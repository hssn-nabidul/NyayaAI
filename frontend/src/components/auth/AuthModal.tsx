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
  BarChart3,
  Library,
  ScrollText,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: <Search className="w-4 h-4" />, name: 'Archive Discovery' },
  { icon: <FileText className="w-4 h-4" />, name: 'Scholarly Briefs' },
  { icon: <BookOpen className="w-4 h-4" />, name: 'Institutional Dictionary' },
  { icon: <Sparkles className="w-4 h-4" />, name: 'AI Legal Reasoning' },
  { icon: <Gavel className="w-4 h-4" />, name: 'Moot Court Prep' },
  { icon: <Scale className="w-4 h-4" />, name: 'AI Drafting Studio' },
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
        className="absolute inset-0 bg-ink/40 backdrop-blur-md transition-all duration-500"
        onClick={closeModal}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-parchment border border-divider rounded-library shadow-2xl overflow-hidden animate-fade-up">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Library size={200} className="text-ink" />
        </div>

        {/* Close Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            closeModal();
          }}
          className="absolute top-6 right-6 p-2 text-ink/20 hover:text-ink transition-colors hover:bg-ink/5 rounded-library z-50"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-12 flex flex-col items-center text-center space-y-10 relative z-10">
          <div className="w-20 h-20 bg-ink text-parchment rounded-library flex items-center justify-center shadow-xl border border-ink/10 relative">
            <Lock className="w-8 h-8 text-gold" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold rounded-full border-2 border-parchment flex items-center justify-center">
               <Sparkles size={12} className="text-ink" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-3xl font-serif text-ink tracking-tight italic font-bold">Access the Archive</h3>
            <p className="text-ink/60 text-sm leading-relaxed max-w-sm mx-auto font-medium">
              Join the Nyaya institution to unlock <span className="text-gold font-bold">{featureName}</span> and other professional research tools.
            </p>
          </div>

          {/* Features List */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 bg-parchment-dim rounded-library border border-divider group hover:border-ink/20 transition-all shadow-sm">
                <div className="text-gold shrink-0">
                  {f.icon}
                </div>
                <span className="text-[10px] font-bold text-ink/60 uppercase tracking-widest leading-none">
                  {f.name}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full space-y-6 pt-4">
            <GoogleSignInButton />
            <div className="pt-6 border-t border-divider border-dashed">
               <p className="text-[10px] text-ink/20 uppercase tracking-[0.2em] font-black">
                 Verified Scholarly Access · Institutional Data
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
