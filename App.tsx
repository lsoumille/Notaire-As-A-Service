
import React, { useState } from 'react';
import { UserSituation, LegalAnalysis } from './types';
import { analyzeTransmissionStrategy } from './services/geminiService';
import Questionnaire from './components/Questionnaire';
import StrategyResults from './components/StrategyResults';
import FeeSimulator from './components/FeeSimulator';
import KnowledgeBase from './components/KnowledgeBase';
import { Gavel, Sparkles, Loader2, Calculator, BookOpen, Lightbulb } from 'lucide-react';

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
      setError("Une erreur est survenue lors de l'analyse. Veuillez vérifier votre clé API ou votre connexion.");
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
    <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md">
              <Gavel className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notaire-as-a-Service</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Expertise Digitale & IA</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            {[
              { id: 'Strategy', label: 'Ma Stratégie', icon: Lightbulb },
              { id: 'Fees', label: 'Simulateur de Frais', icon: Calculator },
              { id: 'Knowledge', label: 'Base de Connaissances', icon: BookOpen },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === tab.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold mb-6 border border-indigo-100">
                  <Sparkles className="w-4 h-4" /> Analyse augmentée par Intelligence Artificielle
                </div>
                <h2 className="text-5xl font-serif text-slate-900 mb-6 leading-tight">
                  Optimisez votre héritage et <span className="text-indigo-600">sécurisez l'avenir</span> de vos proches.
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Définissez vos objectifs pour recevoir une étude personnalisée sur vos meilleures options fiscales et civiles.
                </p>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-100 rounded-full animate-pulse"></div>
                  <Loader2 className="w-20 h-20 text-indigo-600 animate-spin absolute top-0 left-0" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-serif text-slate-800">Expertise en cours...</h3>
                  <p className="text-slate-500">Nous analysons les abattements fiscaux et les leviers successoraux optimaux.</p>
                </div>
              </div>
            ) : error ? (
              <div className="max-w-md mx-auto bg-red-50 border border-red-200 p-8 rounded-2xl text-center">
                <p className="text-red-700 font-medium mb-6">{error}</p>
                <button onClick={reset} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold">Réessayer</button>
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
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <Gavel className="text-slate-300 w-6 h-6" />
             <span className="text-slate-400 font-serif font-bold text-lg">Notaire-as-a-Service</span>
          </div>
          <div className="text-slate-400 text-xs text-center md:text-right max-w-md">
            <p className="mb-2">© 2025 Plateforme Notariale IA. Outil de simulation sans valeur d'acte authentique.</p>
            <p>Conformément au Code de Déontologie, consultez toujours une étude notariale pour finaliser vos projets.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
