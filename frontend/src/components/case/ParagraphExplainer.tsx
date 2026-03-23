'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTermExplain } from '@/features/dictionary/useTermExplain';
import { Sparkles, Loader2, X, Book, Scale, Info, ChevronRight, AlertCircle, Library, Gavel } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useAuthModalStore } from '@/lib/stores/auth-modal.store';
import { cn } from '@/lib/utils';

export default function ParagraphExplainer() {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setVisible] = useState(false);
  const [isExplaining, setExplaining] = useState(false);
  const [explanationTerm, setExplanationTerm] = useState('');
  const { user } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.openModal);
  
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
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + window.scrollY,
          });
          setSelectedText(text);
          setVisible(true);
        }
      } else {
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
    if (!user) {
      openAuthModal('AI Text Explainer');
      return;
    }
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
          className="fixed z-[100] -translate-x-1/2 -translate-y-full pb-3 animate-in fade-in zoom-in duration-200"
          style={{ left: position.x, top: position.y }}
        >
          <button
            onClick={handleExplain}
            className="flex items-center gap-2 bg-ink text-parchment px-4 py-2 rounded-library font-bold text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all border border-ink/20"
          >
            <Sparkles size={12} className="text-gold" />
            Explain with AI
          </button>
        </div>
      )}

      {/* Full Explanation Modal/Overlay */}
      {isExplaining && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            ref={popoverRef}
            className="bg-parchment border border-divider w-full max-w-2xl rounded-library shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-divider flex items-center justify-between bg-parchment-dim">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-library bg-ink text-parchment flex items-center justify-center shadow-sm">
                  <Sparkles size={18} className="text-gold" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-ink tracking-tight">Institutional Brief</h3>
                  <p className="text-[9px] text-ink/40 font-bold uppercase tracking-widest">Digital Scholarly Assistant</p>
                </div>
              </div>
              <button 
                onClick={closeAll}
                className="p-2 hover:bg-ink/5 rounded-library transition-colors text-ink/40"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
              {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="w-12 h-12 border-2 border-ink/5 rounded-library" />
                    <div className="w-12 h-12 border-2 border-ink border-t-transparent rounded-library animate-spin absolute top-0" />
                  </div>
                  <p className="text-ink/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Consulting the Archives...</p>
                </div>
              ) : error ? (
                <div className="py-12 text-center space-y-6 animate-fade-up">
                  <AlertCircle size={40} className="mx-auto text-status-red" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-serif text-ink">Analysis Failed</h3>
                    <p className="text-ink/40 text-sm">Failed to generate a scholarly explanation.</p>
                  </div>
                  <button onClick={handleExplain} className="text-gold font-bold uppercase tracking-widest text-[10px] underline underline-offset-4">Retry Inquiry</button>
                </div>
              ) : data ? (
                <div className="space-y-10 animate-fade-up">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-gold">
                      <Info size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Inquiry Context</span>
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-serif text-ink leading-tight italic font-bold">
                        {data.explanation.term}
                      </h2>
                      <div className="p-6 bg-parchment-dim border border-divider rounded-library shadow-inner">
                        <p className="text-[17px] text-ink/90 font-serif leading-relaxed italic">
                          "{data.explanation.definition}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-divider border-dashed border-t" />

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-gold">
                      <Scale size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Judicial Application in India</span>
                    </div>
                    <p className="text-ink/70 leading-relaxed text-base border-l-2 border-divider pl-6 font-medium">
                      {data.explanation.context_india}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-gold">
                        <Gavel size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Relevant Records</span>
                      </div>
                      <ul className="space-y-3">
                        {data.explanation.landmark_cases.map((c: any, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-[13px] text-ink/60 leading-relaxed font-serif italic">
                            <ChevronRight size={14} className="mt-0.5 text-divider shrink-0" />
                            <span className="font-bold">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-gold">
                        <Library size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Related Folios</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.explanation.related_terms.map((t: any, i: number) => (
                          <span 
                            key={i}
                            className="px-3 py-1 bg-parchment-dim border border-divider rounded-library text-[10px] font-bold uppercase tracking-widest text-ink/40 shadow-sm"
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
              <div className="p-6 bg-parchment-dim border-t border-divider flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[9px] text-ink/20 uppercase tracking-[0.2em] font-bold">Inquiry Allocation</span>
                  <span className="text-[10px] font-bold text-gold">{data.usage.remaining} / {data.usage.limit}</span>
                </div>
                <p className="text-[9px] text-ink/20 font-medium italic">Nyaya Archive Scholar v1.5</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
