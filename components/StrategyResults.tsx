
import React from 'react';
import { LegalAnalysis, StrategyOption, UserSituation } from '../types';
import { ShieldCheck, TrendingUp, AlertCircle, CheckCircle2, Euro, BarChart3, Layers, Flag, ShieldAlert, Cpu, Printer, FileText, LayoutDashboard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
        <div className="bg-brand-navy p-6 rounded-2xl shadow-2xl border border-brand-accent/20 min-w-[280px]">
          <p className="font-heading font-extrabold text-white mb-4 border-b border-white/10 pb-2 text-[11px] uppercase tracking-wider">{label}</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-white/40">
              <span>Masse concernée</span>
              <span className="text-white">{formatCurrency(capital)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-brand-accent">
              <span>Économie d'impôts</span>
              <span>+{formatCurrency(savings)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-rose-400">
              <span>Coût d'exécution</span>
              <span>-{formatCurrency(cost)}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs font-heading font-black text-white uppercase tracking-widest">Gain Patrimonial</span>
              <span className={`text-sm font-heading font-black ${netGain >= 0 ? 'text-brand-accent' : 'text-rose-400'}`}>
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

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-fadeInUp">
      <div className="bg-brand-navy p-12 rounded-[40px] shadow-2xl border border-brand-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent opacity-5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-8 flex items-center gap-4">
            <LayoutDashboard className="text-brand-accent w-10 h-10" /> Synthèse <span className="text-brand-accent">Expertise</span>
          </h2>
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light italic">
              "{analysis.summary}"
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-12 rounded-[40px] shadow-xl border border-brand-accent/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h3 className="text-3xl font-heading font-extrabold text-brand-navy flex items-center gap-4">
              <BarChart3 className="w-8 h-8 text-brand-accent" />Projection <span className="text-brand-accent">Optimale</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2 ml-12">Analyse comparative des leviers successoraux</p>
          </div>
        </div>

        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fiscalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 9, fill: '#0A2540', fontWeight: 800, textAnchor: 'middle' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(val) => `${val / 1000}k€`}
                tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={60} iconType="circle" />
              <Bar name="Masse Successorale" dataKey="Capital" stackId="a" fill="#0A254008" radius={[10, 10, 0, 0]} barSize={50} />
              <Bar name="Économie Générée" dataKey="Économies" stackId="b" fill="#00D9FF" barSize={50} />
              <Bar name="Droits & Frais" dataKey="Coût Fiscal" stackId="b" fill="#0A2540" radius={[10, 10, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-10">
          <h3 className="text-2xl font-heading font-extrabold text-brand-navy flex items-center gap-4 px-2">
            <ShieldCheck className="w-8 h-8 text-brand-accent" />Stratégies <span className="text-brand-accent">Préconisées</span>
          </h3>
          
          {sortedOptions.map((option, idx) => (
            <div key={idx} className={`glass-card rounded-[32px] overflow-hidden hover:scale-[1.01] transition-all duration-500 border-l-[12px] ${
              option.priority === 'Haute' ? 'border-l-brand-accent' : 
              option.priority === 'Moyenne' ? 'border-l-brand-navy' : 
              'border-l-slate-200'
            }`}>
              <div className="p-10">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <h4 className="text-2xl font-heading font-bold text-brand-navy">{option.title}</h4>
                      <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest flex items-center gap-2 ${
                        option.priority === 'Haute' ? 'bg-brand-accent text-brand-navy' :
                        option.priority === 'Moyenne' ? 'bg-brand-navy text-white' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        <Flag className="w-3.5 h-3.5" /> {option.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-brand-accent/10 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-brand-accent" />
                        <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">Optimisation : {option.estimatedSavings}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-slate-500 text-lg leading-relaxed mb-10 font-light">{option.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-emerald-50/50 p-8 rounded-[24px] border border-emerald-100/50">
                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 mb-6">
                      <CheckCircle2 className="w-4 h-4" /> Points Forts
                    </div>
                    <ul className="space-y-4">
                      {option.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                          <span className="font-medium">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-rose-50/50 p-8 rounded-[24px] border border-rose-100/50">
                    <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                      <ShieldAlert className="w-4 h-4" /> Vigilances
                    </div>
                    <ul className="space-y-4">
                      {option.cons.map((con, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-rose-300 rounded-full mt-2 shrink-0" />
                          <span className="font-light italic">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-brand-accent" />
                  <span className="text-xs font-bold text-brand-navy">Incidence fiscale calculée : <span className="text-slate-400 font-light italic">{option.taxImpact}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1 space-y-10">
          <div className="bg-brand-navy p-10 rounded-[32px] text-white shadow-2xl relative overflow-hidden group no-print border border-brand-accent/20">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-700">
              <ShieldCheck className="w-24 h-24 text-brand-accent" />
            </div>
            <h3 className="text-2xl font-heading font-extrabold mb-6 relative z-10">Expertise <span className="text-brand-accent">Digitale</span></h3>
            <p className="text-slate-300 text-xs mb-10 relative z-10 leading-relaxed font-light">
              Exportez ce rapport confidentiel pour le présenter à votre conseil habituel.
            </p>
            <div className="grid grid-cols-1 gap-4 relative z-10">
              <button 
                onClick={handlePrint}
                className="w-full bg-brand-accent text-brand-navy py-4 rounded-2xl text-[11px] font-heading font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-accent/20"
              >
                <FileText className="w-5 h-5 inline-block mr-2" /> Rapport de Étude
              </button>
              <button 
                onClick={handlePrint}
                className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl text-[11px] font-heading font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <Printer className="w-5 h-5 inline-block mr-2" /> Impression
              </button>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[24px] border border-brand-accent/10">
             <div className="flex items-center gap-3 text-brand-navy font-black mb-6 uppercase text-[10px] tracking-widest">
               <ShieldCheck className="w-5 h-5 text-brand-accent" /> Mention Légale
             </div>
             <p className="text-[11px] text-slate-500 leading-relaxed italic font-light">
               "L'anticipation successorale permet de transformer une contrainte fiscale en une transmission choisie." (L'Ingé Patrimoine). 
             </p>
          </div>

          <button 
            onClick={onReset}
            className="w-full py-4 text-brand-navy/30 font-heading font-black uppercase text-[11px] tracking-widest hover:text-brand-accent transition-all flex items-center justify-center gap-3 no-print"
          >
            Réinitialiser le Diagnostic
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyResults;
