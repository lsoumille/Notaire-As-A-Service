
export type MaritalStatus = 
  | 'Célibataire' 
  | 'Marié (Communauté réduite aux acquêts - Régime légal)' 
  | 'Marié (Communauté universelle)' 
  | 'Marié (Séparation de biens)' 
  | 'Marié (Participation aux acquêts)' 
  | 'Marié (Communauté de meubles et acquêts)'
  | 'PACS (Séparation de biens)' 
  | 'PACS (Indivision)' 
  | 'Union Libre (Concubinage)';

export type UnionHistory = 'Aucune' | 'Divorcé(e)' | 'Veuf/Veuve';
export type TransmissionType = 'Donation' | 'Succession' | 'Vente Immobilière';
export type Relationship = 'Enfant' | 'Petit-enfant' | 'Conjoint/PACS' | 'Frère/Sœur' | 'Neveu/Nièce' | 'Tiers';

export type AssetCategory = 'Immobilier' | 'Financier' | 'Professionnel' | 'Autre';

export interface Asset {
  type: 'Immobilier' | 'Assurance-vie' | 'Liquidités/Livrets' | 'PEA/Titres' | 'Entreprise' | 'Autre';
  category: AssetCategory;
  value: number;
  label: string;
  location?: string;
}

export interface UserSituation {
  age: number;
  maritalStatus: MaritalStatus;
  unionHistory: UnionHistory;
  hasChildrenFromFirstBed: boolean;
  childrenCount: number;
  totalAssets: number;
  assetsBreakdown: Asset[];
  goals: string[];
}

export interface StrategyOption {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  taxImpact: string;
  affectedValue: number;
  estimatedSavings: string;
  estimatedSavingsAmount: number;
  estimatedTaxCost: number;
  relevanceScore: number;
  priority: 'Haute' | 'Moyenne' | 'Basse';
}

export interface LegalAnalysis {
  summary: string;
  suggestedOptions: StrategyOption[];
  legalWarning: string;
}

export interface KnowledgeEntry {
  term: string;
  definition: string;
  example?: string;
  category: 'Civil' | 'Fiscal' | 'Procédure';
  lawReference?: string;
}

export interface FeeBreakdown {
  emoluments: number;
  taxes: number;
  disbursements: number;
  total: number;
}
