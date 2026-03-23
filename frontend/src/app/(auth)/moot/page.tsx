'use client';

import React, { useState } from 'react';
import { useMoot } from '@/features/moot/useMoot';
import { Gavel, Sparkles, Loader2, AlertCircle, Scale, BookOpen, ChevronRight, MessageSquare, ShieldCheck, FileText } from 'lucide-react';

export default function MootPage() {
  const [proposition, setProposition] = useState('');
  const [side, setSide] = useState('both');
  const { mutate: generate, isPending, data, error } = useMoot();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (proposition.trim().length < 50) {
      alert("Please provide a more detailed moot proposition (at least 50 characters).");
      return;
    }
    generate({ proposition, side, format: 'memorial' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-6">
      {/* Header */}
      <div className="bg-ink-2/30 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Gavel size={120} className="text-gold" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
              <Gavel size={20} />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-gold tracking-tight">Moot Court Prep</h1>
          </div>
          <p className="text-cream/40 max-w-2xl text-sm md:text-base leading-relaxed">
            Generate structured legal arguments, identify landmark precedents, and anticipate counter-arguments 
            for your moot competition. Powered by Indian case law.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Area */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute top-4 left-6 flex items-center gap-2 text-[10px] font-bold text-gold/40 uppercase tracking-[0.2em] pointer-events-none">
                  <FileText size={12} />
                  Moot Proposition
                </div>
                <textarea
                  value={proposition}
                  onChange={(e) => setProposition(e.target.value)}
                  placeholder="Paste your moot proposition here..."
                  className="w-full bg-white/5 border border-white/10 text-cream rounded-[2rem] p-8 pt-12 min-h-[400px] focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all font-sans leading-relaxed resize-none shadow-inner custom-scrollbar-gold text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {['petitioner', 'respondent', 'both'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                      side === s 
                        ? 'bg-gold/10 border-gold/50 text-gold shadow-lg shadow-gold/5' 
                        : 'bg-white/2 border-white/5 text-cream/40 hover:border-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || proposition.length < 50}
              className="w-full bg-gold text-ink py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gold-light transition-all flex items-center justify-center gap-3 shadow-lg shadow-gold/10 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating Memorial...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Arguments
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
                 <Scale size={40} className="text-cream/10" />
               </div>
               <div className="text-center space-y-2">
                <p className="text-cream/20 uppercase tracking-[0.3em] text-xs font-bold">Ready for Moot</p>
                <p className="text-cream/10 font-serif text-lg italic">"Argumentum ad judicium."</p>
               </div>
            </div>
          ) : isPending ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-6">
              <Loader2 size={40} className="text-gold animate-spin" />
              <p className="text-cream/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Researching Precedents...</p>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-status-red/10 rounded-3xl p-12 text-center space-y-4">
              <AlertCircle size={32} className="mx-auto text-status-red" />
              <h3 className="text-lg font-serif text-cream">Generation Failed</h3>
              <p className="text-cream/40 text-sm">{error.message}</p>
            </div>
          ) : (
            <div className="space-y-12 animate-fade-up">
              {/* Petitioner Section */}
              {data.analysis.petitioner && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-4">
                    <div className="h-px flex-1 bg-gold/20" />
                    <h3 className="text-sm font-bold text-gold uppercase tracking-[0.3em]">Petitioner's Case</h3>
                    <div className="h-px flex-1 bg-gold/20" />
                  </div>
                  
                  <div className="space-y-4">
                    {data.analysis.petitioner.arguments.map((arg: any, i: number) => (
                      <div key={i} className="bg-white/2 border border-white/5 rounded-3xl p-8 space-y-4 hover:border-gold/20 transition-all">
                        <h4 className="text-lg font-serif text-cream font-bold leading-tight">{i + 1}. {typeof arg.heading === 'string' ? arg.heading : arg.heading?.text || 'Legal Argument'}</h4>
                        <p className="text-sm text-cream/60 leading-relaxed">{typeof arg.body === 'string' ? arg.body : arg.body?.text || 'Argument details unavailable.'}</p>
                        
                        <div className="pt-4 space-y-3">
                          <p className="text-[10px] font-bold text-gold/40 uppercase tracking-widest">Supporting Precedents</p>
                          <div className="grid grid-cols-1 gap-2">
                            {arg.supporting_cases.map((c: any, ci: number) => (
                              <div key={ci} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-cream/80">{typeof c.title === 'string' ? c.title : c.title?.text || 'Case'} ({c.year})</span>
                                  <span className="text-[9px] text-gold/60 font-mono">{typeof c.citation === 'string' ? c.citation : c.citation?.text || 'Citation'}</span>
                                </div>
                                <p className="text-[11px] text-cream/40 italic">{typeof c.relevance === 'string' ? c.relevance : c.relevance?.text || ''}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-status-red/5 border border-status-red/10 p-8 rounded-3xl space-y-3">
                    <h4 className="text-[10px] font-bold text-status-red uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={14} />
                      Anticipated Rebuttal
                    </h4>
                    <p className="text-sm text-cream/70 italic leading-relaxed">
                      {typeof data.analysis.petitioner.anticipated_counter === 'string' 
                        ? data.analysis.petitioner.anticipated_counter 
                        : (data.analysis.petitioner.anticipated_counter as any)?.text || 'No counter-argument provided.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Respondent Section */}
              {data.analysis.respondent && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <h3 className="text-sm font-bold text-cream/40 uppercase tracking-[0.3em]">Respondent's Case</h3>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                  
                  <div className="space-y-4">
                    {data.analysis.respondent.arguments.map((arg: any, i: number) => (
                      <div key={i} className="bg-white/2 border border-white/5 rounded-3xl p-8 space-y-4 hover:border-white/20 transition-all">
                        <h4 className="text-lg font-serif text-cream font-bold leading-tight">{i + 1}. {typeof arg.heading === 'string' ? arg.heading : arg.heading?.text || 'Legal Argument'}</h4>
                        <p className="text-sm text-cream/60 leading-relaxed">{typeof arg.body === 'string' ? arg.body : arg.body?.text || 'Argument details unavailable.'}</p>
                        
                        <div className="pt-4 space-y-3">
                          <p className="text-[10px] font-bold text-cream/20 uppercase tracking-widest">Supporting Precedents</p>
                          <div className="grid grid-cols-1 gap-2">
                            {arg.supporting_cases.map((c: any, ci: number) => (
                              <div key={ci} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-cream/80">{typeof c.title === 'string' ? c.title : c.title?.text || 'Case'} ({c.year})</span>
                                  <span className="text-[9px] text-cream/40 font-mono">{typeof c.citation === 'string' ? c.citation : c.citation?.text || 'Citation'}</span>
                                </div>
                                <p className="text-[11px] text-cream/40 italic">{typeof c.relevance === 'string' ? c.relevance : c.relevance?.text || ''}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gold/5 border border-gold/10 p-8 rounded-3xl space-y-3">
                    <h4 className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={14} />
                      Anticipated Rebuttal
                    </h4>
                    <p className="text-sm text-cream/70 italic leading-relaxed">
                      {typeof data.analysis.respondent.anticipated_counter === 'string' 
                        ? data.analysis.respondent.anticipated_counter 
                        : (data.analysis.respondent.anticipated_counter as any)?.text || 'No counter-argument provided.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Usage */}
              <div className="px-8 flex items-center justify-between">
                 <p className="text-[9px] text-cream/20 uppercase tracking-widest">AI Credits Remaining: {data.usage.remaining} / {data.usage.limit}</p>
                 <p className="text-[9px] text-cream/20">Moot Prep Engine v1.2</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
