'use client';

import React from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useAuthModalStore } from '@/lib/stores/auth-modal.store';
import GoogleSignInButton from './GoogleSignInButton';
import { ShieldCheck, Lock, Sparkles, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthGateProps {
  children: React.ReactNode;
  featureName?: string;
  description?: string;
}

export default function AuthGate({ 
  children, 
  featureName = "this AI feature",
  description = "Unlock personalized institutional legal research by signing in with your scholar account. It's completely free for students and citizens."
}: AuthGateProps) {
  const { user, isLoading } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.openModal);

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-parchment-dim rounded-library flex flex-col items-center justify-center animate-pulse border border-divider">
        <div className="w-12 h-12 rounded-library bg-ink/5 mb-4" />
        <div className="h-4 w-48 bg-ink/5 rounded mb-2" />
        <div className="h-3 w-32 bg-ink/5 rounded" />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="w-full p-10 md:p-16 bg-parchment border border-divider rounded-library flex flex-col items-center text-center relative overflow-hidden group shadow-sm">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
        <Library size={180} className="text-ink" />
      </div>

      <div className="w-16 h-16 bg-ink text-parchment rounded-library flex items-center justify-center mb-8 shadow-xl border border-ink/10 relative">
        <Lock className="w-7 h-7 text-gold" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold rounded-full border-2 border-parchment flex items-center justify-center">
           <Sparkles size={12} className="text-ink" />
        </div>
      </div>

      <h3 className="text-2xl font-serif text-ink mb-4 italic font-bold tracking-tight">Institutional Access Required</h3>
      <p className="text-ink/60 max-w-md mb-10 leading-relaxed text-sm font-medium">
        {description}
      </p>

      <button 
        onClick={() => openAuthModal(featureName)}
        className="px-10 py-4 bg-ink text-parchment font-bold rounded-library text-[11px] uppercase tracking-widest hover:bg-ink/90 transition-all shadow-md flex items-center gap-2"
      >
        <ShieldCheck size={16} className="text-gold" />
        Sign in to unlock
      </button>

      <div className="mt-8 pt-6 border-t border-divider border-dashed w-full max-w-xs">
         <p className="text-[9px] text-ink/20 uppercase tracking-[0.2em] font-black">
           Verified Scholarly Access · Open Data
         </p>
      </div>
    </div>
  );
}
