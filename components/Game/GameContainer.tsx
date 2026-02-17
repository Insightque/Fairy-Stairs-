
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Direction, StairData, GameState, Difficulty } from '../../types';
import { 
  X_STEP, STAIR_HEIGHT, INITIAL_TIMER, DIFFICULTY_SETTINGS, CHARACTERS 
} from '../../constants';
import { soundManager } from '../../services/soundManager';
import { generateGameComment } from '../../services/aiService';
import HUD from './HUD';
import StairWorld from './StairWorld';
import Controls from './Controls';
import GameOverOverlay from './GameOverOverlay';

interface GameContainerProps {
  gameState: GameState;
  onGameOver: (score: number) => void;
  onReset: () => void;
  onRestart: () => void;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameState, onGameOver, onReset, onRestart }) => {
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(INITIAL_TIMER);
  const [isDead, setIsDead] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); 
  const [stairs, setStairs] = useState<StairData[]>([]);
  const [charPosition, setCharPosition] = useState({ x: 0, y: 0 });
  const [charDirection, setCharDirection] = useState<Direction>(Direction.RIGHT);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [geminiComment, setGeminiComment] = useState("");
  const [isLoadingComment, setIsLoadingComment] = useState(false);

  const lastTimeRef = useRef(Date.now());
  const selectedChar = CHARACTERS[gameState.selectedCharacter] || CHARACTERS.kuromi;
  const settings = DIFFICULTY_SETTINGS[gameState.difficulty];

  const createNextStair = useCallback((last: StairData, id: number): StairData => {
    const nextDir = Math.random() > 0.5 ? (last.direction === Direction.RIGHT ? Direction.LEFT : Direction.RIGHT) : last.direction;
    return { 
      id, 
      direction: nextDir, 
      x: nextDir === Direction.RIGHT ? last.x + X_STEP : last.x - X_STEP, 
      y: last.y - STAIR_HEIGHT 
    };
  }, []);

  const initGame = useCallback(() => {
    const firstStair: StairData = { id: 0, direction: Direction.RIGHT, x: 0, y: 0 };
    const secondStair: StairData = { 
      id: 1, 
      direction: Direction.RIGHT, 
      x: X_STEP, 
      y: -STAIR_HEIGHT 
    };
    
    let list = [firstStair, secondStair];
    for (let i = 2; i < 50; i++) {
      list.push(createNextStair(list[list.length - 1], i));
    }
    
    setStairs(list);
    setScore(0); 
    setTimer(INITIAL_TIMER); 
    setIsDead(false); 
    setHasStarted(false);
    setCurrentIndex(0); 
    setCharPosition({ x: 0, y: 0 }); 
    setCharDirection(Direction.RIGHT);
    lastTimeRef.current = Date.now();
  }, [createNextStair]);

  useEffect(() => { initGame(); }, [initGame]);

  useEffect(() => {
    if (!hasStarted || isDead) return;
    const tick = () => {
      const now = Date.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      setTimer(prev => {
        const next = prev - (settings.baseDecay + (score * 0.05 * settings.decayMult)) * dt;
        if (next <= 0) { handleDeath('TIME_OVER'); return 0; }
        return next;
      });
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [hasStarted, isDead, score, settings]);

  const handleDeath = async (reason: string) => {
    if (isDead) return;
    setIsDead(true); soundManager.playFail(); onGameOver(score);
    setIsLoadingComment(true);
    // Gemini 대신 미리 정의된 로컬 메시지 로드
    const comment = await generateGameComment(selectedChar.id, score, reason);
    setGeminiComment(comment);
    setIsLoadingComment(false);
  };

  const handleAction = (action: 'CLIMB' | 'TURN') => {
    if (isDead) return;
    if (!hasStarted) { setHasStarted(true); lastTimeRef.current = Date.now(); }
    
    const nextStair = stairs[currentIndex + 1];
    if (currentIndex + 20 > stairs.length) {
      setStairs(prev => {
        let newS = [...prev]; let last = newS[newS.length - 1];
        for(let i=0; i<15; i++) { last = createNextStair(last, last.id + 1); newS.push(last); }
        return newS;
      });
    }

    const targetDir = nextStair.x > stairs[currentIndex].x ? Direction.RIGHT : Direction.LEFT;
    let newDir = charDirection;
    if (action === 'TURN') newDir = charDirection === Direction.RIGHT ? Direction.LEFT : Direction.RIGHT;

    if (newDir === targetDir) {
      if (action === 'CLIMB') soundManager.playStep();
      else soundManager.playTurn();

      setCurrentIndex(prev => prev + 1);
      setCharPosition({ x: nextStair.x, y: nextStair.y });
      setCharDirection(newDir);
      setScore(s => s + 1);
      setTimer(t => Math.min(100, t + settings.timerRefill));
      setIsJumping(true); setTimeout(() => setIsJumping(false), 100);
    } else {
      handleDeath('WRONG_STEP');
    }
  };

  return (
    <div className="flex flex-col w-full h-full relative">
      <HUD score={score} timer={timer} />
      <StairWorld 
        stairs={stairs} currentIndex={currentIndex} charPosition={charPosition} 
        charDirection={charDirection} character={selectedChar} isJumping={isJumping} 
        hasStarted={hasStarted} isDead={isDead} 
      />
      <Controls charDirection={charDirection} onAction={handleAction} />
      {isDead && (
        <GameOverOverlay 
          score={score} character={selectedChar} comment={geminiComment} 
          isLoadingComment={isLoadingComment} onReset={onReset} onRestart={onRestart} 
        />
      )}
    </div>
  );
};

export default GameContainer;
