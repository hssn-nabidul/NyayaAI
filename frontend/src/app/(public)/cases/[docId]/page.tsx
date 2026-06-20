'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase } from '@/features/cases/useCase';
import CitationGraphPanel from '@/components/case/CitationGraphPanel';
import CaseTimeline from '@/components/case/CaseTimeline';
import CaseChatPanel from '@/components/case/CaseChatPanel';
import RelatedCasesPanel from '@/components/case/RelatedCasesPanel';
import SimilarCasesPanel from '@/components/case/SimilarCasesPanel';
import {
  Loader2, ArrowLeft, AlertTriangle,
  Share2, Download, Network
} from 'lucide-react';

export default function CaseDetailPage() {
  const params = useParams();
  const docId = params.docId as string;
  const router = useRouter();
  const { data: caseDetail, isLoading, error } = useCase(docId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-32 text-center">
        <Loader2 className="mx-auto animate-spin text-gold" size={40} />
        <p className="mt-4 text-ink/40 font-bold uppercase tracking-widest text-xs">Consulting Archives...</p>
      </div>
    );
  }

  if (error || !caseDetail) {
    return (
      <div className="max-w-4xl mx-auto py-32 text-center">
        <AlertTriangle className="mx-auto text-status-red" size={40} />
        <h1 className="mt-4 text-2xl font-serif text-ink">Record Not Found</h1>
        <button onClick={() => router.back()} className="mt-4 text-gold underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 px-6 space-y-8 animate-fade-up">
      <div className="flex items-center justify-between border-b border-divider pb-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-ink/40 hover:text-ink">
          <ArrowLeft size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
        </button>
        <div className="flex gap-2">
          <button className="p-2 border border-divider rounded-library"><Share2 size={18} /></button>
          <button className="p-2 border border-divider rounded-library"><Download size={18} /></button>
        </div>
      </div>

      <header className="bg-parchment border border-divider p-10 rounded-library relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl font-serif text-ink leading-tight">{caseDetail.title}</h1>
            <div className="flex gap-4 text-[10px] font-bold text-ink/40 uppercase tracking-widest">
              <span>{caseDetail.docsource}</span>
              <span>{caseDetail.publishdate}</span>
            </div>
          </div>
          
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-parchment border border-divider rounded-library overflow-hidden">
            <div className="p-10 font-serif text-lg leading-relaxed judgment-content" dangerouslySetInnerHTML={{ __html: caseDetail.doc }} />
          </div>
          <RelatedCasesPanel docId={docId} />
          <SimilarCasesPanel docId={docId} caseTitle={caseDetail.title} />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <CaseChatPanel docId={docId} />

          <CaseTimeline docId={docId} />
          
          <CitationGraphPanel docId={docId} />
        </div>
      </div>
    </div>
  );
}
