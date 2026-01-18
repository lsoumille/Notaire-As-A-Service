
import { GoogleGenAI, Type } from "@google/genai";
import { UserSituation, LegalAnalysis } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export async function analyzeTransmissionStrategy(situation: UserSituation): Promise<LegalAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          suggestedOptions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                taxImpact: { type: Type.STRING },
                affectedValue: { type: Type.NUMBER },
                estimatedSavings: { type: Type.STRING },
                estimatedSavingsAmount: { type: Type.NUMBER },
                estimatedTaxCost: { type: Type.NUMBER },
                relevanceScore: { type: Type.NUMBER },
                priority: { type: Type.STRING, enum: ["Haute", "Moyenne", "Basse"] }
              },
              required: ["title", "description", "pros", "cons", "taxImpact", "affectedValue", "estimatedSavings", "estimatedSavingsAmount", "estimatedTaxCost", "relevanceScore", "priority"]
            }
          },
          legalWarning: { type: Type.STRING }
        },
        required: ["summary", "suggestedOptions", "legalWarning"]
      }
    }
  });

  return JSON.parse(response.text) as LegalAnalysis;
}
