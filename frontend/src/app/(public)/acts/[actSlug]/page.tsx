'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getActBySlug, FullAct, Section as ActSection } from '@/lib/data/acts/loader';
import { useExplainSection, ExplainResponse, RelatedCase } from '@/features/acts/useActs';

// Rename imported Section to avoid conflict with local logic if needed
type Section = ActSection;
import { 
  Search, 
  ChevronRight, 
  ChevronDown,
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Scale, 
  CheckCircle2,
  Info,
  List,
  Type,
  Loader2,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ActDetailPage() {
  const params = useParams();
  const actSlug = params.actSlug as string;
  const router = useRouter();
  
  // Layout Management
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'contents' | 'text' | 'ai'>('contents');
  
  // Direct sync loading from local JSON
  const act = getActBySlug(actSlug);
  
  const [selectedSectionNumber, setSelectedSectionNumber] = useState<string | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [tocSearch, setTocSearch] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  
  // Derive active section from state
  const activeSection = useMemo(() => {
    if (!act || !selectedSectionNumber) return null;
    return act.sections.find(s => s.number === selectedSectionNumber) || null;
  }, [act, selectedSectionNumber]);

  // Group sections by chapter
  const sectionsByChapter = useMemo(() => {
    if (!act) return {};
    const groups: Record<string, Section[]> = {};
    const sections = !tocSearch 
      ? act.sections 
      : act.sections.filter(s => 
          s.title.toLowerCase().includes(tocSearch.toLowerCase()) || 
          s.number.toString().includes(tocSearch)
        );

    sections.forEach(s => {
      const chap = s.chapter || 'General';
      if (!groups[chap]) groups[chap] = [];
      groups[chap].push(s);
    });
    return groups;
  }, [act, tocSearch]);

  // Auto-expand chapter containing active section
  useEffect(() => {
    if (activeSection?.chapter) {
      setExpandedChapters(prev => ({ ...prev, [activeSection.chapter!]: true }));
    }
  }, [activeSection]);

  // If we have an active section, automatically switch to 'text' tab on mobile
  useEffect(() => {
    if (activeSection && activeTab === 'contents' && window.innerWidth < 768) {
      setActiveTab('text');
    }
  }, [activeSection]);

  const toggleChapter = (chap: string): void => {
    setExpandedChapters(prev => ({ ...prev, [chap]: !prev[chap] }));
  };

  const { 
    mutate: explainSection, 
    data: mutationExplanation, 
    isPending: isExplaining,
    error: explainError,
    reset: resetExplanation
  } = useExplainSection();

  const [cachedExplanation, setCachedExplanation] = useState<ExplainResponse | null>(null);

  // Computed explanation source
  const explanation = mutationExplanation || cachedExplanation;

  const handleSectionClick = (section: Section): void => {
    setSelectedSectionNumber(section.number);
    resetExplanation();
    setCachedExplanation(null);
    setShowExplainer(false);
  };

  const handleExplainClick = (): void => {
    if (!activeSection) return;
    
    const cacheKey = `section_explain_${actSlug}_${activeSection.number}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        setCachedExplanation(JSON.parse(cached) as ExplainResponse);
        setShowExplainer(true);
        if (window.innerWidth < 768) setActiveTab('ai');
        return;
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }

    setShowExplainer(true);
    if (window.innerWidth < 768) setActiveTab('ai');
    
    explainSection({
      act_id: actSlug,
      section_number: activeSection.number,
      section_title: activeSection.title,
      section_text: activeSection.content
    });
  };

  if (!act) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Loader2 className="text-gold animate-spin" size={40} />
        <p className="text-cream/40 text-sm uppercase tracking-widest animate-pulse">Loading Act Text...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-4 md:-m-8 overflow-hidden bg-ink">
      
      {/* MOBILE TAB NAV */}
      <div className="md:hidden flex border-b border-white/5 bg-ink shrink-0">
        <button 
          onClick={() => setActiveTab('contents')}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
            activeTab === 'contents' ? "text-gold border-b-2 border-gold" : "text-cream/40"
          )}
        >
          Contents
        </button>
        <button 
          onClick={() => setActiveTab('text')}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
            activeTab === 'text' ? "text-gold border-b-2 border-gold" : "text-cream/40"
          )}
        >
          Text
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
            activeTab === 'ai' ? "text-gold border-b-2 border-gold" : "text-cream/40"
          )}
        >
          AI Explain
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* PANEL 1: Navigation Sidebar (Section List) */}
        <aside className={cn(
          "bg-ink flex-shrink-0 flex flex-col border-r border-white/5 transition-all duration-300 overflow-hidden",
          isSidebarCollapsed ? "w-0" : "w-full md:w-[260px]",
          activeTab !== 'contents' && "hidden md:flex"
        )}>
          <div className="p-4 border-b border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => router.push('/acts')}
                className="flex items-center gap-2 text-cream/40 hover:text-gold transition-colors text-[10px] font-bold uppercase tracking-widest"
              >
                <ArrowLeft size={14} />
                Library
              </button>
              <button 
                onClick={() => setIsSidebarCollapsed(true)}
                className="hidden md:block text-cream/20 hover:text-gold transition-colors"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
            </div>
            <h2 className="text-cream font-serif text-lg truncate px-1" title={act.title}>
              {act.title}
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/20" size={14} />
              <input
                type="text"
                placeholder="Search sections..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-cream outline-none focus:border-gold/30 transition-all"
                value={tocSearch}
                onChange={(e) => setTocSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {Object.entries(sectionsByChapter).map(([chap, sections]) => (
              <div key={chap} className="space-y-1">
                <button 
                  onClick={() => toggleChapter(chap)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-cream/30 hover:text-gold transition-colors text-left"
                >
                  <span className="truncate pr-2">{chap}</span>
                  {expandedChapters[chap] ? <ChevronDown size={12} className="shrink-0" /> : <ChevronRight size={12} className="shrink-0" />}
                </button>
                
                {expandedChapters[chap] && (
                  <div className="space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                    {sections.map((s) => (
                      <button
                        key={s.number}
                        onClick={() => handleSectionClick(s)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg transition-all flex items-start gap-3 group",
                          activeSection?.number === s.number 
                            ? "bg-gold/10 text-gold shadow-sm shadow-gold/5" 
                            : "text-cream/60 hover:bg-white/5 hover:text-cream"
                        )}
                      >
                        <span className={cn(
                          "text-[10px] mt-0.5 shrink-0 font-bold",
                          activeSection?.number === s.number ? "text-gold" : "text-gold/40 group-hover:text-gold"
                        )}>
                          §{s.number}
                        </span>
                        <span className="text-[11px] leading-tight line-clamp-2">{s.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* SIDEBAR TOGGLE BUTTON (Floating when collapsed) */}
        {isSidebarCollapsed && (
          <button 
            onClick={() => setIsSidebarCollapsed(false)}
            className="absolute left-4 top-4 z-10 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-ink shadow-lg shadow-gold/20 transition-all hover:scale-110 hidden md:flex"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* PANEL 2: Section Content Reader */}
        <main className={cn(
          "flex-1 flex flex-col min-w-0 bg-ink-2/30 overflow-hidden",
          activeTab !== 'text' && "hidden md:flex"
        )}>
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {activeSection ? (
              <div className="max-w-3xl mx-auto p-6 md:p-12 lg:p-20 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
                <header className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest rounded-full border border-gold/20">
                      Section {activeSection.number}
                    </span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif text-cream leading-tight tracking-tight">
                    {activeSection.title}
                  </h1>
                  {activeSection.chapter && (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold/40 font-black">
                      {activeSection.chapter}
                    </p>
                  )}
                </header>

                <div className="prose prose-invert max-w-none font-sans text-cream/90 leading-relaxed md:leading-loose text-base md:xl whitespace-pre-wrap">
                  {activeSection.content ? (
                    activeSection.content.replace(/^[\s––—\-\.\:]+/, '').split('\n').map((para, i) => (
                      <p key={i} className="mb-6 md:mb-8">{para}</p>
                    ))
                  ) : (
                    <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center space-y-4">
                      <Loader2 className="text-gold/20 animate-spin mx-auto" size={32} />
                      <p className="text-cream/40 italic text-sm">This section text is currently unavailable in the local database.</p>
                    </div>
                  )}
                </div>

                {/* RELATED CASES (Bottom of reader) */}
                {explanation?.related_cases && explanation.related_cases.length > 0 && (
                  <div className="mt-20 pt-12 border-t border-white/5 space-y-8">
                    <div className="flex items-center gap-3">
                      <Scale size={20} className="text-gold" />
                      <h3 className="font-serif text-2xl text-cream">Related Case Law</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {explanation.related_cases.map((caseItem: RelatedCase, i: number) => (
                        <div key={i} className="p-6 bg-white/2 rounded-2xl border border-white/5 hover:border-gold/20 transition-all group">
                          <p className="text-lg font-bold text-gold group-hover:text-cream transition-colors">{caseItem.title}</p>
                          <p className="text-xs text-cream/30 uppercase tracking-widest mt-1 mb-4">{caseItem.citation}</p>
                          <p className="text-sm text-cream/60 leading-relaxed italic border-l-2 border-gold/20 pl-4">
                            "{caseItem.relevance}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile/Small Screen Explain Button */}
                <div className="md:hidden pt-8">
                   <button 
                    onClick={handleExplainClick}
                    className="w-full py-4 bg-gold text-ink font-bold rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Sparkles size={20} />
                    Explain Section {activeSection.number}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-20">
                <BookOpen size={64} />
                <p className="font-serif text-2xl italic">Select a section from the contents to read</p>
              </div>
            )}
          </div>
        </main>

        {/* PANEL 3: AI Explainer Sidebar */}
        <aside className={cn(
          "w-full md:w-[320px] flex-shrink-0 flex flex-col bg-ink border-l border-white/5 overflow-hidden transition-all duration-300",
          activeTab !== 'ai' && "hidden md:flex"
        )}>
          <div className="p-6 border-b border-white/5 bg-gold/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3 text-gold">
              <Sparkles size={20} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Nyaya AI Explainer</h3>
            </div>
            <HelpCircle size={16} className="text-cream/20" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {!activeSection ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-cream/20">
                  <BookOpen size={32} />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest font-black text-gold">Awaiting Selection</p>
                  <p className="text-xs text-cream/40">Select a section to break it down using AI</p>
                </div>
              </div>
            ) : !showExplainer ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-20 h-20 rounded-[2.5rem] bg-gold/5 flex items-center justify-center text-gold/30">
                  <Sparkles size={40} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-cream font-serif text-xl">Need a breakdown?</h4>
                  <p className="text-cream/40 text-sm leading-relaxed">
                    Nyaya AI can explain this section in simple terms, highlighting key takeaways and practical examples.
                  </p>
                </div>
                <button 
                  onClick={handleExplainClick}
                  className="w-full py-4 bg-gold/10 hover:bg-gold text-gold hover:text-ink border border-gold/30 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <Sparkles size={18} className="group-hover:animate-pulse" />
                  Explain Section {activeSection.number}
                </button>
              </div>
            ) : isExplaining ? (
              <div className="h-full flex flex-col space-y-10 animate-pulse">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gold/20 rounded" />
                    <div className="w-24 h-3 bg-gold/10 rounded" />
                  </div>
                  <div className="h-32 bg-white/5 rounded-2xl border border-white/5" />
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gold/20 rounded" />
                    <div className="w-20 h-3 bg-gold/10 rounded" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-4 h-4 bg-gold/20 rounded-full shrink-0" />
                      <div className="w-full h-3 bg-white/5 rounded" />
                    </div>
                    <div className="flex gap-4">
                      <div className="w-4 h-4 bg-gold/20 rounded-full shrink-0" />
                      <div className="w-3/4 h-3 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gold/20 rounded" />
                    <div className="w-16 h-3 bg-gold/10 rounded" />
                  </div>
                  <div className="h-20 bg-gold/5 rounded-2xl border border-gold/10" />
                </div>

                <div className="flex flex-col items-center justify-center pt-8 gap-2">
                  <Loader2 className="text-gold animate-spin" size={24} />
                  <p className="text-[8px] uppercase tracking-widest font-black text-gold/40">Synthesizing Law</p>
                </div>
              </div>
            ) : explanation ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-gold/60">
                    <Info size={14} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Plain English Meaning</h4>
                  </div>
                  <div className="p-5 bg-white/2 rounded-2xl border border-white/5">
                    <p className="text-sm text-cream/90 leading-relaxed font-sans italic">
                      "{explanation.simple_explanation}"
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-gold/60">
                    <List size={14} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Key Takeaways</h4>
                  </div>
                  <ul className="space-y-4">
                    {explanation.key_points?.map((pt: string, i: number) => (
                      <li key={i} className="text-sm text-cream/60 flex gap-4 leading-snug">
                        <CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-gold/60">
                    <Scale size={14} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Illustration</h4>
                  </div>
                  <div className="p-5 bg-gold/5 rounded-2xl border border-gold/10">
                    <p className="text-xs text-cream/70 leading-relaxed italic font-sans">
                      {explanation.illustration}
                    </p>
                  </div>
                </section>

                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                   <p className="text-[8px] text-cream/20 font-black uppercase tracking-widest">Powered by Gemini 1.5 Flash</p>
                   <button 
                    onClick={() => setShowExplainer(false)}
                    className="text-[10px] font-black uppercase tracking-widest text-gold/40 hover:text-gold transition-colors"
                  >
                    Minimize
                  </button>
                </div>
              </div>
            ) : explainError ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-4">
                <ShieldAlert size={40} className="text-status-red/40" />
                <p className="text-sm text-cream/60">We couldn't generate an explanation right now. Please try again.</p>
                <button 
                  onClick={() => explainSection()}
                  className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-cream hover:bg-white/10"
                >
                  Retry AI Call
                </button>
              </div>
            ) : null}
          </div>
        </aside>

      </div>
    </div>
  );
}
