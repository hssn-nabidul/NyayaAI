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
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

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
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-6">
      {/* Header */}
      <div className="bg-ink-2/30 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <PenTool size={120} className="text-gold" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
              <PenTool size={20} />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-gold tracking-tight">AI Drafting Assistant</h1>
          </div>
          <p className="text-cream/40 max-w-2xl text-sm md:text-base leading-relaxed">
            Write your legal arguments or petition draft. Our AI will analyze your text, 
            identify legal points, and suggest relevant Indian case law to strengthen your submission.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Editor Area */}
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleSuggest} className="space-y-4">
            <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-1 overflow-hidden focus-within:border-gold/30 transition-all shadow-2xl">
              <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div className="flex items-center gap-2 text-gold/60">
                  <FileText size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Drafting Canvas</span>
                </div>
                <div className="text-[9px] text-cream/20 uppercase tracking-[0.2em]">Word Count: {draftText.split(/\s+/).filter(Boolean).length}</div>
              </div>
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="Start typing your legal argument, petition draft, or legal notice..."
                className="w-full bg-transparent text-cream p-8 min-h-[600px] focus:outline-none font-sans leading-relaxed resize-none custom-scrollbar-gold text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={isPending || draftText.length < 50}
              className="w-full bg-gold text-ink py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gold-light transition-all flex items-center justify-center gap-3 shadow-xl shadow-gold/10 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Finding Case Law...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Suggest Supporting Cases
                </>
              )}
            </button>
          </form>
        </div>

        {/* Intelligence Side Pane */}
        <div className="lg:col-span-2">
          {!data && !isPending && !error ? (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2 p-12 text-center space-y-6">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                 <Scale size={40} className="text-cream/10" />
               </div>
               <div className="space-y-2">
                <p className="text-cream/20 uppercase tracking-[0.3em] text-[10px] font-bold">Intelligence Feed</p>
                <p className="text-cream/10 font-serif text-lg italic leading-relaxed">"Legal authority is the foundation of every argument. Begin drafting to see citations."</p>
               </div>
            </div>
          ) : isPending ? (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center space-y-8 bg-white/2 rounded-[3rem] border border-white/5">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-gold/10 rounded-full" />
                <div className="w-24 h-24 border-4 border-gold border-t-transparent rounded-full animate-spin absolute top-0" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-gold font-serif text-xl italic">Scanning Law Library</p>
                <p className="text-cream/20 text-[9px] font-bold uppercase tracking-[0.4em] animate-pulse">Matching Arguments to Precedents</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-status-red/10 rounded-3xl p-12 text-center space-y-4">
              <AlertCircle size={32} className="mx-auto text-status-red" />
              <h3 className="text-lg font-serif text-cream">Detection Failed</h3>
              <p className="text-cream/40 text-sm">{error.message}</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-right h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {/* Detected Arguments */}
              <div className="bg-ink-2/50 border border-white/5 rounded-[2rem] p-8 space-y-6 shadow-xl">
                <h3 className="text-[10px] font-bold text-gold/60 uppercase tracking-[0.2em] flex items-center gap-2">
                  <MessageSquareQuote size={14} />
                  Detected Legal Points
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.detected_arguments.map((arg, i) => (
                    <div key={i} className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-xs text-cream/70 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-gold" />
                      {arg}
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Suggestions */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-gold/60 uppercase tracking-[0.2em] px-4 flex items-center gap-2">
                  <BookOpen size={14} />
                  Suggested Authorities ({data.suggestions.length})
                </h3>
                
                <div className="space-y-4">
                  {data.suggestions.map((suggestion, i) => (
                    <div key={i} className="bg-white/2 border border-white/5 rounded-[2rem] p-6 hover:bg-white/5 hover:border-gold/20 transition-all group relative overflow-hidden">
                      {/* Relevance Score Indicator */}
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold opacity-20" style={{ opacity: suggestion.relevance_score }} />
                      
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-gold uppercase tracking-widest bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                              {suggestion.court} · {suggestion.year}
                            </span>
                            <h4 className="text-base font-serif text-cream leading-tight pt-1 group-hover:text-gold transition-colors">
                              {suggestion.title}
                            </h4>
                            <p className="text-[10px] text-cream/30 font-mono italic">{suggestion.citation}</p>
                          </div>
                          <div className="text-[10px] font-bold text-status-green flex flex-col items-end">
                             <span>{Math.round(suggestion.relevance_score * 100)}%</span>
                             <span className="text-[8px] uppercase opacity-50">Match</span>
                          </div>
                        </div>

                        <div className="p-4 bg-white/2 rounded-xl border border-white/5 space-y-2">
                           <div className="flex items-center gap-2 text-gold/40">
                              <Zap size={10} />
                              <span className="text-[8px] font-bold uppercase tracking-widest">Relevance to your draft</span>
                           </div>
                           <p className="text-xs text-cream/60 leading-relaxed italic">
                             "{suggestion.reason}"
                           </p>
                        </div>

                        <button className="w-full flex items-center justify-between text-[10px] font-bold text-cream/30 hover:text-gold transition-colors uppercase tracking-widest pt-2 border-t border-white/5">
                           <span>Cite this case</span>
                           <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage & Footer */}
              <div className="p-8 rounded-[2rem] bg-gold/5 border border-gold/10 space-y-4">
                 <div className="flex items-center gap-2 text-gold">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">AI Confirmation</span>
                 </div>
                 <p className="text-[10px] text-cream/40 leading-relaxed">
                   These cases have been selected based on the legal principles detected in your draft. Always verify citations with official law reports before submission.
                 </p>
                 <div className="pt-2 border-t border-gold/10 flex items-center justify-between">
                    <span className="text-[9px] text-cream/20 uppercase tracking-widest">Daily Credits</span>
                    <span className="text-[9px] font-bold text-gold">{data.usage.remaining} / {data.usage.limit}</span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
