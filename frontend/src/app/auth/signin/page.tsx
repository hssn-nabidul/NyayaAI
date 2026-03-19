'use client';

import React from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { Scale } from 'lucide-react';

export default function SignInPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  React.useEffect(() => {
    if (user && !isLoading) {
      router.push(callbackUrl);
    }
  }, [user, isLoading, router, callbackUrl]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-10 bg-ink-2 border border-white/5 rounded-[40px] shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-8">
           <Scale className="w-32 h-32 text-gold/5 -rotate-12 pointer-events-none" />
        </div>

        <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center font-bold text-3xl text-ink mb-8 shadow-[0_0_40px_rgba(212,168,67,0.3)]">
          N
        </div>

        <h1 className="text-3xl font-bold serif text-gold mb-4">Welcome to Nyaya</h1>
        <p className="text-cream/60 mb-10 leading-relaxed">
          Sign in to access AI-powered legal research, moot prep tools, and document analysis.
        </p>

        <GoogleSignInButton />

        <div className="mt-12 pt-8 border-t border-white/5 w-full flex flex-col gap-4">
          <p className="text-xs text-cream/40 leading-relaxed italic">
            "Justice must not only be done, but must also be seen to be done."
          </p>
          <div className="flex justify-center gap-6">
            <span className="text-[10px] text-cream/20 uppercase tracking-widest">Privacy First</span>
            <span className="text-[10px] text-cream/20 uppercase tracking-widest">Free Forever</span>
          </div>
        </div>
      </div>
    </div>
  );
}
