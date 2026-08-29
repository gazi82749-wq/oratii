export default function ScribbleLoader({ text = "Analyzing..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-24 h-24 mb-4">
        {/* Rapidly changing scribbles */}
        <svg 
          className="w-full h-full text-slate-900 animate-[spin_3s_linear_infinite]" 
          viewBox="0 0 100 100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* We use strokeDasharray and animation to simulate drawing */}
          <path 
            className="animate-[dash_1.5s_ease-in-out_infinite]"
            d="M50 10c-20 0-40 20-40 40s20 40 40 40 40-20 40-40S70 10 50 10zm0 10c15 0 30 15 30 30s-15 30-30 30S20 65 20 50 35 20 50 20zM30 50c0-10 10-20 20-20s20 10 20 20-10 20-20 20-20-10-20-20z" 
            style={{ strokeDasharray: '200', strokeDashoffset: '0' }}
          />
        </svg>
        
        {/* Pencil SVG that "draws" the loader */}
        <svg 
          className="absolute top-1/2 left-1/2 w-8 h-8 text-amber-500 animate-[bounce_0.5s_infinite] -mt-4" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      </div>
      <p className="text-xl font-black text-slate-900 font-handwriting tracking-wider animate-pulse">
        {text}
      </p>

      <style jsx>{`
        @keyframes dash {
          0% {
            stroke-dashoffset: 200;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -200;
          }
        }
      `}</style>
    </div>
  );
}
