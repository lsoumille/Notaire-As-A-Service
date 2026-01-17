
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

    DIRECTIVES D'ANALYSE STRICTES :

    1. RAISONNEMENT FISCAL DÉTAILLÉ : Pour chaque stratégie, tu dois exposer ton calcul dans la 'description' selon la séquence : 
       [Valeur Brute de l'Actif] -> [Application de l'Abattement (ex: 100k€/enfant)] -> [Assiette Taxable] -> [Estimation des Droits selon barème progressif].

    2. BARÈME DE L'USUFRUIT (Art. 669 CGI) : Applique strictement les valeurs suivantes pour le démembrement :
       - Moins de 51 ans : Usufruit 60% / Nue-propriété 40%
       - 51 à 60 ans : Usufruit 50% / Nue-propriété 50%
       - 61 à 70 ans : Usufruit 40% / Nue-propriété 60%
       - 71 à 80 ans : Usufruit 30% / Nue-propriété 70%
       - 81 à 90 ans : Usufruit 20% / Nue-propriété 80%

    3. POINTS DE BLOCAGE (Art. 757 du Code Civil) : 
       Si 'Enfants d'un premier lit' est OUI, souligne impérativement que le conjoint survivant perd son droit d'option légal pour le 100% usufruit (limité à 1/4 en pleine propriété). Propose la 'Donation entre époux' comme remède indispensable pour rétablir l'option usufruit total.

    4. QUANTIFICATION DES GAINS : 'estimatedSavingsAmount' doit être une estimation chiffrée de la différence entre les droits de succession classiques au décès (sans stratégie) et le coût fiscal de la stratégie proposée.

    5. SÉLECTIVITÉ SCI : Ne propose la SCI que si l'avantage (décote de 15% sur les parts, gestion de l'indivision) surpasse nettement la donation démembrée directe, notamment pour des biens locatifs ou multiples.

    6. ASSURANCE-VIE : Sépare bien le traitement fiscal des versements avant 70 ans (Art. 990 I - abattement 152 500 €) et après 70 ans (Art. 757 B - abattement 30 500 € sur le capital).

    7. PRIORISATION : Attribue une priorité ('Haute', 'Moyenne', 'Basse') à chaque option selon son urgence ou son impact fiscal/civil.

    RETOURNE UN JSON STRUCTURÉ :
    - 'summary' : Un rapport de synthèse professionnel de 3-4 phrases.
    - 'suggestedOptions' : Array d'objets avec titre, description (incluant le calcul détaillé), pros, cons, taxImpact, affectedValue, estimatedSavings, estimatedSavingsAmount, estimatedTaxCost, relevanceScore, priority.
    - 'legalWarning' : Avertissement sur le caractère informatif et la nécessité d'un acte authentique.
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
