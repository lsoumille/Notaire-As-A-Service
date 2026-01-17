
import React, { useState } from 'react';
import { LEGAL_GLOSSARY } from '../utils/legalData';
import { Search, BookOpen, Scale, Lightbulb, ChevronRight, Crown } from 'lucide-react';

const KnowledgeBase: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Civil' | 'Fiscal' | 'Procédure'>('All');

  const filteredData = LEGAL_GLOSSARY.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(search.toLowerCase()) || 
                          item.definition.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || item.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-serif text-brand-navy mb-4">L'Académie Patrimoniale</h2>
        <p className="text-brand-gold text-[10px] font-black uppercase tracking-widest">Maîtrisez les concepts clés de votre transmission</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-grow">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-gold w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher : Usufruit, SCI, Assurance-vie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-full border border-brand-gold/10 focus:ring-1 focus:ring-brand-gold focus:outline-none bg-white shadow-sm font-medium text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Civil', 'Fiscal', 'Procédure'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap ${
                filter === f 
                  ? 'bg-brand-navy text-white shadow-lg' 
                  : 'bg-white text-brand-navy/60 border border-brand-gold/10 hover:border-brand-gold/30'
              }`}
            >
              {f === 'All' ? 'Tous' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredData.map((item, idx) => (
          <div key={idx} className="bg-white rounded-3xl shadow-sm border border-brand-gold/5 hover:shadow-2xl hover:border-brand-gold/20 transition-all duration-500 group flex flex-col overflow-hidden">
            <div className="p-8 flex-grow">
              <div className="flex items-center justify-between mb-6">
                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                  item.category === 'Civil' ? 'bg-brand-navy text-white' :
                  item.category === 'Fiscal' ? 'bg-brand-gold text-white' :
                  'bg-brand-cream text-brand-navy border border-brand-gold/10'
                }`}>
                  {item.category}
                </span>
                <BookOpen className="w-4 h-4 text-brand-gold/30 group-hover:text-brand-gold transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-4 group-hover:text-brand-gold transition-colors">{item.term}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 font-light">
                {item.definition}
              </p>
              
              {item.example && (
                <div className="mt-4 p-5 bg-brand-cream rounded-2xl border border-brand-gold/10 group-hover:bg-brand-gold/5 transition-colors">
                  <div className="flex items-center gap-2 text-brand-gold font-black text-[9px] uppercase tracking-widest mb-3">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Cas concret
                  </div>
                  <p className="text-[11px] text-brand-navy/80 leading-relaxed italic font-light">
                    {item.example}
                  </p>
                </div>
              )}
            </div>

            {item.lawReference && (
              <div className="px-8 py-4 bg-brand-cream/30 border-t border-brand-gold/5 flex items-center gap-2 text-[9px] font-black text-brand-gold uppercase tracking-tighter">
                <Scale className="w-3.5 h-3.5" />
                Source : {item.lawReference}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-20 bg-brand-navy p-12 rounded-3xl text-white relative overflow-hidden shadow-2xl border border-brand-gold/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold opacity-5 rounded-full -mr-40 -mt-40"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="bg-brand-gold/20 p-2 inline-block rounded mb-4">
              <Crown className="text-brand-gold w-6 h-6" />
            </div>
            <h3 className="text-3xl font-serif mb-6 italic text-brand-goldLight">La Vision de l'Ingé Patrimoine</h3>
            <p className="text-slate-300 leading-relaxed mb-8 font-light text-sm italic">
              "Transmettre n'est pas seulement une question de fiscalité. C'est l'art de pérenniser un équilibre familial tout en assurant votre autonomie financière future."
            </p>
            <button className="flex items-center gap-2 text-brand-gold font-black uppercase text-[10px] tracking-widest hover:text-white transition group">
              Réserver un audit complet <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition">
              <div className="text-2xl font-bold text-brand-gold mb-1">100k€</div>
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Enfant / 15 ans</div>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition">
              <div className="text-2xl font-bold text-brand-gold mb-1">152k€</div>
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">AV / Art. 990 I</div>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition">
              <div className="text-2xl font-bold text-brand-gold mb-1">15%</div>
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Décote SCI</div>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition">
              <div className="text-2xl font-bold text-brand-gold mb-1">669 CGI</div>
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Barème Usufruit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
