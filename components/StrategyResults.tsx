
import React from 'react';
import { LegalAnalysis, StrategyOption, UserSituation } from '../types';
import { ShieldCheck, TrendingUp, CheckCircle2, Flag, ShieldAlert, Calculator, Lock, Calendar, ArrowRight } from 'lucide-react';

const APPOINTMENT_URL = '[URL_GOOGLE_CALENDAR_PLACEHOLDER]';

interface StrategyResultsProps {
  analysis: LegalAnalysis;
  situation: UserSituation;
}

const StrategyResults: React.FC<StrategyResultsProps> = ({ analysis }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  const priorityOrder = { 'Haute': 0, 'Moyenne': 1, 'Basse': 2 };
  const sortedOptions = [...analysis.suggestedOptions].sort((a, b) => 
    priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-fadeInUp mt-8">
      <div className="bg-brand-navy p-12 rounded-[40px] shadow-2xl border border-brand-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent opacity-5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-8 flex items-center gap-4">
            <ShieldCheck className="text-brand-accent w-10 h-10" /> Synthèse
          </h2>
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light italic">
              "{analysis.summary}"
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-brand-navy/5 to-brand-accent/5 p-8 rounded-[32px] border border-brand-accent/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-brand-accent/10 p-3 rounded-xl">
            <svg className="w-6 h-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-heading font-bold text-brand-navy">
            Restez informé des actualités patrimoniales
          </h3>
        </div>
        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          <iframe 
            src="https://lingepatrimoine.substack.com/embed" 
            width="100%" 
            height="320" 
            style={{ border: '1px solid #EEE', background: 'white' }}
            frameBorder="0" 
            scrolling="no"
            title="Newsletter"
          />
        </div>
      </div>

      <div className="space-y-10">
        <h3 className="text-2xl font-heading font-extrabold text-brand-navy flex items-center gap-4 px-2">
          <ShieldCheck className="w-8 h-8 text-brand-accent" />Stratégie <span className="text-brand-accent">Préconisée</span>
        </h3>
          
        {sortedOptions.length > 0 && (
          <div className="glass-card rounded-[32px] overflow-hidden border-l-[12px] border-l-brand-accent">
            <div className="p-10">
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <h4 className="text-2xl font-heading font-bold text-brand-navy">{sortedOptions[0].title}</h4>
                    <span className="text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest flex items-center gap-2 bg-brand-accent text-brand-navy">
                      <Flag className="w-3.5 h-3.5" /> {sortedOptions[0].priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-accent/10 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-brand-accent" />
                      <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">Optimisation : {sortedOptions[0].estimatedSavings}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-slate-500 text-lg leading-relaxed mb-10 font-light">{sortedOptions[0].description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-emerald-50/50 p-8 rounded-[24px] border border-emerald-100/50">
                  <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 mb-6">
                    <CheckCircle2 className="w-4 h-4" /> Points Forts
                  </div>
                  <ul className="space-y-4">
                    {sortedOptions[0].pros.map((pro, i) => (
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
                    {sortedOptions[0].cons.map((con, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-rose-300 rounded-full mt-2 shrink-0" />
                        <span className="font-light italic">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-brand-accent/10 p-6 rounded-2xl border border-brand-accent/20">
                    <div className="text-[10px] font-black text-brand-navy uppercase tracking-widest mb-2">Économie d'impôt</div>
                    <div className="text-2xl font-heading font-black text-brand-accent">
                      +{formatCurrency(sortedOptions[0].estimatedSavingsAmount)}
                    </div>
                  </div>
                  <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                    <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Coût d'exécution</div>
                    <div className="text-2xl font-heading font-black text-rose-500">
                      -{formatCurrency(sortedOptions[0].estimatedTaxCost)}
                    </div>
                  </div>
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Gain patrimonial</div>
                    <div className={`text-2xl font-heading font-black ${(sortedOptions[0].estimatedSavingsAmount - sortedOptions[0].estimatedTaxCost) >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {(sortedOptions[0].estimatedSavingsAmount - sortedOptions[0].estimatedTaxCost) >= 0 ? '+' : ''}{formatCurrency(sortedOptions[0].estimatedSavingsAmount - sortedOptions[0].estimatedTaxCost)}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <Calculator className="w-5 h-5 text-brand-accent" />
                  <span className="text-xs font-bold text-brand-navy">Incidence fiscale calculée : <span className="text-slate-400 font-light italic">{sortedOptions[0].taxImpact}</span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {sortedOptions.length > 1 && (
          <div className="relative">
            <div className="absolute inset-0 backdrop-blur-xl bg-white/70 z-10 rounded-[32px]" />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-brand-navy p-4 rounded-full mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-brand-accent" />
              </div>
              <h4 className="text-xl font-heading font-bold text-brand-navy mb-2">
                {sortedOptions.length - 1} stratégie{sortedOptions.length > 2 ? 's' : ''} supplémentaire{sortedOptions.length > 2 ? 's' : ''} disponible{sortedOptions.length > 2 ? 's' : ''}
              </h4>
              <p className="text-slate-500 max-w-md mb-6 text-sm">
                Obtenez un conseil personnalisé pour découvrir toutes les stratégies adaptées à votre situation patrimoniale spécifique.
              </p>
              <a
                href={APPOINTMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-brand-accent text-brand-navy px-8 py-4 rounded-xl font-heading font-bold text-sm uppercase tracking-wider hover:bg-brand-navy hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <Calendar className="w-5 h-5" />
                <span>Prendre rendez-vous pour un conseil personnalisé</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="glass-card rounded-[32px] overflow-hidden opacity-30">
              <div className="p-10">
                <div className="h-32" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyResults;
