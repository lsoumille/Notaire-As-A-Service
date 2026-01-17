
import React, { useState } from 'react';
import { UserSituation, Asset, MaritalStatus, AssetCategory, UnionHistory } from '../types';
import { User, Users, Briefcase, Target, ArrowRight, Plus, Trash2, Lightbulb, Info, Building2, Coins, Wallet, Heart, History, Scale, AlertCircle } from 'lucide-react';

interface QuestionnaireProps {
  onComplete: (situation: UserSituation) => void;
}

const ASSET_TYPES: Record<Asset['type'], { category: AssetCategory; icon: React.ReactNode }> = {
  'Immobilier': { category: 'Immobilier', icon: <Building2 className="w-4 h-4" /> },
  'Assurance-vie': { category: 'Financier', icon: <Heart className="w-4 h-4 text-rose-500" /> },
  'Liquidités/Livrets': { category: 'Financier', icon: <Wallet className="w-4 h-4 text-blue-500" /> },
  'PEA/Titres': { category: 'Financier', icon: <Coins className="w-4 h-4 text-amber-500" /> },
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
    const hasRealEstate = situation.assetsBreakdown.some(a => a.category === 'Immobilier');
    const hasFinancialAssets = situation.assetsBreakdown.some(a => a.type === 'PEA/Titres' || a.type === 'Liquidités/Livrets');
    const isMarried = situation.maritalStatus.startsWith('Marié');
    const isPacs = situation.maritalStatus.startsWith('PACS');
    const childAbattement = 100000 * situation.childrenCount;
    const formatValue = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

    switch (goal) {
      case "Réduire les droits de succession":
        return {
          tip: `Avec vos ${situation.childrenCount} enfant(s), vous bénéficiez de ${formatValue(childAbattement)} d'abattements globaux. ${hasRealEstate ? "Le démembrement immobilier permettrait d'utiliser cet abattement sur la seule nue-propriété." : "Pensez aux dons de sommes d'argent (Art. 790G) pour optimiser vos abattements."}`,
          icon: <Info className="w-4 h-4 text-blue-500" />
        };
      case "Protéger le conjoint survivant":
        let note = "";
        if (situation.hasChildrenFromFirstBed && isMarried) {
          note = "ALERTE : En présence d'enfants d'un premier lit, la loi restreint les options de votre conjoint. Une 'Donation entre époux' est cruciale pour lui garantir l'usufruit total.";
        } else if (situation.maritalStatus === 'Marié (Communauté universelle)') {
          note = "Votre régime offre la protection maximale. Attention au coût fiscal final pour les enfants au second décès.";
        } else if (isMarried) {
          note = "La 'Donation entre époux' permet d'élargir les droits de votre conjoint au-delà du quart en propriété prévu par la loi.";
        } else if (isPacs) {
          note = "Rappel : Sans testament, le partenaire de PACS n'hérite de rien, même s'il est exonéré de taxes.";
        } else {
          note = "En concubinage, la taxation est de 60%. L'assurance-vie est votre levier principal de protection.";
        }
        return {
          tip: note,
          icon: situation.hasChildrenFromFirstBed ? <AlertCircle className="w-4 h-4 text-amber-500" /> : <Users className="w-4 h-4 text-rose-500" />
        };
      case "Accélérer la transmission aux enfants":
        return {
          tip: situation.childrenCount > 1 
            ? "La donation-partage est fortement recommandée pour vos enfants afin de figer les valeurs et éviter tout conflit futur."
            : "Une donation avec réserve d'usufruit vous permet de transmettre dès maintenant tout en gardant l'usage du bien.",
          icon: <ArrowRight className="w-4 h-4 text-emerald-500" />
        };
      case "Optimisation fiscale globale":
        return {
          tip: situation.maritalStatus === 'Marié (Séparation de biens)' && hasFinancialAssets
            ? "En séparation, soyez vigilant sur le financement des comptes joints pour éviter les requalifications fiscales en donation déguisée."
            : `À ${situation.age} ans, le démembrement de contrat de capitalisation est un levier fiscal puissant pour vos placements financiers.`,
          icon: <Lightbulb className="w-4 h-4 text-yellow-500" />
        };
      default:
        return { tip: "Précisez vos actifs pour des conseils personnalisés.", icon: <Info className="w-4 h-4" /> };
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

  const MARITAL_OPTIONS: MaritalStatus[] = [
    'Marié (Communauté réduite aux acquêts - Régime légal)',
    'Marié (Communauté universelle)',
    'Marié (Séparation de biens)',
    'Marié (Participation aux acquêts)',
    'Marié (Communauté de meubles et acquêts)',
    'PACS (Séparation de biens)',
    'PACS (Indivision)',
    'Union Libre (Concubinage)',
    'Célibataire'
  ];

  const UNION_HISTORY_OPTIONS: UnionHistory[] = ['Aucune', 'Divorcé(e)', 'Veuf/Veuve'];

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-[#1e293b] p-8 text-white">
        <h2 className="text-3xl font-serif mb-2">Analyse Notariale</h2>
        <p className="text-slate-300">Étape {step} sur 4 : {
          step === 1 ? "Profil & Situation Familiale" : 
          step === 2 ? "Composition du patrimoine" : 
          step === 3 ? "Objectifs de transmission" : 
          "Récapitulatif"
        }</p>
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-slate-800 font-semibold mb-4 border-b pb-2">
                <User className="w-5 h-5 text-indigo-600" />
                <span>Situation Civile Actuelle</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Votre âge actuel</label>
                  <input 
                    type="number" 
                    value={situation.age}
                    onChange={(e) => setSituation({...situation, age: parseInt(e.target.value)})}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Régime Matrimonial / Union</label>
                  <select 
                    value={situation.maritalStatus}
                    onChange={(e) => setSituation({...situation, maritalStatus: e.target.value as MaritalStatus})}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  >
                    {MARITAL_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 text-slate-800 font-semibold mb-4 border-b pb-2">
                <History className="w-5 h-5 text-indigo-600" />
                <span>Antécédents & Enfants</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Passé marital</label>
                  <select 
                    value={situation.unionHistory}
                    onChange={(e) => setSituation({...situation, unionHistory: e.target.value as UnionHistory})}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {UNION_HISTORY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col justify-center">
                   <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                      <input 
                        type="checkbox"
                        checked={situation.hasChildrenFromFirstBed}
                        onChange={(e) => setSituation({...situation, hasChildrenFromFirstBed: e.target.checked})}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Enfants d'un premier lit ?</span>
                   </label>
                   {situation.hasChildrenFromFirstBed && (
                     <p className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1 uppercase tracking-tight">
                       <AlertCircle className="w-3 h-3" /> Impact sur les droits du conjoint
                     </p>
                   )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre d'enfants total</label>
                  <input 
                    type="number" 
                    value={situation.childrenCount}
                    onChange={(e) => setSituation({...situation, childrenCount: parseInt(e.target.value)})}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic">Inclure les enfants de toutes les unions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 text-slate-800 font-semibold mb-4">
              <Briefcase className="w-5 h-5" />
              <span>Détail du Patrimoine Brut</span>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl space-y-4 border border-slate-100 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Désignation du bien</label>
                  <input 
                    placeholder="ex: Appartement Lyon, Portefeuille PEA..." 
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={newAsset.label}
                    onChange={e => setNewAsset({...newAsset, label: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Type de catégorie</label>
                  <select 
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={newAsset.type}
                    onChange={e => setNewAsset({...newAsset, type: e.target.value as Asset['type']})}
                  >
                    {Object.keys(ASSET_TYPES).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estimation (€)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={newAsset.value || ''}
                    onChange={e => setNewAsset({...newAsset, value: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={addAsset}
                    className="w-full bg-indigo-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition font-bold"
                  >
                    <Plus className="w-4 h-4" /> Ajouter l'actif
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 max-h-60 overflow-y-auto pr-2">
              {situation.assetsBreakdown.map((asset, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      {ASSET_TYPES[asset.type].icon}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{asset.label}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{asset.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900">{asset.value.toLocaleString()} €</span>
                    <button onClick={() => removeAsset(idx)} className="text-slate-300 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t flex justify-between items-center sticky bottom-0 bg-white">
                <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Masse successorale brute</span>
                <span className="text-2xl font-serif font-bold text-indigo-700">{situation.totalAssets.toLocaleString()} €</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <div className="flex items-center gap-3 text-slate-800 font-semibold mb-4">
                <Target className="w-5 h-5" />
                <span>Vos priorités</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {GOALS_LIST.map(goal => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-4 rounded-xl border-2 text-left transition text-sm ${
                      situation.goals.includes(goal) 
                        ? "border-indigo-600 bg-indigo-50 text-indigo-900" 
                        : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {situation.goals.length > 0 && (
              <div className="bg-indigo-900 p-6 rounded-2xl text-white">
                <h4 className="flex items-center gap-2 font-bold mb-4 text-indigo-200 uppercase text-[10px] tracking-widest">
                  <Lightbulb className="w-4 h-4" /> Orientations Préliminaires
                </h4>
                <div className="space-y-4">
                  {situation.goals.map(goal => {
                    const advice = getDynamicGoalAdvice(goal);
                    return (
                      <div key={goal} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="shrink-0">{advice.icon}</div>
                        <div>
                          <div className="text-xs font-bold text-indigo-100 mb-1">{goal}</div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{advice.tip}</p>
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
          <div className="space-y-6 animate-fadeIn text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
              <Scale className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-serif text-slate-800">Finaliser l'Expertise</h3>
            <p className="text-slate-500 max-w-md mx-auto text-sm">
              L'algorithme va intégrer votre régime de {situation.maritalStatus} ainsi que votre historique familial pour calculer votre stratégie optimale.
            </p>
            <div className="bg-slate-50 p-6 rounded-xl text-left max-w-md mx-auto border border-slate-100 mt-6 space-y-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Synthèse de votre profil</div>
              <div className="text-xs text-slate-700">• <strong>Régime :</strong> {situation.maritalStatus}</div>
              <div className="text-xs text-slate-700">• <strong>Historique :</strong> {situation.unionHistory}{situation.hasChildrenFromFirstBed ? " + Enfants 1er lit" : ""}</div>
              <div className="text-xs text-slate-700">• <strong>Famille :</strong> {situation.childrenCount} enfant(s) au total</div>
              <div className="text-xs text-slate-700">• <strong>Patrimoine :</strong> {situation.totalAssets.toLocaleString()} €</div>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-between items-center">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="px-6 py-3 text-slate-500 font-semibold hover:text-slate-700 transition"
            >
              Retour
            </button>
          )}
          <div className="ml-auto">
            {step < 4 ? (
              <button 
                onClick={nextStep}
                disabled={step === 2 && situation.assetsBreakdown.length === 0}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
              >
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => onComplete(situation)}
                className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
              >
                Calculer la Stratégie
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
