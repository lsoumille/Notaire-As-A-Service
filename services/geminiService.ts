import { UserSituation, LegalAnalysis, StrategyOption } from "../types";

// Configuration constants
const REQUEST_TIMEOUT_MS = 30000;

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

// Define the response schema structure for Gemini
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
 * Validates the user situation input before sending to the API
 */
function validateUserSituation(situation: UserSituation): void {
  if (!situation) {
    throw new ValidationError('La situation utilisateur est requise');
  }
  
  if (situation.age < 18 || situation.age > 100) {
    throw new ValidationError('L\'âge doit être compris entre 18 et 100 ans', 'age');
  }
  
  if (situation.childrenCount < 0 || situation.childrenCount > 10) {
    throw new ValidationError('Le nombre d\'enfants doit être compris entre 0 et 10', 'childrenCount');
  }
  
  if (situation.totalAssets < 0 || situation.totalAssets > 1_000_000_000_000) {
    throw new ValidationError('Le patrimoine total doit être positif et réaliste', 'totalAssets');
  }
  
  if (!situation.assetsBreakdown || situation.assetsBreakdown.length === 0) {
    throw new ValidationError('Au moins un actif doit être renseigné', 'assetsBreakdown');
  }
  
  if (!situation.goals || situation.goals.length === 0) {
    throw new ValidationError('Au moins un objectif doit être sélectionné', 'goals');
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
 * Builds the prompt for the Gemini API based on user situation
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

/**
 * Main function to analyze transmission strategy
 */
export async function analyzeTransmissionStrategy(
  situation: UserSituation
): Promise<LegalAnalysis> {
  // Validate input first
  validateUserSituation(situation);

  const prompt = buildPrompt(situation);

  try {
    const response = await fetchWithTimeout(
      '/api/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          responseSchema: RESPONSE_SCHEMA
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
