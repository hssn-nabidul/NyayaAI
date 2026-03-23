'use client';

import React, { useState } from 'react';
import { useRights } from '@/features/rights/useRights';
import { Search, ShieldCheck, Sparkles, Scale, Info, Loader2, AlertCircle, ChevronRight, CheckCircle2, HeartHandshake } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import AuthGate from '@/components/auth/AuthGate';

const PRESET_RIGHTS = [
  'Right to Life and Personal Liberty',
  'Right to Equality',
  'Right against Self-Incrimination',
  'Freedom of Speech and Expression',
  'Right to Speedy Trial',
  'Right to Legal Aid'
];

export default function RightsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const { user } = useAuthStore();

  const { data, isLoading, error } = useRights(activeQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length >= 3) {
      setActiveQuery(searchTerm.trim());
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4 md:px-6">
      {/* Header */}
      <div className="bg-ink-2/30 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck size={120} className="text-gold" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
              <ShieldCheck size={20} />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-gold tracking-tight">Know Your Rights</h1>
          </div>
          <p className="text-cream/40 max-w-2xl text-sm md:text-base leading-relaxed">
            The Constitution of India guarantees fundamental rights to every citizen. 
            Describe your situation or search for a specific right to understand your legal protections.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative group max-w-2xl z-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold group-focus-within:text-gold transition-colors duration-300 z-10" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Describe a situation or name a right..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-32 text-cream focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all font-medium"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold text-ink px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
          >
            Explain
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {!activeQuery ? (
            <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2 space-y-6">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                 <HeartHandshake size={40} className="text-cream/10" />
               </div>
               <div className="text-center space-y-2">
                <p className="text-cream/20 uppercase tracking-[0.3em] text-xs font-bold">Your Protections</p>
                <p className="text-cream/10 font-serif text-lg italic">"Knowledge is your first line of defence."</p>
               </div>
            </div>
          ) : isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center space-y-6">
              <Loader2 size={40} className="text-gold animate-spin" />
              <p className="text-cream/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Consulting Constitutional Expert...</p>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-status-red/10 rounded-3xl p-12 text-center space-y-4">
              <AlertCircle size={32} className="mx-auto text-status-red" />
              <h3 className="text-lg font-serif text-cream">Query Failed</h3>
              <p className="text-cream/40 text-sm">{error instanceof Error ? error.message : 'Failed to fetch explanation'}</p>
            </div>
          ) : data ? (
            <div className="space-y-6 animate-fade-up">
              <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gold/60">
                      <Info size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Legal Protection</span>
                    </div>
                    <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest rounded-full border border-gold/20">
                      {typeof data.explanation.article === 'string' ? data.explanation.article : (data.explanation.article as any)?.text || 'Constitutional Provision'}
                    </span>
                  </div>
                  <h2 className="text-3xl font-serif text-cream">{typeof data.explanation.right_name === 'string' ? data.explanation.right_name : (data.explanation.right_name as any)?.text || 'Fundamental Right'}</h2>
                  <p className="text-lg text-cream/80 leading-relaxed font-sans italic">
                    "{typeof data.explanation.simple_explanation === 'string' ? data.explanation.simple_explanation : (data.explanation.simple_explanation as any)?.text || 'No explanation available.'}"
                  </p>
                </div>

                <div className="h-px bg-white/5" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gold/60">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Practical Applications</span>
                  </div>
                  <ul className="space-y-3">
                    {data.explanation.what_you_can_do.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-cream/70 text-sm md:text-base bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold/40 mt-2 shrink-0" />
                        <span>{typeof item === 'string' ? item : (item as any)?.text || (item as any)?.action || String(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gold/60">
                      <Sparkles size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Landmark Cases</span>
                    </div>
                    <ul className="space-y-2">
                      {data.explanation.landmark_cases.map((c, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-cream/50">
                          <ChevronRight size={12} className="mt-0.5 text-gold/40 shrink-0" />
                          <span>{typeof c === 'string' ? c : (c as any)?.title || (c as any)?.name || String(c)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gold/60">
                      <Scale size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Legal Remedy</span>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-xs text-cream/60 leading-relaxed italic">
                      {typeof data.explanation.remedy === 'string' ? data.explanation.remedy : (data.explanation.remedy as any)?.text || 'Consult a legal professional.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/2 border border-white/5 rounded-3xl p-6 space-y-6 sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold">Common Searches</h3>
            <div className="space-y-2">
              {PRESET_RIGHTS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSearchTerm(t);
                    setActiveQuery(t);
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
