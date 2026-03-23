'use client';

import React from 'react';
import { CaseDetail } from '@/types/case';
import { Scale, User, Calendar, Building2, FileText, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseMetadataHeaderProps {
  caseDetail: CaseDetail;
}

export default function CaseMetadataHeader({ caseDetail }: CaseMetadataHeaderProps) {
  return (
    <header className="space-y-6 bg-parchment border border-divider p-10 md:p-16 rounded-library shadow-sm relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
        <Scale size={180} className="text-ink" />
      </div>

      <div className="space-y-6 relative z-10 max-w-4xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 bg-ink text-parchment text-[9px] font-bold uppercase tracking-[0.2em] rounded-library shadow-sm">
            {caseDetail.docsource}
          </span>
          <span className="text-divider text-xs">•</span>
          <span className="text-ink/40 text-[9px] font-bold uppercase tracking-widest">
            {caseDetail.publishdate}
          </span>
          {caseDetail.citation && 
           caseDetail.citation !== 'Court' && 
           !caseDetail.citation.includes('Court (') && (
            <>
              <span className="text-divider text-xs">•</span>
              <span className="text-gold text-[9px] font-bold uppercase tracking-widest">
                {caseDetail.citation}
              </span>
            </>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-ink leading-[1.1] tracking-tight italic font-bold">
          {caseDetail.title}
        </h1>

        <div className="flex flex-wrap items-center gap-10 pt-8 border-t border-divider border-dashed">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-library bg-parchment-dim border border-divider flex items-center justify-center text-ink/40 shadow-sm">
              <User size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-ink/30 font-bold uppercase tracking-widest">Presiding / Author</span>
              <span className="text-ink font-serif font-bold italic">{caseDetail.author || 'Not Specified'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-library bg-parchment-dim border border-divider flex items-center justify-center text-ink/40 shadow-sm">
              <FileText size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-ink/30 font-bold uppercase tracking-widest">Registry Folio ID</span>
              <span className="text-ink font-mono font-medium">{caseDetail.tid}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
