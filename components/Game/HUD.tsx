
import React from 'react';

interface HUDProps {
  score: number;
  timer: number;
}

const HUD: React.FC<HUDProps> = ({ score, timer }) => {
  return (
    <div className="h-[15%] min-h-[80px] w-full flex flex-col justify-end px-6 pb-2 z-20 relative pointer-events-none font-['Jua']">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col">
          <span className="text-cyan-700 text-xs font-bold tracking-widest opacity-80">SCORE</span>
          <span 
            className="text-5xl text-white font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] leading-none stroke-cyan-700" 
            style={{ WebkitTextStroke: '2px #0e7490' }}
          >
            {score}
          </span>
        </div>
        <div className="flex-1 ml-6 mb-2">
          <div className="h-4 w-full bg-black/20 rounded-full overflow-hidden border-2 border-white/50 shadow-inner">
            <div 
              className={`h-full transition-all duration-200 ${timer < 30 ? 'bg-red-400 animate-pulse' : 'bg-yellow-300'}`}
              style={{ width: `${Math.max(0, timer)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
