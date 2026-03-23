'use client';

import React, { useState } from 'react';
import { useJudgeProfile } from '@/features/judges/useJudgeProfile';
import { Search, Gavel, Sparkles, Scale, Info, Loader2, AlertCircle, ChevronRight, BarChart3, Clock, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useAuthModalStore } from '@/lib/stores/auth-modal.store';
import AuthGate from '@/components/auth/AuthGate';
import Link from 'next/link';

export default function JudgesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeJudge, setActiveJudge] = useState('');
  const { user } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.openModal);

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
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-6">
      {/* Header */}
      <div className="bg-ink-2/30 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Gavel size={120} className="text-gold" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-gold tracking-tight">Judge Analytics</h1>
          </div>
          <p className="text-cream/40 max-w-2xl text-sm md:text-base leading-relaxed">
            Generate judicial profiles and analyze the jurisprudential trends of Indian judges. 
            AI-driven insights into ideological tendencies and notable contributions.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative group max-w-2xl z-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold group-focus-within:text-gold transition-colors duration-300 z-10" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter Judge Name (e.g. D.Y. Chandrachud, B.V. Nagarathna...)"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-32 text-cream focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all font-medium"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold text-ink px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
          >
            Analyse
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {!activeJudge ? (
            <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2 space-y-6">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                 <Gavel size={40} className="text-cream/10" />
               </div>
               <div className="text-center space-y-2">
                <p className="text-cream/20 uppercase tracking-[0.3em] text-xs font-bold">Awaiting Analysis</p>
                <p className="text-cream/10 font-serif text-lg italic">"Search for a judge to see their judicial profile..."</p>
               </div>
            </div>
          ) : isLoading ? (
            <div className="h-[500px] flex flex-col items-center justify-center space-y-6">
              <Loader2 size={40} className="text-gold animate-spin" />
              <p className="text-cream/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Aggregating Jurisprudence...</p>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-status-red/10 rounded-3xl p-12 text-center space-y-4">
              <AlertCircle size={32} className="mx-auto text-status-red" />
              <h3 className="text-lg font-serif text-cream">Analysis Failed</h3>
              <p className="text-cream/40 text-sm">{error instanceof Error ? error.message : 'Failed to fetch judge analytics'}</p>
            </div>
          ) : data ? (
            <div className="space-y-8 animate-fade-up">
              {/* Profile Card */}
              <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div className="space-y-2">
                <div className="flex items-center gap-2 text-gold/60">
                  <Scale size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Judicial Profile</span>
                </div>
                <h2 className="text-4xl font-serif text-cream">Justice {data.judge_name}</h2>
                <div className="flex items-center gap-3 pt-2">
                  <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest rounded-full border border-gold/20">
                    {typeof data.profile.ideological_tendency === 'string' ? data.profile.ideological_tendency : (data.profile.ideological_tendency as any)?.text || 'Neutral'}
                  </span>
                  <span className="text-cream/20 text-xs">•</span>
                  <span className="text-cream/40 text-[10px] font-bold uppercase tracking-widest">
                    {data.stats.total_found} Judgments Indexed
                  </span>
                </div>
                </div>
                </div>

                <div className="h-px bg-white/5" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                <div className="md:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/60">Judicial Philosophy</h4>
                  <p className="text-lg text-cream/80 leading-relaxed font-sans italic">
                    "{typeof data.profile.profile_summary === 'string' ? data.profile.profile_summary : (data.profile.profile_summary as any)?.text || 'Summary unavailable.'}"
                  </p>
                </div>
                </div>

                <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/60">Known For</h4>
                <ul className="space-y-3">
                  {data.profile.known_for.map((item: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-cream/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold/40 mt-1.5 shrink-0" />
                      <span>{typeof item === 'string' ? item : item?.text || String(item)}</span>
                    </li>
                  ))}
                </ul>
                </div>
                </div>              </div>

              {/* Recent Judgments */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gold/60 flex items-center gap-2">
                    <Clock size={16} />
                    Recent Judgments
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {data.recent_judgments.map((j, i) => (
                    <Link 
                      key={j.doc_id} 
                      href={`/cases/${j.doc_id}`}
                      className="group bg-white/2 border border-white/5 p-6 rounded-3xl hover:border-gold/30 hover:bg-gold/5 transition-all flex items-center justify-between gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-gold/40 uppercase tracking-widest">{j.court}</span>
                          <span className="text-cream/20 text-[10px]">•</span>
                          <span className="text-[10px] font-bold text-cream/30 uppercase tracking-widest">{j.date}</span>
                        </div>
                        <h4 className="text-lg font-serif text-cream group-hover:text-gold transition-colors leading-tight">{j.title}</h4>
                        <p className="text-xs text-cream/40 line-clamp-1 italic">{j.citation}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold group-hover:text-ink transition-all shrink-0">
                        <ChevronRight size={20} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/2 border border-white/5 rounded-3xl p-6 space-y-6 sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold">Famous Benches</h3>
            <div className="space-y-2">
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
                  className="w-full text-left px-4 py-2.5 rounded-xl text-xs text-cream/40 hover:bg-white/5 hover:text-cream/60 transition-all flex items-center justify-between group"
                >
                  {t}
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gold" />
                </button>
              ))}
            </div>

            {data && (
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
                  <span className="text-cream/20">Daily AI Limit</span>
                  <span className="text-gold">{data.usage.remaining} / {data.usage.limit}</span>
                </div>
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold transition-all duration-500" 
                    style={{ width: `${(data.usage.remaining / data.usage.limit) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
