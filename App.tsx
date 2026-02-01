
import React, { useState } from 'react';
import { UserSituation, LegalAnalysis } from './types';
import { analyzeTransmissionStrategy } from './services/geminiService';
import Questionnaire from './components/Questionnaire';
import StrategyResults from './components/StrategyResults';
import FeeSimulator from './components/FeeSimulator';
import KnowledgeBase from './components/KnowledgeBase';
import { Sparkles, Loader2, Calculator, BookOpen, Lightbulb, ShieldCheck, ExternalLink, Calendar, AlertCircle, Scale } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col font-body">
      {/* Navbar - Solid background to prevent flickering from animated grid background */}
      <header className="bg-brand-navy border-b border-brand-accent/20 fixed top-0 left-0 right-0 w-full z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-[0_0_15px_rgba(0,217,255,0.3)] flex items-center justify-center overflow-hidden">
              <img 
                src="https://lingepatrimoine.fr/logo/logo_inge_patrimoine-removebg-preview.png" 
                alt="Logo L'Ingé Patrimoine" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-heading font-extrabold tracking-tight text-white">Transmission <span className="text-brand-accent">Facile</span></h1>
              <p className="text-[10px] text-brand-accent/70 font-bold uppercase tracking-widest">by L'Ingé Patrimoine</p>
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
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === tab.id 
                  ? 'bg-brand-accent text-brand-navy shadow-[0_0_20px_rgba(0,217,255,0.4)]' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content - pt-20 added to compensate for fixed header */}
      <main className="flex-grow pt-20 container mx-auto px-4 py-12 relative z-10">
        {activeTab === 'Strategy' && (
          <>
            {!analysis && !loading && (
              <div className="max-w-4xl mx-auto text-center mb-16 mt-12 animate-fadeInUp">
                <h2 className="text-4xl md:text-6xl font-heading font-extrabold mb-6 leading-tight text-brand-navy">
                  Optimisez votre transmission <br/> <span className="text-brand-accent">sécurisez votre héritage.</span>
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
                  Simulation de votre stratégie de transmission de patrimoine en fonction de vos objectifs. N'hésitez à prendre rendez-vous pour une consultation personnalisée.
                </p>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-brand-accent/10 rounded-full animate-pulse"></div>
                  <Loader2 className="w-24 h-24 text-brand-accent animate-spin absolute top-0 left-0" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-heading font-bold text-brand-navy">Analyse de vos abattements...</h3>
                  <p className="text-slate-400 text-sm">Calibration des leviers fiscaux selon les derniers barèmes en vigueur.</p>
                </div>
              </div>
            ) : error ? (
              <div className="max-w-md mx-auto glass-card p-10 rounded-2xl text-center border-red-100">
                <p className="text-red-500 font-medium mb-6">{error}</p>
                <button onClick={reset} className="bg-brand-navy text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-accent hover:text-brand-navy transition-all duration-300">Réessayer</button>
              </div>
            ) : (analysis && situation) ? (
              <StrategyResults analysis={analysis} situation={situation} />
            ) : (
              <Questionnaire onComplete={handleStartAnalysis} />
            )}
          </>
        )}

        {activeTab === 'Fees' && <FeeSimulator />}
        {activeTab === 'Knowledge' && <KnowledgeBase />}
      </main>

      {/* Footer */}
      <footer className="bg-brand-navy border-t border-brand-accent/10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Disclaimer plus visible */}
          <div className="bg-white/5 border border-brand-accent/20 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
              <div className="text-white/80 text-xs leading-relaxed">
                <p className="font-bold text-white mb-1">Information importante</p>
                <p>Cet outil est purement informatif et ne constitue pas un acte authentique. Les simulations et analyses proposées sont indicatives. Consultez toujours votre notaire et votre conseiller en gestion de patrimoine (CGP) pour toute décision patrimoniale.</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
               <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                 <img 
                   src="https://lingepatrimoine.fr/logo/logo_inge_patrimoine-removebg-preview.png" 
                   alt="Logo L'Ingé Patrimoine" 
                   className="w-6 h-6 object-contain"
                 />
               </div>
               <div>
                 <span className="text-white font-heading font-bold text-lg tracking-tight">Transmission <span className="text-brand-accent">Facile</span></span>
               </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <a 
                href="https://lingepatrimoine.fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-brand-accent transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Retourner sur L'Ingé Patrimoine
              </a>
              
              <a 
                href="[URL_GOOGLE_CALENDAR_PLACEHOLDER]"
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-brand-accent text-brand-navy px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider hover:bg-white transition-all"
              >
                <Calendar className="w-4 h-4" />
                Prendre rendez-vous
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-white/30 text-xs">© 2025 L'Ingé Patrimoine. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
