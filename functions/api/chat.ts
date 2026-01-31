// Cloudflare Pages Function - Server-side API endpoint for Gemini chat
// This function securely calls the Gemini API using the server-side API key

interface Env {
  GEMINI_API_KEY: string;
}

interface GeminiRequest {
  prompt: string;
  modelName: string;
  responseSchema: any;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  try {
    // Parse the incoming request
    const body = await request.json() as GeminiRequest;
    const { prompt, modelName, responseSchema } = body;

    // Validate required fields
    if (!prompt || !modelName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: prompt and modelName' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if API key is configured
    if (!env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured on server' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Prepare the request body for Gemini API
    const geminiRequestBody: any = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    // Add response schema if provided (for structured output)
    if (responseSchema) {
      geminiRequestBody.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      };
    }

    // Call the Gemini API from the server
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiRequestBody)
      }
    );

    // Check if the Gemini API call was successful
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return new Response(
        JSON.stringify({ 
          error: 'Gemini API error', 
          details: errorText,
          status: geminiResponse.status 
        }),
        {
          status: geminiResponse.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and return the Gemini response
    const data = await geminiResponse.json();
    
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Adjust as needed for production
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Handle OPTIONS requests for CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
