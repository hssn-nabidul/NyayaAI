'use client';

import React, { useState } from 'react';
import { useAnalyse } from '@/features/analyse/useAnalyse';
import { FileSearch, Sparkles, Upload, Loader2, AlertCircle, CheckCircle2, ShieldAlert, Zap, FileText, ChevronRight } from 'lucide-react';

export default function AnalysePage() {
  const [docText, setDocText] = useState('');
  const { mutate: analyse, isPending, data, error } = useAnalyse();

  const handleAnalyse = (e: React.FormEvent) => {
    e.preventDefault();
    if (docText.trim().length < 100) {
      alert("Please provide more text for a meaningful analysis (at least 100 characters).");
      return;
    }
    analyse({ doc_text: docText });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-6">
      {/* Header */}
      <div className="bg-ink-2/30 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <FileSearch size={120} className="text-gold" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
              <FileSearch size={20} />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-gold tracking-tight">Document Analyser</h1>
          </div>
          <p className="text-cream/40 max-w-2xl text-sm md:text-base leading-relaxed">
            Upload your legal brief, petition, or contract text for a professional AI breakdown. 
            Identify key clauses, potential risks, and suggested next steps in seconds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Area */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleAnalyse} className="space-y-4">
            <div className="relative group">
              <div className="absolute top-4 left-6 flex items-center gap-2 text-[10px] font-bold text-gold/40 uppercase tracking-[0.2em] pointer-events-none">
                <FileText size={12} />
                Input Document Text
              </div>
              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                placeholder="Paste the text of your legal document here..."
                className="w-full bg-white/5 border border-white/10 text-cream rounded-[2rem] p-8 pt-12 min-h-[500px] focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all font-sans leading-relaxed resize-none shadow-inner custom-scrollbar-gold"
              />
            </div>
            <button
              type="submit"
              disabled={isPending || docText.length < 100}
              className="w-full bg-gold text-ink py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gold-light transition-all flex items-center justify-center gap-3 shadow-lg shadow-gold/10 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Analysing...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Run AI Analysis
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3">
          {!data && !isPending && !error ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2 space-y-6">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                 <Zap size={40} className="text-cream/10" />
               </div>
               <div className="text-center space-y-2">
                <p className="text-cream/20 uppercase tracking-[0.3em] text-xs font-bold">Awaiting Document</p>
                <p className="text-cream/10 font-serif text-lg italic">"Paste your text to reveal AI insights."</p>
               </div>
            </div>
          ) : isPending ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-6">
              <Loader2 size={40} className="text-gold animate-spin" />
              <p className="text-cream/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Deconstructing Document...</p>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-status-red/10 rounded-3xl p-12 text-center space-y-4">
              <AlertCircle size={32} className="mx-auto text-status-red" />
              <h3 className="text-lg font-serif text-cream">Analysis Failed</h3>
              <p className="text-cream/40 text-sm">{error.message}</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-up">
              {/* Top Summary Card */}
              <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                   <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest rounded-full border border-gold/20">
                      {data.analysis.document_type}
                   </span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gold/60 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    Executive Summary
                  </h3>
                  <p className="text-lg text-cream/80 leading-relaxed font-sans italic">
                    "{data.analysis.executive_summary}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-6 bg-status-green/5 border border-status-green/10 rounded-2xl space-y-3">
                      <h4 className="text-[10px] font-bold text-status-green uppercase tracking-widest">Legal Strengths</h4>
                      <ul className="space-y-2">
                        {data.analysis.legal_strengths.map((s, i) => (
                          <li key={i} className="text-xs text-cream/60 flex gap-2">
                            <span className="text-status-green">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                   </div>
                   <div className="p-6 bg-status-red/5 border border-status-red/10 rounded-2xl space-y-3">
                      <h4 className="text-[10px] font-bold text-status-red uppercase tracking-widest">Potential Risks</h4>
                      <ul className="space-y-2">
                        {data.analysis.potential_risks_or_issues.map((r, i) => (
                          <li key={i} className="text-xs text-cream/60 flex gap-2">
                            <span className="text-status-red">•</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>
              </div>

              {/* Key Points Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gold/60 uppercase tracking-widest px-4">Key Clauses & Points</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.analysis.key_clauses_or_points.map((p, i) => (
                    <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-2xl space-y-2 hover:border-gold/20 transition-all">
                      <h4 className="text-xs font-bold text-cream font-serif">{p.point}</h4>
                      <p className="text-xs text-cream/40 leading-relaxed">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gold/5 border border-gold/10 p-8 rounded-[2.5rem] space-y-4">
                <h3 className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} />
                  Suggested Next Steps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.analysis.suggested_next_steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl text-xs text-cream/70 border border-white/5">
                      <ChevronRight size={14} className="text-gold" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage */}
              <div className="px-8 flex items-center justify-between">
                 <p className="text-[9px] text-cream/20 uppercase tracking-widest">Credits Remaining: {data.usage.remaining} / {data.usage.limit}</p>
                 <p className="text-[9px] text-cream/20 italic">Analysis powered by Nyaya AI Engine v1.5</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
