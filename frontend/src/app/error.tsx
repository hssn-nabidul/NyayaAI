'use client';

import React from 'react';
import { AlertCircle, RefreshCcw, Home, ArrowLeft } from 'lucide-react';
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
    console.error('Application Error:', error);
  }, [error]);

  // Clean the error message for display
  const displayMessage = typeof error.message === 'string' 
    ? error.message 
    : 'An unexpected error occurred. Please try again or return home.';

  const isReactError31 = displayMessage.includes('Objects are not valid as a React child');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-8 animate-fade-up">
      <div className="w-20 h-20 bg-status-red/10 rounded-[2rem] flex items-center justify-center text-status-red shadow-2xl shadow-status-red/5">
        <AlertCircle size={40} />
      </div>

      <div className="space-y-4 max-w-md">
        <h2 className="text-3xl font-serif text-cream">Oops! Something went wrong</h2>
        <p className="text-cream/40 leading-relaxed font-sans">
          {isReactError31 
            ? "We encountered a data processing issue while rendering this page. Our team has been notified."
            : displayMessage}
        </p>
        {isReactError31 && (
          <p className="text-[10px] text-cream/20 uppercase tracking-widest font-bold">Error Reference: #31-OBJ-CHILD</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gold text-ink font-bold rounded-2xl hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
        >
          <RefreshCcw size={18} />
          Try Again
        </button>
        
        <Link
          href="/"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-white/5 text-cream font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
        >
          <Home size={18} />
          Return Home
        </Link>
      </div>

      <button 
        onClick={() => window.history.back()}
        className="text-cream/20 hover:text-gold transition-colors text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 pt-8"
      >
        <ArrowLeft size={12} />
        Go Back
      </button>
    </div>
  );
}
