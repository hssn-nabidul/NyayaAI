'use client';

import React, { useEffect } from 'react';
import { useAuthModalStore } from '@/lib/stores/auth-modal.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import GoogleSignInButton from './GoogleSignInButton';
import { 
  ShieldCheck, 
  X, 
  Sparkles, 
  Search, 
  FileText, 
  BookOpen, 
  Gavel, 
  Scale, 
  BarChart3 
} from 'lucide-react';

const FEATURES = [
  { icon: <Search className="w-4 h-4" />, name: 'AI Natural Language Search' },
  { icon: <FileText className="w-4 h-4" />, name: 'AI Case Summaries' },
  { icon: <BookOpen className="w-4 h-4" />, name: 'AI Legal Explainer' },
  { icon: <Sparkles className="w-4 h-4" />, name: 'AI Dictionary & Maxims' },
  { icon: <Gavel className="w-4 h-4" />, name: 'Moot Court Prep' },
  { icon: <Scale className="w-4 h-4" />, name: 'AI Drafting Assistant' },
  { icon: <BarChart3 className="w-4 h-4" />, name: 'Judge Analytics' },
];

export default function AuthModal() {
  const { isOpen, featureName, closeModal } = useAuthModalStore();
  const { user } = useAuthStore();

  // Close modal if user signs in
  useEffect(() => {
    if (user && isOpen) {
      closeModal();
    }
  }, [user, isOpen, closeModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-500"
        onClick={closeModal}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-ink-2 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-up">
        {/* Decorative Background Elements */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={closeModal}
          className="absolute top-6 right-6 p-2 text-cream/20 hover:text-gold transition-colors hover:bg-white/5 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-12 flex flex-col items-center text-center space-y-8 relative z-10">
          <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center border border-gold/20 shadow-2xl">
            <ShieldCheck className="w-10 h-10 text-gold" />
          </div>

          <div className="space-y-3">
            <h3 className="text-3xl font-serif text-cream">Sign in to unlock {featureName}</h3>
            <p className="text-cream/40 text-sm leading-relaxed max-w-sm mx-auto">
              Access the full power of Nyaya AI by signing in with your Google account. It's completely free for students and citizens.
            </p>
          </div>

          {/* Features List */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 group hover:border-gold/30 transition-all">
                <div className="text-gold/40 group-hover:text-gold transition-colors">
                  {f.icon}
                </div>
                <span className="text-[11px] font-bold text-cream/60 uppercase tracking-widest leading-none">
                  {f.name}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full space-y-4 pt-4">
            <GoogleSignInButton />
            <p className="text-[10px] text-cream/20 uppercase tracking-[0.2em] font-black">
              Zero Cost · Instant Access · Trusted Data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
