
import React, { useState } from 'react';
import { UserSituation, Asset, MaritalStatus, AssetCategory, UnionHistory } from '../types';
import { User, Users, Briefcase, Target, ArrowRight, Plus, Trash2, Lightbulb, Info, Building2, Coins, Wallet, Heart, History, Scale, AlertCircle, Crown } from 'lucide-react';

interface QuestionnaireProps {
  onComplete: (situation: UserSituation) => void;
}

const ASSET_TYPES: Record<Asset['type'], { category: AssetCategory; icon: React.ReactNode }> = {
  'Immobilier': { category: 'Immobilier', icon: <Building2 className="w-4 h-4 text-brand-navy" /> },
  'Assurance-vie': { category: 'Financier', icon: <Heart className="w-4 h-4 text-brand-gold" /> },
  'Liquidités/Livrets': { category: 'Financier', icon: <Wallet className="w-4 h-4 text-brand-navy" /> },
  'PEA/Titres': { category: 'Financier', icon: <Coins className="w-4 h-4 text-brand-gold" /> },
  'Entreprise': { category: 'Professionnel', icon: <Briefcase className="w-4 h-4 text-slate-500" /> },
  'Autre': { category: 'Autre', icon: <Plus className="w-4 h-4 text-slate-400" /> }
};

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [situation, setSituation] = useState<UserSituation>({
    age: 50,
    maritalStatus: 'Marié (Communauté réduite aux acquêts - Régime légal)',
    unionHistory: 'Aucune',
    hasChildrenFromFirstBed: false,
    childrenCount: 2,
    totalAssets: 0,
    assetsBreakdown: [],
    goals: []
  });

  const [newAsset, setNewAsset] = useState<Partial<Asset>>({ type: 'Immobilier', value: 0, label: '' });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const addAsset = () => {
    if (newAsset.label && newAsset.value && newAsset.value > 0 && newAsset.type) {
      const typeInfo = ASSET_TYPES[newAsset.type as Asset['type']];
      const assetToAdd: Asset = {
        type: newAsset.type as Asset['type'],
        category: typeInfo.category,
        value: newAsset.value,
        label: newAsset.label
      };
      const updatedAssets = [...situation.assetsBreakdown, assetToAdd];
      const total = updatedAssets.reduce((acc, curr) => acc + curr.value, 0);
      setSituation({ ...situation, assetsBreakdown: updatedAssets, totalAssets: total });
      setNewAsset({ type: 'Immobilier', value: 0, label: '' });
    }
  };

  const removeAsset = (index: number) => {
    const updatedAssets = situation.assetsBreakdown.filter((_, i) => i !== index);
    const total = updatedAssets.reduce((acc, curr) => acc + curr.value, 0);
    setSituation({ ...situation, assetsBreakdown: updatedAssets, totalAssets: total });
  };

  const toggleGoal = (goal: string) => {
    const currentGoals = situation.goals.includes(goal)
      ? situation.goals.filter(g => g !== goal)
      : [...situation.goals, goal];
    setSituation({ ...situation, goals: currentGoals });
  };

  const getDynamicGoalAdvice = (goal: string) => {
    const childAbattement = 100000 * situation.childrenCount;
    const formatValue = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

    switch (goal) {
      case "Réduire les droits de succession":
        return {
          tip: `Avec vos ${situation.childrenCount} enfant(s), vous disposez de ${formatValue(childAbattement)} d'abattements cumulés tous les 15 ans.`,
          icon: <Info className="w-4 h-4 text-brand-gold" />
        };
      case "Protéger le conjoint survivant":
        return {
          tip: situation.hasChildrenFromFirstBed ? "ALERTE : Les enfants d'un premier lit limitent les options par défaut du conjoint. Une donation entre époux est stratégique." : "Le conjoint est exonéré au décès, mais la donation entre époux protège mieux son cadre de vie.",
          icon: <AlertCircle className="w-4 h-4 text-brand-gold" />
        };
      default:
        return { tip: "Précisez vos objectifs pour des conseils ciblés.", icon: <Info className="w-4 h-4" /> };
    }
  };

  const GOALS_LIST = [
    "Réduire les droits de succession",
    "Protéger le conjoint survivant",
    "Accélérer la transmission aux enfants",
    "Conserver le contrôle des actifs",
    "Transmettre une entreprise familiale",
    "Optimisation fiscale globale"
  ];

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-brand-gold/10">
      <div className="bg-brand-navy p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold opacity-10 rounded-full -mr-16 -mt-16"></div>
        <h2 className="text-3xl font-serif mb-2">Audit Patrimonial</h2>
        <p className="text-brand-goldLight text-xs font-bold uppercase tracking-widest">Étape {step} sur 4 : {
          step === 1 ? "Profil Familial" : 
          step === 2 ? "Inventaire des Actifs" : 
          step === 3 ? "Priorités de vie" : 
          "Validation finale"
        }</p>
      </div>

      <div className="p-8 md:p-12">
        {step === 1 && (
          <div className="space-y-10 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-gold uppercase tracking-widest">Votre âge</label>
                <input 
                  type="number" 
                  value={situation.age}
                  onChange={(e) => setSituation({...situation, age: parseInt(e.target.value)})}
                  className="w-full p-4 bg-brand-cream/30 border border-brand-gold/10 rounded-lg focus:ring-1 focus:ring-brand-gold focus:outline-none font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-gold uppercase tracking-widest">Régime matrimonial</label>
                <select 
                  value={situation.maritalStatus}
                  onChange={(e) => setSituation({...situation, maritalStatus: e.target.value as MaritalStatus})}
                  className="w-full p-4 bg-brand-cream/30 border border-brand-gold/10 rounded-lg focus:ring-1 focus:ring-brand-gold focus:outline-none text-sm font-medium"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-gold uppercase tracking-widest">Passé marital</label>
                <select 
                  value={situation.unionHistory}
                  onChange={(e) => setSituation({...situation, unionHistory: e.target.value as UnionHistory})}
                  className="w-full p-4 bg-brand-cream/30 border border-brand-gold/10 rounded-lg focus:ring-1 focus:ring-brand-gold focus:outline-none text-sm font-medium"
                >
                  <option value="Aucune">Aucune union précédente</option>
                  <option value="Divorcé(e)">Divorcé(e)</option>
                  <option value="Veuf/Veuve">Veuf/Veuve</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-gold uppercase tracking-widest">Enfants (Total)</label>
                <input 
                  type="number" 
                  value={situation.childrenCount}
                  onChange={(e) => setSituation({...situation, childrenCount: parseInt(e.target.value)})}
                  className="w-full p-4 bg-brand-cream/30 border border-brand-gold/10 rounded-lg focus:ring-1 focus:ring-brand-gold font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg bg-brand-navy/5 border border-brand-gold/10 hover:bg-brand-navy/10 transition">
                <input 
                  type="checkbox"
                  checked={situation.hasChildrenFromFirstBed}
                  onChange={(e) => setSituation({...situation, hasChildrenFromFirstBed: e.target.checked})}
                  className="w-4 h-4 rounded border-brand-gold/30 text-brand-gold focus:ring-brand-gold"
                />
                <span className="text-sm font-bold uppercase tracking-tight text-brand-navy">Enfants d'un 1er lit ?</span>
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-brand-cream p-6 rounded-xl border border-brand-gold/20 shadow-inner space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  placeholder="Désignation (ex: Résidence, PEA...)" 
                  className="w-full p-3 bg-white border border-brand-gold/10 rounded-lg focus:ring-1 focus:ring-brand-gold font-medium text-sm"
                  value={newAsset.label}
                  onChange={e => setNewAsset({...newAsset, label: e.target.value})}
                />
                <select 
                  className="w-full p-3 bg-white border border-brand-gold/10 rounded-lg focus:ring-1 focus:ring-brand-gold font-bold text-[10px] uppercase tracking-wider"
                  value={newAsset.type}
                  onChange={e => setNewAsset({...newAsset, type: e.target.value as Asset['type']})}
                >
                  {Object.keys(ASSET_TYPES).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="Valeur estimée (€)"
                  className="w-full p-3 bg-white border border-brand-gold/10 rounded-lg focus:ring-1 focus:ring-brand-gold font-medium text-sm"
                  value={newAsset.value || ''}
                  onChange={e => setNewAsset({...newAsset, value: parseInt(e.target.value)})}
                />
                <button 
                  onClick={addAsset}
                  className="w-full bg-brand-gold text-white p-3 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-brand-navy transition shadow-sm"
                >
                  Ajouter à l'inventaire
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {situation.assetsBreakdown.map((asset, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-white border border-brand-gold/5 rounded-xl hover:border-brand-gold/20 transition group">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-cream p-2 rounded-lg">{ASSET_TYPES[asset.type].icon}</div>
                    <div>
                      <div className="font-bold text-brand-navy text-sm">{asset.label}</div>
                      <div className="text-[9px] text-brand-gold font-black uppercase tracking-widest">{asset.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-brand-navy">{asset.value.toLocaleString()} €</span>
                    <button onClick={() => removeAsset(idx)} className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t border-brand-gold/20 flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest">Masse brute totale</span>
                <span className="text-2xl font-serif font-bold text-brand-navy">{situation.totalAssets.toLocaleString()} €</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GOALS_LIST.map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-4 rounded-xl border text-[11px] font-black uppercase tracking-widest text-left transition ${
                    situation.goals.includes(goal) 
                      ? "border-brand-gold bg-brand-gold/5 text-brand-navy shadow-inner" 
                      : "border-brand-gold/10 bg-white text-brand-navy/60 hover:border-brand-gold/30"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>

            {situation.goals.length > 0 && (
              <div className="bg-brand-navy p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-gold opacity-10 rounded-full -mb-12 -mr-12"></div>
                <h4 className="flex items-center gap-2 font-black mb-6 text-brand-gold uppercase text-[10px] tracking-widest border-b border-white/10 pb-2">
                  <Lightbulb className="w-3.5 h-3.5" /> Orientations Stratégiques
                </h4>
                <div className="space-y-4">
                  {situation.goals.slice(0, 2).map(goal => {
                    const advice = getDynamicGoalAdvice(goal);
                    return (
                      <div key={goal} className="flex items-start gap-4">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/5">{advice.icon}</div>
                        <div>
                          <div className="text-[9px] font-black text-brand-goldLight uppercase tracking-wider mb-1">{goal}</div>
                          <p className="text-xs text-slate-300 leading-relaxed font-light italic">{advice.tip}</p>
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
          <div className="space-y-8 animate-fadeIn text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-brand-gold/10 rounded-full mb-4 border border-brand-gold/20">
              <Crown className="w-10 h-10 text-brand-gold" />
            </div>
            <h3 className="text-3xl font-serif">Lancer l'Analyse Expert</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm font-light leading-relaxed">
              Nos algorithmes traitent vos données pour identifier les meilleures structures civiles (SCI, démembrement) et fiscales (Art. 757, 990 I).
            </p>
            <div className="bg-brand-navy p-8 rounded-2xl text-left max-w-sm mx-auto shadow-2xl border border-brand-gold/20">
              <div className="text-[9px] text-brand-gold uppercase tracking-widest font-black mb-4 border-b border-white/10 pb-2">Résumé du dossier</div>
              <div className="space-y-3 text-xs text-slate-300 font-light">
                <p>• <strong className="text-white">Union :</strong> {situation.maritalStatus}</p>
                <p>• <strong className="text-white">Profil :</strong> {situation.childrenCount} enfant(s) - {situation.age} ans</p>
                <p>• <strong className="text-white">Patrimoine :</strong> {situation.totalAssets.toLocaleString()} €</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 flex justify-between items-center">
          {step > 1 ? (
            <button onClick={prevStep} className="text-brand-navy/50 font-black uppercase text-[10px] tracking-widest hover:text-brand-navy transition">
              Précédent
            </button>
          ) : <div />}
          <div className="ml-auto">
            {step < 4 ? (
              <button 
                onClick={nextStep}
                disabled={step === 2 && situation.assetsBreakdown.length === 0}
                className="bg-brand-navy text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-brand-gold transition shadow-lg disabled:opacity-20"
              >
                Suivant <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button 
                onClick={() => onComplete(situation)}
                className="bg-brand-gold text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center gap-2 hover:bg-brand-navy transition shadow-xl shadow-brand-gold/20"
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
