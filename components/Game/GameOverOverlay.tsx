
import React, { useEffect, useState } from 'react';
import { Character } from '../../types';
import { CoinIcon } from '../Icons';

interface GameOverOverlayProps {
  score: number;
  character: Character;
  comment: string;
  isLoadingComment: boolean;
  onReset: () => void;
  onRestart: () => void;
}

const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ 
  score, character, comment, isLoadingComment, onReset, onRestart 
}) => {
  const [totalCoins, setTotalCoins] = useState(0);

  useEffect(() => {
      // Get the latest coins from local storage which was updated in App.tsx handleGameOver
      const stored = localStorage.getItem('fairy_stairs_coins');
      if (stored) setTotalCoins(parseInt(stored));
  }, []);

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-fadeIn font-['Jua']">
      <div className="bg-white rounded-[2rem] p-6 w-full max-w-xs shadow-2xl border-[6px] border-cyan-200 relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-cyan-100 shadow-md">
          <div className="text-6xl animate-bounce">{character.emoji}</div>
        </div>
        
        <h2 className="mt-10 text-2xl font-black text-slate-700 mb-1">GAME OVER</h2>
        <p className="text-4xl font-black text-pink-500 mb-2">{score} 층</p>
        
        <div className="flex justify-center mb-4">
             <div className="bg-yellow-100 border-2 border-yellow-300 rounded-full px-4 py-1 flex items-center gap-2">
                <span className="text-yellow-700 font-bold text-sm">보유 코인</span>
                <CoinIcon className="w-5 h-5" />
                <span className="text-yellow-800 font-black">{totalCoins}</span>
             </div>
        </div>

        <div className="bg-slate-100 rounded-xl p-4 mb-6 min-h-[70px] flex items-center justify-center">
          {isLoadingComment ? (
            <span className="text-gray-400 text-sm animate-pulse">{character.name}가 할 말을 생각중...</span>
          ) : (
            <p className="text-slate-600 text-sm font-bold leading-snug italic word-keep-all">{comment}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onReset}
            className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-600 font-bold hover:bg-gray-300 transition-colors"
          >
            메뉴로
          </button>
          <button 
            onClick={onRestart}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold shadow-lg active:scale-95 transition-transform"
          >
            다시하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverOverlay;
