'use client';

import React from 'react';
import { Settings, User, Bell, Shield, Database, Library } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 px-6">
      {/* Header */}
      <div className="bg-parchment border border-divider p-10 md:p-16 rounded-library space-y-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Settings size={180} className="text-ink" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center shadow-sm">
              <Settings size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-serif text-ink tracking-tight">Institutional Preferences</h1>
              <p className="text-[10px] text-ink/40 uppercase tracking-[0.2em] font-bold">Personal Archive Configuration</p>
            </div>
          </div>
          <p className="text-ink/60 max-w-2xl text-base leading-relaxed border-l-2 border-gold/30 pl-6 font-sans">
            Configure your scholarly environment, manage local data synchronization, and adjust 
            institutional access parameters for your legal research folio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 animate-fade-up">
        <div className="bg-parchment border border-divider rounded-library p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3 text-ink/40 border-b border-divider pb-4">
            <User size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Scholar Profile</h3>
          </div>
          <p className="text-sm text-ink/60 italic font-medium">
            Profile management and institutional credentials will be configurable here in the next archival update.
          </p>
        </div>

        <div className="bg-parchment border border-divider rounded-library p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3 text-ink/40 border-b border-divider pb-4">
            <Database size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Local Data Vault</h3>
          </div>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-bold text-ink">Synchronize Folios</p>
                   <p className="text-[11px] text-ink/40">Keep your locally saved judgments synced across devices.</p>
                </div>
                <div className="w-10 h-5 bg-ink/10 rounded-full relative">
                   <div className="absolute left-1 top-1 w-3 h-3 bg-divider rounded-full" />
                </div>
             </div>
          </div>
        </div>

        <div className="pt-8 border-t border-divider border-dashed flex items-center justify-between opacity-30">
           <div className="flex items-center gap-2">
              <Library size={14} className="text-gold" />
              <span className="text-[9px] font-bold text-ink uppercase tracking-widest">Nyaya Archive v1.0.0</span>
           </div>
           <span className="text-[9px] font-bold text-ink uppercase tracking-widest">Build 2026.03.23</span>
        </div>
      </div>
    </div>
  );
}
