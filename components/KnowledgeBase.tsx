
import React, { useState } from 'react';
import { LEGAL_GLOSSARY } from '../utils/legalData';
import { Search, BookOpen, Scale, Lightbulb, ChevronRight } from 'lucide-react';

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
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-serif text-slate-900 mb-4">Base de Connaissances Juridiques</h2>
        <p className="text-lg text-slate-500">Comprendre les mécanismes de transmission avec des cas concrets.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un terme (ex: usufruit, assurance-vie...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm transition"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Civil', 'Fiscal', 'Procédure'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                filter === f 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-100 hover:border-slate-300'
              }`}
            >
              {f === 'All' ? 'Tous' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredData.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col">
            <div className="p-6 flex-grow">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  item.category === 'Civil' ? 'bg-blue-50 text-blue-600' :
                  item.category === 'Fiscal' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-purple-50 text-purple-600'
                }`}>
                  {item.category}
                </span>
                <BookOpen className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{item.term}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {item.definition}
              </p>
              
              {item.example && (
                <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 group-hover:bg-indigo-50 transition-colors">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-[11px] uppercase tracking-wider mb-2">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Cas Pratique
                  </div>
                  <p className="text-xs text-indigo-900/80 leading-relaxed italic">
                    {item.example}
                  </p>
                </div>
              )}
            </div>

            {item.lawReference && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                <Scale className="w-3.5 h-3.5" />
                Réf : {item.lawReference}
              </div>
            )}
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="text-slate-300 mb-4 flex justify-center">
              <Search className="w-12 h-12 opacity-20" />
            </div>
            <p className="text-slate-400 font-medium">Aucun terme ne correspond à votre recherche.</p>
          </div>
        )}
      </div>

      <div className="mt-16 bg-slate-900 p-10 rounded-3xl text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-serif mb-4 italic">Le conseil du Notaire</h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              En France, il n'est pas possible de déshériter totalement ses enfants. Ils sont considérés comme "héritiers réservataires". Cependant, vous pouvez optimiser la transmission de votre résidence principale via un démembrement croisé ou l'assurance-vie pour protéger un tiers.
            </p>
            <button className="flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition group">
              Approfondir la quotité disponible <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition">
              <div className="text-2xl font-bold text-indigo-400 mb-1">100k€</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Abattement Enfant</div>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition">
              <div className="text-2xl font-bold text-indigo-400 mb-1">15 ans</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Délai Fiscal</div>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition">
              <div className="text-2xl font-bold text-indigo-400 mb-1">20%</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">TVA Emoluments</div>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition">
              <div className="text-2xl font-bold text-indigo-400 mb-1">Art. 912</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Code Civil</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
