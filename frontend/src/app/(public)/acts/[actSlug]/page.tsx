'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useActDetails, 
  useSectionDetails, 
  useExplainSection 
} from '@/features/acts/useActs';
import { 
  Loader2, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Scale, 
  CheckCircle2,
  AlertTriangle,
  Info,
  List,
  Type,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import AuthGate from '@/components/auth/AuthGate';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'contents' | 'text' | 'explain';

export default function ActDetailPage() {
  const params = useParams();
  const actSlug = params.actSlug as string;
  const router = useRouter();
  
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [tocSearch, setTocSearch] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('contents');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const { data: act, isLoading: isLoadingAct } = useActDetails(actSlug);
  const { data: sectionData, isLoading: isLoadingSection } = useSectionDetails(actSlug, activeSection || '');
  const { 
    mutate: explainSection, 
    data: explanation, 
    isPending: isExplaining,
    error: explainError,
    reset: resetExplanation
  } = useExplainSection(actSlug, activeSection || '');

  const filteredTOC = useMemo(() => {
    return act?.sections.filter(s => 
      s.number.includes(tocSearch) || 
      s.title.toLowerCase().includes(tocSearch.toLowerCase())
    );
  }, [act, tocSearch]);

  const handleSectionClick = (num: string) => {
    setActiveSection(num);
    resetExplanation();
    if (window.innerWidth < 768) {
      setActiveTab('text');
    }
  };

  if (isLoadingAct) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Loader2 className="text-gold animate-spin" size={40} />
        <p className="text-cream/40 text-sm uppercase tracking-widest animate-pulse">Loading Act Text...</p>
      </div>
    );
  }

  if (!act) {
    return (
      <div className="text-center py-20 space-y-4">
        <h1 className="text-2xl font-serif text-cream">Act Not Found</h1>
        <button onClick={() => router.push('/acts')} className="text-gold underline">Back to Library</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] -m-4 md:-m-8">
      {/* Mobile Tabs */}
      <div className="flex md:hidden border-b border-white/5 bg-ink-2">
        <button 
          onClick={() => setActiveTab('contents')}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-1",
            activeTab === 'contents' ? "text-gold bg-gold/5" : "text-cream/40"
          )}
        >
          <List size={16} />
          Contents
        </button>
        <button 
          onClick={() => setActiveTab('text')}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-1",
            activeTab === 'text' ? "text-gold bg-gold/5" : "text-cream/40"
          )}
        >
          <Type size={16} />
          Text
        </button>
        <button 
          onClick={() => setActiveTab('explain')}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-1",
            activeTab === 'explain' ? "text-gold bg-gold/5" : "text-cream/40"
          )}
        >
          <Sparkles size={16} />
          AI Explain
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Toggle Sidebar Button (Desktop) */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={cn(
            "hidden md:flex absolute top-4 left-4 z-50 p-2 bg-ink-3 border border-white/10 rounded-lg text-cream/40 hover:text-gold transition-all hover:scale-105",
            isSidebarCollapsed ? "translate-x-0" : "translate-x-60"
          )}
          title={isSidebarCollapsed ? "Show Contents" : "Hide Contents"}
        >
          {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Left: TOC Sidebar (Fixed 260px) */}
        <aside className={cn(
          "w-full md:w-[260px] flex-shrink-0 flex flex-col bg-ink border-r border-white/5 overflow-hidden transition-all duration-300",
          activeTab !== 'contents' && "hidden md:flex",
          isSidebarCollapsed && "md:w-0 md:border-none md:opacity-0"
        )}>
          <div className="p-4 pt-16 md:pt-4 border-b border-white/5 space-y-4">
            <button 
              onClick={() => router.push('/acts')}
              className="flex items-center gap-2 text-cream/40 hover:text-gold transition-colors text-[10px] font-bold uppercase tracking-widest"
            >
              <ArrowLeft size={14} />
              Library
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/20" size={14} />
              <input
                type="text"
                placeholder="Find section..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-cream outline-none focus:border-gold/30 transition-all"
                value={tocSearch}
                onChange={(e) => setTocSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
            {filteredTOC?.length === 0 && tocSearch.trim() && (
              <div className="p-4 text-center space-y-3">
                <p className="text-[10px] text-cream/30 uppercase tracking-widest">Section not in list</p>
                <button 
                  onClick={() => handleSectionClick(tocSearch.replace(/\D/g, ''))}
                  className="w-full py-3 bg-gold/10 hover:bg-gold/20 text-gold text-xs font-bold rounded-xl border border-gold/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  Jump to Section {tocSearch.replace(/\D/g, '')}
                </button>
              </div>
            )}
            {filteredTOC?.map((s) => (
              <button
                key={s.number}
                onClick={() => handleSectionClick(s.number)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-start gap-3 group",
                  activeSection === s.number 
                    ? "bg-gold/10 text-gold font-bold" 
                    : "text-cream/60 hover:bg-white/5 hover:text-cream"
                )}
              >
                <span className={cn(
                  "text-[10px] mt-0.5 shrink-0",
                  activeSection === s.number ? "text-gold" : "text-gold/30 group-hover:text-gold/50"
                )}>
                  §{s.number}
                </span>
                <span className="text-xs line-clamp-2 leading-snug">{s.title}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Middle: Section Reader (Flex-1) */}
        <main className={cn(
          "flex-1 flex flex-col min-w-0 bg-ink-2/20 overflow-hidden",
          activeTab !== 'text' && "hidden md:flex"
        )}>
          {activeSection ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoadingSection ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="text-gold/40 animate-spin" size={40} />
                    <p className="text-[10px] text-gold/40 uppercase font-bold tracking-widest">Fetching section verbatim...</p>
                  </div>
                </div>
              ) : sectionData ? (
                <div className="max-w-3xl mx-auto p-6 md:p-16 space-y-10 animate-fade-up">
                  <header className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest rounded border border-gold/20">
                        Section {sectionData.section.number}
                      </span>
                      <span className="text-cream/40 text-[10px] font-bold uppercase tracking-widest line-clamp-1">
                        {sectionData.act_title}
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif text-cream leading-tight">
                      {sectionData.section.title}
                    </h1>
                  </header>

                  <div className="prose prose-invert max-w-none font-sans text-cream/80 leading-[1.9] text-base md:text-xl">
                    {sectionData.section.content.split('\n').map((para, i) => (
                      <p key={i} className="mb-6">{para}</p>
                    ))}
                  </div>

                  <section className="pt-12 border-t border-white/5 space-y-6">
                    <div className="flex items-center gap-2 text-gold">
                      <Scale size={20} />
                      <h3 className="font-serif text-xl">Related Case Law</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {sectionData.related_cases.length > 0 ? (
                        sectionData.related_cases.map((c: any) => (
                          <Link 
                            key={c.doc_id}
                            href={`/cases/${c.doc_id}`}
                            className="group flex items-center justify-between p-5 bg-white/2 hover:bg-gold/5 border border-white/5 hover:border-gold/20 rounded-2xl transition-all"
                          >
                            <div className="space-y-1 min-w-0">
                              <p className="text-base font-medium text-cream group-hover:text-gold transition-colors truncate">{c.title}</p>
                              <div className="flex items-center gap-2 text-[10px] text-cream/20 uppercase font-bold tracking-widest">
                                <span>{c.court}</span>
                                <span>•</span>
                                <span>{c.date}</span>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-cream/20 group-hover:text-gold transition-all shrink-0" />
                          </Link>
                        ))
                      ) : (
                        <p className="text-sm text-cream/30 italic">No specific cases linked to this section yet.</p>
                      )}
                    </div>
                  </section>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-[2.5rem] bg-white/2 flex items-center justify-center text-cream/10">
                <BookOpen size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-cream font-serif text-xl font-bold">Select a Section</h3>
                <p className="text-cream/30 text-sm max-w-xs mx-auto">
                  Choose a section from the table of contents to read its full text and related cases.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Right: AI Explainer (Fixed 320px) */}
        <aside className={cn(
          "w-full md:w-[320px] flex-shrink-0 flex flex-col bg-ink border-l border-white/5 overflow-hidden",
          activeTab !== 'explain' && "hidden md:flex"
        )}>
          <div className="p-4 border-b border-white/5 bg-gold/[0.02]">
            <div className="flex items-center gap-2 text-gold">
              <Sparkles size={16} />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">AI Section Explainer</h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <AuthGate 
              featureName="AI Section Explanation"
              description="Get a plain-English breakdown of legal sections."
            >
              {!activeSection ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <Info size={32} />
                  <p className="text-xs uppercase tracking-widest font-bold">Select a section to explain</p>
                </div>
              ) : !explanation ? (
                <div className="space-y-6">
                  <p className="text-xs text-cream/40 leading-relaxed italic">
                    Gemini AI can break down Section {activeSection} into simple terms, providing practical takeaways and illustrations.
                  </p>
                  <button 
                    onClick={() => explainSection()}
                    disabled={isExplaining}
                    className="w-full py-4 bg-gold text-ink font-bold rounded-xl hover:bg-gold-light transition-all shadow-lg shadow-gold/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isExplaining ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    Explain Section {activeSection}
                  </button>
                  {explainError && (
                    <p className="text-[10px] text-status-red text-center italic">Failed to generate explanation. Try again.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-8 animate-fade-up">
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-gold/60">
                      <CheckCircle2 size={12} />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/60">Simple Meaning</h4>
                    </div>
                    <p className="text-sm text-cream/80 leading-relaxed font-sans italic">
                      "{explanation.simple_explanation}"
                    </p>
                  </section>

                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-gold/60">
                      <Info size={12} />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/60">Key Takeaways</h4>
                    </div>
                    <ul className="space-y-2">
                      {explanation.key_points?.map((pt: string, i: number) => (
                        <li key={i} className="text-xs text-cream/60 flex gap-2">
                          <span className="text-gold font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-gold/60">
                      <BookOpen size={12} />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/60">Example</h4>
                    </div>
                    <p className="text-[11px] text-cream/70 leading-relaxed italic font-sans">
                      {explanation.illustration}
                    </p>
                  </section>

                  <button 
                    onClick={() => resetExplanation()}
                    className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-gold/40 hover:text-gold transition-colors"
                  >
                    Clear Explanation
                  </button>
                </div>
              )}
            </AuthGate>
          </div>
          
          <div className="p-4 border-t border-white/5 text-center">
             <p className="text-[10px] text-cream/20 uppercase tracking-widest">Powered by Gemini 1.5 Flash</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
