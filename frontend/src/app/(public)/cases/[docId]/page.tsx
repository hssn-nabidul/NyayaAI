'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase } from '@/features/cases/useCase';
import { useCaseSummary } from '@/features/cases/useCaseSummary';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useBookmarks } from '@/features/bookmarks/useBookmarks';
import AuthGate from '@/components/auth/AuthGate';
import CitationGraphPanel from '@/components/case/CitationGraphPanel';
import CaseTimeline from '@/components/case/CaseTimeline';
import Link from 'next/link';
import {
  Loader2, ArrowLeft, Calendar, User, Scale, Bookmark,
 
  Share2, FileText, Sparkles, CheckCircle2, AlertTriangle, 
  Info, Building2, Download, Quote, Library, Network 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CaseDetailPage() {
  const params = useParams();
  const docId = params.docId as string;
  const router = useRouter();
  const { data: caseDetail, isLoading, error } = useCase(docId);
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(docId);
  
  const { 
    mutate: generateSummary, 
    data: summaryData, 
    isPending: isSummarizing,
    error: summaryError 
  } = useCaseSummary(docId);

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

  const summary = summaryData?.summary;

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
          
          {summary?.precedent_status && (
            <div className="shrink-0 flex flex-col items-end gap-2">
              <div className={cn(
                "px-4 py-2 rounded-library border flex items-center gap-2 shadow-sm",
                summary.precedent_status === 'Good Law' ? "bg-status-green/5 border-status-green/20 text-status-green" :
                summary.precedent_status === 'Overruled' ? "bg-status-red/5 border-status-red/20 text-status-red" :
                summary.precedent_status === 'Distinguished' ? "bg-status-orange/5 border-status-orange/20 text-status-orange" :
                summary.precedent_status === 'Landmark' ? "bg-gold/5 border-gold/20 text-gold" :
                "bg-ink/5 border-divider text-ink/40"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  summary.precedent_status === 'Good Law' ? "bg-status-green" :
                  summary.precedent_status === 'Overruled' ? "bg-status-red" :
                  summary.precedent_status === 'Distinguished' ? "bg-status-orange" :
                  summary.precedent_status === 'Landmark' ? "bg-gold" :
                  "bg-ink/40"
                )} />
                <span className="text-[11px] font-bold uppercase tracking-widest">{summary.precedent_status}</span>
              </div>
              <p className="text-[9px] font-bold text-ink/30 uppercase tracking-tighter text-right max-w-[200px]">
                {summary.status_reason}
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="bg-parchment border border-divider rounded-library overflow-hidden">
            <div className="p-10 font-serif text-lg leading-relaxed judgment-content" dangerouslySetInnerHTML={{ __html: caseDetail.doc }} />
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <AuthGate featureName="AI Brief" description="Generate a summary.">
            {!summary ? (
              <button 
                onClick={() => generateSummary()} 
                disabled={isSummarizing}
                className="w-full py-4 bg-ink text-parchment rounded-library font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gold transition-colors disabled:opacity-50"
              >
                {isSummarizing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isSummarizing ? 'Analyzing...' : 'Generate AI Brief'}
              </button>
            ) : (
              <div className="bg-parchment border border-divider p-8 rounded-library space-y-6 shadow-sm">
                <div className="flex items-center gap-2 text-gold">
                  <Sparkles size={16} />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Institutional Brief</h3>
                </div>
                <p className="text-[13px] text-ink/70 leading-relaxed font-medium italic border-l-2 border-gold/30 pl-4">
                  "{typeof summary.plain_summary === 'string' ? summary.plain_summary : 'Brief data.'}"
                </p>

                {/* Referenced Statutes Mapping based on AI Summary Areas of Law */}
                {summary.area_of_law && Array.isArray(summary.area_of_law) && (
                  <div className="pt-6 border-t border-divider border-dashed space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40">Tagged Statutes</h4>
                    <div className="flex flex-wrap gap-2">
                       {summary.area_of_law.map((tag: any, idx: number) => {
                         const tagStr = typeof tag === 'string' ? tag : tag?.text || String(tag);
                         // Simple heuristic to link to acts
                         let actHref = null;
                         const lowerTag = tagStr.toLowerCase();
                         if (lowerTag.includes('bns') || lowerTag.includes('nyaya sanhita')) actHref = '/acts/bns-2023';
                         if (lowerTag.includes('bnss') || lowerTag.includes('nagarik suraksha')) actHref = '/acts/bnss-2023';
                         if (lowerTag.includes('bsa') || lowerTag.includes('sakshya')) actHref = '/acts/bsa-2023';
                         if (lowerTag.includes('constitution') || lowerTag.includes('art.')) actHref = '/acts/constitution-of-india';
                         if (lowerTag.includes('penal code') || lowerTag.includes('ipc')) actHref = '/acts/ipc-1860';
                         if (lowerTag.includes('crpc')) actHref = '/acts/crpc-1973';
                         
                         if (actHref) {
                           return (
                             <Link key={idx} href={actHref} className="px-3 py-1 bg-ink/5 hover:bg-gold-dim hover:text-gold hover:border-gold/30 border border-transparent transition-all rounded-library text-[9px] font-bold uppercase tracking-widest text-ink">
                               {tagStr}
                             </Link>
                           );
                         }
                         return (
                           <span key={idx} className="px-3 py-1 bg-parchment-dim border border-divider rounded-library text-[9px] font-bold uppercase tracking-widest text-ink/40">
                             {tagStr}
                           </span>
                         );
                       })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </AuthGate>
          
          {summary && <CaseTimeline docId={docId} />}
          
          <CitationGraphPanel docId={docId} />
        </div>
      </div>
    </div>
  );
}
