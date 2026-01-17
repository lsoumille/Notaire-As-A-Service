
import React from 'react';
import { LegalAnalysis, StrategyOption, UserSituation } from '../types';
import { 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Euro, 
  Info,
  BarChart3,
  Layers,
  Star,
  Zap,
  Home,
  Heart,
  PlusCircle,
  MinusCircle,
  Coins,
  Scale,
  Printer,
  FileText,
  Gavel,
  Flag
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';

interface StrategyResultsProps {
  analysis: LegalAnalysis;
  situation: UserSituation;
  onReset: () => void;
}

const StrategyResults: React.FC<StrategyResultsProps> = ({ analysis, situation, onReset }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  // Sort options by priority: Haute > Moyenne > Basse
  const priorityOrder = { 'Haute': 0, 'Moyenne': 1, 'Basse': 2 };
  const sortedOptions = [...analysis.suggestedOptions].sort((a, b) => 
    priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
  );

  const fiscalData = analysis.suggestedOptions.map(opt => ({
    name: opt.title,
    "Capital": opt.affectedValue,
    "Économies": opt.estimatedSavingsAmount,
    "Coût Fiscal": opt.estimatedTaxCost,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const capital = payload.find((p: any) => p.dataKey === "Capital")?.value || 0;
      const savings = payload.find((p: any) => p.dataKey === "Économies")?.value || 0;
      const cost = payload.find((p: any) => p.dataKey === "Coût Fiscal")?.value || 0;
      const netGain = savings - cost;

      return (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-slate-100 min-w-[240px]">
          <p className="font-bold text-slate-900 mb-3 border-b pb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                Capital mobilisé :
              </span>
              <span className="font-bold text-slate-700">{formatCurrency(capital)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-600 flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5" />
                Économie fiscale :
              </span>
              <span className="font-bold text-emerald-700">+{formatCurrency(savings)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-rose-500 flex items-center gap-1.5">
                <MinusCircle className="w-3.5 h-3.5" />
                Coût de l'acte :
              </span>
              <span className="font-bold text-rose-600">-{formatCurrency(cost)}</span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center">
              <span className="text-sm font-bold text-indigo-900">Bilan Net :</span>
              <span className={`text-sm font-black ${netGain >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                {netGain >= 0 ? '+' : ''}{formatCurrency(netGain)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getUsufruitPercentage = (age: number): number => {
    if (age < 21) return 90;
    if (age < 31) return 80;
    if (age < 41) return 70;
    if (age < 51) return 60;
    if (age < 61) return 50;
    if (age < 71) return 40;
    if (age < 81) return 30;
    if (age < 91) return 20;
    return 10;
  };

  const usufruitPct = getUsufruitPercentage(situation.age);
  const nuePropPct = 100 - usufruitPct;

  const isDismembermentStrategy = (option: StrategyOption) => {
    const keywords = ['démembrement', 'usufruit', 'nue-propriété', 'nue propriété'];
    return keywords.some(k => 
      option.title.toLowerCase().includes(k) || 
      option.description.toLowerCase().includes(k)
    );
  };

  const isFinancialDismemberment = (option: StrategyOption) => {
    const keywords = ['capitalisation', 'assurance-vie', 'clause bénéficiaire', 'titres', 'financier'];
    return keywords.some(k => 
      option.title.toLowerCase().includes(k) || 
      option.description.toLowerCase().includes(k)
    );
  };

  const commonLevers = [
    {
      title: "Assurance-vie (Art. 990 I)",
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      benefit: "Abattement de 152 500 € par bénéficiaire",
      description: "Le levier le plus puissant. Exonération totale jusqu'à 152 500 € par bénéficiaire désigné pour les primes versées avant 70 ans. Hors succession civile.",
      condition: situation.age < 70
    },
    {
      title: "Assurance-vie (Art. 757 B)",
      icon: <Zap className="w-5 h-5 text-orange-400" />,
      benefit: "Abattement global de 30 500 €",
      description: "Après 70 ans, seuls les intérêts sont exonérés. Un abattement unique de 30 500 € s'applique sur le capital versé, partagé entre tous les bénéficiaires.",
      condition: situation.age >= 70
    },
    {
      title: "Donation de Sommes d'Argent (Art. 790 G)",
      icon: <Euro className="w-5 h-5 text-emerald-500" />,
      benefit: "Exonération de 31 865 € tous les 15 ans",
      description: "Permet de transmettre du financier sans impôts. Nécessite que le donateur ait moins de 80 ans. Se cumule avec l'abattement de 100 000 €.",
      condition: situation.age < 80 && situation.childrenCount > 0
    },
    {
      title: "Présent d'usage",
      icon: <Star className="w-5 h-5 text-indigo-500" />,
      benefit: "Zéro fiscalité, hors rapport successoral",
      description: "Cadeau fait à l'occasion d'un événement. Il doit être proportionné à votre fortune et n'est jamais taxé ni rapporté à la succession.",
      condition: true
    },
    {
      title: "SCI Familiale",
      icon: <Home className="w-5 h-5 text-orange-500" />,
      benefit: "Optimisation de la valeur via la décote",
      description: "Transforme de l'immobilier en financier (parts). Permet d'appliquer une décote de valeur (10-15%) et facilite la transmission de la nue-propriété.",
      condition: situation.assetsBreakdown.some(a => a.category === 'Immobilier')
    },
    {
      title: "Donation entre Époux",
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      benefit: "Extension des droits du conjoint",
      description: "Aussi appelée 'au dernier vivant', elle protège le conjoint en lui offrant des options d'usufruit ou de propriété plus larges que la loi.",
      condition: situation.maritalStatus.includes('Marié')
    }
  ].filter(l => l.condition);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="print-only hidden mb-10 border-b-2 border-slate-900 pb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <Gavel className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Notaire-as-a-Service</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Mémorandum de Stratégie Patrimoniale</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Date du document : {new Date().toLocaleDateString('fr-FR')}</p>
            <p>Ref : NSP-{Math.random().toString(36).substring(7).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 border-l-8 border-l-indigo-600">
        <h2 className="text-3xl font-serif text-slate-900 mb-4">Synthèse de votre Étude Notariale</h2>
        <p className="text-lg text-slate-600 leading-relaxed italic">
          "{analysis.summary}"
        </p>
      </div>

      <section className="animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            Leviers de Transmission Incontournables
          </h3>
          <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest no-print">
            Basé sur votre profil ({situation.age} ans)
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commonLevers.map((lever, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  {lever.icon}
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{lever.title}</h4>
              </div>
              <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block mb-3">
                {lever.benefit}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {lever.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Impact Fiscal Proportionnel au Capital
            </h3>
            <p className="text-sm text-slate-500 mt-1">Comparatif des gains fiscaux par rapport au capital transmis</p>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fiscalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(val) => `${val / 1000}k€`}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36}/>
              <Bar name="Capital Mobilisé" dataKey="Capital" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={50} />
              <Bar name="Économie Générée" dataKey="Économies" stackId="b" fill="#10b981" barSize={50} />
              <Bar name="Coût de Mise en Place" dataKey="Coût Fiscal" stackId="b" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Recommendations Stratégiques (IA)
          </h3>
          
          {sortedOptions.map((option, idx) => (
            <div key={idx} className={`bg-white rounded-xl shadow-md border-l-4 overflow-hidden hover:shadow-lg transition ${
              option.priority === 'Haute' ? 'border-l-rose-500 border-slate-100' : 
              option.priority === 'Moyenne' ? 'border-l-indigo-500 border-slate-100' : 
              'border-l-slate-300 border-slate-100'
            }`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xl font-bold text-slate-900">{option.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1 ${
                        option.priority === 'Haute' ? 'bg-rose-50 text-rose-600' :
                        option.priority === 'Moyenne' ? 'bg-indigo-50 text-indigo-600' :
                        'bg-slate-50 text-slate-500'
                      }`}>
                        <Flag className="w-3 h-3" /> Priorité {option.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> Gain fiscal estimé : {option.estimatedSavings}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 mb-6">{option.description}</p>

                {isDismembermentStrategy(option) && (
                  <div className="mb-6 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-2 text-indigo-800 font-bold mb-3">
                      <Layers className="w-5 h-5" />
                      Focus : Mécanique du Démembrement {isFinancialDismemberment(option) ? "Financier" : "Immobilier"}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs text-slate-600 leading-relaxed">
                          En fonction de votre âge ({situation.age} ans), la loi fixe votre usufruit à <span className="font-bold text-indigo-700">{usufruitPct}%</span> de la pleine propriété.
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex-grow bg-indigo-200 h-2 rounded-full overflow-hidden flex">
                            <div className="bg-indigo-600 h-full" style={{width: `${usufruitPct}%`}}></div>
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          <span>Usufruit ({usufruitPct}%)</span>
                          <span>Nue-prop ({nuePropPct}%)</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-700 space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5" />
                          <span>Base taxable réduite à <span className="font-bold">{nuePropPct}%</span> de la valeur.</span>
                        </div>
                        {isFinancialDismemberment(option) ? (
                          <>
                            <div className="flex items-start gap-2">
                              <Coins className="w-3 h-3 text-amber-500 mt-0.5" />
                              <span><strong>Quasi-usufruit :</strong> L'usufruitier peut utiliser les fonds, mais les enfants détiennent une <span className="font-bold">créance de restitution</span>.</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start gap-2">
                              <Home className="w-3 h-3 text-indigo-500 mt-0.5" />
                              <span>Conservation du droit d'habiter ou de percevoir les loyers.</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Avantages
                    </div>
                    <ul className="space-y-2">
                      {option.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" /> Vigilances
                    </div>
                    <ul className="space-y-2">
                      {option.cons.map((con, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 text-indigo-600 font-semibold">
                  <Euro className="w-5 h-5" />
                  <span>Impact Fiscal : <span className="text-slate-800 font-normal">{option.taxImpact}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
            <div className="flex items-center gap-3 text-amber-800 font-bold mb-3">
              <AlertCircle className="w-6 h-6" />
              Mention Légale
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              {analysis.legalWarning}
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-xl text-white shadow-2xl relative overflow-hidden group no-print">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-500">
              <Euro className="w-24 h-24" />
            </div>
            <h3 className="text-xl font-serif mb-4 relative z-10">Aller plus loin ?</h3>
            <p className="text-slate-400 text-sm mb-6 relative z-10 leading-relaxed">
              Ces pistes doivent être validées par un acte authentique. Générez votre rapport pour préparer votre RDV.
            </p>
            <div className="grid grid-cols-1 gap-3 relative z-10">
              <button 
                onClick={handlePrint}
                className="w-full bg-white text-slate-900 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition shadow-lg"
              >
                <FileText className="w-4 h-4" /> Rapport PDF
              </button>
              <button 
                onClick={handlePrint}
                className="w-full bg-indigo-600/50 backdrop-blur-sm border border-white/20 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-600/70 transition"
              >
                <Printer className="w-4 h-4" /> Imprimer
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-2 text-indigo-600 font-bold mb-3 uppercase text-[10px] tracking-widest">
               <Scale className="w-4 h-4" /> Rappel Loi
             </div>
             <p className="text-xs text-slate-500 leading-relaxed italic">
               "L'usufruitier a le droit de jouir de toute espèce de biens dont un autre a la propriété, comme le propriétaire lui-même, mais à la charge d'en conserver la substance." (Art. 578 du Code Civil)
             </p>
          </div>

          <button 
            onClick={onReset}
            className="w-full py-3 text-slate-500 hover:text-indigo-600 font-medium transition flex items-center justify-center gap-2 no-print"
          >
            Nouvelle simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyResults;
