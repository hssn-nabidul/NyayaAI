'use client';

import React, { useState } from 'react';
import { useMoot } from '@/features/moot/useMoot';
import { Gavel, Sparkles, Loader2, AlertCircle, Scale, BookOpen, ChevronRight, MessageSquare, ShieldCheck, FileText, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="max-w-7xl mx-auto space-y-8 pb-24 px-6">
      {/* Header */}
      <div className="bg-parchment border border-divider p-10 md:p-16 rounded-library space-y-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Gavel size={180} className="text-ink" />
        </div>
        
        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center shadow-sm">
              <Gavel size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-serif text-ink tracking-tight">Moot Court Prep</h1>
              <p className="text-[10px] text-ink/40 uppercase tracking-[0.2em] font-bold">Phase 3: Production & Advocacy</p>
            </div>
          </div>
          <p className="text-ink/60 max-w-2xl text-base leading-relaxed border-l-2 border-gold/30 pl-6 font-sans">
            Generate institutional-grade legal arguments, identify landmark precedents, and anticipate 
            counter-arguments for competitive advocacy. Powered by the full archive of Indian case law.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-parchment border border-divider rounded-library p-8 space-y-8 shadow-sm">
            <form onSubmit={handleGenerate} className="space-y-8">
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute top-4 left-6 flex items-center gap-2 text-[10px] font-bold text-ink/30 uppercase tracking-[0.2em] pointer-events-none z-10">
                    <FileText size={12} className="text-gold" />
                    Inquiry Proposition
                  </div>
                  <textarea
                    value={proposition}
                    onChange={(e) => setProposition(e.target.value)}
                    placeholder="Provide the complete factual matrix or moot proposition for scholarly analysis..."
                    className="w-full bg-parchment-dim border border-divider text-ink rounded-library p-8 pt-14 min-h-[450px] focus:outline-none focus:ring-1 focus:ring-ink/10 focus:border-ink/20 focus:bg-parchment transition-all font-sans leading-relaxed resize-none shadow-inner text-sm"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest px-1">Advocacy Perspective</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['petitioner', 'respondent', 'both'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSide(s)}
                        className={cn(
                          "py-2.5 rounded-library text-[10px] font-bold uppercase tracking-widest transition-all border",
                          side === s 
                            ? 'bg-ink text-parchment border-ink shadow-sm' 
                            : 'bg-parchment-dim border-divider text-ink/40 hover:bg-ink/5'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending || proposition.length < 50}
                className="w-full bg-ink text-parchment py-4 rounded-library font-bold text-[11px] uppercase tracking-widest hover:bg-ink/90 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analyzing Proposition...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-gold" />
                    Generate Advocacy Brief
                  </>
                )}
              </button>
            </form>
            
            <div className="pt-6 border-t border-divider border-dashed">
               <p className="text-[9px] text-ink/30 italic leading-relaxed">
                 AI-generated memorials are intended for educational and competitive use. 
                 Verify all citations against official archives.
               </p>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-7">
          {!data && !isPending && !error ? (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center border border-divider rounded-library bg-parchment-dim space-y-6 border-dashed">
               <div className="w-16 h-16 bg-ink/5 rounded-library flex items-center justify-center">
                 <Scale size={32} className="text-ink/10" />
               </div>
               <div className="text-center space-y-2">
                <p className="text-ink/20 uppercase tracking-[0.3em] text-[10px] font-bold">Awaiting Proposition</p>
                <p className="text-ink/30 font-serif text-xl italic max-w-xs mx-auto">"Argumentum ad judicium: The search for legal truth."</p>
               </div>
            </div>
          ) : isPending ? (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-ink/5 rounded-library" />
                <div className="w-12 h-12 border-2 border-ink border-t-transparent rounded-library animate-spin absolute top-0" />
              </div>
              <p className="text-ink/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Researching Institutional Archives...</p>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-divider rounded-library p-16 text-center space-y-6 animate-fade-up">
              <div className="w-16 h-16 bg-status-red/10 rounded-library flex items-center justify-center mx-auto text-status-red">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-ink">Generation Failed</h3>
                <p className="text-ink/40 text-sm max-w-xs mx-auto">{error.message || "The AI brief engine encountered an error."}</p>
              </div>
              <button onClick={() => window.location.reload()} className="text-gold font-bold uppercase tracking-widest text-[10px] underline underline-offset-4">Retry Briefing</button>
            </div>
          ) : (
            <div className="space-y-12 animate-fade-up">
              {/* Petitioner Section */}
              {data.analysis.petitioner && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-divider" />
                    <h3 className="text-[10px] font-bold text-ink uppercase tracking-[0.4em]">In the Case of Petitioner</h3>
                    <div className="h-px flex-1 bg-divider" />
                  </div>
                  
                  <div className="space-y-6">
                    {data.analysis.petitioner.arguments.map((arg: any, i: number) => (
                      <div key={i} className="bg-parchment border border-divider rounded-library p-10 space-y-6 shadow-sm hover:border-ink/20 transition-all">
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-gold uppercase tracking-widest">Submission 0{i + 1}</span>
                          <h4 className="text-2xl font-serif text-ink leading-tight italic">{typeof arg.heading === 'string' ? arg.heading : arg.heading?.text || 'Legal Argument'}</h4>
                        </div>
                        
                        <p className="text-[15px] text-ink/70 leading-relaxed font-medium border-l-2 border-divider pl-6">{typeof arg.body === 'string' ? arg.body : arg.body?.text || 'Argument details unavailable.'}</p>
                        
                        <div className="pt-6 space-y-4">
                          <div className="flex items-center gap-2 text-ink/30">
                            <Library size={12} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Supporting Institutional Precedents</p>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {arg.supporting_cases.map((c: any, ci: number) => (
                              <div key={ci} className="bg-parchment-dim p-5 rounded-library border border-divider space-y-2 shadow-inner">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-ink font-serif italic">{typeof c.title === 'string' ? c.title : c.title?.text || 'Case'} ({c.year})</span>
                                  <span className="text-[10px] text-gold font-bold">{typeof c.citation === 'string' ? c.citation : c.citation?.text || 'Citation'}</span>
                                </div>
                                <p className="text-[11px] text-ink/50 leading-relaxed">{typeof c.relevance === 'string' ? c.relevance : c.relevance?.text || ''}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-parchment-dim border border-divider p-8 rounded-library space-y-4 shadow-sm border-l-4 border-l-status-red">
                    <h4 className="text-[10px] font-bold text-status-red uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={14} />
                      Anticipated Rebuttal & Risk
                    </h4>
                    <p className="text-[13px] text-ink/60 italic leading-relaxed font-medium">
                      {typeof data.analysis.petitioner.anticipated_counter === 'string' 
                        ? data.analysis.petitioner.anticipated_counter 
                        : (data.analysis.petitioner.anticipated_counter as any)?.text || 'No counter-argument provided.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Respondent Section */}
              {data.analysis.respondent && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-divider" />
                    <h3 className="text-[10px] font-bold text-ink/40 uppercase tracking-[0.4em]">In the Case of Respondent</h3>
                    <div className="h-px flex-1 bg-divider" />
                  </div>
                  
                  <div className="space-y-6">
                    {data.analysis.respondent.arguments.map((arg: any, i: number) => (
                      <div key={i} className="bg-parchment border border-divider rounded-library p-10 space-y-6 shadow-sm hover:border-ink/20 transition-all">
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-gold uppercase tracking-widest">Submission 0{i + 1}</span>
                          <h4 className="text-2xl font-serif text-ink leading-tight italic">{typeof arg.heading === 'string' ? arg.heading : arg.heading?.text || 'Legal Argument'}</h4>
                        </div>
                        
                        <p className="text-[15px] text-ink/70 leading-relaxed font-medium border-l-2 border-divider pl-6">{typeof arg.body === 'string' ? arg.body : arg.body?.text || 'Argument details unavailable.'}</p>
                        
                        <div className="pt-6 space-y-4">
                          <div className="flex items-center gap-2 text-ink/30">
                            <Library size={12} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Supporting Institutional Precedents</p>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {arg.supporting_cases.map((c: any, ci: number) => (
                              <div key={ci} className="bg-parchment-dim p-5 rounded-library border border-divider space-y-2 shadow-inner">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-ink font-serif italic">{typeof c.title === 'string' ? c.title : c.title?.text || 'Case'} ({c.year})</span>
                                  <span className="text-[10px] text-gold font-bold">{typeof c.citation === 'string' ? c.citation : c.citation?.text || 'Citation'}</span>
                                </div>
                                <p className="text-[11px] text-ink/50 leading-relaxed">{typeof c.relevance === 'string' ? c.relevance : c.relevance?.text || ''}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-parchment-dim border border-divider p-8 rounded-library space-y-4 shadow-sm border-l-4 border-l-ink">
                    <h4 className="text-[10px] font-bold text-ink uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={14} />
                      Anticipated Rebuttal & Risk
                    </h4>
                    <p className="text-[13px] text-ink/60 italic leading-relaxed font-medium">
                      {typeof data.analysis.respondent.anticipated_counter === 'string' 
                        ? data.analysis.respondent.anticipated_counter 
                        : (data.analysis.respondent.anticipated_counter as any)?.text || 'No counter-argument provided.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Usage */}
              <div className="pt-12 border-t border-divider border-dashed flex items-center justify-between">
                 <div className="flex flex-col gap-1">
                    <p className="text-[9px] text-ink/30 uppercase tracking-[0.2em] font-bold">Institutional Credits</p>
                    <div className="flex items-center gap-2">
                       <div className="h-1 w-24 bg-divider rounded-full overflow-hidden">
                          <div className="h-full bg-gold" style={{ width: `${(data.usage.remaining/data.usage.limit)*100}%` }} />
                       </div>
                       <span className="text-[9px] font-bold text-gold">{data.usage.remaining} Units Left</span>
                    </div>
                 </div>
                 <p className="text-[9px] text-ink/20 font-medium uppercase tracking-widest">Nyaya Archive Prep Engine v1.2</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
