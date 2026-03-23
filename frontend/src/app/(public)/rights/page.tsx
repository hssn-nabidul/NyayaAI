'use client';

import React, { useState, useEffect } from 'react';
import { useRights } from '@/features/rights/useRights';
import { Search, ShieldCheck, Sparkles, Scale, Info, Loader2, AlertCircle, ChevronRight, CheckCircle2, HeartHandshake, Library } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useAuthModalStore } from '@/lib/stores/auth-modal.store';
import AuthGate from '@/components/auth/AuthGate';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const PRESET_RIGHTS = [
  'Right to Life and Personal Liberty',
  'Right to Equality',
  'Right against Self-Incrimination',
  'Freedom of Speech and Expression',
  'Right to Speedy Trial',
  'Right to Legal Aid'
];

export default function RightsPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState('');
  const { user } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.openModal);

  // Auto-trigger search if query exists and user is logged in
  useEffect(() => {
    if (initialQuery && user) {
      setActiveQuery(initialQuery);
    }
  }, [initialQuery, user]);

  const { data, isLoading, error } = useRights(activeQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('Fundamental Rights Explainer');
      return;
    }
    if (searchTerm.trim().length >= 3) {
      setActiveQuery(searchTerm.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 px-6">
      {/* Header */}
      <div className="bg-parchment border border-divider p-10 md:p-16 rounded-library space-y-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <ShieldCheck size={180} className="text-ink" />
        </div>
        
        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-serif text-ink tracking-tight">Know Your Rights</h1>
              <p className="text-[10px] text-ink/40 uppercase tracking-[0.2em] font-bold">Phase 2: Constitutional Protection Analysis</p>
            </div>
          </div>
          <p className="text-ink/60 max-w-2xl text-base leading-relaxed border-l-2 border-gold/30 pl-6 font-sans">
            The Constitution of India guarantees fundamental protections to every citizen. 
            Describe your situation or consult a specific provision to understand your scholarly safeguards.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative group max-w-3xl z-10 pt-4">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/30 group-focus-within:text-gold transition-colors duration-300 z-10" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Consult a situation or right (e.g. unlawful arrest, privacy...)"
            className="w-full bg-parchment-dim border border-divider rounded-library py-5 pl-16 pr-40 text-ink focus:outline-none focus:border-ink/20 focus:bg-parchment transition-all font-medium placeholder:text-ink/30 text-lg shadow-inner"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-ink text-parchment px-8 py-3 rounded-library font-bold text-[11px] uppercase tracking-widest hover:bg-ink/90 transition-all shadow-sm"
          >
            Explain
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {!activeQuery ? (
            <div className="h-[450px] flex flex-col items-center justify-center border border-divider rounded-library bg-parchment-dim space-y-6 border-dashed">
               <div className="w-16 h-16 bg-ink/5 rounded-library flex items-center justify-center">
                 <HeartHandshake size={32} className="text-ink/10" />
               </div>
               <div className="text-center space-y-2">
                <p className="text-ink/20 uppercase tracking-[0.3em] text-[10px] font-bold">Safeguards Ready</p>
                <p className="text-ink/30 font-serif text-xl italic max-w-xs mx-auto">"Knowledge of the law is the first line of institutional defence."</p>
               </div>
            </div>
          ) : isLoading ? (
            <div className="h-[450px] flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-ink/5 rounded-library" />
                <div className="w-12 h-12 border-2 border-ink border-t-transparent rounded-library animate-spin absolute top-0" />
              </div>
              <p className="text-ink/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Consulting Constitutional Archives...</p>
            </div>
          ) : error ? (
            <div className="bg-status-red/5 border border-divider rounded-library p-16 text-center space-y-6 animate-fade-up">
              <div className="w-16 h-16 bg-status-red/10 rounded-library flex items-center justify-center mx-auto text-status-red">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-ink">Inquiry Failed</h3>
                <p className="text-ink/40 text-sm max-w-xs mx-auto">{error instanceof Error ? error.message : 'Failed to retrieve constitutional data.'}</p>
              </div>
              <button onClick={() => window.location.reload()} className="text-gold font-bold uppercase tracking-widest text-[10px] underline underline-offset-4">Retry Inquiry</button>
            </div>
          ) : data ? (
            <div className="space-y-8 animate-fade-up">
              <div className="bg-parchment border border-divider rounded-library p-10 md:p-16 space-y-12 shadow-sm">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gold">
                      <Info size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Protection Brief</span>
                    </div>
                    <span className="px-3 py-1 bg-ink text-parchment text-[9px] font-bold uppercase tracking-widest rounded-library shadow-sm">
                      {typeof data.explanation.article === 'string' ? data.explanation.article : (data.explanation.article as any)?.text || 'Constitutional Provision'}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-serif text-ink tracking-tight italic">
                      {typeof data.explanation.right_name === 'string' ? data.explanation.right_name : (data.explanation.right_name as any)?.text || 'Fundamental Right'}
                    </h2>
                    <div className="p-8 bg-parchment-dim border border-divider rounded-library shadow-inner">
                      <p className="text-xl text-ink font-serif leading-relaxed italic">
                        "{typeof data.explanation.simple_explanation === 'string' ? data.explanation.simple_explanation : (data.explanation.simple_explanation as any)?.text || 'No explanation available.'}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-divider border-dashed border-t" />

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-gold">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Institutional Applications</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {data.explanation.what_you_can_do.map((item: any, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-6 bg-parchment-dim border border-divider rounded-library shadow-sm group hover:border-ink/20 transition-all">
                        <div className="w-6 h-6 rounded-library bg-ink text-parchment flex items-center justify-center shrink-0 text-[10px] font-bold">0{i+1}</div>
                        <span className="text-[15px] text-ink/70 font-medium leading-relaxed italic">{typeof item === 'string' ? item : (item as any)?.text || (item as any)?.action || String(item)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-gold">
                      <Sparkles size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Precedential Foundations</span>
                    </div>
                    <ul className="space-y-4">
                      {data.explanation.landmark_cases.map((c: any, i: number) => (
                        <li key={i} className="flex items-start gap-4 text-sm text-ink/60 leading-relaxed group">
                          <span className="text-divider font-bold">0{i+1}</span>
                          <span className="font-serif italic font-bold group-hover:text-gold transition-colors">{typeof c === 'string' ? c : (c as any)?.title || (c as any)?.name || String(c)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-gold">
                      <Scale size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Legal Remedy</span>
                    </div>
                    <div className="p-6 bg-ink text-parchment border border-divider rounded-library shadow-lg">
                      <p className="text-[13px] text-parchment/80 leading-relaxed italic font-medium">
                        {typeof data.explanation.remedy === 'string' ? data.explanation.remedy : (data.explanation.remedy as any)?.text || 'Consult an institutional legal professional for specific guidance.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-parchment border border-divider rounded-library p-8 space-y-8 shadow-sm">
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Archival Protections</h3>
              <p className="text-[11px] text-ink/40 font-medium italic">Standard constitutional inquiries.</p>
            </div>
            
            <div className="space-y-1">
              {PRESET_RIGHTS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    if (!user) {
                      openAuthModal('Fundamental Rights Explainer');
                      return;
                    }
                    setSearchTerm(t);
                    setActiveQuery(t);
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
                  <span className="text-ink/20">Archival Limit</span>
                  <span className="text-gold">{data.usage.remaining} / {data.usage.limit}</span>
                </div>
                <div className="h-1.5 w-full bg-divider rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold transition-all duration-500" 
                    style={{ width: `${(data.usage.remaining / data.usage.limit) * 100}%` }}
                  />
                </div>
                <p className="text-[9px] text-ink/20 italic text-right">Daily constitutional inquiry limit.</p>
              </div>
            )}
          </div>

          <div className="bg-ink p-8 rounded-library shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-parchment/60">
              <ShieldCheck size={16} className="text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Institutional Guard</span>
            </div>
            <p className="text-xs text-parchment/80 leading-relaxed font-medium italic">
              "Fundamental rights are the bedrock of our institution. I can help you understand how they apply to your specific folio."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
