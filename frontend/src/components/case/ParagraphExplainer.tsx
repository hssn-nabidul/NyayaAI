'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTermExplain } from '@/features/dictionary/useTermExplain';
import { Sparkles, Loader2, X, Book, Scale, Info, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ParagraphExplainer() {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setVisible] = useState(false);
  const [isExplaining, setExplaining] = useState(false);
  const [explanationTerm, setExplanationTerm] = useState('');
  
  const { data, isLoading, error } = useTermExplain(explanationTerm);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 2 && text.length < 100) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          setSelectedText(text);
          setPosition({
            x: rect.left + window.scrollX + rect.width / 2,
            y: rect.top + window.scrollY - 10
          });
          setVisible(true);
        }
      } else {
        // Only hide if we aren't currently showing an explanation
        if (!isExplaining) {
          setVisible(false);
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        if (!isExplaining) {
          setVisible(false);
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isExplaining]);

  const handleExplain = () => {
    setExplanationTerm(selectedText);
    setExplaining(true);
  };

  const closeAll = () => {
    setVisible(false);
    setExplaining(false);
    setExplanationTerm('');
    setSelectedText('');
  };

  if (!isVisible && !isExplaining) return null;

  return (
    <>
      {/* Floating Action Button above selection */}
      {isVisible && !isExplaining && (
        <div 
          className="fixed z-[100] -translate-x-1/2 -translate-y-full pb-2 animate-in fade-in zoom-in duration-200"
          style={{ left: position.x, top: position.y }}
        >
          <button
            onClick={handleExplain}
            className="flex items-center gap-2 bg-gold text-ink px-4 py-2 rounded-full font-bold text-xs shadow-2xl hover:scale-105 transition-all"
          >
            <Sparkles size={14} />
            Explain with AI
          </button>
        </div>
      )}

      {/* Full Explanation Modal/Overlay */}
      {isExplaining && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            ref={popoverRef}
            className="bg-ink-2 border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                  <Sparkles size={16} />
                </div>
                <h3 className="font-serif font-bold text-lg text-gold tracking-tight">AI Term Explainer</h3>
              </div>
              <button 
                onClick={closeAll}
                className="p-2 hover:bg-white/5 rounded-full text-cream/40 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar-gold">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 size={40} className="text-gold animate-spin" />
                  <p className="text-cream/40 text-[10px] font-bold uppercase tracking-widest animate-pulse">Analysing Legal Concept...</p>
                </div>
              ) : error ? (
                <div className="py-10 text-center space-y-4">
                  <AlertCircle size={40} className="mx-auto text-status-red" />
                  <p className="text-cream/60">Failed to generate explanation. Please try again.</p>
                  <button onClick={handleExplain} className="text-gold underline font-bold text-xs uppercase tracking-widest">Retry</button>
                </div>
              ) : data ? (
                <div className="space-y-8 animate-fade-up">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gold/60">
                      <Info size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Definition</span>
                    </div>
                    <h2 className="text-3xl font-serif text-cream">{data.explanation.term}</h2>
                    <p className="text-lg text-cream/80 leading-relaxed font-sans italic">
                      "{data.explanation.definition}"
                    </p>
                  </div>

                  <div className="h-px bg-white/5" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gold/60">
                      <Scale size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Context in India</span>
                    </div>
                    <p className="text-cream/70 leading-relaxed text-sm md:text-base">
                      {data.explanation.context_india}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gold/60">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Key Cases</span>
                      </div>
                      <ul className="space-y-2">
                        {data.explanation.landmark_cases.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-cream/50">
                            <ChevronRight size={12} className="mt-0.5 text-gold/40 shrink-0" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gold/60">
                        <Book size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Related</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.explanation.related_terms.map((t, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] text-cream/40"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            {data && (
              <div className="p-6 bg-white/2 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[9px] text-cream/20 uppercase tracking-widest">Remaining AI Credits</span>
                  <span className="text-xs font-bold text-gold">{data.usage.remaining} / {data.usage.limit}</span>
                </div>
                <p className="text-[9px] text-cream/20 italic italic">Nyaya AI Scholar v1.5</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
