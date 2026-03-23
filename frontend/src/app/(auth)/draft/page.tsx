'use client';

import React, { useState } from 'react';
import { useDraftSuggest } from '@/features/draft/useDraftSuggest';
import { 
  PenTool, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  BookOpen, 
  ChevronRight, 
  Plus, 
  Scale, 
  FileText,
  MessageSquareQuote,
  Zap,
  CheckCircle2,
  Library,
  ScrollText
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DraftAssistantPage() {
  const [draftText, setDraftText] = useState('');
  const { mutate: getSuggestions, isPending, data, error } = useDraftSuggest();

  const handleSuggest = (e: React.FormEvent) => {
    e.preventDefault();
    if (draftText.trim().length < 50) {
      alert("Please provide more text for the AI to identify legal arguments (at least 50 characters).");
      return;
    }
    getSuggestions({ draft_text: draftText });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 px-6">
      {/* Header */}
      <div className="bg-parchment border border-divider p-10 md:p-16 rounded-library space-y-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <PenTool size={180} className="text-ink" />
        </div>
        
        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center shadow-sm">
              <ScrollText size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-serif text-ink tracking-tight">AI Drafting Assistant</h1>
              <p className="text-[10px] text-ink/40 uppercase tracking-[0.2em] font-bold">Phase 3: Production & Submission</p>
            </div>
          </div>
          <p className="text-ink/60 max-w-2xl text-base leading-relaxed border-l-2 border-gold/30 pl-6 font-sans">
            Draft your legal arguments or petitions on the institutional canvas. Our AI scans the full 
            archive to identify legal points and suggest authoritative Indian case law to bolster your brief.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Editor Area */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSuggest} className="space-y-6">
            <div className="bg-parchment border border-divider rounded-library overflow-hidden focus-within:border-ink/20 focus-within:ring-1 focus-within:ring-ink/5 transition-all shadow-sm">
              <div className="px-8 py-4 border-b border-divider flex items-center justify-between bg-parchment-dim">
                <div className="flex items-center gap-2 text-ink/60">
                  <FileText size={14} className="text-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Digital Drafting Folio</span>
                </div>
                <div className="text-[9px] text-ink/30 font-bold uppercase tracking-[0.2em]">Tokens: {draftText.split(/\s+/).filter(Boolean).length} / 5000</div>
              </div>
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="Commence drafting your legal argument, petition, or notice..."
                className="w-full bg-transparent text-ink p-10 min-h-[650px] focus:outline-none font-serif leading-relaxed resize-none text-lg placeholder:text-ink/10"
              />
            </div>
            <button
              type="submit"
              disabled={isPending || draftText.length < 50}
              className="w-full bg-ink text-parchment py-5 rounded-library font-bold text-[11px] uppercase tracking-widest hover:bg-ink/90 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Scanning Archive for Precedents...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-gold" />
                  Request Institutional Citations
                </>
              )}
            </button>
          </form>
        </div>

        {/* Intelligence Side Pane */}
        <div className="lg:col-span-5 h-[800px] flex flex-col">
          {!data && !isPending && !error ? (
            <div className="h-full flex flex-col items-center justify-center border border-divider rounded-library bg-parchment-dim p-12 text-center space-y-6 border-dashed">
               <div className="w-16 h-16 bg-ink/5 rounded-library flex items-center justify-center">
                 <Scale size={32} className="text-ink/10" />
               </div>
               <div className="space-y-2">
                <p className="text-ink/20 uppercase tracking-[0.3em] text-[10px] font-bold">Archives Inactive</p>
                <p className="text-ink/30 font-serif text-lg italic leading-relaxed">"Authority is the foundation of every argument. Begin drafting to consult the library."</p>
               </div>
            </div>
          ) : isPending ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 bg-parchment border border-divider rounded-library shadow-sm">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-ink/5 rounded-library" />
                <div className="w-16 h-16 border-2 border-ink border-t-transparent rounded-library animate-spin absolute top-0" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-ink font-serif text-xl italic">Indexing Submissions</p>
                <p className="text-ink/20 text-[9px] font-bold uppercase tracking-[0.4em] animate-pulse">Matching Principles to Records</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-divider rounded-library p-12 text-center space-y-6 animate-fade-up">
              <div className="w-12 h-12 bg-status-red/10 rounded-library flex items-center justify-center mx-auto text-status-red">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-serif text-ink">Retrieval Failed</h3>
                <p className="text-ink/40 text-sm">{error.message || "Archive scanning failed."}</p>
              </div>
              <button onClick={() => window.location.reload()} className="text-gold font-bold uppercase tracking-widest text-[10px] underline underline-offset-4">Retry Retrieval</button>
            </div>
          ) : (
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-6">
              {/* Detected Arguments */}
              <div className="bg-parchment border border-divider rounded-library p-8 space-y-6 shadow-sm">
                <h3 className="text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <MessageSquareQuote size={14} className="text-gold" />
                  Identified Legal Points
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.detected_arguments.map((arg: any, i: number) => (
                    <div key={i} className="px-3 py-1.5 bg-parchment-dim rounded-library border border-divider text-[11px] font-bold text-ink/60 flex items-center gap-2 shadow-sm">
                      <div className="w-1 h-1 rounded-full bg-gold" />
                      {typeof arg === 'string' ? arg : arg?.text || String(arg)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Suggestions */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em] px-4 flex items-center gap-2">
                  <Library size={14} className="text-gold" />
                  Authoritative Suggestions ({data.suggestions.length})
                </h3>
                
                <div className="space-y-4">
                  {data.suggestions.map((suggestion: any, i: number) => (
                    <div key={i} className="bg-parchment border border-divider rounded-library p-6 hover:border-ink/20 transition-all group relative overflow-hidden shadow-sm">
                      {/* Relevance Score Indicator */}
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold" style={{ opacity: suggestion.relevance_score * 0.8 }} />
                      
                      <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold text-parchment uppercase tracking-widest bg-ink px-2 py-0.5 rounded-library shadow-sm">
                              {typeof suggestion.court === 'string' ? suggestion.court : suggestion.court?.text || 'Court'} · {suggestion.year}
                            </span>
                            <h4 className="text-lg font-serif text-ink leading-tight pt-1 italic font-bold">
                              {typeof suggestion.title === 'string' ? suggestion.title : suggestion.title?.text || 'Judgment'}
                            </h4>
                            <p className="text-[10px] text-ink/30 font-mono italic font-medium">{typeof suggestion.citation === 'string' ? suggestion.citation : suggestion.citation?.text || 'Citation'}</p>
                          </div>
                          <div className="text-[10px] font-bold text-forest flex flex-col items-end shrink-0">
                             <span className="text-sm">{Math.round(suggestion.relevance_score * 100)}%</span>
                             <span className="text-[8px] uppercase opacity-50 tracking-widest">Authority</span>
                          </div>
                        </div>

                        <div className="p-5 bg-parchment-dim rounded-library border border-divider space-y-2 shadow-inner">
                           <div className="flex items-center gap-2 text-gold">
                              <Zap size={12} />
                              <span className="text-[9px] font-bold uppercase tracking-widest">Application Logic</span>
                           </div>
                           <p className="text-[13px] text-ink/60 leading-relaxed italic font-medium">
                             "{typeof suggestion.reason === 'string' ? suggestion.reason : suggestion.reason?.text || 'No logic specified.'}"
                           </p>
                        </div>

                        <button className="w-full flex items-center justify-between text-[10px] font-bold text-ink/30 hover:text-gold transition-colors uppercase tracking-widest pt-3 border-t border-divider border-dashed">
                           <span>Cite Institutional Record</span>
                           <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage & Footer */}
              <div className="p-8 rounded-library bg-ink text-parchment space-y-6 shadow-lg">
                 <div className="flex items-center gap-2 text-gold">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">AI Archivist Verified</span>
                 </div>
                 <p className="text-[11px] text-parchment/60 leading-relaxed font-medium italic">
                   These records have been filtered based on the specific legal principles detected in your folio. Verify all citations against official law reports.
                 </p>
                 <div className="pt-4 border-t border-parchment/10 flex items-center justify-between">
                    <span className="text-[9px] text-parchment/30 font-bold uppercase tracking-widest">Inquiry Allocation</span>
                    <span className="text-[9px] font-bold text-gold">{data.usage.remaining} Records Left</span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
