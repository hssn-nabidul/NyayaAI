'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Book, Library } from 'lucide-react';

export default function TermPage() {
  const params = useParams();
  const router = useRouter();
  const term = params.term as string;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 px-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-ink/40 hover:text-ink transition-colors text-[9px] font-bold uppercase tracking-widest group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Return to Glossary
      </button>

      {/* Header */}
      <div className="bg-parchment border border-divider p-10 md:p-16 rounded-library space-y-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Book size={180} className="text-ink" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center shadow-sm">
              <Book size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-serif text-ink tracking-tight italic font-bold capitalize">
                {decodeURIComponent(term).replace(/-/g, " ")}
              </h1>
              <p className="text-[10px] text-ink/40 uppercase tracking-[0.2em] font-bold">Lexical Archive Folio</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-parchment border border-divider rounded-library p-10 space-y-8 shadow-sm">
        <div className="flex items-center gap-3 text-gold border-b border-divider pb-4">
          <Library size={18} />
          <h3 className="text-[10px] font-bold uppercase tracking-widest">Scholarly Explanation</h3>
        </div>
        <p className="text-[17px] text-ink/60 italic leading-relaxed font-medium">
          The institutional definition and judicial application of this legal term are currently being indexed into the scholarly archives. 
          Please consult the primary "Legal Glossary" dashboard for immediate inquiries.
        </p>
      </div>
    </div>
  );
}
