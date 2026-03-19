export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-cream/40 text-sm animate-pulse uppercase tracking-widest">Searching Judgments</p>
      </div>
    </div>
  );
}
