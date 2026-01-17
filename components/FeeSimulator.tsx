
import React, { useState, useMemo } from 'react';
import { TransmissionType, Relationship, FeeBreakdown } from '../types';
import { estimateFees } from '../utils/feeCalculator';
import { Calculator, Info, Landmark, UserCheck, PieChart } from 'lucide-react';

const FeeSimulator: React.FC = () => {
  const [value, setValue] = useState<number>(200000);
  const [type, setType] = useState<TransmissionType>('Vente Immobilière');
  const [relationship, setRelationship] = useState<Relationship>('Enfant');

  const fees = useMemo(() => estimateFees(value, type, relationship), [value, type, relationship]);

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              Paramètres
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type d'opération</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['Vente Immobilière', 'Donation', 'Succession'] as TransmissionType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`p-3 rounded-lg border text-sm text-left transition ${type === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valeur estimée du bien (€)</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {type !== 'Vente Immobilière' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lien de parenté</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as Relationship)}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Enfant">Enfant</option>
                    <option value="Petit-enfant">Petit-enfant</option>
                    <option value="Conjoint/PACS">Conjoint / PACS</option>
                    <option value="Frère/Sœur">Frère / Sœur</option>
                    <option value="Neveu/Nièce">Neveu / Nièce</option>
                    <option value="Tiers">Tiers (Aucun lien)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-indigo-300" />
              <span className="font-bold">Note importante</span>
            </div>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Ces montants sont des estimations. Les frais réels dépendent de la complexité du dossier, des débours exacts et des hypothèques éventuelles.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <h3 className="text-2xl font-serif text-slate-900 mb-8">Estimation des frais totaux</h3>
            
            <div className="text-5xl font-bold text-indigo-600 mb-12 flex items-baseline gap-2">
              {fees.total.toLocaleString()} €
              <span className="text-lg font-normal text-slate-400">TTC</span>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2"><Landmark className="w-4 h-4 text-amber-500" /> Taxes de l'État (Droits)</span>
                  <span>{fees.taxes.toLocaleString()} €</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${(fees.taxes / fees.total) * 100}%` }}></div>
                </div>
                <p className="text-xs text-slate-500">Reversement obligatoire au Trésor Public.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-indigo-500" /> Rémunération du Notaire (Émoluments)</span>
                  <span>{fees.emoluments.toLocaleString()} €</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${(fees.emoluments / fees.total) * 100}%` }}></div>
                </div>
                <p className="text-xs text-slate-500">Honoraires réglementés par l'État.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2"><PieChart className="w-4 h-4 text-slate-400" /> Frais techniques (Débours)</span>
                  <span>{fees.disbursements.toLocaleString()} €</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full transition-all duration-500" style={{ width: `${(fees.disbursements / fees.total) * 100}%` }}></div>
                </div>
                <p className="text-xs text-slate-500">Coûts des pièces administratives et cadastre.</p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-2">Comprendre le coût :</h4>
              <p className="text-sm text-slate-600">
                Dans une {type.toLowerCase()}, ce que l'on appelle "frais de notaire" est composé à plus de 80% de taxes collectées pour le compte de l'État et des collectivités locales. Le notaire n'en conserve qu'une fraction pour sa mission de service public.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeSimulator;
