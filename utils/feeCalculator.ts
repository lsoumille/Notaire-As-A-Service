
import { TransmissionType, Relationship, FeeBreakdown } from '../types';

/**
 * Simplified calculation for French Notary Fees (Emoluments proportionnels)
 * Based on S1 barème (Vente/Donation)
 */
export function calculateNotaryEmoluments(value: number): number {
  let emoluments = 0;
  if (value <= 6500) {
    emoluments = value * 0.03870;
  } else if (value <= 17000) {
    emoluments = (6500 * 0.03870) + ((value - 6500) * 0.1596);
  } else if (value <= 60000) {
    emoluments = (6500 * 0.03870) + ((17000 - 6500) * 0.1596) + ((value - 17000) * 0.01064);
  } else {
    emoluments = (6500 * 0.03870) + ((17000 - 6500) * 0.1596) + ((60000 - 17000) * 0.01064) + ((value - 60000) * 0.00799);
  }
  return emoluments * 1.2; // Including 20% VAT
}

/**
 * Estimation of State Taxes (Droits d'enregistrement / Succession)
 */
export function calculateStateTaxes(value: number, type: TransmissionType, relationship: Relationship): number {
  if (type === 'Vente Immobilière') {
    // Standard "Frais de mutation" ~5.8% for old buildings
    return value * 0.0581;
  }

  // Simplified Inheritance/Donation logic
  let abatement = 0;
  switch (relationship) {
    case 'Enfant': abatement = 100000; break;
    case 'Conjoint/PACS': abatement = 80724; break; // For donation, 0 for succession
    case 'Petit-enfant': abatement = 31865; break;
    case 'Frère/Sœur': abatement = 15932; break;
    default: abatement = 1594; break;
  }

  const taxableValue = Math.max(0, value - abatement);
  if (taxableValue === 0) return 0;

  // Rough simplified progressive barème
  if (taxableValue < 8072) return taxableValue * 0.05;
  if (taxableValue < 12109) return taxableValue * 0.10;
  if (taxableValue < 15932) return taxableValue * 0.15;
  if (taxableValue < 552324) return taxableValue * 0.20;
  return taxableValue * 0.45;
}

export function estimateFees(value: number, type: TransmissionType, relationship: Relationship): FeeBreakdown {
  const emoluments = calculateNotaryEmoluments(value);
  const taxes = calculateStateTaxes(value, type, relationship);
  const disbursements = type === 'Vente Immobilière' ? 800 : 400; // Flat estimate for debours

  return {
    emoluments: Math.round(emoluments),
    taxes: Math.round(taxes),
    disbursements,
    total: Math.round(emoluments + taxes + disbursements)
  };
}
