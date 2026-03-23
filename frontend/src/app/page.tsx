'use client';

import { useAuthStore } from '@/lib/stores/auth.store';
import SearchBar from '@/components/search/SearchBar';
import { Scale, BookOpen, Gavel, ShieldCheck, Sparkles, Search, Library, FileText, Network } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto space-y-24 py-16 md:py-24 px-6">
      {/* Hero Section */}
      <section className="text-center space-y-10 animate-fade-up">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-library bg-gold-dim border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-[0.2em]">
            <Library size={12} />
            The Modern Law Library
          </div>
          <h1 className="text-7xl md:text-9xl font-serif text-ink leading-none tracking-tight">
            Nyaya
          </h1>
          <p className="text-xl md:text-2xl text-ink/60 max-w-2xl mx-auto font-sans leading-relaxed">
            Free, offline-first legal research for India. Democratising access to justice through institutional-grade tools.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto pt-6">
          <SearchBar className="shadow-lg shadow-ink/5" />
        </div>

        {/* Quick Access Pills */}
        <div className="flex flex-wrap justify-center items-center gap-3 pt-4">
           <span className="text-[10px] font-bold text-ink/30 uppercase tracking-widest mr-2">Research Phases:</span>
           <Link href="/search" className="px-4 py-1.5 rounded-library border border-divider hover:bg-ink/5 text-ink/60 text-[11px] font-medium transition-all">
             Discovery
           </Link>
           <Link href="/dictionary" className="px-4 py-1.5 rounded-library border border-divider hover:bg-ink/5 text-ink/60 text-[11px] font-medium transition-all">
             Analysis
           </Link>
           <Link href="/moot" className="px-4 py-1.5 rounded-library border border-divider hover:bg-ink/5 text-ink/60 text-[11px] font-medium transition-all">
             Production
           </Link>
        </div>
      </section>

      {/* Institutional Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-1 animate-fade-up delay-100 border border-divider bg-divider">
        <Link href="/search" className="p-10 bg-parchment hover:bg-parchment-dim transition-all group flex flex-col justify-between h-[320px]">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-ink">Judicial Search</h3>
              <p className="text-ink/60 text-sm leading-relaxed font-sans">
                Access millions of Indian court judgments with high-density filters. 
                Search by keyword, citation, or specific judge profiles.
              </p>
            </div>
          </div>
          <div className="text-[10px] font-bold text-gold uppercase tracking-widest">Explore Archives →</div>
        </Link>

        <div className="p-10 bg-parchment hover:bg-parchment-dim transition-all group flex flex-col justify-between h-[320px] cursor-default">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-ink">Actionable Briefs</h3>
              <p className="text-ink/60 text-sm leading-relaxed font-sans">
                Gemini 1.5 Flash generates structured summaries, extracting holdings 
                and legal issues before you dive into the full judgment.
              </p>
            </div>
          </div>
          <div className="text-[10px] font-bold text-gold uppercase tracking-widest">AI Librarian Active</div>
        </div>

        <Link href="/cases/graph" className="p-10 bg-parchment hover:bg-parchment-dim transition-all group flex flex-col justify-between h-[320px]">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center group-hover:scale-110 transition-transform">
              <Network size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-ink">Citation Networks</h3>
              <p className="text-ink/60 text-sm leading-relaxed font-sans">
                Visualize connections between cases. Identify landmark precedents 
                and see how the law has evolved over decades.
              </p>
            </div>
          </div>
          <div className="text-[10px] font-bold text-gold uppercase tracking-widest">View Graph →</div>
        </Link>

        <Link href="/acts" className="p-10 bg-parchment hover:bg-parchment-dim transition-all group flex flex-col justify-between h-[320px]">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-ink">The Digital Desk</h3>
              <p className="text-ink/60 text-sm leading-relaxed font-sans">
                Side-by-side reading of Bare Acts and related judgments. 
                Everything you need for moot court or brief drafting.
              </p>
            </div>
          </div>
          <div className="text-[10px] font-bold text-gold uppercase tracking-widest">Open Desk →</div>
        </Link>

        <Link href="/dictionary" className="p-10 bg-parchment hover:bg-parchment-dim transition-all group flex flex-col justify-between h-[320px]">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-ink">Legal Glossary</h3>
              <p className="text-ink/60 text-sm leading-relaxed font-sans">
                Comprehensive dictionary of Indian legal terms and Latin maxims, 
                annotated with plain-English AI explanations.
              </p>
            </div>
          </div>
          <div className="text-[10px] font-bold text-gold uppercase tracking-widest">Consult Glossary →</div>
        </Link>

        <Link href="/rights" className="p-10 bg-parchment hover:bg-parchment-dim transition-all group flex flex-col justify-between h-[320px]">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-ink">Situation Guides</h3>
              <p className="text-ink/60 text-sm leading-relaxed font-sans">
                Focused guides for citizens. Clear, authoritative information 
                on your rights in common legal situations.
              </p>
            </div>
          </div>
          <div className="text-[10px] font-bold text-gold uppercase tracking-widest">Know Your Rights →</div>
        </Link>
      </section>

      {/* Institutional Footer Info */}
      <section className="text-center py-20 border-t border-divider animate-fade-up delay-200">
        <p className="text-[10px] font-bold text-ink/20 uppercase tracking-[0.4em] mb-8">Verified Institutional Data Sources</p>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale contrast-125">
           <span className="font-serif text-lg tracking-widest text-ink">INDIAN KANOON</span>
           <span className="font-sans font-black text-xl tracking-tighter text-ink uppercase">Google Gemini</span>
           <span className="font-serif text-lg italic text-ink">Ministry of Law & Justice</span>
           <span className="font-sans font-bold text-lg text-ink">Digital India</span>
        </div>
      </section>
    </div>
  );
}
