
import React, { useState } from 'react';
import Game from './components/Game';
import Menu from './components/Menu';
import Background from './components/Background';
import { GameState, Difficulty } from './types';

const App: React.FC = () => {
  const [gameId, setGameId] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: parseInt(localStorage.getItem('kuromi_high_score') || '0'),
    isGameOver: false,
    gameStarted: false,
    timer: 100,
    unlockedCharacters: ['kuromi', 'cinnamoroll', 'mymelody', 'pompompurin'],
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
      timer: 100,
      currentStairIndex: 0,
      difficulty: difficulty,
      selectedCharacter: characterId
    }));
  };

  const handleGameOver = (finalScore: number) => {
    const newHighScore = Math.max(gameState.highScore, finalScore);
    if (newHighScore > gameState.highScore) {
      localStorage.setItem('kuromi_high_score', newHighScore.toString());
    }
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      highScore: newHighScore,
      score: finalScore
    }));
  };

  const resetToMenu = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: false,
      isGameOver: false,
      score: 0
    }));
  };

  return (
    <div className="w-full h-screen relative overflow-hidden flex justify-center bg-black/5">
      {/* 배경 컴포넌트 (전체 화면 꽉 채움) */}
      <Background />
      
      {/* 게임 컨테이너: 모바일 비율 유지 (최대 너비 480px) */}
      <div className="relative z-10 w-full max-w-[480px] h-full shadow-2xl overflow-hidden flex flex-col">
        {!gameState.gameStarted ? (
          <Menu 
            highScore={gameState.highScore} 
            onStart={startGame} 
            initialCharacterId={gameState.selectedCharacter}
          />
        ) : (
          <Game 
            key={gameId}
            gameState={gameState} 
            onGameOver={handleGameOver} 
            onReset= {resetToMenu}
            onRestart={() => startGame(gameState.difficulty, gameState.selectedCharacter)}
          />
        )}
      </div>
    </div>
  );
};

export default App;
