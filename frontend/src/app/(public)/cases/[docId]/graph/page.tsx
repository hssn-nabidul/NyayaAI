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
  X
} from 'lucide-react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-ink">
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
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.type === 'root' ? '#D4A843' : (node.type === 'cites' ? '#5B9CF6' : '#3ECF8E');
    ctx.fill();
    
    // Add glow for root or selected
    if (node.type === 'root' || (selectedNode && node.id === selectedNode.id)) {
       ctx.shadowColor = node.type === 'root' ? '#D4A843' : '#F2ECD8';
       ctx.shadowBlur = 15;
    } else {
       ctx.shadowBlur = 0;
    }

    // Always show labels for root or if zoomed in
    if (globalScale > 1.5 || node.type === 'root') {
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

      ctx.fillStyle = 'rgba(11, 12, 15, 0.85)';
      ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] - 6, bckgDimensions[0], bckgDimensions[1]);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = node.type === 'root' ? '#D4A843' : (selectedNode && node.id === selectedNode.id ? '#FFFFFF' : '#F2ECD8');
      ctx.fillText(label, node.x, node.y - bckgDimensions[1] - 6 + fontSize / 2);
    }
  }, [selectedNode]);

  if (isGraphLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-ink space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gold/10 rounded-full" />
          <div className="w-20 h-20 border-4 border-gold border-t-transparent rounded-full animate-spin absolute top-0" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-gold font-serif text-xl">Mapping Legal Universe</h2>
          <p className="text-cream/20 text-[10px] font-bold uppercase tracking-[0.3em]">Connecting citations & references</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-ink overflow-hidden relative">
      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-ink-2/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-cream/60 hover:text-gold hover:border-gold/30 transition-all shadow-2xl"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="bg-ink-2/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl shadow-2xl">
            <h1 className="text-gold font-serif text-sm truncate max-w-md">
              {caseDetail?.title || 'Citation Universe'}
            </h1>
            <p className="text-[9px] text-cream/30 uppercase tracking-widest font-bold">Interactive Citation Graph</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
           <div className="hidden md:flex bg-ink-2/80 backdrop-blur-md border border-white/10 p-1 rounded-xl shadow-2xl">
              <div className="px-3 py-1.5 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-gold" />
                 <span className="text-[9px] font-bold text-cream/40 uppercase tracking-widest">Root Case</span>
              </div>
              <div className="px-3 py-1.5 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-status-blue" />
                 <span className="text-[9px] font-bold text-cream/40 uppercase tracking-widest">Cites</span>
              </div>
              <div className="px-3 py-1.5 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-status-green" />
                 <span className="text-[9px] font-bold text-cream/40 uppercase tracking-widest">Cited By</span>
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
        backgroundColor="#0B0C0F"
        nodeLabel={(node: any) => node.title}
        nodeColor={(node: any) => {
          if (node.type === 'root') return '#D4A843';
          if (node.type === 'cites') return '#5B9CF6';
          return '#3ECF8E';
        }}
        nodeRelSize={6}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkColor={() => 'rgba(255,255,255,0.08)'}
        linkWidth={1.5}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={nodeCanvasObject}
        cooldownTicks={150}
        d3AlphaDecay={0.01}
      />

      {/* Side Info Panel */}
      {selectedNode && (
        <div className="absolute top-24 right-6 bottom-24 w-80 bg-ink-2/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl z-30 p-8 flex flex-col animate-fade-in-right overflow-hidden">
           <button 
             onClick={() => setSelectedNode(null)}
             className="absolute top-6 right-6 text-cream/20 hover:text-cream transition-colors"
           >
             <X size={16} />
           </button>

           <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="space-y-3">
                 <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                   selectedNode.type === 'root' ? 'bg-gold/10 text-gold' : 
                   (selectedNode.type === 'cites' ? 'bg-status-blue/10 text-status-blue' : 'bg-status-green/10 text-status-green')
                 }`}>
                   {selectedNode.type === 'root' ? 'Selected Case' : (selectedNode.type === 'cites' ? 'Cited in Judgment' : 'Citing this Case')}
                 </span>
                 <h3 className="text-lg font-serif text-cream leading-tight">
                   {selectedNode.title}
                 </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                    <p className="text-[9px] text-cream/20 uppercase tracking-widest font-bold">Action</p>
                    <button 
                      onClick={() => router.push(`/cases/${selectedNode.id}`)}
                      className="w-full flex items-center justify-between text-gold hover:text-white transition-colors group"
                    >
                       <span className="text-xs font-medium">Open full judgment</span>
                       <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                 <div className="flex items-center gap-2 text-gold/60">
                    <Info size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Graph Tip</span>
                 </div>
                 <p className="text-xs text-cream/40 leading-relaxed italic">
                   Nodes are positioned based on their legal relationships. Closer nodes often share more legal principles.
                 </p>
              </div>
           </div>

           <button 
             onClick={() => router.push(`/cases/${selectedNode.id}`)}
             className="mt-6 w-full py-4 bg-gold text-ink font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
           >
             <Gavel size={18} />
             View Details
           </button>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-ink-2/80 backdrop-blur-md border border-white/10 p-2 rounded-2xl shadow-2xl z-20">
         <button 
           onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 400)}
           className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-cream/60 hover:text-gold transition-colors"
           title="Zoom In"
         >
           <ZoomIn size={20} />
         </button>
         <button 
           onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.5, 400)}
           className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-cream/60 hover:text-gold transition-colors"
           title="Zoom Out"
         >
           <ZoomOut size={20} />
         </button>
         <div className="w-px h-8 bg-white/10 mx-1" />
         <button 
           onClick={() => {
             graphRef.current?.centerAt(0, 0, 1000);
             graphRef.current?.zoom(1, 1000);
           }}
           className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-cream/60 hover:text-gold transition-colors"
           title="Reset View"
         >
           <Maximize2 size={20} />
         </button>
         <button 
           onClick={() => refetch()}
           className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-cream/60 hover:text-gold transition-colors"
           title="Refresh Data"
         >
           <RefreshCw size={20} />
         </button>
      </div>

      {/* Interaction Hint */}
      <div className="absolute bottom-10 right-10 flex items-center gap-3 bg-gold/10 border border-gold/20 px-4 py-2 rounded-full backdrop-blur-md animate-fade-up pointer-events-none">
         <MousePointer2 size={14} className="text-gold" />
         <span className="text-[10px] font-bold text-gold uppercase tracking-[0.1em]">Drag to pan · Scroll to zoom · Click to inspect</span>
      </div>
    </div>
  );
}
