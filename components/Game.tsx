
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Direction, StairData, GameState, Difficulty, Character } from '../types';
import { GoogleGenAI } from "@google/genai";
import { soundManager } from './SoundManager';

interface GameProps {
  gameState: GameState;
  onGameOver: (score: number) => void;
  onReset: () => void;
  onRestart: () => void;
}

// Cute SVG Icons
const ArrowIcon = ({ direction, className, color }: { direction: Direction, className?: string, color?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color || "currentColor"} 
    strokeWidth="4" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={{ transform: direction === Direction.LEFT ? 'scaleX(-1)' : 'none' }}
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const TurnIcon = ({ className, color }: { className?: string, color?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color || "currentColor"} 
    strokeWidth="3.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const STAIR_HEIGHT = 35; 
const X_STEP = 35; 
const MAX_VISIBLE_STAIRS = 15;

const CHARACTERS: Record<string, Character & { emoji: string }> = {
  kuromi: { id: 'kuromi', name: '쿠로미', imageUrl: 'https://raw.githubusercontent.com/Aris-In/Kawaii-Assets/main/kuromi.png', color: 'bg-purple-100', emoji: '😈' },
  cinnamoroll: { id: 'cinnamoroll', name: '시나모롤', imageUrl: 'https://raw.githubusercontent.com/Aris-In/Kawaii-Assets/main/cinnamoroll.png', color: 'bg-blue-50', emoji: '☁️' },
  mymelody: { id: 'mymelody', name: '마이멜로디', imageUrl: 'https://raw.githubusercontent.com/Aris-In/Kawaii-Assets/main/mymelody.png', color: 'bg-pink-100', emoji: '🐰' },
  pompompurin: { id: 'pompompurin', name: '폼폼푸린', imageUrl: 'https://raw.githubusercontent.com/Aris-In/Kawaii-Assets/main/pompompurin.png', color: 'bg-yellow-100', emoji: '🍮' },
};

const STAIR_COLORS = [
  'bg-white',
  'bg-pink-100',
  'bg-blue-100',
  'bg-purple-100'
];

const Game: React.FC<GameProps> = ({ gameState, onGameOver, onReset, onRestart }) => {
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(100);
  const [isDead, setIsDead] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); 
  const [stairs, setStairs] = useState<StairData[]>([]);
  
  // Character State
  const [charPosition, setCharPosition] = useState({ x: 0, y: 0 });
  const [charDirection, setCharDirection] = useState<Direction>(Direction.RIGHT);
  const [currentStairIndex, setCurrentStairIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [imgError, setImgError] = useState(false); 
  
  // AI Comment State
  const [geminiComment, setGeminiComment] = useState("");
  const [isLoadingComment, setIsLoadingComment] = useState(false);

  const lastTimeRef = useRef<number>(Date.now());
  const aiRef = useRef<GoogleGenAI | null>(null);

  const selectedChar = CHARACTERS[gameState.selectedCharacter] || CHARACTERS.kuromi;

  const difficultySettings = {
    [Difficulty.EASY]: { decayMult: 0.5, baseDecay: 5 },
    [Difficulty.NORMAL]: { decayMult: 1.0, baseDecay: 10 },
    [Difficulty.HARD]: { decayMult: 1.5, baseDecay: 15 }
  };
  const settings = difficultySettings[gameState.difficulty];

  useEffect(() => {
    try {
      if (process.env.API_KEY) {
        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
      }
    } catch (e) {
      console.error("AI Init Error", e);
    }
  }, []);

  const createNextStair = (lastStair: StairData, id: number): StairData => {
    const changeDir = Math.random() > 0.5;
    const nextDir = changeDir 
      ? (lastStair.direction === Direction.RIGHT ? Direction.LEFT : Direction.RIGHT) 
      : lastStair.direction;
    
    const nextX = nextDir === Direction.RIGHT ? lastStair.x + X_STEP : lastStair.x - X_STEP;
    
    return {
      id,
      direction: nextDir,
      x: nextX,
      y: lastStair.y - STAIR_HEIGHT
    };
  };

  const initGame = useCallback(() => {
    const startStair: StairData = { id: 0, direction: Direction.RIGHT, x: 0, y: 0 };
    const initialStairs = [startStair];
    for (let i = 1; i < 50; i++) {
      initialStairs.push(createNextStair(initialStairs[initialStairs.length - 1], i));
    }
    setStairs(initialStairs);
    setScore(0);
    setTimer(100);
    setIsDead(false);
    setHasStarted(false);
    setCurrentStairIndex(0);
    setCharPosition({ x: 0, y: 0 });
    setCharDirection(Direction.RIGHT);
    setGeminiComment("");
    setImgError(false);
    lastTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (!hasStarted || isDead) return;

    let animationFrameId: number;
    
    const tick = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setTimer((prev) => {
        const decaySpeed = settings.baseDecay + (score * 0.05 * settings.decayMult);
        const nextTime = prev - (decaySpeed * deltaTime);
        
        if (nextTime <= 0) {
          handleGameOver(score, "TIME_OVER");
          return 0;
        }
        return nextTime;
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, isDead, score, settings]);

  const handleGameOver = async (finalScore: number, reason: string) => {
    if (isDead) return;
    
    setIsDead(true);
    soundManager.playFail();
    onGameOver(finalScore); 
    
    if (aiRef.current && finalScore > 5) {
      setIsLoadingComment(true);
      try {
        const prompt = `
          The player played 'Infinite Stairs' with character '${selectedChar.name}'.
          Score: ${finalScore}. Reason for game over: ${reason}.
          Write a short, funny, 1-sentence reaction from ${selectedChar.name}'s perspective in Korean.
          Use emojis. Don't be too mean, be cute but cheeky.
        `;
        const response = await aiRef.current.models.generateContent({
          model: 'gemini-2.5-flash-latest',
          contents: prompt,
        });
        setGeminiComment(response.text);
      } catch (e) {
        // Ignore error
      } finally {
        setIsLoadingComment(false);
      }
    } else {
        setGeminiComment(finalScore === 0 ? "한 계단도 못 올라갔어? 🥺" : "조금 더 힘내봐! 🔥");
    }
  };

  const handleInput = (action: 'CLIMB' | 'TURN') => {
    if (isDead) return;
    
    if (!hasStarted) {
      setHasStarted(true);
      lastTimeRef.current = Date.now();
    }

    const nextIndex = currentStairIndex + 1;
    if (nextIndex + 20 > stairs.length) {
      setStairs(prev => {
        const newStairs = [...prev];
        let last = newStairs[newStairs.length - 1];
        for(let i=0; i<10; i++) {
            last = createNextStair(last, last.id + 1);
            newStairs.push(last);
        }
        return newStairs;
      });
    }

    const nextStair = stairs[nextIndex];
    const currentStair = stairs[currentStairIndex];

    const requiredDir = nextStair.x > currentStair.x ? Direction.RIGHT : Direction.LEFT;

    let newDir = charDirection;
    let success = false;

    if (action === 'CLIMB') {
      if (charDirection === requiredDir) {
        success = true;
      }
    } else if (action === 'TURN') {
      newDir = charDirection === Direction.RIGHT ? Direction.LEFT : Direction.RIGHT;
      if (newDir === requiredDir) {
        success = true;
      }
    }

    if (success) {
      soundManager.playStep();
      setCurrentStairIndex(nextIndex);
      setCharPosition({ x: nextStair.x, y: nextStair.y });
      setCharDirection(newDir);
      setScore(s => s + 1);
      setTimer(t => Math.min(100, t + 10));
      
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 100);
      
    } else {
      handleGameOver(score, "WRONG_STEP");
    }
  };

  const cameraX = -charPosition.x;
  const cameraY = -charPosition.y + 120;

  return (
    <div className="flex flex-col w-full h-full relative font-['Jua'] select-none">
      
      {/* 1. HUD (15%) */}
      <div className="h-[15%] min-h-[80px] w-full flex flex-col justify-end px-6 pb-2 z-20 relative pointer-events-none">
         <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col">
              <span className="text-cyan-700 text-xs font-bold tracking-widest opacity-80">SCORE</span>
              <span className="text-5xl text-white font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] leading-none stroke-cyan-700" style={{ WebkitTextStroke: '2px #0e7490' }}>
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

      {/* 2. Game Area (Flex-1) */}
      <div className="flex-1 relative overflow-hidden z-10 w-full bg-gradient-to-b from-transparent to-white/10">
         <div 
            className="absolute left-1/2 top-[55%] w-0 h-0 transition-transform duration-200 ease-out will-change-transform"
            style={{ 
              transform: `translate3d(${cameraX}px, ${cameraY}px, 0)` 
            }}
         >
            {/* Stairs */}
            {stairs.slice(Math.max(0, currentStairIndex - 5), currentStairIndex + MAX_VISIBLE_STAIRS).map((stair, index) => (
              <div
                key={stair.id}
                className={`absolute w-[46px] h-[28px] rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.1)] border-2 border-white/40 ${STAIR_COLORS[stair.id % STAIR_COLORS.length]}`}
                style={{
                  left: stair.x - 23,
                  top: stair.y,
                }}
              >
                {(stair.id % 5 === 0 && stair.id !== 0) && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[14px]">⭐</div>}
              </div>
            ))}

            {/* Character */}
            <div 
              className={`absolute w-16 h-16 transition-transform duration-100 z-10 ${isJumping ? 'scale-110 -translate-y-6' : ''}`}
              style={{
                left: charPosition.x - 32,
                top: charPosition.y - 50,
                transformOrigin: 'bottom center',
                transform: `${isJumping ? 'scale(1.1) translateY(-24px)' : 'scale(1) translateY(0)'} scaleX(${charDirection === Direction.LEFT ? -1 : 1})`,
              }}
            >
               {/* Small Floating Direction Arrow (Simplified) */}
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 animate-bounce pointer-events-none">
                   <ArrowIcon 
                       direction={charDirection} 
                       className={`w-7 h-7 drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)] ${charDirection === Direction.LEFT ? 'text-pink-500' : 'text-cyan-500'}`}
                   />
               </div>

               {!imgError ? (
                 <img 
                   src={selectedChar.imageUrl} 
                   alt="char" 
                   onError={() => setImgError(true)}
                   className="w-full h-full object-contain filter drop-shadow-lg"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-4xl filter drop-shadow-lg">
                   {selectedChar.emoji}
                 </div>
               )}
               
               {/* Hint Bubble (Initial) */}
               {!hasStarted && !isDead && (
                 <div className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1 rounded-full text-xs font-bold text-cyan-600 animate-pulse shadow-md border-2 border-cyan-100 z-40">
                   Go Up!
                 </div>
               )}
            </div>
         </div>
         
         {/* Game Over Overlay */}
         {isDead && (
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-fadeIn" onClick={(e) => e.stopPropagation()}>
             <div className="bg-white rounded-[2rem] p-6 w-full max-w-xs shadow-[0_10px_40px_rgba(0,0,0,0.2)] border-[6px] border-cyan-200 relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-cyan-100 shadow-md">
                   <div className="text-6xl animate-bounce">
                     {selectedChar.emoji}
                   </div>
                </div>
                
                <h2 className="mt-10 text-2xl font-black text-slate-700 mb-1">GAME OVER</h2>
                <p className="text-4xl font-black text-pink-500 mb-4 stroke-black">{score} 층</p>
                
                <div className="bg-slate-100 rounded-xl p-3 mb-6 min-h-[60px] flex items-center justify-center">
                   {isLoadingComment ? (
                     <span className="text-gray-400 text-sm animate-pulse">쿠로미가 할 말을 생각중...</span>
                   ) : (
                     <p className="text-slate-600 text-sm font-bold word-keep-all leading-snug">"{geminiComment}"</p>
                   )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => { soundManager.playStep(); onReset(); }}
                    className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-600 font-bold hover:bg-gray-300 transition-colors"
                  >
                    메뉴로
                  </button>
                  <button 
                    onClick={() => { soundManager.playStart(); onRestart(); }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold shadow-lg hover:scale-105 transition-transform"
                  >
                    다시하기
                  </button>
                </div>
             </div>
           </div>
         )}
      </div>

      {/* 3. Controls (Compact & Responsive) */}
      <div className="h-[25%] min-h-[120px] max-h-[180px] w-full flex gap-3 p-4 pb-6 z-20 items-stretch bg-gradient-to-t from-[#b4f0f8]/50 to-transparent">
         {/* LEFT: Climb */}
         <button
           className="flex-1 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-b from-pink-400 to-pink-500 border-b-[6px] sm:border-b-[8px] border-pink-700 active:border-b-0 active:translate-y-2 transition-all shadow-[0_8px_20px_rgba(236,72,153,0.4)] flex flex-col items-center justify-center group touch-manipulation relative overflow-hidden"
           onPointerDown={(e) => {
             e.preventDefault(); 
             handleInput('CLIMB'); 
           }}
         >
            {/* Shimmer effect for climb button */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="mb-1 p-1.5 sm:p-2.5 bg-white/20 rounded-full backdrop-blur-sm shadow-inner group-active:scale-90 transition-transform">
                <ArrowIcon direction={charDirection} className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-md" color="white" />
            </div>
            <span className="text-white font-black text-base sm:text-xl pointer-events-none drop-shadow-sm">오르기</span>
            <span className="text-[9px] sm:text-[10px] text-pink-100 font-bold mt-1 pointer-events-none opacity-80">
                 {charDirection === Direction.LEFT ? 'LEFT' : 'RIGHT'}
            </span>
         </button>

         {/* RIGHT: Turn */}
         <button
           className="flex-1 rounded-[1.5rem] sm:rounded-[2rem] bg-white border-b-[6px] sm:border-b-[8px] border-gray-200 active:border-b-0 active:translate-y-2 transition-all shadow-lg flex flex-col items-center justify-center group touch-manipulation relative"
           onPointerDown={(e) => { 
             e.preventDefault(); 
             handleInput('TURN'); 
           }}
         >
            <div className="mb-1 p-1.5 sm:p-2.5 bg-gray-100 rounded-full shadow-inner group-active:scale-90 transition-transform">
                <TurnIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </div>
            <span className="text-gray-500 font-black text-base sm:text-lg pointer-events-none">방향전환</span>
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold mt-1 pointer-events-none">TURN</span>
         </button>
      </div>
    </div>
  );
};

export default Game;
