export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6" role="status" aria-live="polite">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-[#1B2140] animate-spin" />
      </div>
      <p className="mt-4 text-xs font-semibold tracking-wider uppercase text-slate-400">
        Loading...
      </p>
      <span className="sr-only">Loading page content...</span>
    </div>
  );
}
