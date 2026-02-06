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

// --- Types from types.ts ---
type MaritalStatus =
  | 'Célibataire'
  | 'Marié (Communauté réduite aux acquêts - Régime légal)'
  | 'Marié (Communauté universelle)'
  | 'Marié (Séparation de biens)'
  | 'Marié (Participation aux acquêts)'
  | 'Marié (Communauté de meubles et acquêts)'
  | 'PACS (Séparation de biens)'
  | 'PACS (Indivision)'
  | 'Union Libre (Concubinage)';

type UnionHistory = 'Aucune' | 'Divorcé(e)' | 'Veuf/Veuve';

type AssetType =
  | 'Immobilier'
  | 'SCPI'
  | 'Liquidités'
  | 'Assurance-vie (UC/Fonds euros)'
  | 'PER'
  | 'Actions'
  | 'Obligations'
  | 'Cryptomonnaies'
  | 'Entreprise'
  | 'Métaux précieux'
  | 'Bois et forêts'
  | 'Autres actifs';

interface Asset {
  type: AssetType;
  value: number;
  label: string;
}

interface UserSituation {
  age: number;
  maritalStatus: MaritalStatus;
  unionHistory: UnionHistory;
  hasChildrenFromFirstBed: boolean;
  childrenCount: number;
  totalAssets: number;
  assetsBreakdown: Asset[];
  goals: string[];
  additionalContext?: string;
}

// --- Prompt and Schema configuration ---

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    suggestedOptions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          pros: { type: "array", items: { type: "string" } },
          cons: { type: "array", items: { type: "string" } },
          taxImpact: { type: "string" },
          affectedValue: { type: "number" },
          estimatedSavings: { type: "string" },
          estimatedSavingsAmount: { type: "number" },
          estimatedTaxCost: { type: "number" },
          relevanceScore: { type: "number" },
          priority: { type: "string", enum: ["Haute", "Moyenne", "Basse"] }
        },
        required: ["title", "description", "pros", "cons", "taxImpact", "affectedValue", "estimatedSavings", "estimatedSavingsAmount", "estimatedTaxCost", "relevanceScore", "priority"]
      }
    },
    legalWarning: { type: "string" }
  },
  required: ["summary", "suggestedOptions", "legalWarning"]
} as const;

/**
 * Validates the user situation input
 */
function validateUserSituation(situation: UserSituation): void {
  if (!situation) {
    throw new Error('La situation utilisateur est requise');
  }

  if (situation.age < 18 || situation.age > 100) {
    throw new Error('L\'âge doit être compris entre 18 et 100 ans');
  }

  if (situation.childrenCount < 0 || situation.childrenCount > 10) {
    throw new Error('Le nombre d\'enfants doit être compris entre 0 et 10');
  }

  if (situation.totalAssets < 0 || situation.totalAssets > 1_000_000_000_000) {
    throw new Error('Le patrimoine total doit être positif et réaliste');
  }

  if (!situation.assetsBreakdown || situation.assetsBreakdown.length === 0) {
    throw new Error('Au moins un actif doit être renseigné');
  }

  if (!situation.goals || situation.goals.length === 0) {
    throw new Error('Au moins un objectif doit être sélectionné');
  }
}

/**
 * Builds the prompt for the Gemini API
 */
function buildPrompt(situation: UserSituation): string {
  const assetsDescription = situation.assetsBreakdown
    .map(a => `${a.label} (${a.type}) : ${a.value.toLocaleString('fr-FR')} €`)
    .join(', ');

  return `
    En tant qu'expert notarial français de haut niveau, analyse la situation suivante et propose des stratégies de transmission de patrimoine optimisées.
    
    SITUATION DE L'UTILISATEUR :
    - Âge : ${situation.age} ans
    - Situation matrimoniale : ${situation.maritalStatus}
    - Passé marital : ${situation.unionHistory}
    - Enfants d'un premier lit : ${situation.hasChildrenFromFirstBed ? 'OUI' : 'NON'}
    - Nombre d'enfants total : ${situation.childrenCount}
    - Patrimoine total : ${situation.totalAssets.toLocaleString('fr-FR')} €
    - Détail des actifs : ${assetsDescription}
    - Objectifs prioritaires : ${situation.goals.join(', ')}
    - CONTEXTE ADDITIONNEL (IMPORTANT) : ${situation.additionalContext?.trim() || 'Aucun contexte spécifique fourni.'}

    DIRECTIVES D'ANALYSE STRICTES :

    1. INTÉGRATION DU CONTEXTE : Si l'utilisateur mentionne un contexte spécifique (ex: enfant handicapé, mésentente familiale, projet d'expatriation), tes stratégies doivent PRIORITAIREMENT y répondre (ex: mentionner le mandat de protection future, la donation résiduelle, etc.).

    2. RAISONNEMENT FISCAL DÉTAILLÉ : Pour chaque stratégie, tu dois exposer ton calcul dans la 'description' selon la séquence : 
       [Valeur Brute de l'Actif] -> [Application de l'Abattement (ex: 100k€/enfant)] -> [Assiette Taxable] -> [Estimation des Droits selon barème progressif].

    3. BARÈME DE L'USUFRUIT (Art. 669 CGI) : Applique strictement les valeurs selon l'âge pour le démembrement.

    4. POINTS DE BLOCAGE (Art. 757 du Code Civil) : 
       Si 'Enfants d'un premier lit' est OUI, souligne impérativement les limites du conjoint survivant et propose la 'Donation entre époux'.

    5. QUANTIFICATION DES GAINS : 'estimatedSavingsAmount' doit être une estimation chiffrée sérieuse.

    RETOURNE UN JSON STRUCTURÉ :
    - 'summary' : Un rapport de synthèse professionnel de 3-4 phrases.
    - 'suggestedOptions' : Array d'objets avec titre, description (incluant le calcul détaillé), pros, cons, taxImpact, affectedValue, estimatedSavings, estimatedSavingsAmount, estimatedTaxCost, relevanceScore, priority.
    - 'legalWarning' : Avertissement standard.
  `;
}

// Configuration du modèle Gemini (configurable via variable d'environnement)
// Valeur par défaut: gemini-3-flash-preview
const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';

interface GeminiRequest {
  situation: UserSituation;
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

    const { situation } = body;

    // Validate required fields
    if (!situation) {
      return createErrorResponse('La situation utilisateur est requise', 400, request, env);
    }

    try {
      validateUserSituation(situation);
    } catch (e: any) {
      return createErrorResponse(e.message, 400, request, env);
    }

    // Build and sanitize the prompt
    const prompt = buildPrompt(situation);
    const sanitizedPrompt = sanitizeInput(prompt);

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

    // Add response schema (embedded in backend)
    geminiRequestBody.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA
    };

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
