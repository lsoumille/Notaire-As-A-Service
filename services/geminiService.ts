import { UserSituation, LegalAnalysis, StrategyOption } from "../types";

// Configuration constants
const REQUEST_TIMEOUT_MS = 90000;

// Custom error classes for better error handling
export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates the response from Gemini API
 */
function validateAnalysisResponse(data: unknown): LegalAnalysis {
  if (!data || typeof data !== 'object') {
    throw new GeminiAPIError('Réponse invalide de l\'API');
  }

  const response = data as Record<string, unknown>;

  if (typeof response.summary !== 'string' || !response.summary) {
    throw new GeminiAPIError('Le résumé de l\'analyse est manquant');
  }

  if (!Array.isArray(response.suggestedOptions) || response.suggestedOptions.length === 0) {
    throw new GeminiAPIError('Les options stratégiques sont manquantes');
  }

  // Validate each option
  const validatedOptions: StrategyOption[] = response.suggestedOptions.map((opt: unknown, index: number) => {
    if (!opt || typeof opt !== 'object') {
      throw new GeminiAPIError(`Option ${index + 1} invalide`);
    }
    const option = opt as Record<string, unknown>;

    return {
      title: String(option.title || ''),
      description: String(option.description || ''),
      pros: Array.isArray(option.pros) ? option.pros.map(String) : [],
      cons: Array.isArray(option.cons) ? option.cons.map(String) : [],
      taxImpact: String(option.taxImpact || ''),
      affectedValue: Number(option.affectedValue) || 0,
      estimatedSavings: String(option.estimatedSavings || ''),
      estimatedSavingsAmount: Number(option.estimatedSavingsAmount) || 0,
      estimatedTaxCost: Number(option.estimatedTaxCost) || 0,
      relevanceScore: Math.min(100, Math.max(0, Number(option.relevanceScore) || 0)),
      priority: (['Haute', 'Moyenne', 'Basse'].includes(option.priority as string)
        ? option.priority as 'Haute' | 'Moyenne' | 'Basse'
        : 'Moyenne')
    };
  });

  return {
    summary: response.summary,
    suggestedOptions: validatedOptions,
    legalWarning: String(response.legalWarning || 'Consultez un notaire pour tout acte officiel.')
  };
}

/**
 * Fetches with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Main function to analyze transmission strategy
 */
export async function analyzeTransmissionStrategy(
  situation: UserSituation
): Promise<LegalAnalysis> {
  try {
    const response = await fetchWithTimeout(
      '/api/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          situation
        })
      },
      REQUEST_TIMEOUT_MS
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Erreur de communication avec le serveur'
      }));

      throw new GeminiAPIError(
        errorData.error || `Erreur serveur (${response.status})`,
        response.status
      );
    }

    const data = await response.json();

    // Extract the text from Gemini's response structure
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      // Check for blocked content or safety filters
      const blockReason = data.candidates?.[0]?.finishReason;
      if (blockReason === 'SAFETY') {
        throw new GeminiAPIError(
          'Le contenu a été bloqué par les filtres de sécurité. Veuillez reformuler votre demande.'
        );
      }
      throw new GeminiAPIError('Format de réponse invalide de l\'API Gemini');
    }

    // Parse and validate the response
    let parsedResponse: unknown;
    try {
      parsedResponse = JSON.parse(generatedText);
    } catch (parseError) {
      throw new GeminiAPIError('Impossible de parser la réponse JSON de l\'API');
    }

    return validateAnalysisResponse(parsedResponse);

  } catch (error) {
    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new GeminiAPIError(
        'La requête a pris trop de temps. Veuillez réessayer.',
        408
      );
    }

    // Re-throw known errors
    if (error instanceof ValidationError || error instanceof GeminiAPIError) {
      throw error;
    }

    // Wrap unknown errors
    throw new GeminiAPIError(
      'Une erreur inattendue s\'est produite.',
      500
    );
  }
}
