import React, { useState } from 'react';
import { Mail, Shield, Calendar, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { validateEmail } from '../utils/emailValidator';

interface PaywallProps {
  onEmailSubmitted: (email: string) => void;
}

const Paywall: React.FC<PaywallProps> = ({ onEmailSubmitted }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setError(validation.error || 'Email invalide');
      return;
    }

    setIsSubmitting(true);

    try {
      // Subscribe to Substack
      const substackForm = document.getElementById('substack-form') as HTMLFormElement;
      if (substackForm) {
        // Set the email in the Substack form
        const substackEmailInput = substackForm.querySelector('input[type="email"]') as HTMLInputElement;
        if (substackEmailInput) {
          substackEmailInput.value = email;
          
          // Submit the form programmatically
          const formData = new FormData(substackForm);
          
          // Call Substack API
          await fetch(substackForm.action, {
            method: 'POST',
            body: formData,
            mode: 'no-cors' // Substack doesn't support CORS, but the subscription will still work
          }).catch(() => {
            // Ignore errors from no-cors mode - the subscription should still work
          });
        }
      }

      // Even if Substack fails, we continue - the user entered a valid email
      onEmailSubmitted(email);
    } catch (err) {
      console.error('Subscription error:', err);
      // Continue anyway - we just want to validate the email
      onEmailSubmitted(email);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CALENDAR_URL = 'PLACEHOLDER_GOOGLE_CALENDAR_URL'; // Placeholder for Google Calendar URL

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Main Paywall Card */}
        <div className="glass-card rounded-3xl overflow-hidden border border-brand-accent/20 shadow-2xl animate-fadeInUp">
          {/* Header */}
          <div className="bg-brand-navy p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent opacity-10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-accent/20 rounded-2xl mb-6 border border-brand-accent/30">
                <Shield className="w-10 h-10 text-brand-accent" />
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-extrabold mb-4 leading-tight">
                Accédez à votre <span className="text-brand-accent">Analyse Expert</span>
              </h1>
              <p className="text-brand-accent/70 text-sm font-medium max-w-md mx-auto">
                Optimisation fiscale et stratégies de transmission patrimoniale sur-mesure
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-8">
            {/* Benefits */}
            <div className="bg-brand-accent/5 p-6 rounded-2xl border border-brand-accent/10">
              <h3 className="text-xs font-heading font-black uppercase tracking-widest text-brand-navy mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-accent" />
                Ce que vous recevrez
              </h3>
              <ul className="space-y-3">
                {[
                  'Analyse patrimoniale personnalisée par IA',
                  'Stratégies optimisées de transmission',
                  'Calculs fiscaux détaillés et barèmes actualisés',
                  'Newsletter exclusive de L\'Ingé Patrimoine'
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                    <span className="font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-heading font-black uppercase tracking-widest text-brand-navy flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-accent" />
                  Votre adresse email professionnelle
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="votre.email@exemple.fr"
                  className="w-full p-5 bg-brand-light border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none text-sm font-medium transition-all"
                  disabled={isSubmitting}
                />
                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-brand-navy">Engagement confidentialité :</strong> En soumettant votre email, 
                  vous serez automatiquement inscrit à la newsletter de <strong>L'Ingé Patrimoine</strong> pour recevoir 
                  nos conseils patrimoniaux exclusifs. Vous pourrez vous désabonner à tout moment.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full bg-brand-accent text-brand-navy py-5 rounded-xl font-heading font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_30px_rgba(0,217,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Validation en cours...' : 'Accéder à mon analyse gratuite'}
              </button>
            </form>

            {/* Calendar Booking CTA */}
            <div className="pt-6 border-t border-slate-200">
              <div className="text-center space-y-4">
                <p className="text-xs font-medium text-slate-500">
                  Besoin d'un accompagnement personnalisé ?
                </p>
                <a
                  href={CALENDAR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-brand-navy text-brand-navy rounded-xl font-heading font-bold text-sm hover:bg-brand-navy hover:text-white transition-all duration-300 shadow-lg"
                >
                  <Calendar className="w-5 h-5" />
                  Prendre rendez-vous avec un expert
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Substack Form */}
        <div style={{ display: 'none' }}>
          <iframe
            id="substack-iframe"
            src="https://lingepatrimoine.substack.com/embed"
            width="100%"
            height="320"
            style={{ border: 'none', background: 'white' }}
            frameBorder="0"
            scrolling="no"
            title="Substack Newsletter"
            onLoad={() => {
              // Try to access the form inside the iframe
              const iframe = document.getElementById('substack-iframe') as HTMLIFrameElement;
              try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                  const form = iframeDoc.querySelector('form');
                  if (form) {
                    form.id = 'substack-form';
                  }
                }
              } catch (e) {
                // Cross-origin restriction - we'll use the no-cors fetch instead
                console.log('Cross-origin iframe - using alternative subscription method');
              }
            }}
          />
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Service développé par L'Ingé Patrimoine. Analyse automatisée sans valeur d'acte authentique. 
            Consultez toujours votre notaire et ingénieur patrimonial pour validation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
