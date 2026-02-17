
import React from 'react';
import { StairData, Direction, Character } from '../../types';
import { MAX_VISIBLE_STAIRS, STAIR_COLORS } from '../../constants';
import { ArrowIcon } from '../Icons';

interface StairWorldProps {
  stairs: StairData[];
  currentIndex: number;
  charPosition: { x: number; y: number };
  charDirection: Direction;
  character: Character;
  isJumping: boolean;
  hasStarted: boolean;
  isDead: boolean;
}

const StairWorld: React.FC<StairWorldProps> = ({ 
  stairs, currentIndex, charPosition, charDirection, character, isJumping, hasStarted, isDead 
}) => {
  const cameraX = -charPosition.x;
  const cameraY = -charPosition.y + 120;

  return (
    <div className="flex-1 relative overflow-hidden z-10 w-full bg-gradient-to-b from-transparent to-white/10 font-['Jua']">
      <div 
        className="absolute left-1/2 top-[55%] w-0 h-0 transition-transform duration-200 ease-out"
        style={{ transform: `translate3d(${cameraX}px, ${cameraY}px, 0)` }}
      >
        {/* Render Stairs */}
        {stairs.slice(Math.max(0, currentIndex - 5), currentIndex + MAX_VISIBLE_STAIRS).map((stair) => (
          <div
            key={stair.id}
            className={`absolute w-[46px] h-[28px] rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.1)] border-2 border-white/40 ${STAIR_COLORS[stair.id % STAIR_COLORS.length]}`}
            style={{ left: stair.x - 23, top: stair.y }}
          >
            {stair.id % 5 === 0 && stair.id !== 0 && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[14px]">⭐</div>
            )}
          </div>
        ))}

        {/* Render Character */}
        <div 
          className="absolute w-16 h-16 transition-transform duration-100 z-10"
          style={{
            left: charPosition.x - 32,
            top: charPosition.y - 50,
            transformOrigin: 'bottom center',
            transform: `scaleX(${charDirection === Direction.LEFT ? -1 : 1})`,
          }}
        >
          {/* Movement Animation Container */}
          <div 
            key={currentIndex} // Re-trigger jump-squash animation every step
            className={`w-full h-full relative ${hasStarted && !isDead ? 'animate-jump-squash' : ''}`}
            style={{ transformOrigin: 'bottom center' }}
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 animate-bounce">
              <ArrowIcon 
                direction={Direction.RIGHT} 
                className={`w-7 h-7 drop-shadow-lg ${charDirection === Direction.LEFT ? 'text-pink-500' : 'text-cyan-500'}`}
              />
            </div>

            <img 
              src={character.imageUrl} 
              alt={character.name} 
              className="w-full h-full object-contain filter drop-shadow-xl"
            />
          </div>

          {!hasStarted && !isDead && (
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1 rounded-full text-xs font-bold text-cyan-600 animate-pulse shadow-md border-2 border-cyan-100 z-40">
              GO UP!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StairWorld;
