#!/usr/bin/env node
/**
 * Test de l'API Chat
 * Usage: node test-chat-api.ts
 * 
 * Ce test vérifie que l'API /api/chat retourne une réponse valide
 * avec la structure JSON attendue.
 */

const API_URL = 'http://localhost:8788/api/chat';

const testPayload = {
  prompt: `En tant qu'expert notarial français de haut niveau, analyse la situation suivante et propose des stratégies de transmission de patrimoine optimisées.
    
    SITUATION DE L'UTILISATEUR :
    - Âge : 50 ans
    - Situation matrimoniale : Marié (Communauté réduite aux acquêts - Régime légal)
    - Passé marital : Aucune
    - Enfants d'un premier lit : NON
    - Nombre d'enfants total : 2
    - Patrimoine total : 500000 €
    - Détail des actifs : residence secondaire (Immobilier) : 500000 €
    - Objectifs prioritaires : Accélérer la transmission aux enfants
    - CONTEXTE ADDITIONNEL (IMPORTANT) : Aucun contexte spécifique fourni.

    RETOURNE UN JSON STRUCTURÉ avec summary, suggestedOptions (array avec title, description, pros, cons, taxImpact, affectedValue, estimatedSavings, estimatedSavingsAmount, estimatedTaxCost, relevanceScore, priority), et legalWarning.`,
  modelName: 'gemini-3-flash-preview',
  responseSchema: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      suggestedOptions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            pros: { type: 'array', items: { type: 'string' } },
            cons: { type: 'array', items: { type: 'string' } },
            taxImpact: { type: 'string' },
            affectedValue: { type: 'number' },
            estimatedSavings: { type: 'string' },
            estimatedSavingsAmount: { type: 'number' },
            estimatedTaxCost: { type: 'number' },
            relevanceScore: { type: 'number' },
            priority: { type: 'string', enum: ['Haute', 'Moyenne', 'Basse'] }
          },
          required: ['title', 'description', 'pros', 'cons', 'taxImpact', 'affectedValue', 'estimatedSavings', 'estimatedSavingsAmount', 'estimatedTaxCost', 'relevanceScore', 'priority']
        }
      },
      legalWarning: { type: 'string' }
    },
    required: ['summary', 'suggestedOptions', 'legalWarning']
  }
};

async function testChatAPI() {
  console.log('🧪 Test de l\'API Chat...');
  console.log(`📡 URL: ${API_URL}`);
  console.log('');

  const startTime = Date.now();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8788'
      },
      body: JSON.stringify(testPayload)
    });

    const duration = Date.now() - startTime;

    // Vérification du status HTTP
    if (!response.ok) {
      console.error(`❌ ÉCHEC - Status HTTP: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('📄 Réponse d\'erreur:', errorText);
      process.exit(1);
    }

    console.log(`✅ Status HTTP: ${response.status} ${response.statusText}`);
    console.log(`⏱️  Durée: ${duration}ms`);
    console.log('');

    // Parsing de la réponse
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ ÉCHEC - La réponse n\'est pas un JSON valide');
      console.error('📄 Réponse brute:', await response.text());
      process.exit(1);
    }

    // Vérification de la structure de la réponse Gemini
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('❌ ÉCHEC - Structure Gemini invalide: candidates manquant ou vide');
      console.log('📄 Réponse:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    const candidate = data.candidates[0];
    
    if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts)) {
      console.error('❌ ÉCHEC - Structure Gemini invalide: content.parts manquant');
      console.log('📄 Réponse:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    // Extraction du JSON de la réponse
    let parsedContent;
    try {
      const textContent = candidate.content.parts[0].text;
      parsedContent = JSON.parse(textContent);
    } catch (parseError) {
      console.error('❌ ÉCHEC - Impossible de parser le contenu JSON de la réponse');
      console.log('📄 Contenu brut:', candidate.content.parts[0]?.text);
      process.exit(1);
    }

    // Vérification des champs requis
    const requiredFields = ['summary', 'suggestedOptions', 'legalWarning'];
    const missingFields = requiredFields.filter(field => !(field in parsedContent));
    
    if (missingFields.length > 0) {
      console.error(`❌ ÉCHEC - Champs manquants: ${missingFields.join(', ')}`);
      console.log('📄 Réponse parsée:', JSON.stringify(parsedContent, null, 2));
      process.exit(1);
    }

    // Vérification que suggestedOptions est un array
    if (!Array.isArray(parsedContent.suggestedOptions)) {
      console.error('❌ ÉCHEC - suggestedOptions doit être un array');
      process.exit(1);
    }

    console.log('✅ Structure de la réponse OK');
    console.log(`📊 Nombre d'options suggérées: ${parsedContent.suggestedOptions.length}`);
    
    if (parsedContent.suggestedOptions.length > 0) {
      console.log('');
      console.log('📋 Résumé:');
      console.log(parsedContent.summary.substring(0, 200) + '...');
      console.log('');
      console.log('💡 Options suggérées:');
      parsedContent.suggestedOptions.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.title} (Priorité: ${option.priority})`);
      });
    }

    console.log('');
    console.log('✅✅✅ TEST RÉUSSI - L\'API fonctionne correctement! ✅✅✅');
    process.exit(0);

  } catch (error) {
    console.error('❌ ÉCHEC - Erreur lors de l\'appel API:');
    console.error(error.message);
    
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      console.log('');
      console.log('💡 Astuce: Assurez-vous que le serveur est démarré sur http://localhost:8788');
    }
    
    process.exit(1);
  }
}

// Lancer le test
testChatAPI();
