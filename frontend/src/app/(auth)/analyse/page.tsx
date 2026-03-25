'use client';

import React, { useState } from 'react';
import { useAnalyse } from '@/features/analyse/useAnalyse';
import { FileSearch, Sparkles, Upload, Loader2, AlertCircle, CheckCircle2, ShieldAlert, Zap, FileText, ChevronRight, Library, MessageSquareQuote } from 'lucide-react';
import { cn } from '@/lib/utils';
import DeepAnalysisChat from '@/components/tools/DeepAnalysisChat';

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
    <div className="max-w-7xl mx-auto space-y-8 pb-24 px-6">
      {/* Header */}
      <div className="bg-parchment border border-divider p-10 md:p-16 rounded-library space-y-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <FileSearch size={180} className="text-ink" />
        </div>
        
        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center shadow-sm">
              <FileSearch size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-serif text-ink tracking-tight">Document Analyser</h1>
              <p className="text-[10px] text-ink/40 uppercase tracking-[0.2em] font-bold">Phase 3: Production & Risk Assessment</p>
            </div>
          </div>
          <p className="text-ink/60 max-w-2xl text-base leading-relaxed border-l-2 border-gold/30 pl-6 font-sans">
            Input your legal brief, petition, or contract for a professional institutional breakdown. 
            Our AI identifies key clauses, assesses legal risks, and suggests scholarly next steps.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-parchment border border-divider rounded-library p-8 space-y-8 shadow-sm">
            <form onSubmit={handleAnalyse} className="space-y-8">
              <div className="relative group">
                <div className="absolute top-4 left-6 flex items-center gap-2 text-[10px] font-bold text-ink/30 uppercase tracking-[0.2em] pointer-events-none z-10">
                  <FileText size={12} className="text-gold" />
                  Document Transcript
                </div>
                <textarea
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  placeholder="Paste the complete text of your legal document for scholarly deconstruction..."
                  className="w-full bg-parchment-dim border border-divider text-ink rounded-library p-8 pt-14 min-h-[500px] focus:outline-none focus:ring-1 focus:ring-ink/10 focus:border-ink/20 focus:bg-parchment transition-all font-sans leading-relaxed resize-none shadow-inner text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isPending || docText.length < 100}
                className="w-full bg-ink text-parchment py-4 rounded-library font-bold text-[11px] uppercase tracking-widest hover:bg-ink/90 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Deconstructing Document...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-gold" />
                    Commence AI Analysis
                  </>
                )}
              </button>
            </form>
            
            <div className="pt-6 border-t border-divider border-dashed">
               <p className="text-[9px] text-ink/30 italic leading-relaxed">
                 Institutional analysis provides a preliminary deconstruction. 
                 Final risk assessment must be verified by qualified legal counsel.
               </p>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-7">
          {!data && !isPending && !error ? (
            <div className="h-full min-h-[650px] flex flex-col items-center justify-center border border-divider rounded-library bg-parchment-dim space-y-6 border-dashed">
               <div className="w-16 h-16 bg-ink/5 rounded-library flex items-center justify-center">
                 <Zap size={32} className="text-ink/10" />
               </div>
               <div className="text-center space-y-2">
                <p className="text-ink/20 uppercase tracking-[0.3em] text-[10px] font-bold">Archives Ready</p>
                <p className="text-ink/30 font-serif text-xl italic max-w-xs mx-auto">"Upload text to reveal institutional insights and risks."</p>
               </div>
            </div>
          ) : isPending ? (
            <div className="h-full min-h-[650px] flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-ink/5 rounded-library" />
                <div className="w-12 h-12 border-2 border-ink border-t-transparent rounded-library animate-spin absolute top-0" />
              </div>
              <p className="text-ink/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Running Archive Cross-Reference...</p>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-divider rounded-library p-16 text-center space-y-6 animate-fade-up">
              <div className="w-16 h-16 bg-status-red/10 rounded-library flex items-center justify-center mx-auto text-status-red">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-ink">Analysis Error</h3>
                <p className="text-ink/40 text-sm max-w-xs mx-auto">{error.message || "The AI analysis engine encountered a deconstruction failure."}</p>
              </div>
              <button onClick={() => window.location.reload()} className="text-gold font-bold uppercase tracking-widest text-[10px] underline underline-offset-4">Retry Analysis</button>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-up">
              {/* Top Summary Card */}
              <div className="bg-parchment border border-divider rounded-library p-10 md:p-12 space-y-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                   <span className="px-3 py-1 bg-ink text-parchment text-[9px] font-bold uppercase tracking-widest rounded-library shadow-sm">
                      {data.analysis.document_type}
                   </span>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    Scholarly Brief
                  </h3>
                  <p className="text-xl text-ink font-serif leading-relaxed italic border-l-4 border-divider pl-8">
                    "{data.analysis.executive_summary}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                   <div className="p-8 bg-parchment-dim border border-divider rounded-library space-y-4 shadow-inner border-l-4 border-l-forest">
                      <h4 className="text-[10px] font-bold text-forest uppercase tracking-widest">Legal Strengths</h4>
                      <ul className="space-y-3">
                        {data.analysis.legal_strengths.map((s: string, i: number) => (
                          <li key={i} className="text-[13px] text-ink/70 flex gap-3 leading-relaxed font-medium">
                            <span className="text-forest">0{i+1}</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                   </div>
                   <div className="p-8 bg-parchment-dim border border-divider rounded-library space-y-4 shadow-inner border-l-4 border-l-status-red">
                      <h4 className="text-[10px] font-bold text-status-red uppercase tracking-widest">Identified Risks</h4>
                      <ul className="space-y-3">
                        {data.analysis.potential_risks_or_issues.map((r: string, i: number) => (
                          <li key={i} className="text-[13px] text-ink/70 flex gap-3 leading-relaxed font-medium">
                            <span className="text-status-red">0{i+1}</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>
              </div>

              {/* Key Points Grid */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em] px-4 flex items-center gap-2">
                  <Library size={14} className="text-gold" />
                  Salient Clauses & Folios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.analysis.key_clauses_or_points.map((p: any, i: number) => (
                    <div key={i} className="bg-parchment border border-divider p-8 rounded-library space-y-3 hover:border-ink/20 transition-all shadow-sm">
                      <h4 className="text-xs font-bold text-ink font-serif italic border-b border-divider pb-2 uppercase tracking-wide">{p.point}</h4>
                      <p className="text-[13px] text-ink/60 leading-relaxed font-medium">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-ink p-10 rounded-library space-y-6 shadow-lg">
                <h3 className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} />
                  Institutional Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.analysis.suggested_next_steps.map((s: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 bg-parchment/5 p-5 rounded-library text-[13px] text-parchment/80 border border-parchment/10 font-medium italic">
                      <ChevronRight size={16} className="text-gold shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage */}
              <div className="pt-8 border-t border-divider border-dashed flex items-center justify-between">
                 <div className="flex flex-col gap-1">
                    <p className="text-[9px] text-ink/30 uppercase tracking-[0.2em] font-bold">Institutional Credits</p>
                    <div className="flex items-center gap-2">
                       <div className="h-1 w-24 bg-divider rounded-full overflow-hidden">
                          <div className="h-full bg-gold" style={{ width: `${(data.usage.remaining/data.usage.limit)*100}%` }} />
                       </div>
                       <span className="text-[9px] font-bold text-gold">{data.usage.remaining} Units Left</span>
                    </div>
                 </div>
                 <p className="text-[9px] text-ink/20 font-medium uppercase tracking-widest italic">Nyaya Archive Analysis Engine v1.5</p>
              </div>

              {/* Deep Analysis Streaming Chat */}
              <div className="pt-12 space-y-6">
                <div className="flex items-center gap-3 px-4">
                  <MessageSquareQuote size={20} className="text-gold" />
                  <div>
                    <h3 className="text-sm font-serif italic text-ink tracking-wide">Deep Contextual Analysis</h3>
                    <p className="text-[9px] text-ink/30 uppercase tracking-[0.2em] font-bold">Interactive Scholarly Chat</p>
                  </div>
                </div>
                <DeepAnalysisChat context={docText} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
