'use client';

import React from 'react';
import { AlertCircle, RefreshCcw, Home, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service if available
    console.error('Institutional Application Error:', error);
  }, [error]);

  // Clean the error message for display
  const displayMessage = typeof error.message === 'string' 
    ? error.message 
    : 'An unexpected archive retrieval failure occurred. Please retry the inquiry.';

  const isReactError31 = displayMessage.includes('Objects are not valid as a React child');

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-10 animate-fade-up">
      <div className="w-24 h-24 bg-status-red/5 border border-divider rounded-library flex items-center justify-center text-status-red shadow-sm relative">
        <ShieldAlert size={48} className="opacity-20" />
        <AlertCircle size={32} className="absolute" />
      </div>

      <div className="space-y-4 max-w-xl">
        <h2 className="text-4xl font-serif text-ink italic font-bold tracking-tight">Institutional Briefing Interrupted</h2>
        <p className="text-ink/60 leading-relaxed font-medium text-lg border-l-4 border-divider pl-8 mx-auto text-left max-w-md italic">
          {isReactError31 
            ? "We encountered a structural data conflict while indexing this folio. The archival team has been alerted."
            : displayMessage}
        </p>
        {isReactError31 && (
          <p className="text-[9px] text-ink/20 uppercase tracking-[0.3em] font-black pt-4">Archive Reference: #ERR-31-STRUCTURAL</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-ink text-parchment font-bold rounded-library hover:bg-ink/90 transition-all shadow-md text-[11px] uppercase tracking-widest"
        >
          <RefreshCcw size={18} className="text-gold" />
          Retry Retrieval
        </button>
        
        <Link
          href="/"
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-parchment-dim text-ink font-bold rounded-library border border-divider hover:bg-ink/5 transition-all shadow-sm text-[11px] uppercase tracking-widest"
        >
          <Home size={18} className="text-ink/30" />
          Archive Index
        </Link>
      </div>

      <button 
        onClick={() => window.history.back()}
        className="text-ink/30 hover:text-gold transition-colors text-[9px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 pt-12"
      >
        <ArrowLeft size={14} />
        Relinquish Inquiry
      </button>
    </div>
  );
}
