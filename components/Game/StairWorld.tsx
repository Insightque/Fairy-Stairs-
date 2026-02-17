
import React, { useState, useEffect } from 'react';
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
  const [imgError, setImgError] = useState(false);
  const cameraX = -charPosition.x;
  const cameraY = -charPosition.y + 120;

  // 캐릭터가 바뀌면 에러 상태 리셋
  useEffect(() => {
    setImgError(false);
  }, [character.id]);

  // 쿠로미와 마이멜로디일 경우 기본 방향 반전 (이미지 원본 방향 이슈 해결)
  const isFlippedChar = ['kuromi', 'mymelody'].includes(character.id);
  const dirScale = charDirection === Direction.LEFT ? -1 : 1;
  const finalScale = isFlippedChar ? -dirScale : dirScale;

  return (
    <div className="flex-1 relative overflow-hidden z-10 w-full font-['Jua']">
      <div 
        className="absolute left-1/2 top-[55%] w-0 h-0 transition-transform duration-200 ease-out"
        style={{ transform: `translate3d(${cameraX}px, ${cameraY}px, 0)` }}
      >
        {/* Render Stairs */}
        {stairs.slice(Math.max(0, currentIndex - 5), currentIndex + MAX_VISIBLE_STAIRS).map((stair) => (
          <div
            key={stair.id}
            className={`absolute w-[50px] h-[30px] rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.1)] border-2 border-white/60 ${STAIR_COLORS[stair.id % STAIR_COLORS.length]}`}
            style={{ left: stair.x - 25, top: stair.y }}
          >
            {stair.id % 5 === 0 && stair.id !== 0 && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[16px] animate-bounce">⭐</div>
            )}
          </div>
        ))}

        {/* Render Character */}
        <div 
          className="absolute w-20 h-20 transition-transform duration-100 z-10"
          style={{
            left: charPosition.x - 40,
            top: charPosition.y - 65,
            transformOrigin: 'bottom center',
            transform: `scaleX(${finalScale})`,
          }}
        >
          <div 
            key={currentIndex}
            className={`w-full h-full relative flex items-center justify-center ${hasStarted && !isDead ? 'animate-jump-squash' : ''}`}
            style={{ transformOrigin: 'bottom center' }}
          >
            {/* Direction Indicator */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30" style={{ transform: `scaleX(${isFlippedChar ? -1 : 1})` }}>
              <ArrowIcon 
                direction={Direction.RIGHT} 
                className={`w-8 h-8 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] ${charDirection === Direction.LEFT ? 'text-pink-500' : 'text-cyan-500'}`}
              />
            </div>

            {imgError ? (
              <div className="text-6xl drop-shadow-xl filter bg-white/30 rounded-full p-2">{character.emoji}</div>
            ) : (
              <img 
                src={character.imageUrl} 
                alt={character.name} 
                className="w-[90%] h-[90%] object-contain filter drop-shadow-[0_8px_8px_rgba(0,0,0,0.15)]"
                loading="eager"
                onError={() => {
                  console.error(`[게임중 캐릭터 로드 실패] ID: ${character.id} | 경로: ${character.imageUrl}`);
                  setImgError(true);
                }}
              />
            )}
          </div>

          {!hasStarted && !isDead && (
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-base font-bold text-cyan-600 animate-pulse shadow-lg border-2 border-cyan-100 z-40" style={{ transform: `scaleX(${isFlippedChar ? -1 : 1})` }}>
              Ready? Go! 🚀
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StairWorld;
