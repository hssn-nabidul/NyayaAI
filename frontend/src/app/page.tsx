'use client';

import { useAuthStore } from '@/lib/stores/auth.store';
import SearchBar from '@/components/search/SearchBar';
import { Scale, BookOpen, Gavel, ShieldCheck, Sparkles, Search } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-5xl mx-auto space-y-24 py-12 md:py-20 px-4">
      {/* Hero Section */}
      <section className="text-center space-y-8 animate-fade-up">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest">
            <Sparkles size={12} />
            AI-Powered Legal Research
          </div>
          <h1 className="text-6xl md:text-8xl font-serif text-gold leading-tight tracking-tight">
            Nyaya
          </h1>
          <p className="text-xl md:text-2xl text-cream/60 max-w-2xl mx-auto font-sans leading-relaxed">
            Free, offline-first legal research for India. Democratising access to justice for students and citizens.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto pt-4">
          <SearchBar className="shadow-2xl shadow-gold/5" />
        </div>

        {/* Quick Actions (Mobile Only) */}
        <div className="flex md:hidden items-center gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar px-1">
          <Link href="/search" className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-cream text-[11px] font-bold uppercase tracking-widest active:bg-gold active:text-ink transition-all">
            <Search size={14} className="text-gold" />
            Search Cases
          </Link>
          <Link href="/acts" className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-cream text-[11px] font-bold uppercase tracking-widest active:bg-gold active:text-ink transition-all">
            <BookOpen size={14} className="text-gold" />
            Bare Acts
          </Link>
          <Link href="/rights" className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-cream text-[11px] font-bold uppercase tracking-widest active:bg-gold active:text-ink transition-all">
            <ShieldCheck size={14} className="text-gold" />
            Know Your Rights
          </Link>
          <Link href="/moot" className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-cream text-[11px] font-bold uppercase tracking-widest active:bg-gold active:text-ink transition-all">
            <Gavel size={14} className="text-gold" />
            Moot Prep
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up delay-100">
        <Link href="/search" className="p-8 rounded-[2.5rem] border border-white/5 bg-white/2 space-y-4 hover:border-gold/30 hover:bg-gold/5 transition-all group">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform shadow-lg shadow-gold/5">
            <Scale size={28} />
          </div>
          <h3 className="text-2xl font-serif text-gold">Judicial Search</h3>
          <p className="text-cream/40 leading-relaxed font-sans">
            Access millions of Indian court judgments with powerful filters. 
            Search by keyword, citation, or judge.
          </p>
        </Link>

        <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/2 space-y-4 hover:border-gold/30 hover:bg-gold/5 transition-all group cursor-default">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform shadow-lg shadow-gold/5">
            <Sparkles size={28} />
          </div>
          <h3 className="text-2xl font-serif text-gold">AI Summaries</h3>
          <p className="text-cream/40 leading-relaxed font-sans">
            Understand complex judgments in seconds. Gemini 1.5 Flash generates 
            accurate, structured summaries of any case.
          </p>
        </div>

        <Link href="/dictionary" className="p-8 rounded-[2.5rem] border border-white/5 bg-white/2 space-y-4 hover:border-gold/30 hover:bg-gold/5 transition-all group">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform shadow-lg shadow-gold/5">
            <BookOpen size={28} />
          </div>
          <h3 className="text-2xl font-serif text-gold">Legal Glossary</h3>
          <p className="text-cream/40 leading-relaxed font-sans">
            A comprehensive dictionary of Indian legal terms and Latin maxims, 
            explained in plain English for everyone.
          </p>
        </Link>

        <Link href="/rights" className="p-8 rounded-[2.5rem] border border-white/5 bg-white/2 space-y-4 hover:border-gold/30 hover:bg-gold/5 transition-all group">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform shadow-lg shadow-gold/5">
            <ShieldCheck size={28} />
          </div>
          <h3 className="text-2xl font-serif text-gold">Know Your Rights</h3>
          <p className="text-cream/40 leading-relaxed font-sans">
            Interactive guide to your legal rights in common situations like 
            arrests, landlord disputes, and consumer issues.
          </p>
        </Link>
      </section>

      {/* Trust Badge / Info */}
      <section className="text-center py-12 border-t border-white/5 animate-fade-up delay-200">
        <p className="text-[10px] font-bold text-cream/20 uppercase tracking-[0.4em] mb-4">Powered by Reliable Data</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           <span className="font-serif text-lg tracking-widest text-cream">INDIAN KANOON</span>
           <span className="font-sans font-black text-xl tracking-tighter text-cream">Google Gemini</span>
           <span className="font-serif text-lg italic text-cream">Ministry of Law & Justice Database</span>
        </div>
      </section>
    </div>
  );
}
