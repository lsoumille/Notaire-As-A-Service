
import { TransmissionType, Relationship, FeeBreakdown } from '../types';

/**
 * Barème des émoluments proportionnels des notaires (Article A444-53)
 * Mis à jour pour 2024-2025
 */
const EMOLUMENT_TRANCHES = [
  { threshold: 6500, rate: 0.03870 },
  { threshold: 17000, rate: 0.01596 },
  { threshold: 60000, rate: 0.01064 },
  { threshold: Infinity, rate: 0.00799 }
] as const;

/**
 * Barème progressif des droits de succession/donation en ligne directe (enfants)
 * Article 777 du CGI
 */
const DROITS_LIGNE_DIRECTE = [
  { threshold: 8072, rate: 0.05 },
  { threshold: 12109, rate: 0.10 },
  { threshold: 15932, rate: 0.15 },
  { threshold: 552324, rate: 0.20 },
  { threshold: 902838, rate: 0.30 },
  { threshold: 1805677, rate: 0.40 },
  { threshold: Infinity, rate: 0.45 }
] as const;

/**
 * Barème des droits entre frères et sœurs
 */
const DROITS_FRERE_SOEUR = [
  { threshold: 24430, rate: 0.35 },
  { threshold: Infinity, rate: 0.45 }
] as const;

/**
 * Abattements selon le lien de parenté (Article 779 CGI)
 * Abattements applicables tous les 15 ans
 */
const ABATTEMENTS: Record<Relationship, number> = {
  'Enfant': 100000,
  'Petit-enfant': 31865,
  'Conjoint/PACS': 0, // Exonération totale en succession, 80724 en donation
  'Frère/Sœur': 15932,
  'Neveu/Nièce': 7967,
  'Tiers': 1594
} as const;

/**
 * Abattement spécifique pour donation au conjoint/PACS
 */
const ABATTEMENT_DONATION_CONJOINT = 80724;

/**
 * Calcule les émoluments du notaire selon le barème proportionnel
 * Méthode de calcul par tranches successives
 */
export function calculateNotaryEmoluments(value: number): number {
  if (value <= 0) return 0;
  
  let emoluments = 0;
  let previousThreshold = 0;

  for (const tranche of EMOLUMENT_TRANCHES) {
    const trancheBase = Math.min(value, tranche.threshold) - previousThreshold;
    if (trancheBase > 0) {
      emoluments += trancheBase * tranche.rate;
    }
    if (value <= tranche.threshold) break;
    previousThreshold = tranche.threshold;
  }

  // TVA à 20%
  return emoluments * 1.2;
}

/**
 * Calcule les droits de mutation selon le barème progressif
 * Application correcte du barème par tranches pour la ligne directe
 */
function calculateProgressiveTax(taxableValue: number, bareme: readonly { threshold: number; rate: number }[]): number {
  if (taxableValue <= 0) return 0;

  let tax = 0;
  let previousThreshold = 0;

  for (const tranche of bareme) {
    const trancheBase = Math.min(taxableValue, tranche.threshold) - previousThreshold;
    if (trancheBase > 0) {
      tax += trancheBase * tranche.rate;
    }
    if (taxableValue <= tranche.threshold) break;
    previousThreshold = tranche.threshold;
  }

  return tax;
}

/**
 * Estimation des taxes de l'État (Droits d'enregistrement / Succession)
 * Prend en compte les abattements et le barème progressif
 */
export function calculateStateTaxes(
  value: number, 
  type: TransmissionType, 
  relationship: Relationship
): number {
  if (value <= 0) return 0;

  // Vente immobilière : droits de mutation ~5.81% (5.09% + frais annexes)
  if (type === 'Vente Immobilière') {
    // Droits d'enregistrement : 5.09% (communes + département)
    // Taxe additionnelle communale : 0.72% (moyenne)
    return value * 0.0581;
  }

  // Conjoint/PACS : exonéré en succession (art. 796-0 bis CGI)
  if (relationship === 'Conjoint/PACS' && type === 'Succession') {
    return 0;
  }

  // Déterminer l'abattement applicable
  let abatement: number;
  if (relationship === 'Conjoint/PACS' && type === 'Donation') {
    abatement = ABATTEMENT_DONATION_CONJOINT;
  } else {
    abatement = ABATTEMENTS[relationship];
  }

  // Assiette taxable après abattement
  const taxableValue = Math.max(0, value - abatement);
  if (taxableValue === 0) return 0;

  // Application du barème selon le lien de parenté
  switch (relationship) {
    case 'Enfant':
    case 'Conjoint/PACS': // Pour donation uniquement
      return calculateProgressiveTax(taxableValue, DROITS_LIGNE_DIRECTE);
      
    case 'Petit-enfant':
      return calculateProgressiveTax(taxableValue, DROITS_LIGNE_DIRECTE);
      
    case 'Frère/Sœur':
      return calculateProgressiveTax(taxableValue, DROITS_FRERE_SOEUR);
      
    case 'Neveu/Nièce':
      // Taux fixe de 55%
      return taxableValue * 0.55;
      
    case 'Tiers':
    default:
      // Taux fixe de 60%
      return taxableValue * 0.60;
  }
}

/**
 * Estimation des débours (frais annexes)
 * Varie selon le type d'opération et la valeur du bien
 */
function calculateDisbursements(value: number, type: TransmissionType): number {
  const baseDisbursements = type === 'Vente Immobilière' ? 800 : 400;
  
  // Ajustement selon la valeur (plus de formalités pour les gros patrimoines)
  if (value > 500000) {
    return baseDisbursements + 200;
  }
  if (value > 1000000) {
    return baseDisbursements + 400;
  }
  
  return baseDisbursements;
}

/**
 * Fonction principale d'estimation des frais de notaire
 */
export function estimateFees(
  value: number, 
  type: TransmissionType, 
  relationship: Relationship
): FeeBreakdown {
  // Validation des entrées
  if (value < 0) {
    return { emoluments: 0, taxes: 0, disbursements: 0, total: 0 };
  }

  const emoluments = calculateNotaryEmoluments(value);
  const taxes = calculateStateTaxes(value, type, relationship);
  const disbursements = calculateDisbursements(value, type);

  return {
    emoluments: Math.round(emoluments),
    taxes: Math.round(taxes),
    disbursements,
    total: Math.round(emoluments + taxes + disbursements)
  };
}

/**
 * Calcule la valeur de l'usufruit selon l'article 669 du CGI
 */
export function getUsufruitValue(age: number, propertyValue: number): { usufruit: number; nuePropriete: number } {
  let usufruitPercent: number;
  
  if (age < 21) usufruitPercent = 90;
  else if (age < 31) usufruitPercent = 80;
  else if (age < 41) usufruitPercent = 70;
  else if (age < 51) usufruitPercent = 60;
  else if (age < 61) usufruitPercent = 50;
  else if (age < 71) usufruitPercent = 40;
  else if (age < 81) usufruitPercent = 30;
  else if (age < 91) usufruitPercent = 20;
  else usufruitPercent = 10;

  return {
    usufruit: Math.round(propertyValue * (usufruitPercent / 100)),
    nuePropriete: Math.round(propertyValue * ((100 - usufruitPercent) / 100))
  };
}
