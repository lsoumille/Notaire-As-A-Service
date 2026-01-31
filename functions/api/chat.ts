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

// Helper function to get CORS headers
// For production, you can set ALLOWED_ORIGINS environment variable to restrict origins
function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  
  // In production, check if origin is allowed
  // You can configure this via env.ALLOWED_ORIGINS environment variable
  const allowedOrigins = (env as any).ALLOWED_ORIGINS 
    ? (env as any).ALLOWED_ORIGINS.split(',') 
    : ['*'];
  
  const allowOrigin = allowedOrigins.includes('*') || allowedOrigins.includes(origin)
    ? (allowedOrigins.includes('*') ? '*' : origin)
    : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
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
          headers: { 
            'Content-Type': 'application/json',
            ...getCorsHeaders(request, env)
          }
        }
      );
    }

    // Check if API key is configured
    if (!env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured on server' }),
        {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...getCorsHeaders(request, env)
          }
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
          headers: { 
            'Content-Type': 'application/json',
            ...getCorsHeaders(request, env)
          }
        }
      );
    }

    // Parse and return the Gemini response
    const data = await geminiResponse.json();
    
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        ...getCorsHeaders(request, env)
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
        headers: { 
          'Content-Type': 'application/json',
          ...getCorsHeaders(request, env)
        }
      }
    );
  }
};

// Handle OPTIONS requests for CORS preflight
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  
  return new Response(null, {
    headers: getCorsHeaders(request, env)
  });
};
