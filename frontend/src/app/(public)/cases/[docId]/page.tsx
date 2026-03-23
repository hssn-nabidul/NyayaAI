'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase } from '@/features/cases/useCase';
import { useCaseSummary } from '@/features/cases/useCaseSummary';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useBookmarks } from '@/features/bookmarks/useBookmarks';
import AuthGate from '@/components/auth/AuthGate';
import CitationGraphPanel from '@/components/case/CitationGraphPanel';
import ParagraphExplainer from '@/components/case/ParagraphExplainer';
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
      <ParagraphExplainer />
      
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
        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-serif text-ink leading-tight">{caseDetail.title}</h1>
          <div className="flex gap-4 text-[10px] font-bold text-ink/40 uppercase tracking-widest">
            <span>{caseDetail.docsource}</span>
            <span>{caseDetail.publishdate}</span>
          </div>
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
              <button onClick={() => generateSummary()} className="w-full py-4 bg-ink text-parchment rounded-library font-bold">Generate AI Brief</button>
            ) : (
              <div className="bg-parchment border border-divider p-6 rounded-library">
                <h3 className="font-serif font-bold mb-4">Institutional Brief</h3>
                <p className="text-sm italic">"{typeof summary.plain_summary === 'string' ? summary.plain_summary : 'Brief data.'}"</p>
              </div>
            )}
          </AuthGate>
          <CitationGraphPanel docId={docId} />
        </div>
      </div>
    </div>
  );
}
