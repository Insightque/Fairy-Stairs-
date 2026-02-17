
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Direction, StairData, GameState, Difficulty, ItemType } from '../../types';
import { 
  X_STEP, STAIR_HEIGHT, INITIAL_TIMER, DIFFICULTY_SETTINGS, CHARACTERS, ITEM_INFO 
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

  // Item Effects State
  const [hasShield, setHasShield] = useState(false);
  const [isGiant, setIsGiant] = useState(false);
  const [isSpeedCurse, setIsSpeedCurse] = useState(false);
  const [isAutoClimbing, setIsAutoClimbing] = useState(false);
  
  const autoClimbCountRef = useRef(0);
  const giantTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speedTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Game Over Lock to prevent multiple triggers
  const isDeadRef = useRef(false);

  const lastTimeRef = useRef(Date.now());
  const selectedChar = CHARACTERS[gameState.selectedCharacter] || CHARACTERS.kuromi;
  const settings = DIFFICULTY_SETTINGS[gameState.difficulty];

  // 아이템 생성 로직
  const generateRandomItem = (): ItemType | undefined => {
    const rand = Math.random();
    // 약 50계단마다 1번 (2%) -> Good Item
    if (rand < 0.02) {
      return Math.random() < 0.5 ? ItemType.AUTO_CLIMB : ItemType.SHIELD;
    }
    // 약 50계단마다 1번 (2%) -> Bad Item
    else if (rand > 0.98) {
      return Math.random() < 0.5 ? ItemType.GIANT : ItemType.SPEED_CURSE;
    }
    return undefined;
  };

  const createNextStair = useCallback((last: StairData, id: number): StairData => {
    const nextDir = Math.random() > 0.5 ? (last.direction === Direction.RIGHT ? Direction.LEFT : Direction.RIGHT) : last.direction;
    
    // 첫 10계단은 아이템 없음, 그 이후 랜덤 생성
    const item = id > 10 ? generateRandomItem() : undefined;

    return { 
      id, 
      direction: nextDir, 
      x: nextDir === Direction.RIGHT ? last.x + X_STEP : last.x - X_STEP, 
      y: last.y - STAIR_HEIGHT,
      item
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
    isDeadRef.current = false; // Reset lock
    setHasStarted(false);
    setCurrentIndex(0); 
    setCharPosition({ x: 0, y: 0 }); 
    setCharDirection(Direction.RIGHT);
    
    // Reset Effects
    setHasShield(false);
    setIsGiant(false);
    setIsSpeedCurse(false);
    setIsAutoClimbing(false);
    if (giantTimerRef.current) clearTimeout(giantTimerRef.current);
    if (speedTimerRef.current) clearTimeout(speedTimerRef.current);

    lastTimeRef.current = Date.now();
  }, [createNextStair]);

  useEffect(() => { initGame(); }, [initGame]);

  const handleDeath = async (reason: string) => {
    // 이미 죽은 상태라면 중복 처리 방지 (Ref 사용)
    if (isDeadRef.current) return;
    
    // 방패가 있고, 시간 초과가 아닌 '실수(WRONG_STEP)'일 경우 방어
    if (hasShield && reason === 'WRONG_STEP') {
        setHasShield(false);
        soundManager.playTurn(); 
        return;
    }

    isDeadRef.current = true; // 즉시 잠금
    setIsDead(true); 
    soundManager.playFail(); 
    onGameOver(score);
    
    setIsLoadingComment(true);
    const comment = await generateGameComment(selectedChar.id, score, reason);
    setGeminiComment(comment);
    setIsLoadingComment(false);
  };

  // Timer Loop
  useEffect(() => {
    if (!hasStarted || isDead) return;
    const tick = () => {
      const now = Date.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      setTimer(prev => {
        const curseMultiplier = isSpeedCurse ? 1.5 : 1.0;
        const decay = (settings.baseDecay + (score * 0.05 * settings.decayMult)) * curseMultiplier;
        const next = prev - (decay * dt);
        
        // 상태 업데이트 내부에서 Side Effect(handleDeath)를 호출하므로 Ref lock이 필수적임
        if (next <= 0) { 
            handleDeath('TIME_OVER'); 
            return 0; 
        }
        return next;
      });
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [hasStarted, isDead, score, settings, isSpeedCurse]);

  // Auto Climb Logic
  useEffect(() => {
    if (!isAutoClimbing || isDead) return;

    const interval = setInterval(() => {
      if (autoClimbCountRef.current > 0) {
        const nextStair = stairs[currentIndex + 1];
        if (!nextStair) return; 

        const targetDir = nextStair.x > stairs[currentIndex].x ? Direction.RIGHT : Direction.LEFT;
        
        let action: 'CLIMB' | 'TURN' = 'CLIMB';
        if (charDirection !== targetDir) {
            action = 'TURN';
        }

        handleMoveSuccess(nextStair, targetDir, action, true);
        autoClimbCountRef.current -= 1;
      } else {
        setIsAutoClimbing(false);
        setHasShield(true); 
      }
    }, 80); 

    return () => clearInterval(interval);
  }, [isAutoClimbing, currentIndex, stairs, charDirection, isDead]);

  const applyItemEffect = (item: ItemType) => {
    switch (item) {
      case ItemType.AUTO_CLIMB:
        setIsAutoClimbing(true);
        autoClimbCountRef.current = 10;
        break;
      case ItemType.SHIELD:
        setHasShield(true);
        break;
      case ItemType.GIANT:
        setIsGiant(true);
        if (giantTimerRef.current) clearTimeout(giantTimerRef.current);
        giantTimerRef.current = setTimeout(() => setIsGiant(false), ITEM_INFO.GIANT.duration);
        break;
      case ItemType.SPEED_CURSE:
        setIsSpeedCurse(true);
        if (speedTimerRef.current) clearTimeout(speedTimerRef.current);
        speedTimerRef.current = setTimeout(() => setIsSpeedCurse(false), ITEM_INFO.SPEED_CURSE.duration);
        break;
    }
    soundManager.playStart(); 
  };

  const handleMoveSuccess = (nextStair: StairData, targetDir: Direction, action: 'CLIMB' | 'TURN', isAuto: boolean) => {
      if (action === 'CLIMB') soundManager.playStep();
      else soundManager.playTurn();

      setCurrentIndex(prev => prev + 1);
      setCharPosition({ x: nextStair.x, y: nextStair.y });
      setCharDirection(targetDir);
      setScore(s => s + 1);
      setTimer(t => Math.min(100, t + settings.timerRefill));
      setIsJumping(true); 
      setTimeout(() => setIsJumping(false), 100);

      if (nextStair.item && !isAuto) { 
          applyItemEffect(nextStair.item);
      }
  };

  const handleAction = (action: 'CLIMB' | 'TURN') => {
    if (isDead || isAutoClimbing) return; 
    if (!hasStarted) { setHasStarted(true); lastTimeRef.current = Date.now(); }
    
    if (currentIndex + 20 > stairs.length) {
      setStairs(prev => {
        let newS = [...prev]; let last = newS[newS.length - 1];
        for(let i=0; i<15; i++) { last = createNextStair(last, last.id + 1); newS.push(last); }
        return newS;
      });
    }

    const nextStair = stairs[currentIndex + 1];
    const currentStair = stairs[currentIndex];
    
    if (!nextStair) return;

    const targetDir = nextStair.x > currentStair.x ? Direction.RIGHT : Direction.LEFT;
    
    let newDir = charDirection;
    if (action === 'TURN') newDir = charDirection === Direction.RIGHT ? Direction.LEFT : Direction.RIGHT;

    if (newDir === targetDir) {
      handleMoveSuccess(nextStair, targetDir, action, false);
    } else {
      handleDeath('WRONG_STEP');
    }
  };

  return (
    <div className="flex flex-col w-full h-full relative">
      <HUD score={score} timer={timer} />
      <StairWorld 
        stairs={stairs} 
        currentIndex={currentIndex} 
        charPosition={charPosition} 
        charDirection={charDirection} 
        character={selectedChar} 
        isJumping={isJumping} 
        hasStarted={hasStarted} 
        isDead={isDead}
        hasShield={hasShield}
        isGiant={isGiant}
      />
      <Controls charDirection={charDirection} onAction={handleAction} />
      
      <div className="absolute top-20 left-4 flex flex-col gap-2 z-20 pointer-events-none">
        {hasShield && <div className="animate-bounce text-2xl drop-shadow-md">🛡️</div>}
        {isGiant && <div className="animate-pulse text-2xl drop-shadow-md">🍄</div>}
        {isSpeedCurse && <div className="animate-pulse text-2xl drop-shadow-md">⏰</div>}
        {isAutoClimbing && <div className="animate-spin text-2xl drop-shadow-md">🚀</div>}
      </div>

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
