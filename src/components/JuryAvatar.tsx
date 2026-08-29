'use client';

// Jury member persona avatar card (Module 2)
export default function JuryAvatar({ persona, isSpeaking = false, isActive = false, onClick, satisfactionLevel }) {
  return (
    <div
      onClick={() => onClick?.(persona)}
      className={`flex flex-col items-center p-4 rounded-2xl border transition-all cursor-pointer ${
        isActive
          ? 'bg-white border-indigo-300 shadow-md'
          : 'bg-indigo-50 border-indigo-100 hover:border-indigo-200 hover:shadow-sm'
      } ${isSpeaking ? 'jury-speaking' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-2 ${
        isSpeaking ? 'jury-avatar-ring' : ''
      }`} style={{
        background: `linear-gradient(135deg, ${persona.color}20, ${persona.color}40)`,
        border: `2px solid ${persona.color}60`
      }}>
        {persona.icon}
      </div>

      {/* Name & Title */}
      <p className="text-xs font-black text-[#151930] text-center">{persona.name}</p>
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{persona.title}</p>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="flex items-center gap-1 mt-2">
          <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
          <span className="w-1 h-2 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.1s' }} />
          <span className="w-1 h-1.5 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="text-[8px] font-bold text-green-600 ml-1">Speaking</span>
        </div>
      )}

      {/* Satisfaction Level */}
      {satisfactionLevel !== undefined && (
        <div className="mt-2 w-full">
          <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${satisfactionLevel}%`,
                background: satisfactionLevel > 70 ? '#00b894' : satisfactionLevel > 40 ? '#fdcb6e' : '#ff7675'
              }}
            />
          </div>
          <p className="text-[8px] text-slate-400 text-center mt-0.5">{satisfactionLevel}% satisfied</p>
        </div>
      )}
    </div>
  );
}

// Jury panel row
export function JuryPanel({ personas, activePersonaId, speakingPersonaId, satisfactionLevels = {}, onPersonaClick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {personas.map(persona => (
        <JuryAvatar
          key={persona.id}
          persona={persona}
          isActive={activePersonaId === persona.id}
          isSpeaking={speakingPersonaId === persona.id}
          satisfactionLevel={satisfactionLevels[persona.id]}
          onClick={onPersonaClick}
        />
      ))}
    </div>
  );
}
