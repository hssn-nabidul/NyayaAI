'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useCitations } from '@/features/cases/useCitations';
import { useCase } from '@/features/cases/useCase';
import { 
  Loader2, 
  ArrowLeft, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  MousePointer2,
  Info,
  ExternalLink,
  ChevronRight,
  Gavel,
  X,
  Network,
  Library
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-parchment">
      <Loader2 size={40} className="text-gold animate-spin" />
    </div>
  ),
});

export default function FullScreenGraphPage() {
  const params = useParams();
  const docId = params.docId as string;
  const router = useRouter();
  
  const { data: graphData, isLoading: isGraphLoading, error: graphError, refetch } = useCitations(docId);
  const { data: caseDetail } = useCase(docId);
  
  const graphRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Performance optimization: Stop simulation after a few seconds
  useEffect(() => {
    if (graphData && graphRef.current) {
      const timer = setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.pauseAnimation();
        }
      }, 8000); 
      return () => clearTimeout(timer);
    }
  }, [graphData]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    // Center graph on node
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(3, 1000);
    }
  }, []);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.title;
    const fontSize = 12 / globalScale;
    ctx.font = `bold ${fontSize}px Manrope, system-ui, sans-serif`;
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.type === 'root' ? '#B8860B' : (node.type === 'cites' ? '#1A2E44' : '#2D4B33');
    ctx.fill();
    
    // Add border
    ctx.strokeStyle = '#FCF9F4';
    ctx.lineWidth = 1 / globalScale;
    ctx.stroke();
    
    // Add glow for root or selected
    if (node.type === 'root' || (selectedNode && node.id === selectedNode.id)) {
       ctx.shadowColor = node.type === 'root' ? '#B8860B' : '#1A2E44';
       ctx.shadowBlur = 10;
    } else {
       ctx.shadowBlur = 0;
    }

    // Always show labels for root or if zoomed in
    if (globalScale > 1.5 || node.type === 'root' || (selectedNode && node.id === selectedNode.id)) {
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

      ctx.fillStyle = 'rgba(26, 46, 68, 0.95)';
      ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] - 8, bckgDimensions[0], bckgDimensions[1]);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FCF9F4';
      ctx.fillText(label, node.x, node.y - bckgDimensions[1] - 8 + fontSize / 2);
    }
  }, [selectedNode]);

  if (isGraphLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-parchment space-y-8">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-ink/5 rounded-library" />
          <div className="w-20 h-20 border-4 border-gold border-t-transparent rounded-library animate-spin absolute top-0" />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-ink font-serif text-3xl italic font-bold tracking-tight">Mapping Institutional Universe</h2>
          <p className="text-ink/20 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">Connecting citations & scholarly references</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-parchment overflow-hidden relative">
      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 p-8 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-library bg-ink text-parchment flex items-center justify-center hover:bg-gold transition-all shadow-xl border border-ink/10 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="bg-parchment border border-divider px-8 py-4 rounded-library shadow-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-library bg-ink text-parchment flex items-center justify-center shrink-0">
               <Network size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="text-ink font-serif text-base font-bold italic truncate max-w-lg leading-tight">
                {caseDetail?.title || 'Citation Universe'}
              </h1>
              <p className="text-[9px] text-ink/30 uppercase tracking-[0.2em] font-bold">Interactive Precedential Network</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
           <div className="hidden md:flex bg-parchment border border-divider p-1 rounded-library shadow-2xl">
              <div className="px-4 py-2 flex items-center gap-3 border-r border-divider">
                 <div className="w-2 h-2 rounded-full bg-gold" />
                 <span className="text-[9px] font-bold text-ink/40 uppercase tracking-widest">Selected Folio</span>
              </div>
              <div className="px-4 py-2 flex items-center gap-3 border-r border-divider">
                 <div className="w-2 h-2 rounded-full bg-ink" />
                 <span className="text-[9px] font-bold text-ink/40 uppercase tracking-widest">Cited Record</span>
              </div>
              <div className="px-4 py-2 flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-forest" />
                 <span className="text-[9px] font-bold text-ink/40 uppercase tracking-widest">Citing Record</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Graph */}
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#FCF9F4"
        nodeLabel={(node: any) => node.title}
        nodeColor={(node: any) => {
          if (node.type === 'root') return '#B8860B';
          if (node.type === 'cites') return '#1A2E44';
          return '#2D4B33';
        }}
        nodeRelSize={6}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkColor={() => 'rgba(26, 46, 68, 0.08)'}
        linkWidth={1.5}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={nodeCanvasObject}
        cooldownTicks={150}
        d3AlphaDecay={0.01}
      />

      {/* Side Info Panel */}
      {selectedNode && (
        <div className="absolute top-24 right-8 bottom-24 w-80 bg-parchment/95 backdrop-blur-xl border border-divider rounded-library shadow-2xl z-30 p-10 flex flex-col animate-fade-up overflow-hidden">
           <button 
             onClick={() => setSelectedNode(null)}
             className="absolute top-6 right-6 text-ink/20 hover:text-ink transition-colors"
           >
             <X size={20} />
           </button>

           <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="space-y-4">
                 <span className={cn(
                   "px-2 py-0.5 rounded-library text-[8px] font-bold uppercase tracking-widest border",
                   selectedNode.type === 'root' ? 'bg-gold-dim text-gold border-gold/20' : 
                   (selectedNode.type === 'cites' ? 'bg-ink/5 text-ink border-ink/10' : 'bg-forest-dim text-forest border-forest/10')
                 )}>
                   {selectedNode.type === 'root' ? 'Selected Archive' : (selectedNode.type === 'cites' ? 'Cited Record' : 'Citing Record')}
                 </span>
                 <h3 className="text-xl font-serif text-ink italic font-bold leading-tight">
                   {selectedNode.title}
                 </h3>
              </div>

              <div className="space-y-6 pt-8 border-t border-divider border-dashed">
                 <div className="flex items-center gap-2 text-gold">
                    <Info size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Institutional Context</span>
                 </div>
                 <p className="text-[13px] text-ink/50 leading-relaxed italic font-medium">
                   This record is linked via direct jurisprudential reference. Clustered nodes represent high conceptual density within the archive.
                 </p>
              </div>
           </div>

           <button 
             onClick={() => router.push(`/cases/${selectedNode.id}`)}
             className="mt-8 w-full py-4 bg-ink text-parchment font-bold rounded-library flex items-center justify-center gap-3 hover:bg-gold transition-all shadow-md text-[11px] uppercase tracking-widest"
           >
             <Gavel size={16} className="text-gold" />
             Consult Folio
           </button>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-parchment border border-divider p-2 rounded-library shadow-2xl z-20">
         <button 
           onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 400)}
           className="w-12 h-12 rounded-library bg-parchment-dim hover:bg-ink hover:text-parchment transition-all flex items-center justify-center text-ink/40 shadow-sm"
           title="Zoom In"
         >
           <ZoomIn size={20} />
         </button>
         <button 
           onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.5, 400)}
           className="w-12 h-12 rounded-library bg-parchment-dim hover:bg-ink hover:text-parchment transition-all flex items-center justify-center text-ink/40 shadow-sm"
           title="Zoom Out"
         >
           <ZoomOut size={20} />
         </button>
         <div className="w-px h-8 bg-divider mx-1" />
         <button 
           onClick={() => {
             graphRef.current?.centerAt(0, 0, 1000);
             graphRef.current?.zoom(1, 1000);
           }}
           className="w-12 h-12 rounded-library bg-parchment-dim hover:bg-ink hover:text-parchment transition-all flex items-center justify-center text-ink/40 shadow-sm"
           title="Reset View"
         >
           <Maximize2 size={20} />
         </button>
         <button 
           onClick={() => refetch()}
           className="w-12 h-12 rounded-library bg-parchment-dim hover:bg-ink hover:text-parchment transition-all flex items-center justify-center text-ink/40 shadow-sm"
           title="Refresh Archive"
         >
           <RefreshCw size={20} />
         </button>
      </div>

      {/* Interaction Hint */}
      <div className="absolute bottom-10 right-10 flex items-center gap-4 bg-parchment border border-divider px-6 py-3 rounded-library shadow-2xl animate-fade-up pointer-events-none">
         <MousePointer2 size={16} className="text-gold" />
         <span className="text-[10px] font-bold text-ink uppercase tracking-[0.2em]">Drag: Pan · Scroll: Zoom · Click: Inspect</span>
      </div>
    </div>
  );
}
