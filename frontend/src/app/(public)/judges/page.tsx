'use client';

import React, { useState, useEffect } from 'react';
import { useJudgeProfile } from '@/features/judges/useJudgeProfile';
import { Search, Gavel, Sparkles, Scale, Info, Loader2, AlertCircle, ChevronRight, BarChart3, Clock, ExternalLink, Library, User, FileText } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useAuthModalStore } from '@/lib/stores/auth-modal.store';
import AuthGate from '@/components/auth/AuthGate';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function JudgesPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeJudge, setActiveJudge] = useState('');
  const { user } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.openModal);

  // Auto-trigger search if query exists and user is logged in
  useEffect(() => {
    if (initialQuery && user) {
      setActiveJudge(initialQuery);
    }
  }, [initialQuery, user]);

  const { data, isLoading, error, isFetching } = useJudgeProfile(activeJudge);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('Judge Analytics');
      return;
    }
    if (searchTerm.trim().length >= 3) {
      setActiveJudge(searchTerm.trim());
    }
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
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-serif text-ink tracking-tight">Judicial Analytics</h1>
              <p className="text-[10px] text-ink/40 uppercase tracking-[0.2em] font-bold">Phase 2: Jurisprudential Profiling</p>
            </div>
          </div>
          <p className="text-ink/60 max-w-2xl text-base leading-relaxed border-l-2 border-gold/30 pl-6 font-sans">
            Generate scholarly profiles and analyze the jurisprudential trends of Indian judges. 
            AI-driven deconstruction of ideological tendencies and landmark contributions.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative group max-w-3xl z-10 pt-4">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/30 group-focus-within:text-gold transition-colors duration-300 z-10" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter Judge Name (e.g. D.Y. Chandrachud, B.V. Nagarathna...)"
            className="w-full bg-parchment-dim border border-divider rounded-library py-5 pl-16 pr-40 text-ink focus:outline-none focus:border-ink/20 focus:bg-parchment transition-all font-medium placeholder:text-ink/30 text-lg shadow-inner"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-ink text-parchment px-8 py-3 rounded-library font-bold text-[11px] uppercase tracking-widest hover:bg-ink/90 transition-all shadow-sm"
          >
            Analyse
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {!activeJudge ? (
            <div className="h-[500px] flex flex-col items-center justify-center border border-divider rounded-library bg-parchment-dim space-y-6 border-dashed">
               <div className="w-16 h-16 bg-ink/5 rounded-library flex items-center justify-center">
                 <Gavel size={32} className="text-ink/10" />
               </div>
               <div className="text-center space-y-2">
                <p className="text-ink/20 uppercase tracking-[0.3em] text-[10px] font-bold">Awaiting Inquiry</p>
                <p className="text-ink/30 font-serif text-xl italic max-w-xs mx-auto">"Search for a presiding officer to deconstruct their judicial legacy."</p>
               </div>
            </div>
          ) : isLoading ? (
            <div className="h-[500px] flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-ink/5 rounded-library" />
                <div className="w-12 h-12 border-2 border-ink border-t-transparent rounded-library animate-spin absolute top-0" />
              </div>
              <p className="text-ink/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Consulting Judicial Archives...</p>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-divider rounded-library p-16 text-center space-y-6 animate-fade-up">
              <div className="w-16 h-16 bg-status-red/10 rounded-library flex items-center justify-center mx-auto text-status-red">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-ink">Analysis Failed</h3>
                <p className="text-ink/40 text-sm max-w-xs mx-auto">{error instanceof Error ? error.message : 'Failed to retrieve judicial data.'}</p>
              </div>
              <button onClick={() => window.location.reload()} className="text-gold font-bold uppercase tracking-widest text-[10px] underline underline-offset-4">Retry Analysis</button>
            </div>
          ) : data ? (
            <div className="space-y-12 animate-fade-up">
              {/* Profile Card */}
              <div className="bg-parchment border border-divider rounded-library p-10 md:p-16 space-y-12 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gold">
                      <Scale size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Judicial Profile</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif text-ink tracking-tight italic font-bold">Justice {data.judge_name}</h2>
                    <div className="flex items-center gap-4 pt-2">
                      <span className="px-3 py-1 bg-ink text-parchment text-[9px] font-bold uppercase tracking-widest rounded-library shadow-sm">
                        {typeof data.profile.ideological_tendency === 'string' ? data.profile.ideological_tendency : (data.profile.ideological_tendency as any)?.text || 'Neutral'}
                      </span>
                      <span className="text-divider text-xs">•</span>
                      <span className="text-ink/40 text-[9px] font-bold uppercase tracking-widest">
                        {data.stats.total_found} Folios Indexed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-divider border-dashed border-t" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                  <div className="md:col-span-2 space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                         <Library size={12} />
                         Judicial Philosophy
                      </h4>
                      <p className="text-xl text-ink font-serif leading-relaxed italic border-l-4 border-divider pl-8">
                        "{typeof data.profile.profile_summary === 'string' ? data.profile.profile_summary : (data.profile.profile_summary as any)?.text || 'Summary unavailable.'}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold">Key Scholarly Focus</h4>
                    <ul className="space-y-4">
                      {data.profile.known_for.map((item: any, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-[13px] text-ink/60 font-medium leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                          <span>{typeof item === 'string' ? item : item?.text || String(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recent Judgments */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-divider" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-ink/30 flex items-center gap-3">
                    <Clock size={14} />
                    Indexed Records
                  </h3>
                  <div className="h-px flex-1 bg-divider" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {data.recent_judgments.map((j, i) => (
                    <Link 
                      key={j.doc_id} 
                      href={`/cases/${j.doc_id}`}
                      className="group bg-parchment border border-divider p-8 rounded-library hover:border-ink/20 transition-all flex items-center justify-between gap-8 shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-bold text-gold uppercase tracking-widest bg-gold-dim px-2 py-0.5 rounded-library border border-gold/10">{j.court}</span>
                          <span className="text-divider text-[10px]">•</span>
                          <span className="text-[9px] font-bold text-ink/40 uppercase tracking-widest">{j.date}</span>
                        </div>
                        <h4 className="text-2xl font-serif text-ink group-hover:text-gold transition-colors leading-tight italic font-bold underline decoration-gold/0 group-hover:decoration-gold/20 underline-offset-4">{j.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-ink/30 font-mono italic font-medium">
                           <FileText size={12} />
                           {j.citation}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center group-hover:bg-gold transition-all shrink-0 shadow-sm">
                        <ChevronRight size={24} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-parchment border border-divider rounded-library p-8 space-y-8 shadow-sm">
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Presiding Officers</h3>
              <p className="text-[11px] text-ink/40 font-medium italic">Scholarly profiles of the bench.</p>
            </div>
            
            <div className="space-y-1">
              {[
                'D.Y. Chandrachud', 
                'B.V. Nagarathna', 
                'S.K. Kaul', 
                'Hima Kohli', 
                'J.B. Pardiwala',
                'Abhay S. Oka'
              ].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    if (!user) {
                      openAuthModal('Judge Analytics');
                      return;
                    }
                    setSearchTerm(t);
                    setActiveJudge(t);
                  }}
                  className="w-full text-left px-5 py-3 rounded-library text-[12px] font-bold text-ink/40 hover:bg-ink/5 hover:text-ink transition-all flex items-center justify-between group border-l-2 border-transparent hover:border-gold"
                >
                  {t}
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-gold" />
                </button>
              ))}
            </div>

            {data && (
              <div className="pt-8 border-t border-divider border-dashed space-y-4">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] font-bold">
                  <span className="text-ink/20">Analysis Allocation</span>
                  <span className="text-gold">{data.usage.remaining} / {data.usage.limit}</span>
                </div>
                <div className="h-1.5 w-full bg-divider rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold transition-all duration-1000" 
                    style={{ width: `${(data.usage.remaining / data.usage.limit) * 100}%` }}
                  />
                </div>
                <p className="text-[9px] text-ink/20 italic text-right">Daily judicial profile limit.</p>
              </div>
            )}
          </div>

          <div className="bg-ink p-8 rounded-library shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-parchment/60">
              <Sparkles size={16} className="text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-widest">AI Archivist</span>
            </div>
            <p className="text-xs text-parchment/80 leading-relaxed font-medium italic">
              "I deconstruct thousands of judicial records to map the thematic and ideological landscape of individual judges."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
