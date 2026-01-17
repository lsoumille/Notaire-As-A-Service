
import React, { useState } from 'react';
import { UserSituation, LegalAnalysis } from './types';
import { analyzeTransmissionStrategy } from './services/geminiService';
import Questionnaire from './components/Questionnaire';
import StrategyResults from './components/StrategyResults';
import FeeSimulator from './components/FeeSimulator';
import KnowledgeBase from './components/KnowledgeBase';
import { Gavel, Sparkles, Loader2, Calculator, BookOpen, Lightbulb, Crown } from 'lucide-react';

type Tab = 'Strategy' | 'Fees' | 'Knowledge';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Strategy');
  const [analysis, setAnalysis] = useState<LegalAnalysis | null>(null);
  const [situation, setSituation] = useState<UserSituation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartAnalysis = async (userSituation: UserSituation) => {
    setLoading(true);
    setError(null);
    setSituation(userSituation);
    try {
      const results = await analyzeTransmissionStrategy(userSituation);
      setAnalysis(results);
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de l'analyse. Veuillez vérifier votre clé API.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setSituation(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-navy">
      {/* Header */}
      <header className="bg-white border-b border-brand-gold/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-brand-navy p-2 rounded-lg shadow-md border border-brand-gold/30">
              <Crown className="text-brand-gold w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Transmission Facile</h1>
              <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">by L'Ingé Patrimoine</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'Strategy', label: 'Ma Stratégie', icon: Lightbulb },
              { id: 'Fees', label: 'Simulateur', icon: Calculator },
              { id: 'Knowledge', label: 'Académie', icon: BookOpen },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === tab.id 
                  ? 'bg-brand-navy text-white shadow-md' 
                  : 'text-brand-navy/60 hover:text-brand-navy hover:bg-brand-gold/5'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12">
        {activeTab === 'Strategy' && (
          <>
            {!analysis && !loading && (
              <div className="max-w-4xl mx-auto text-center mb-16 animate-fadeIn">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-widest mb-6 border border-brand-gold/20">
                  <Sparkles className="w-3 h-3" /> Expertise Digitale Augmentée
                </div>
                <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
                  Optimisez votre transmission <br/> <span className="text-brand-gold">sécurisez votre héritage.</span>
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
                  Bénéficiez de la précision d'un ingénieur patrimonial associée à l'expertise notariale pour bâtir votre stratégie sur mesure.
                </p>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-brand-gold/10 rounded-full animate-pulse"></div>
                  <Loader2 className="w-20 h-20 text-brand-gold animate-spin absolute top-0 left-0" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-serif">Analyse de vos abattements...</h3>
                  <p className="text-slate-400 text-sm">Calcul de l'assiette taxable et des leviers fiscaux optimaux.</p>
                </div>
              </div>
            ) : error ? (
              <div className="max-w-md mx-auto bg-red-50 border border-red-200 p-8 rounded-2xl text-center">
                <p className="text-red-700 font-medium mb-6">{error}</p>
                <button onClick={reset} className="bg-brand-navy text-white px-6 py-2 rounded-lg font-bold">Réessayer</button>
              </div>
            ) : (analysis && situation) ? (
              <StrategyResults analysis={analysis} situation={situation} onReset={reset} />
            ) : (
              <Questionnaire onComplete={handleStartAnalysis} />
            )}
          </>
        )}

        {activeTab === 'Fees' && <FeeSimulator />}
        {activeTab === 'Knowledge' && <KnowledgeBase />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-brand-gold/10 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
             <div className="bg-brand-navy p-1.5 rounded">
               <Crown className="text-brand-gold w-5 h-5" />
             </div>
             <span className="text-brand-navy font-bold text-sm tracking-tight">Transmission Facile by L'Ingé Patrimoine</span>
          </div>
          <div className="text-slate-400 text-[10px] text-center md:text-right max-w-sm uppercase tracking-wider font-medium leading-loose">
            <p>© 2025 L'Ingé Patrimoine. Outil informatif sans valeur d'acte authentique.</p>
            <p>Consultez toujours votre notaire et votre ingénieur patrimonial.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
