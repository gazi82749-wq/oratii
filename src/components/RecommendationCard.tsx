'use client';

// Smart recommendation card (Module 10)
export default function RecommendationCard({ insight, action, link, icon, accentColor }) {
  return (
    <div className="recommendation-card border border-indigo-200 p-4 card-hover" style={{ '--accent': accentColor || '#6c5ce7' } as any}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{icon || 'ðŸ’¡'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-700 leading-snug mb-2">{insight}</p>
          {link ? (
            <a
              href={link}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#151930] text-white text-[9px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              {action || 'Take Action'} â†’
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-slate-500 text-[9px] font-bold uppercase tracking-wider rounded-lg">
              {action || 'Recommended'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Recommendations section container
export function RecommendationsSection({ recommendations, title }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-indigo-200 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-[#151930] uppercase tracking-wider">{title || 'Smart Recommendations'}</h3>
          <p className="text-xs text-slate-400 mt-0.5">AI-powered suggestions based on your performance</p>
        </div>
        <span className="text-xl">ðŸ§ </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.map((rec, idx) => (
          <RecommendationCard
            key={idx}
            insight={rec.insight}
            action={rec.action}
            link={rec.link}
            icon={rec.icon}
            accentColor={rec.accentColor}
          />
        ))}
      </div>
    </div>
  );
}
