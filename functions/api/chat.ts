// Cloudflare Pages Function - Server-side API endpoint for Gemini chat
// This function securely calls the Gemini API using the server-side API key

// Type declaration for Cloudflare Pages Functions
// These types are provided by the Cloudflare runtime environment
declare type PagesFunction<Env = unknown> = (context: {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
}) => Response | Promise<Response>;

interface Env {
  GEMINI_API_KEY: string;
  ALLOWED_ORIGINS?: string;
  GEMINI_MODEL?: string;
}

// Configuration du modèle Gemini (configurable via variable d'environnement)
// Valeur par défaut: gemini-3-flash-preview
const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';

interface GeminiRequest {
  prompt: string;
  responseSchema?: unknown;
}

interface GeminiRequestBody {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    responseMimeType: string;
    responseSchema: unknown;
  };
}

// Constants for validation and security
const MAX_PROMPT_LENGTH = 50000;
const MAX_REQUEST_SIZE = 100000; // 100KB

/**
 * Sanitizes user input to prevent injection attacks
 */
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  // Remove any potential script injection attempts
  // Keep the content intact but escape dangerous patterns
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters except newlines/tabs
    .trim();
}

/**
 * Creates a standardized error response
 */
function createErrorResponse(
  message: string,
  statusCode: number,
  request: Request,
  env: Env,
  details?: string
): Response {
  const errorBody = {
    error: message,
    ...(details && { details }),
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(errorBody), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(request, env)
    }
  });
}

// Helper function to get CORS headers
// For production, you can set ALLOWED_ORIGINS environment variable to restrict origins
function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') || '';

  // In production, check if origin is allowed
  // You can configure this via env.ALLOWED_ORIGINS environment variable
  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['*'];

  const allowOrigin = allowedOrigins.includes('*') || allowedOrigins.includes(origin)
    ? (allowedOrigins.includes('*') ? '*' : origin)
    : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  try {
    // Check content length to prevent oversized requests
    const contentLength = request.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return createErrorResponse('Requête trop volumineuse', 413, request, env);
    }

    // Parse the incoming request
    let body: GeminiRequest;
    try {
      body = await request.json() as GeminiRequest;
    } catch {
      return createErrorResponse('Format de requête JSON invalide', 400, request, env);
    }

    const { prompt, responseSchema } = body;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      return createErrorResponse('Le champ "prompt" est requis et doit être une chaîne', 400, request, env);
    }

    // Validate prompt length
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return createErrorResponse(
        `Le prompt est trop long (max: ${MAX_PROMPT_LENGTH} caractères)`,
        400,
        request,
        env
      );
    }

    // Sanitize the prompt
    const sanitizedPrompt = sanitizeInput(prompt);
    if (sanitizedPrompt.length === 0) {
      return createErrorResponse('Le prompt ne peut pas être vide', 400, request, env);
    }

    // Check if API key is configured
    if (!env.GEMINI_API_KEY) {

      return createErrorResponse(
        'Configuration serveur incomplète',
        500,
        request,
        env
      );
    }

    // Prepare the request body for Gemini API
    const geminiRequestBody: GeminiRequestBody = {
      contents: [{ parts: [{ text: sanitizedPrompt }] }]
    };

    // Add response schema if provided (for structured output)
    if (responseSchema) {
      geminiRequestBody.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      };
    }

    // Call the Gemini API from the server with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout

    // Get model from environment variable or use default
    const geminiModel = env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

    let geminiResponse: Response;
    try {
      geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiRequestBody),
          signal: controller.signal
        }
      );
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return createErrorResponse('Timeout de la requête vers l\'API Gemini', 504, request, env);
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    // Check if the Gemini API call was successful
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();


      // Map Gemini error codes to appropriate HTTP codes
      let statusCode = geminiResponse.status;
      let errorMessage = 'Erreur de l\'API Gemini';

      if (geminiResponse.status === 429) {
        errorMessage = 'Trop de requêtes. Veuillez patienter avant de réessayer.';
      } else if (geminiResponse.status >= 500) {
        errorMessage = 'Service Gemini temporairement indisponible';
        statusCode = 503;
      }

      return createErrorResponse(errorMessage, statusCode, request, env);
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

    return createErrorResponse(
      'Erreur interne du serveur',
      500,
      request,
      env
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
