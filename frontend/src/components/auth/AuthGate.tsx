'use client';

import React from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useAuthModalStore } from '@/lib/stores/auth-modal.store';
import GoogleSignInButton from './GoogleSignInButton';
import { ShieldCheck, Lock } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
  featureName?: string;
  description?: string;
}

export default function AuthGate({ 
  children, 
  featureName = "this AI feature",
  description = "Unlock personalized AI legal research by signing in with your Google account. It's completely free."
}: AuthGateProps) {
  const { user, isLoading } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.openModal);

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-white/5 rounded-2xl flex flex-col items-center justify-center animate-pulse border border-white/5">
        <div className="w-12 h-12 rounded-full bg-white/10 mb-4" />
        <div className="h-4 w-48 bg-white/10 rounded mb-2" />
        <div className="h-3 w-32 bg-white/10 rounded" />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="w-full p-8 md:p-12 bg-ink-2 border border-white/5 rounded-3xl flex flex-col items-center text-center relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-6 border border-gold/20 shadow-2xl relative">
        <ShieldCheck className="w-8 h-8 text-gold" />
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-status-red rounded-full flex items-center justify-center border-2 border-ink-2">
          <Lock size={10} className="text-white" />
        </div>
      </div>

      <h3 className="text-2xl font-bold serif text-cream mb-3 italic">Member Content</h3>
      <p className="text-cream/40 max-w-md mb-8 leading-relaxed text-sm">
        {description}
      </p>

      <button 
        onClick={() => openAuthModal(featureName)}
        className="px-8 py-3 bg-gold text-ink font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-gold-light transition-all shadow-lg shadow-gold/20"
      >
        Sign in to unlock
      </button>

      <p className="mt-6 text-[10px] text-cream/20 uppercase tracking-[0.2em] font-bold">
        One-click Google Access
      </p>
    </div>
  );
}
