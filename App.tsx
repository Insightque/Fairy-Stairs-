
import React, { useState, useEffect } from 'react';
import GameContainer from './components/Game/GameContainer';
import Menu from './components/Menu';
import Background from './components/Background';
import { GameState, Difficulty } from './types';
import { CHARACTER_PRICES } from './constants';

const App: React.FC = () => {
  const [gameId, setGameId] = useState(0);

  // 안전한 정수 파싱 헬퍼
  const safeParseInt = (key: string, defaultVal: number): number => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultVal;
      const parsed = parseInt(item, 10);
      return isNaN(parsed) ? defaultVal : parsed;
    } catch {
      return defaultVal;
    }
  };

  // 안전한 JSON 파싱 헬퍼
  const safeParseJSON = (key: string, defaultVal: any): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: safeParseInt('kuromi_high_score', 0),
    totalCoins: safeParseInt('fairy_stairs_coins', 0),
    sessionCoins: 0,
    isGameOver: false,
    gameStarted: false,
    timer: 100,
    unlockedCharacters: safeParseJSON('fairy_stairs_unlocked', ["kuromi"]),
    selectedCharacter: 'kuromi',
    currentStairIndex: 0,
    difficulty: Difficulty.NORMAL
  });

  const startGame = (difficulty: Difficulty, characterId: string) => {
    setGameId(prev => prev + 1);
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      isGameOver: false,
      score: 0,
      sessionCoins: 0, // 세션 코인 초기화
      timer: 100,
      difficulty,
      selectedCharacter: characterId
    }));
  };

  const handleGameOver = (finalScore: number, finalSessionCoins: number) => {
    // 안전장치: 혹시 모를 NaN 방지
    const validSessionCoins = isNaN(finalSessionCoins) ? 0 : finalSessionCoins;
    const validScore = isNaN(finalScore) ? 0 : finalScore;

    const newHighScore = Math.max(gameState.highScore, validScore);
    const newTotalCoins = gameState.totalCoins + validSessionCoins;

    if (newHighScore > gameState.highScore) {
      localStorage.setItem('kuromi_high_score', newHighScore.toString());
    }
    
    // 코인 저장 (즉시 반영)
    localStorage.setItem('fairy_stairs_coins', newTotalCoins.toString());

    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      highScore: newHighScore,
      totalCoins: newTotalCoins,
      sessionCoins: validSessionCoins,
      score: validScore
    }));
  };

  const resetToMenu = () => {
    setGameState(prev => ({ ...prev, gameStarted: false, isGameOver: false, sessionCoins: 0 }));
  };

  const handlePurchaseCharacter = (characterId: string) => {
    const price = CHARACTER_PRICES[characterId];
    if (gameState.totalCoins >= price && !gameState.unlockedCharacters.includes(characterId)) {
      const newCoins = gameState.totalCoins - price;
      const newUnlocked = [...gameState.unlockedCharacters, characterId];
      
      // 상태 업데이트 및 스토리지 저장
      setGameState(prev => ({
        ...prev,
        totalCoins: newCoins,
        unlockedCharacters: newUnlocked,
        selectedCharacter: characterId // 구매 즉시 선택
      }));

      localStorage.setItem('fairy_stairs_coins', newCoins.toString());
      localStorage.setItem('fairy_stairs_unlocked', JSON.stringify(newUnlocked));
      return true;
    }
    return false;
  };

  return (
    <div className="w-full h-screen relative overflow-hidden flex justify-center bg-black/5">
      <Background />
      <div className="relative z-10 w-full max-w-[480px] h-full shadow-2xl overflow-hidden flex flex-col">
        {!gameState.gameStarted ? (
          <Menu 
            highScore={gameState.highScore} 
            totalCoins={gameState.totalCoins}
            unlockedCharacters={gameState.unlockedCharacters}
            onStart={startGame} 
            onPurchase={handlePurchaseCharacter}
            initialCharacterId={gameState.selectedCharacter}
          />
        ) : (
          <GameContainer 
            key={gameId}
            gameState={gameState} 
            onGameOver={handleGameOver} 
            onReset={resetToMenu}
            onRestart={() => startGame(gameState.difficulty, gameState.selectedCharacter)}
          />
        )}
      </div>
    </div>
  );
};

export default App;
