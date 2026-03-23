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
  Loader2, 
  ArrowLeft, 
  Calendar, 
  User, 
  Scale, 
  Bookmark, 
  Share2, 
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2
} from 'lucide-react';
import Link from 'next/link';

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
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <Loader2 size={40} className="mx-auto text-gold animate-spin" />
        <p className="text-cream/40 uppercase tracking-widest text-sm animate-pulse">Fetching Judgment...</p>
      </div>
    );
  }

  if (error || !caseDetail) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-status-red">
          <Scale size={32} />
        </div>
        <h1 className="text-2xl font-serif text-cream">Judgment Not Found</h1>
        <p className="text-cream/40">The case you are looking for could not be retrieved.</p>
        <button onClick={() => router.back()} className="text-gold underline">Go Back</button>
      </div>
    );
  }

  const summary = summaryData?.summary;

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8 animate-fade-up">
      <ParagraphExplainer />
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-cream/40 hover:text-gold transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-widest">Back to Results</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => toggleBookmark({
              doc_id: docId,
              title: caseDetail.title,
              court: caseDetail.docsource,
              date: caseDetail.publishdate,
              citation: caseDetail.citation
            })}
            className={`p-2 rounded-full transition-all ${
              bookmarked 
                ? 'bg-gold text-ink shadow-lg shadow-gold/20' 
                : 'hover:bg-white/5 text-cream/40 hover:text-gold'
            }`}
            title={bookmarked ? "Remove Bookmark" : "Save to Library"}
          >
            <Bookmark size={20} fill={bookmarked ? "currentColor" : "none"} />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-full text-cream/40 hover:text-gold transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Case Header */}
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Judgment Reader */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-ink-2/30 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden">
            <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-2 text-gold">
                <FileText size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Judgment Text</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-cream/30 uppercase tracking-widest">
                 <span>Font Size</span>
                 <div className="h-3 w-px bg-white/10" />
                 <span>High contrast</span>
              </div>
            </div>
            
            <div 
              className="p-8 md:p-12 font-sans text-cream/80 leading-[1.8] judgment-content prose prose-invert max-w-none prose-p:mb-6"
              dangerouslySetInnerHTML={{ __html: caseDetail.doc }}
            />
          </div>
        </div>

        {/* Right: AI Analysis Panel Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <AuthGate 
              featureName="AI Case Summaries"
              description="Get an instant, structured summary of this judgment including key issues, holdings, and legal significance."
            >
              {!summary ? (
                <div className="p-8 rounded-3xl bg-gold/5 border border-gold/10 space-y-6">
                  <div className="flex items-center gap-3 text-gold">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Sparkles size={16} />
                    </div>
                    <h3 className="font-serif text-lg">AI Case Summary</h3>
                  </div>
                  
                  <p className="text-sm text-cream/60 leading-relaxed font-sans">
                    Get an instant, structured summary of this judgment using Gemini AI. 
                    Identify key issues, holdings, and legal significance in seconds.
                  </p>

                  <button 
                    onClick={() => generateSummary()}
                    disabled={isSummarizing}
                    className="w-full py-4 bg-gold text-ink font-bold rounded-xl hover:bg-gold-light transition-all shadow-lg shadow-gold/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSummarizing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Summarizing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate AI Summary
                      </>
                    )}
                  </button>
                  
                  {summaryError && (
                    <div className="flex items-start gap-2 text-status-red text-xs bg-status-red/5 p-3 rounded-lg border border-status-red/10">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <p>{summaryError.message || 'Failed to generate summary'}</p>
                    </div>
                  )}
                  
                  <p className="text-[10px] text-cream/30 text-center uppercase tracking-widest">
                    Uses 1 of 50 daily AI requests
                  </p>
                </div>
              ) : (
                <div className="rounded-3xl bg-gold/5 border border-gold/10 overflow-hidden animate-fade-up">
                  <div className="p-6 border-b border-gold/10 bg-gold/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gold">
                      <Sparkles size={16} />
                      <h3 className="font-serif font-bold tracking-tight">AI Analysis</h3>
                    </div>
                    <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded uppercase font-bold tracking-widest border border-gold/20">
                      Gemini 1.5 Flash
                    </span>
                  </div>
                  
                  <div className="p-6 space-y-8">
                    <section className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/60 flex items-center gap-2">
                         <CheckCircle2 size={12} />
                         Plain Summary
                      </h4>
                      <p className="text-sm text-cream/80 leading-relaxed font-sans italic">
                        "{typeof summary.plain_summary === 'string' ? summary.plain_summary : (summary.plain_summary as any)?.text || 'No summary available.'}"
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/60 flex items-center gap-2">
                         <CheckCircle2 size={12} />
                         Key Legal Issues
                      </h4>
                      <ul className="space-y-2">
                        {summary.key_issues.map((issue: any, idx: number) => (
                          <li key={idx} className="text-xs text-cream/60 flex gap-2">
                            <span className="text-gold">•</span>
                            <span>{typeof issue === 'string' ? issue : (issue as any)?.text || (issue as any)?.issue || String(issue)}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/60 flex items-center gap-2">
                         <CheckCircle2 size={12} />
                         The Holding
                      </h4>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-xs text-cream/80 leading-relaxed font-sans">
                          {typeof summary.holding === 'string' ? summary.holding : (summary.holding as any)?.text || 'No holding available.'}
                        </p>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/60 flex items-center gap-2">
                         <CheckCircle2 size={12} />
                         Significance
                      </h4>
                      <p className="text-xs text-cream/60 leading-relaxed">
                        {typeof summary.significance === 'string' ? summary.significance : (summary.significance as any)?.text || 'No significance data.'}
                      </p>
                    </section>
                    
                    {summary.area_of_law && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {summary.area_of_law.map((tag: any, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-white/5 text-[10px] text-cream/40 rounded border border-white/5 hover:border-gold/20 transition-colors">
                            #{typeof tag === 'string' ? tag : (tag as any)?.text || (tag as any)?.name || String(tag)}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 border-t border-gold/10 flex items-center justify-between">
                       <span className="text-[10px] text-cream/20 uppercase tracking-widest">Remaining Today</span>
                       <span className="text-[10px] font-bold text-gold">{summaryData.usage.remaining} / {summaryData.usage.limit}</span>
                    </div>
                  </div>
                </div>
              )}
            </AuthGate>

            {/* Citations Graph */}
            <CitationGraphPanel docId={docId} />
          </div>
        </div>
      </div>
    </div>
  );
}
