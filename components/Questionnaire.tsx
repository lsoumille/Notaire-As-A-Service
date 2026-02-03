
import React, { useState, useCallback, useMemo } from 'react';
import { UserSituation, Asset, MaritalStatus, AssetCategory, UnionHistory } from '../types';
import { ArrowRight, Plus, Trash2, Lightbulb, Info, Building2, Wallet, Heart, Briefcase, AlertCircle, MessageSquareText, ChevronRight, Calculator, Check, MapPin, Gem, TreePine, Bitcoin, Banknote, TrendingUp, PieChart, Scale } from 'lucide-react';

// Constants
const MIN_AGE = 18;
const MAX_AGE = 120;
const MAX_CHILDREN = 20;
const MAX_ASSET_VALUE = 1_000_000_000_000;
const MAX_ADDITIONAL_CONTEXT_LENGTH = 2000;

interface QuestionnaireProps {
  onComplete: (situation: UserSituation) => void;
}

interface ValidationErrors {
  age?: string;
  childrenCount?: string;
  assets?: string;
  goals?: string;
  additionalContext?: string;
}

const ASSET_TYPES: Record<Asset['type'], { category: AssetCategory; icon: React.ReactNode }> = {
  'Immobilier': { category: 'Immobilier', icon: <Building2 className="w-4 h-4 text-brand-navy" /> },
  'SCPI': { category: 'Immobilier', icon: <MapPin className="w-4 h-4 text-brand-navy" /> },
  'Liquidités': { category: 'Financier', icon: <Wallet className="w-4 h-4 text-brand-accent" /> },
  'Assurance-vie (UC/Fonds euros)': { category: 'Financier', icon: <Heart className="w-4 h-4 text-brand-accent" /> },
  'PER': { category: 'Financier', icon: <Scale className="w-4 h-4 text-brand-accent" /> },
  'Actions': { category: 'Financier', icon: <TrendingUp className="w-4 h-4 text-brand-accent" /> },
  'Obligations': { category: 'Financier', icon: <Banknote className="w-4 h-4 text-brand-accent" /> },
  'Cryptomonnaies': { category: 'Financier', icon: <Bitcoin className="w-4 h-4 text-brand-accent" /> },
  'Entreprise': { category: 'Professionnel', icon: <Briefcase className="w-4 h-4 text-slate-500" /> },
  'Métaux précieux': { category: 'Métaux', icon: <Gem className="w-4 h-4 text-yellow-500" /> },
  'Bois et forêts': { category: 'Forêts', icon: <TreePine className="w-4 h-4 text-green-600" /> },
  'Autres actifs': { category: 'Autres', icon: <Plus className="w-4 h-4 text-slate-400" /> }
};

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [situation, setSituation] = useState<UserSituation>(() => ({
    age: 50,
    maritalStatus: 'Marié (Communauté réduite aux acquêts - Régime légal)',
    unionHistory: 'Aucune',
    hasChildrenFromFirstBed: false,
    childrenCount: 2,
    totalAssets: 0,
    assetsBreakdown: [],
    goals: [],
    additionalContext: ''
  }));

  const [newAsset, setNewAsset] = useState<Partial<Asset>>({ type: 'Immobilier', value: 0, label: '' });

  // Validation functions
  const validateAge = useCallback((age: number): string | undefined => {
    if (isNaN(age) || age < MIN_AGE || age > MAX_AGE) {
      return `L'âge doit être compris entre ${MIN_AGE} et ${MAX_AGE} ans`;
    }
    return undefined;
  }, []);

  const validateChildrenCount = useCallback((count: number): string | undefined => {
    if (isNaN(count) || count < 0 || count > MAX_CHILDREN) {
      return `Le nombre d'enfants doit être compris entre 0 et ${MAX_CHILDREN}`;
    }
    return undefined;
  }, []);

  const validateStep = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case 1:
        const ageError = validateAge(situation.age);
        if (ageError) newErrors.age = ageError;
        
        const childrenError = validateChildrenCount(situation.childrenCount);
        if (childrenError) newErrors.childrenCount = childrenError;
        break;
        
      case 2:
        if (situation.assetsBreakdown.length === 0) {
          newErrors.assets = 'Veuillez ajouter au moins un actif';
        }
        break;
        
      case 3:
        if (situation.goals.length === 0) {
          newErrors.goals = 'Veuillez sélectionner au moins un objectif';
        }
        break;
        
      case 4:
        if (situation.additionalContext && situation.additionalContext.length > MAX_ADDITIONAL_CONTEXT_LENGTH) {
          newErrors.additionalContext = `Le contexte additionnel ne peut pas dépasser ${MAX_ADDITIONAL_CONTEXT_LENGTH} caractères`;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, situation, validateAge, validateChildrenCount]);

  const nextStep = useCallback(() => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  }, [validateStep]);
  
  const prevStep = useCallback(() => {
    setErrors({});
    setStep(prev => prev - 1);
  }, []);

  const addAsset = useCallback(() => {
    if (newAsset.label && newAsset.value && newAsset.value > 0 && newAsset.type) {
      // Validation de la valeur
      if (newAsset.value > MAX_ASSET_VALUE) {
        setErrors(prev => ({ ...prev, assets: 'Valeur d\'actif trop élevée' }));
        return;
      }
      
      const typeInfo = ASSET_TYPES[newAsset.type as Asset['type']];
      const assetToAdd: Asset = {
        type: newAsset.type as Asset['type'],
        category: typeInfo.category,
        value: newAsset.value,
        label: newAsset.label.trim().slice(0, 100) // Limite la longueur du label
      };
      const updatedAssets = [...situation.assetsBreakdown, assetToAdd];
      const total = updatedAssets.reduce((acc, curr) => acc + curr.value, 0);
      setSituation(prev => ({ ...prev, assetsBreakdown: updatedAssets, totalAssets: total }));
      setNewAsset({ type: 'Immobilier', value: 0, label: '' });
      setErrors(prev => ({ ...prev, assets: undefined }));
    }
  }, [newAsset, situation.assetsBreakdown]);

  const removeAsset = useCallback((index: number) => {
    setSituation(prev => {
      const updatedAssets = prev.assetsBreakdown.filter((_, i) => i !== index);
      const total = updatedAssets.reduce((acc, curr) => acc + curr.value, 0);
      return { ...prev, assetsBreakdown: updatedAssets, totalAssets: total };
    });
  }, []);

  const toggleGoal = useCallback((goal: string) => {
    setSituation(prev => {
      const currentGoals = prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal];
      return { ...prev, goals: currentGoals };
    });
    setErrors(prev => ({ ...prev, goals: undefined }));
  }, []);

  const getDynamicGoalAdvice = useCallback((goal: string) => {
    const childAbattement = 100000 * situation.childrenCount;
    const formatValue = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

    switch (goal) {
      case "Réduire les droits de succession":
        return {
          tip: `Avec vos ${situation.childrenCount} enfant(s), vous bénéficiez de ${formatValue(childAbattement)} d'abattements cumulés (Art. 779 CGI).`,
          icon: <Calculator className="w-4 h-4 text-brand-accent" />
        };
      case "Protéger le conjoint survivant":
        return {
          tip: situation.hasChildrenFromFirstBed ? "ALERTE : Les enfants d'un premier lit limitent les droits légaux du conjoint à 1/4 en pleine propriété." : "Le conjoint survivant est exonéré de droits, mais le maintien de son cadre de vie nécessite une anticipation.",
          icon: <AlertCircle className="w-4 h-4 text-brand-accent" />
        };
      default:
        return { tip: "L'analyse expert ajustera les préconisations selon ce choix.", icon: <Info className="w-4 h-4" /> };
    }
  }, [situation.childrenCount, situation.hasChildrenFromFirstBed]);

  const handleComplete = useCallback(() => {
    if (validateStep()) {
      onComplete(situation);
    }
  }, [situation, validateStep, onComplete]);

  // Memoized values for performance
  const totalAssetsFormatted = useMemo(() => 
    situation.totalAssets.toLocaleString('fr-FR'), 
    [situation.totalAssets]
  );

  const GOALS_LIST = [
    "Réduire les droits de succession",
    "Protéger le conjoint survivant",
    "Accélérer la transmission aux enfants",
    "Conserver le contrôle des actifs",
    "Transmettre une entreprise familiale",
    "Optimisation fiscale globale"
  ];

  return (
    <div className="max-w-3xl mx-auto glass-card rounded-3xl overflow-hidden border border-brand-accent/20 animate-fadeInUp">
      <div className="bg-brand-navy p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent opacity-10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-heading font-extrabold mb-2">Situation <span className="text-brand-accent">Patrimoniale</span></h2>
          <div className="flex items-center gap-4">
            <div className="flex-grow h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="bg-brand-accent h-full transition-all duration-700" style={{ width: `${(step/4)*100}%` }}></div>
            </div>
            <p className="text-brand-accent text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Étape {step} / 4</p>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-12">
        {step === 1 && (
          <div className="space-y-10">
            {(errors.age || errors.childrenCount) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {errors.age || errors.childrenCount}
                  </span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-navy uppercase tracking-widest opacity-50">Votre âge</label>
                <input 
                  type="number" 
                  value={situation.age}
                  onChange={(e) => setSituation({...situation, age: parseInt(e.target.value, 10)})}
                  className="w-full p-4 bg-brand-light border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none font-bold text-brand-navy transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-navy uppercase tracking-widest opacity-50">Régime matrimonial</label>
                <select 
                  value={situation.maritalStatus}
                  onChange={(e) => setSituation({...situation, maritalStatus: e.target.value as MaritalStatus})}
                  className="w-full p-4 bg-brand-light border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none text-sm font-bold text-brand-navy transition-all"
                >
                  <option value="Marié (Communauté réduite aux acquêts - Régime légal)">Marié (Communauté réduite aux acquêts - Régime légal)</option>
                  <option value="Marié (Communauté universelle)">Marié (Communauté universelle)</option>
                  <option value="Marié (Séparation de biens)">Marié (Séparation de biens)</option>
                  <option value="Marié (Participation aux acquêts)">Marié (Participation aux acquêts)</option>
                  <option value="Marié (Communauté de meubles et acquêts)">Marié (Communauté de meubles et acquêts)</option>
                  <option value="PACS (Séparation de biens)">PACS (Séparation de biens)</option>
                  <option value="PACS (Indivision)">PACS (Indivision)</option>
                  <option value="Union Libre (Concubinage)">Union Libre (Concubinage)</option>
                  <option value="Célibataire">Célibataire</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-navy uppercase tracking-widest opacity-50">Antécédents</label>
                <select 
                  value={situation.unionHistory}
                  onChange={(e) => setSituation({...situation, unionHistory: e.target.value as UnionHistory})}
                  className="w-full p-4 bg-brand-light border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none text-sm font-bold text-brand-navy transition-all"
                >
                  <option value="Aucune">Aucune union précédente</option>
                  <option value="Divorcé(e)">Divorcé(e)</option>
                  <option value="Veuf/Veuve">Veuf/Veuve</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-navy uppercase tracking-widest opacity-50">Nombre d'enfants</label>
                <input 
                  type="number" 
                  value={situation.childrenCount}
                  onChange={(e) => setSituation({...situation, childrenCount: parseInt(e.target.value, 10)})}
                  className="w-full p-4 bg-brand-light border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none font-bold text-brand-navy transition-all"
                />
              </div>
            </div>

            <label className="flex items-center gap-4 cursor-pointer p-5 rounded-2xl bg-brand-accent/5 border border-brand-accent/10 hover:bg-brand-accent/10 transition-all duration-300">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox"
                  checked={situation.hasChildrenFromFirstBed}
                  onChange={(e) => setSituation({...situation, hasChildrenFromFirstBed: e.target.checked})}
                  className="peer appearance-none w-6 h-6 rounded-lg border-2 border-brand-navy/20 checked:bg-brand-accent checked:border-brand-accent transition-all cursor-pointer"
                />
                <Check className="absolute w-3 h-3 text-brand-navy opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <div>
                <span className="text-xs font-heading font-extrabold uppercase tracking-tight text-brand-navy">Enfants d'un 1er lit ?</span>
                <p className="text-[10px] text-slate-400 font-medium">Nous prendrons en compte les enjeux de réserve héréditaire spécifiques.</p>
              </div>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="bg-brand-navy p-8 rounded-3xl border border-brand-accent/20 shadow-xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Désignation</label>
                  <input 
                    placeholder="ex: Résidence Principale" 
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none font-medium text-sm text-white placeholder:text-white/20"
                    value={newAsset.label}
                    onChange={e => setNewAsset({...newAsset, label: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Type d'actif</label>
                  <select 
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none font-bold text-xs text-white uppercase tracking-wider"
                    value={newAsset.type}
                    onChange={e => setNewAsset({...newAsset, type: e.target.value as Asset['type']})}
                  >
                    {Object.keys(ASSET_TYPES).map(t => (
                      <option key={t} value={t} className="bg-brand-navy">{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Valeur estimée (€)</label>
                  <input 
                    type="number" 
                    placeholder="0 €"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none font-bold text-sm text-brand-accent placeholder:text-brand-accent/20"
                    value={newAsset.value || ''}
                    onChange={e => setNewAsset({...newAsset, value: parseInt(e.target.value, 10)})}
                  />
                </div>
                <button 
                  onClick={addAsset}
                  className="w-full bg-brand-accent text-brand-navy p-3.5 rounded-xl font-heading font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,217,255,0.3)]"
                >
                  Intégrer à l'actif brut
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {situation.assetsBreakdown.map((asset, idx) => (
                <div key={idx} className="flex justify-between items-center p-5 bg-white border border-slate-100 rounded-2xl hover:border-brand-accent/30 transition-all duration-300 group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-brand-accent/10 p-3 rounded-xl group-hover:bg-brand-accent group-hover:text-brand-navy transition-colors">{ASSET_TYPES[asset.type].icon}</div>
                    <div>
                      <div className="font-bold text-brand-navy text-sm">{asset.label}</div>
                      <div className="text-[9px] text-brand-accent font-black uppercase tracking-widest">{asset.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="font-heading font-bold text-brand-navy">{asset.value.toLocaleString()} €</span>
                    <button onClick={() => removeAsset(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {situation.assetsBreakdown.length > 0 && (
                <div className="pt-8 border-t border-slate-100 flex justify-between items-center px-4">
                  <span className="text-[10px] font-black text-brand-navy uppercase tracking-widest opacity-40">Masse successorale brute</span>
                  <span className="text-2xl font-heading font-black text-brand-navy">{totalAssetsFormatted} €</span>
                </div>
              )}
              {errors.assets && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{errors.assets}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10">
            {errors.goals && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{errors.goals}</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GOALS_LIST.map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-5 rounded-2xl border-2 text-[11px] font-heading font-black uppercase tracking-widest text-left transition-all duration-300 relative group ${
                    situation.goals.includes(goal) 
                      ? "border-brand-accent bg-brand-accent/5 text-brand-navy shadow-[0_0_15px_rgba(0,217,255,0.15)]" 
                      : "border-slate-100 bg-brand-light text-brand-navy/50 hover:border-brand-accent/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {goal}
                    {situation.goals.includes(goal) && <ChevronRight className="w-4 h-4 text-brand-accent" />}
                  </div>
                </button>
              ))}
            </div>

            {situation.goals.length > 0 && (
              <div className="bg-brand-navy p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-brand-accent/20">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-accent opacity-5 rounded-full blur-3xl"></div>
                <h4 className="flex items-center gap-3 font-heading font-black mb-8 text-brand-accent uppercase text-[11px] tracking-widest border-b border-white/10 pb-4">
                  <Lightbulb className="w-4 h-4" /> Analyse en temps réel
                </h4>
                <div className="space-y-6">
                  {situation.goals.slice(0, 2).map(goal => {
                    const advice = getDynamicGoalAdvice(goal);
                    return (
                      <div key={goal} className="flex items-start gap-5">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">{advice.icon}</div>
                        <div>
                          <div className="text-[10px] font-black text-brand-accent uppercase tracking-wider mb-2">{goal}</div>
                          <p className="text-sm text-slate-300 leading-relaxed font-light">{advice.tip}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10">
            {/* <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-brand-accent/10 rounded-3xl mb-6 border border-brand-accent/20 shadow-[0_0_30px_rgba(0,217,255,0.1)]">
                <Scale className="w-10 h-10 text-brand-accent" />
              </div>
              <h3 className="text-3xl font-heading font-black text-brand-navy">Finalisation du Dossier</h3>
              <p className="text-slate-500 max-w-sm mx-auto text-sm font-light mt-4">
                Nous analysons maintenant vos données pour identifier les structures de transmission optimales.
              </p>
            </div> */}

            <div className="bg-brand-light p-8 rounded-3xl border border-slate-200">
              <label className="flex items-center gap-2 text-[11px] font-heading font-black text-brand-navy uppercase tracking-widest mb-4">
                <MessageSquareText className="w-4 h-4 text-brand-accent" /> Précisions stratégiques (Optionnel)
              </label>
              <textarea 
                className="w-full p-5 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none text-sm font-medium placeholder:text-slate-300 min-h-[140px] shadow-inner"
                placeholder="Ex : Protection spécifique d'un enfant vulnérable, projet de délocalisation, volonté de favoriser un petit-enfant..."
                value={situation.additionalContext}
                onChange={(e) => setSituation({...situation, additionalContext: e.target.value})}
              />
              <p className="text-[10px] text-slate-400 mt-3 font-medium flex items-center gap-2">
                <Info className="w-3 h-3 text-brand-accent" /> Ces données affinent la pertinence de nos recommandations.
              </p>
            </div>

            <div className="bg-brand-navy p-8 rounded-3xl text-left shadow-2xl border border-brand-accent/20">
              <div className="text-[10px] text-brand-accent uppercase tracking-widest font-black mb-6 border-b border-white/10 pb-4">Check-list de synthèse</div>
              <div className="grid grid-cols-2 gap-6 text-[11px] text-slate-300 font-medium">
                <div className="space-y-3">
                  <p className="flex items-center gap-2"><span className="w-1 h-1 bg-brand-accent rounded-full block" /> <strong className="text-white">Régime :</strong> {situation.maritalStatus.split(' (')[0]}</p>
                  <p className="flex items-center gap-2"><span className="w-1 h-1 bg-brand-accent rounded-full block" /> <strong className="text-white">Passé :</strong> {situation.unionHistory}</p>
                </div>
                <div className="space-y-3">
                  <p className="flex items-center gap-2"><span className="w-1 h-1 bg-brand-accent rounded-full block" /> <strong className="text-white">Famille :</strong> {situation.childrenCount} enfant(s)</p>
                  <p className="flex items-center gap-2"><span className="w-1 h-1 bg-brand-accent rounded-full block" /> <strong className="text-white">Actif :</strong> {situation.totalAssets.toLocaleString()} €</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 flex justify-between items-center">
          {step > 1 ? (
            <button onClick={prevStep} className="text-brand-navy/40 font-heading font-black uppercase text-[11px] tracking-widest hover:text-brand-navy transition-colors">
              Retour
            </button>
          ) : <div />}
          <div className="ml-auto">
            {step < 4 ? (
              <button 
                onClick={nextStep}
                disabled={step === 2 && situation.assetsBreakdown.length === 0}
                className="bg-brand-navy text-white px-12 py-5 rounded-2xl font-heading font-black uppercase tracking-widest text-[11px] flex items-center gap-3 hover:bg-brand-accent hover:text-brand-navy transition-all duration-500 shadow-xl disabled:opacity-20 hover:scale-105 active:scale-95"
              >
                Continuer <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleComplete}
                className="bg-brand-accent text-brand-navy px-16 py-6 rounded-2xl font-heading font-black uppercase tracking-widest text-[12px] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-500 shadow-[0_0_30px_rgba(0,217,255,0.4)]"
              >
                Générer mon Étude
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
