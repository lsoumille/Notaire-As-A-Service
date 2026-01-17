
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
  Flag,
  Crown
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
        <div className="bg-white p-5 rounded-xl shadow-2xl border border-brand-gold/20 min-w-[260px]">
          <p className="font-bold text-brand-navy mb-3 border-b border-brand-gold/10 pb-2 text-sm uppercase tracking-tight">{label}</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
              <span>Capital mobilisé</span>
              <span className="text-brand-navy">{formatCurrency(capital)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-emerald-600">
              <span>Économie fiscale</span>
              <span>+{formatCurrency(savings)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-rose-500">
              <span>Coût estimé</span>
              <span>-{formatCurrency(cost)}</span>
            </div>
            <div className="mt-4 pt-3 border-t border-brand-gold/10 flex justify-between items-center">
              <span className="text-xs font-black text-brand-navy uppercase">Gain Net</span>
              <span className={`text-sm font-black ${netGain >= 0 ? 'text-brand-gold' : 'text-rose-600'}`}>
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

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <div className="print-only hidden mb-12 border-b-2 border-brand-navy pb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-brand-navy p-2 rounded">
              <Crown className="text-brand-gold w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Transmission Facile</h1>
              <p className="text-[10px] text-brand-gold font-black uppercase tracking-widest">by L'Ingé Patrimoine - Mémorandum Confidentiel</p>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <p>Dossier n° LP-{Math.random().toString(36).substring(7).toUpperCase()}</p>
            <p className="mt-1">{new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-xl border border-brand-gold/10 border-l-[12px] border-l-brand-navy">
        <h2 className="text-3xl font-serif text-brand-navy mb-6">Synthèse du Diagnostic</h2>
        <p className="text-lg text-slate-600 leading-relaxed font-light italic">
          "{analysis.summary}"
        </p>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-lg border border-brand-gold/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h3 className="text-2xl font-serif text-brand-navy flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-brand-gold" />
              Impact des Leviers Fiscaux
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Projection du gain fiscal par stratégie</p>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fiscalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e9e0" />
              <XAxis 
                dataKey="name" 
                // Removed textTransform: 'uppercase' from tick object to fix type error as it is not a valid SVG property.
                tick={{ fontSize: 9, fill: '#1a2b4b', fontWeight: 700 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(val) => `${val / 1000}k€`}
                tick={{ fontSize: 10, fill: '#b19470' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={40} iconType="circle" />
              <Bar name="Capital Mobilisé" dataKey="Capital" stackId="a" fill="#1a2b4b10" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar name="Économie Générée" dataKey="Économies" stackId="b" fill="#b19470" barSize={40} />
              <Bar name="Droits & Frais" dataKey="Coût Fiscal" stackId="b" fill="#1a2b4b" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <h3 className="text-2xl font-serif text-brand-navy flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-brand-gold" />
            Nos Préconisations Stratégiques
          </h3>
          
          {sortedOptions.map((option, idx) => (
            <div key={idx} className={`bg-white rounded-2xl shadow-md border-l-[6px] overflow-hidden hover:shadow-xl transition-all duration-300 ${
              option.priority === 'Haute' ? 'border-l-brand-gold shadow-brand-gold/5' : 
              option.priority === 'Moyenne' ? 'border-l-brand-navy' : 
              'border-l-slate-200'
            }`}>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-brand-navy">{option.title}</h4>
                      <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1.5 ${
                        option.priority === 'Haute' ? 'bg-brand-gold text-white' :
                        option.priority === 'Moyenne' ? 'bg-brand-navy text-white' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        <Flag className="w-3 h-3" /> {option.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-gold flex items-center gap-1.5 uppercase tracking-wider">
                        <TrendingUp className="w-4 h-4" /> Gain : {option.estimatedSavings}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-8 font-light">{option.description}</p>

                {isDismembermentStrategy(option) && (
                  <div className="mb-8 p-6 bg-brand-cream border border-brand-gold/20 rounded-2xl">
                    <div className="flex items-center gap-2 text-brand-navy font-black text-[10px] uppercase tracking-widest mb-4">
                      <Layers className="w-4 h-4 text-brand-gold" />
                      Focus Démembrement (Art. 669 CGI)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                          À votre âge ({situation.age} ans), l'usufruit légal est de <span className="text-brand-navy font-bold">{usufruitPct}%</span>.
                        </p>
                        <div className="h-1.5 bg-brand-navy/10 rounded-full overflow-hidden flex">
                          <div className="bg-brand-gold h-full" style={{width: `${usufruitPct}%`}}></div>
                        </div>
                        <div className="flex justify-between text-[8px] font-black text-brand-gold uppercase tracking-widest">
                          <span>Usufruit {usufruitPct}%</span>
                          <span>Nue-prop {nuePropPct}%</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-brand-navy space-y-2 font-medium">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
                          <span>Transmission immédiate avec réserve de jouissance.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
                          <span>Pleine propriété reconstituée sans droits futurs.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="text-[9px] font-black text-brand-gold uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Atouts
                    </div>
                    <ul className="space-y-2.5">
                      {option.pros.map((pro, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2.5">
                          <div className="w-1 h-1 bg-brand-gold rounded-full mt-2 shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Vigilances
                    </div>
                    <ul className="space-y-2.5">
                      {option.cons.map((con, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-start gap-2.5 font-light">
                          <div className="w-1 h-1 bg-slate-300 rounded-full mt-2 shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-2 text-brand-navy font-bold text-xs">
                  <Euro className="w-4 h-4 text-brand-gold" />
                  <span>Fiscalité appliquée : <span className="text-slate-500 font-light italic">{option.taxImpact}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="bg-brand-navy p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden group no-print border border-brand-gold/30">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-700">
              <Crown className="w-24 h-24 text-brand-gold" />
            </div>
            <h3 className="text-xl font-serif mb-4 relative z-10 text-brand-gold">Expertise de Terrain</h3>
            <p className="text-slate-300 text-xs mb-8 relative z-10 leading-relaxed font-light">
              Votre situation nécessite une mise en œuvre rigoureuse. Exportez ce rapport pour votre audit patrimonial.
            </p>
            <div className="grid grid-cols-1 gap-4 relative z-10">
              <button 
                onClick={handlePrint}
                className="w-full bg-brand-gold text-white py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-brand-navy transition shadow-lg"
              >
                <FileText className="w-4 h-4 inline-block mr-2" /> Rapport PDF
              </button>
              <button 
                onClick={handlePrint}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition"
              >
                <Printer className="w-4 h-4 inline-block mr-2" /> Imprimer
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-brand-gold/10 shadow-sm">
             <div className="flex items-center gap-2 text-brand-navy font-black mb-4 uppercase text-[9px] tracking-widest">
               <Scale className="w-4 h-4 text-brand-gold" /> Référence Légale
             </div>
             <p className="text-[11px] text-slate-500 leading-relaxed italic font-light">
               "Nul n'est tenu de rester dans l'indivision et le partage peut toujours être provoqué." (Art. 815 du Code Civil). La SCI est le rempart à ce risque de blocage.
             </p>
          </div>

          <button 
            onClick={onReset}
            className="w-full py-4 text-brand-gold font-black uppercase text-[10px] tracking-widest hover:text-brand-navy transition flex items-center justify-center gap-2 no-print"
          >
            Nouvelle étude
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyResults;
