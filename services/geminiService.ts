import { UserSituation, LegalAnalysis } from "../types";

const MODEL_NAME = 'gemini-1.5-flash';

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
};

export async function analyzeTransmissionStrategy(situation: UserSituation): Promise<LegalAnalysis> {
  const prompt = `
    En tant qu'expert notarial français de haut niveau, analyse la situation suivante et propose des stratégies de transmission de patrimoine optimisées.
    
    SITUATION DE L'UTILISATEUR :
    - Âge : ${situation.age} ans
    - Situation matrimoniale : ${situation.maritalStatus}
    - Passé marital : ${situation.unionHistory}
    - Enfants d'un premier lit : ${situation.hasChildrenFromFirstBed ? 'OUI' : 'NON'}
    - Nombre d'enfants total : ${situation.childrenCount}
    - Patrimoine total : ${situation.totalAssets} €
    - Détail des actifs : ${situation.assetsBreakdown.map(a => `${a.label} (${a.type}) : ${a.value} €`).join(', ')}
    - Objectifs prioritaires : ${situation.goals.join(', ')}
    - CONTEXTE ADDITIONNEL (IMPORTANT) : ${situation.additionalContext || 'Aucun contexte spécifique fourni.'}

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

  // Call our secure server-side API endpoint
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      modelName: MODEL_NAME,
      responseSchema: RESPONSE_SCHEMA
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`API Error: ${errorData.error || response.statusText}`);
  }

  const data = await response.json();
  
  // Extract the text from Gemini's response structure
  // Gemini API returns: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!generatedText) {
    throw new Error('Invalid response format from Gemini API');
  }

  return JSON.parse(generatedText) as LegalAnalysis;
}
