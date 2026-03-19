'use client';

import React from 'react';
import { CaseDetail } from '@/types/case';
import { Scale, User, Calendar } from 'lucide-react';

interface CaseMetadataHeaderProps {
  caseDetail: CaseDetail;
}

export default function CaseMetadataHeader({ caseDetail }: CaseMetadataHeaderProps) {
  return (
    <header className="space-y-6 bg-ink-2/30 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Scale size={120} className="text-gold" />
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-gold/20">
            {caseDetail.docsource}
          </span>
          <span className="text-cream/20 text-xs">•</span>
          <span className="text-cream/40 text-[10px] font-bold uppercase tracking-widest">
            {caseDetail.publishdate}
          </span>
          {caseDetail.citation && 
           caseDetail.citation !== 'Court' && 
           !caseDetail.citation.includes('Court (') && (
            <>
              <span className="text-cream/20 text-xs">•</span>
              <span className="text-gold/60 text-[10px] font-bold uppercase tracking-widest">
                {caseDetail.citation}
              </span>
            </>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-cream leading-tight md:leading-tight">
          {caseDetail.title}
        </h1>

        <div className="flex flex-wrap items-center gap-8 pt-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gold/60">
              <User size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-cream/30 uppercase tracking-widest">Author / Judge</span>
              <span className="text-cream/80 font-medium">{caseDetail.author || 'Not Specified'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gold/60">
              <Scale size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-cream/30 uppercase tracking-widest">Document ID</span>
              <span className="text-cream/80 font-medium">{caseDetail.tid}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
