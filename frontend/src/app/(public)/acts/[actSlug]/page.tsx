'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getActBySlug, FullAct, Section as ActSection } from '@/lib/data/acts/loader';
import { useExplainSection, ExplainResponse, RelatedCase } from '@/features/acts/useActs';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useAuthModalStore } from '@/lib/stores/auth-modal.store';

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
  HelpCircle,
  Library,
  ScrollText,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ActDetailPage() {
  const params = useParams();
  const actSlug = params.actSlug as string;
  const router = useRouter();
  const { user } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.openModal);
  
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
    if (activeSection && activeTab === 'contents' && typeof window !== 'undefined' && window.innerWidth < 768) {
      setActiveTab('text');
    }
  }, [activeSection, activeTab]);

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

    if (!user) {
      openAuthModal('AI Legal Explainer');
      return;
    }
    
    const cacheKey = `section_explain_${actSlug}_${activeSection.number}`;
    const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
    
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
    if (typeof window !== 'undefined' && window.innerWidth < 768) setActiveTab('ai');
    
    explainSection({
      act_id: actSlug,
      section_number: activeSection.number,
      section_title: activeSection.title,
      section_text: activeSection.content
    });
  };

  if (!act) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-ink/5 rounded-library" />
          <div className="w-12 h-12 border-2 border-ink border-t-transparent rounded-library animate-spin absolute top-0" />
        </div>
        <p className="text-ink/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Retrieving Statutory Archive...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-4 md:-m-8 overflow-hidden bg-parchment">
      
      {/* MOBILE TAB NAV */}
      <div className="md:hidden flex border-b border-divider bg-parchment shrink-0">
        <button 
          onClick={() => setActiveTab('contents')}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
            activeTab === 'contents' ? "text-gold border-b-2 border-gold" : "text-ink/40"
          )}
        >
          Contents
        </button>
        <button 
          onClick={() => setActiveTab('text')}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
            activeTab === 'text' ? "text-gold border-b-2 border-gold" : "text-ink/40"
          )}
        >
          Reader
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
            activeTab === 'ai' ? "text-gold border-b-2 border-gold" : "text-ink/40"
          )}
        >
          AI Analyser
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* PANEL 1: Navigation Sidebar (Section List) */}
        <aside className={cn(
          "bg-parchment-dim flex-shrink-0 flex flex-col border-r border-divider transition-all duration-300 overflow-hidden shadow-sm z-20",
          isSidebarCollapsed ? "w-0" : "w-full md:w-[280px]",
          activeTab !== 'contents' && "hidden md:flex"
        )}>
          <div className="p-5 border-b border-divider space-y-5 bg-parchment">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => router.push('/acts')}
                className="flex items-center gap-2 text-ink/40 hover:text-ink transition-colors text-[9px] font-bold uppercase tracking-widest"
              >
                <ArrowLeft size={14} />
                Archive Index
              </button>
              <button 
                onClick={() => setIsSidebarCollapsed(true)}
                className="hidden md:block text-ink/20 hover:text-ink transition-colors"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
            </div>
            <div className="space-y-1">
               <h2 className="text-ink font-serif text-base font-bold italic leading-tight truncate px-1" title={act.title}>
                 {act.title}
               </h2>
               <p className="text-[9px] text-gold font-bold uppercase tracking-widest px-1">Institutional Folio {act.year}</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={14} />
              <input
                type="text"
                placeholder="Search sections..."
                className="w-full bg-parchment-dim border border-divider rounded-library py-2 pl-9 pr-3 text-xs text-ink outline-none focus:border-ink/20 transition-all placeholder:text-ink/20 shadow-inner"
                value={tocSearch}
                onChange={(e) => setTocSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {Object.entries(sectionsByChapter).map(([chap, sections]) => (
              <div key={chap} className="space-y-1">
                <button 
                  onClick={() => toggleChapter(chap)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-ink/30 hover:text-gold transition-colors text-left"
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
                          "w-full text-left px-3 py-2 rounded-library transition-all flex items-start gap-3 group border-l-2",
                          activeSection?.number === s.number 
                            ? "bg-gold-dim text-gold border-gold" 
                            : "text-ink/60 hover:bg-ink/5 hover:text-ink border-transparent"
                        )}
                      >
                        <span className={cn(
                          "text-[9px] mt-0.5 shrink-0 font-bold",
                          activeSection?.number === s.number ? "text-gold" : "text-ink/20 group-hover:text-ink/40"
                        )}>
                          §{s.number}
                        </span>
                        <span className="text-[11px] font-medium leading-tight line-clamp-2">{s.title}</span>
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
            className="absolute left-4 top-4 z-30 w-10 h-10 bg-ink text-parchment rounded-library flex items-center justify-center shadow-lg transition-all hover:bg-gold hidden md:flex"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* PANEL 2: Section Content Reader */}
        <main className={cn(
          "flex-1 flex flex-col min-w-0 bg-parchment overflow-hidden",
          activeTab !== 'text' && "hidden md:flex"
        )}>
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {activeSection ? (
              <div className="max-w-3xl mx-auto p-8 md:p-16 lg:p-24 space-y-10 md:space-y-16 animate-fade-up pb-40">
                <header className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-ink text-parchment text-[9px] font-bold uppercase tracking-widest rounded-library shadow-sm">
                      Section {activeSection.number}
                    </span>
                    <div className="h-px flex-1 bg-divider" />
                  </div>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-ink leading-[1.1] tracking-tight italic font-bold">
                    {activeSection.title}
                  </h1>
                  {activeSection.chapter && (
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-ink/30 font-bold">
                       <ScrollText size={14} className="text-gold" />
                       {activeSection.chapter}
                    </div>
                  )}
                </header>

                <div className="font-serif text-ink leading-[1.8] text-lg md:text-xl whitespace-pre-wrap selection:bg-gold/20">
                  {activeSection.content ? (
                    activeSection.content.replace(/^[\s––—\-\.\:]+/, '').split('\n').map((para, i) => (
                      <p key={i} className="mb-8">{para}</p>
                    ))
                  ) : (
                    <div className="p-10 bg-parchment-dim rounded-library border border-divider text-center space-y-4 shadow-inner border-dashed">
                      <div className="relative mx-auto w-10 h-10">
                        <div className="absolute inset-0 border-2 border-ink/5 rounded-library" />
                        <div className="absolute inset-0 border-2 border-ink/20 border-t-transparent rounded-library animate-spin" />
                      </div>
                      <p className="text-ink/40 italic text-sm font-medium">Statutory text currently being indexed from the archive...</p>
                    </div>
                  )}
                </div>

                {/* RELATED CASES (Bottom of reader) */}
                {explanation?.related_cases && explanation.related_cases.length > 0 && (
                  <div className="mt-24 pt-16 border-t border-divider border-dashed space-y-10">
                    <div className="flex items-center gap-4">
                      <Gavel size={24} className="text-gold" />
                      <h3 className="font-serif text-3xl text-ink font-bold italic tracking-tight">Institutional Precedents</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {explanation.related_cases.map((caseItem: RelatedCase, i: number) => (
                        <div key={i} className="p-8 bg-parchment-dim border border-divider rounded-library hover:border-ink/20 transition-all group shadow-sm">
                          <div className="space-y-2">
                             <p className="text-xl font-serif font-bold text-ink group-hover:text-gold transition-colors italic">{caseItem.title}</p>
                             <p className="text-[10px] text-ink/30 font-mono font-bold uppercase tracking-widest flex items-center gap-2">
                                <FileText size={12} />
                                {caseItem.citation}
                             </p>
                          </div>
                          <p className="text-[15px] text-ink/60 leading-relaxed italic border-l-4 border-divider pl-6 mt-6 font-medium">
                            "{caseItem.relevance}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile/Small Screen Explain Button */}
                <div className="md:hidden pt-12">
                   <button 
                    onClick={handleExplainClick}
                    className="w-full py-4 bg-ink text-parchment font-bold rounded-library flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-[11px] uppercase tracking-widest"
                  >
                    <Sparkles size={18} className="text-gold" />
                    Deconstruct Section {activeSection.number}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-8 opacity-20">
                <div className="w-24 h-24 rounded-library bg-ink/5 flex items-center justify-center">
                   <BookOpen size={48} />
                </div>
                <p className="font-serif text-3xl italic font-bold">"Tolle Lege: Take up and read."</p>
                <p className="text-sm font-bold uppercase tracking-[0.2em]">Select a statutory provision from the sidebar</p>
              </div>
            )}
          </div>
        </main>

        {/* PANEL 3: AI Explainer Sidebar */}
        <aside className={cn(
          "w-full md:w-[360px] flex-shrink-0 flex flex-col bg-parchment-dim border-l border-divider overflow-hidden transition-all duration-300 z-20 shadow-xl",
          activeTab !== 'ai' && "hidden md:flex"
        )}>
          <div className="p-6 border-b border-divider bg-parchment flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 text-ink">
              <Sparkles size={20} className="text-gold" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">AI Archival Analysis</h3>
            </div>
            <HelpCircle size={16} className="text-ink/20" />
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {!activeSection ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-40">
                <div className="w-16 h-16 rounded-library bg-ink/5 flex items-center justify-center text-ink/20">
                  <Library size={32} />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-gold">Archives Awaiting</p>
                  <p className="text-xs text-ink/40 font-medium leading-relaxed italic">Select a section to reveal scholarly insights.</p>
                </div>
              </div>
            ) : !showExplainer ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-10">
                <div className="w-24 h-24 rounded-library bg-ink text-parchment flex items-center justify-center shadow-2xl relative">
                  <Sparkles size={40} className="text-gold" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gold rounded-full border-4 border-parchment-dim flex items-center justify-center shadow-md">
                     <Library size={14} className="text-ink" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-ink font-serif text-2xl font-bold italic">Analysis Required?</h4>
                  <p className="text-ink/60 text-[13px] leading-relaxed font-medium border-l-2 border-gold/30 pl-6 text-left">
                    Our AI deconstructs this statutory provision into scholarly briefings, 
                    extracting key points and practical applications.
                  </p>
                </div>
                <button 
                  onClick={handleExplainClick}
                  className="w-full py-4 bg-ink text-parchment rounded-library font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:bg-gold hover:scale-105 active:scale-95 text-[11px] uppercase tracking-widest group"
                >
                  <Sparkles size={18} className="text-gold group-hover:animate-pulse" />
                  Deconstruct Section {activeSection.number}
                </button>
              </div>
            ) : isExplaining ? (
              <div className="h-full flex flex-col space-y-12 animate-pulse pt-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gold/30 rounded-library" />
                    <div className="w-32 h-3 bg-ink/10 rounded-library" />
                  </div>
                  <div className="h-40 bg-parchment border border-divider rounded-library shadow-inner" />
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gold/30 rounded-library" />
                    <div className="w-24 h-3 bg-ink/10 rounded-library" />
                  </div>
                  <div className="space-y-5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-4">
                        <div className="w-4 h-4 bg-gold/20 rounded-full shrink-0" />
                        <div className="w-full h-3 bg-ink/5 rounded-library" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center pt-12 gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 border-2 border-ink/5 rounded-library" />
                    <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-library animate-spin absolute top-0" />
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.4em] font-black text-gold animate-pulse">Consulting Archivist</p>
                </div>
              </div>
            ) : explanation ? (
              <div className="space-y-12 animate-fade-up pb-20">
                <section className="space-y-5">
                  <div className="flex items-center gap-2 text-gold">
                    <Info size={14} />
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Institutional Meaning</h4>
                  </div>
                  <div className="p-6 bg-parchment border border-divider rounded-library shadow-inner italic">
                    <p className="text-[15px] text-ink font-serif font-bold italic leading-relaxed">
                      "{typeof explanation.simple_explanation === 'string' ? explanation.simple_explanation : (explanation.simple_explanation as any)?.text || 'No explanation available.'}"
                    </p>
                  </div>
                </section>

                <section className="space-y-5">
                  <div className="flex items-center gap-2 text-gold">
                    <List size={14} />
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Scholarly Takeaways</h4>
                  </div>
                  <ul className="space-y-5">
                    {explanation.key_points?.map((pt: any, i: number) => (
                      <li key={i} className="text-[13px] text-ink/70 flex gap-4 leading-relaxed font-medium">
                        <CheckCircle2 size={18} className="text-forest shrink-0 mt-0.5" />
                        <span>{typeof pt === 'string' ? pt : pt?.text || pt?.point || String(pt)}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-5">
                  <div className="flex items-center gap-2 text-gold">
                    <Scale size={14} />
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Practical Folio Example</h4>
                  </div>
                  <div className="p-6 bg-parchment border border-divider rounded-library shadow-sm border-l-4 border-l-ink">
                    <p className="text-[13px] text-ink/60 leading-relaxed italic font-medium">
                      {typeof explanation.illustration === 'string' ? explanation.illustration : (explanation.illustration as any)?.text || 'No illustration available.'}
                    </p>
                  </div>
                </section>

                <div className="pt-8 border-t border-divider border-dashed flex justify-between items-center">
                   <div className="flex flex-col gap-1">
                      <p className="text-[8px] text-ink/20 font-bold uppercase tracking-widest">Powered by AI Archivist</p>
                      <p className="text-[8px] text-ink/20 font-bold uppercase tracking-widest">Units Used: 1/50</p>
                   </div>
                   <button 
                    onClick={() => setShowExplainer(false)}
                    className="text-[10px] font-bold uppercase tracking-widest text-ink/30 hover:text-gold transition-colors"
                  >
                    Minimize
                  </button>
                </div>
              </div>
            ) : explainError ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-6">
                <ShieldAlert size={48} className="text-status-red opacity-30" />
                <div className="space-y-2">
                   <h4 className="font-serif font-bold text-ink italic text-lg">Inquiry Failed</h4>
                   <p className="text-sm text-ink/40 font-medium">The scholarly analysis engine is currently unavailable.</p>
                </div>
                <button 
                  onClick={() => {
                    if (activeSection) {
                      explainSection({
                        act_id: actSlug,
                        section_number: activeSection.number,
                        section_title: activeSection.title,
                        section_text: activeSection.content
                      });
                    }
                  }}
                  className="px-8 py-3 bg-ink text-parchment rounded-library text-[10px] font-bold uppercase tracking-widest shadow-sm"
                >
                  Retry Retrieval
                </button>
              </div>
            ) : null}
          </div>
        </aside>

      </div>
    </div>
  );
}
