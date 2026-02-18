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
  onGameOver: (score: number, sessionCoins: number) => void;
  onReset: () => void;
  onRestart: () => void;
  onRevive: () => boolean;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameState, onGameOver, onReset, onRestart, onRevive }) => {
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
  const [sessionCoins, setSessionCoins] = useState(0);

  // Item Effects State
  const [hasShield, setHasShield] = useState(false);
  const [isGiant, setIsGiant] = useState(false);
  const [isSpeedCurse, setIsSpeedCurse] = useState(false);
  const [isAutoClimbing, setIsAutoClimbing] = useState(false);
  
  const autoClimbCountRef = useRef(0);
  // Use number for timeout refs in browser environment
  const giantTimerRef = useRef<number | null>(null);
  const speedTimerRef = useRef<number | null>(null);
  
  // Game Over Lock to prevent multiple triggers
  const isDeadRef = useRef(false);

  const lastTimeRef = useRef(Date.now());
  const selectedChar = CHARACTERS[gameState.selectedCharacter] || CHARACTERS.kuromi;
  const settings = DIFFICULTY_SETTINGS[gameState.difficulty];

  // 다음 부활 비용 계산: 10 * 3^reviveCount
  const reviveCost = 50 * Math.pow(3, gameState.reviveCount);

  // 아이템 생성 로직
  const generateRandomItem = (): ItemType | undefined => {
    const rand = Math.random();
    
    // 특수 아이템 등장 확률: 30계단 중 1번 (약 3.33%)
    const PROBABILITY_SPECIAL = 1 / 50;
    const PROBABILITY_SPECIAL_BAD = 1 / 30;
    const PROBABILITY_BIG_COIN = 1 / 50;
    
    // 1. 왕동전 (약 3.33%)
    if (rand < PROBABILITY_BIG_COIN) {
        return ItemType.BIG_COIN;
    }
    
    // 2. 좋은 아이템 (약 3.33%) - 오토클라임 or 방패
    if (rand < PROBABILITY_SPECIAL * 2) {
        return Math.random() < 0.5 ? ItemType.AUTO_CLIMB : ItemType.SHIELD;
    }
    
    // 3. 나쁜 아이템 (약 3.33%) - 거대화 or 시간가속
    if (rand < PROBABILITY_SPECIAL_BAD * 3) {
        return Math.random() < 0.5 ? ItemType.GIANT : ItemType.SPEED_CURSE;
    }

    // 4. 일반 동전 (난이도별 확률 적용)
    // 이지: 1/5 (20%), 보통: 2/5 (40%), 어려움: 3/5 (60%)
    let coinChance = 0.2;
    if (gameState.difficulty === Difficulty.NORMAL) coinChance = 0.4;
    if (gameState.difficulty === Difficulty.HARD) coinChance = 0.6;

    if (Math.random() < coinChance) {
      return ItemType.COIN;
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
    setSessionCoins(0);
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
    if (isDeadRef.current) return;
    
    if (hasShield && reason === 'WRONG_STEP') {
        setHasShield(false);
        soundManager.playTurn(); 
        return;
    }

    isDeadRef.current = true; 
    setIsDead(true); 
    soundManager.playFail(); 
    
    // 정확한 코인 수 전달
    onGameOver(score, sessionCoins);
    
    setIsLoadingComment(true);
    const comment = await generateGameComment(selectedChar.id, score, reason);
    setGeminiComment(comment);
    setIsLoadingComment(false);
  };

  const handleReviveGame = () => {
    const success = onRevive();
    if (success) {
        soundManager.playStart(); // 부활 효과음
        setIsDead(false);
        isDeadRef.current = false;
        setTimer(100); // 타이머 완전 회복
        setHasStarted(false); // 사용자 입력 대기 상태로 변경 (바로 죽지 않게)
        lastTimeRef.current = Date.now(); // 타이머 틱 초기화
        
        // 부활 시 페널티나 효과가 필요하다면 여기에 추가 (예: 쉴드 부여)
        setHasShield(true); 
    }
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
  }, [hasStarted, isDead, score, settings, isSpeedCurse, sessionCoins]);

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
      case ItemType.COIN:
        setSessionCoins(prev => prev + 1);
        soundManager.playCoin();
        break;
      case ItemType.BIG_COIN:
        setSessionCoins(prev => prev + 10);
        soundManager.playCoin();
        break;
      case ItemType.AUTO_CLIMB:
        setIsAutoClimbing(true);
        autoClimbCountRef.current = 10;
        soundManager.playStart(); 
        break;
      case ItemType.SHIELD:
        setHasShield(true);
        soundManager.playStart(); 
        break;
      case ItemType.GIANT:
        setIsGiant(true);
        if (giantTimerRef.current) clearTimeout(giantTimerRef.current);
        giantTimerRef.current = window.setTimeout(() => setIsGiant(false), ITEM_INFO.GIANT.duration);
        soundManager.playStart(); 
        break;
      case ItemType.SPEED_CURSE:
        setIsSpeedCurse(true);
        if (speedTimerRef.current) clearTimeout(speedTimerRef.current);
        speedTimerRef.current = window.setTimeout(() => setIsSpeedCurse(false), ITEM_INFO.SPEED_CURSE.duration);
        soundManager.playStart(); 
        break;
    }
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

      if (nextStair.item) {
         if (nextStair.item === ItemType.COIN || nextStair.item === ItemType.BIG_COIN) {
             applyItemEffect(nextStair.item);
         } else if (!isAuto) {
             applyItemEffect(nextStair.item);
         }
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
      <HUD score={score} timer={timer} sessionCoins={sessionCoins} />
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
      <Controls 
        charDirection={charDirection} 
        onAction={handleAction} 
        isButtonSwapped={gameState.isButtonSwapped} 
      />
      
      <div className="absolute top-20 left-4 flex flex-col gap-2 z-20 pointer-events-none">
        {hasShield && <div className="animate-bounce text-2xl drop-shadow-md">🛡️</div>}
        {isGiant && <div className="animate-pulse text-2xl drop-shadow-md">🍄</div>}
        {isSpeedCurse && <div className="animate-pulse text-2xl drop-shadow-md">⏰</div>}
        {isAutoClimbing && <div className="animate-spin text-2xl drop-shadow-md">🚀</div>}
      </div>

      {isDead && (
        <GameOverOverlay 
          score={score} 
          character={selectedChar} 
          comment={geminiComment} 
          isLoadingComment={isLoadingComment} 
          onReset={onReset} 
          onRestart={onRestart}
          onRevive={handleReviveGame}
          reviveCost={reviveCost}
        />
      )}
    </div>
  );
};

export default GameContainer;