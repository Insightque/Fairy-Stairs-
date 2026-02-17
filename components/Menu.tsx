
import React, { useState, useEffect } from 'react';
import { Difficulty } from '../types';
import { CHARACTER_LIST } from '../constants';
import { soundManager } from '../services/soundManager';

interface MenuProps {
  highScore: number;
  onStart: (difficulty: Difficulty, characterId: string) => void;
  initialCharacterId: string;
}

const Menu: React.FC<MenuProps> = ({ highScore, onStart, initialCharacterId }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.NORMAL);
  const [selectedCharId, setSelectedCharId] = useState(initialCharacterId);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const currentCharacter = CHARACTER_LIST.find(c => c.id === selectedCharId) || CHARACTER_LIST[0];

  // 캐릭터 변경 시 에러 상태 초기화 (재시도 허용)
  useEffect(() => {
    if (imgErrors[selectedCharId]) {
      setImgErrors(prev => {
        const next = { ...prev };
        delete next[selectedCharId];
        return next;
      });
    }
  }, [selectedCharId]);

  const handleImgError = (id: string, url: string) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMute(next);
    if (!next) soundManager.playStep();
  };

  const diffs = [
    { type: Difficulty.EASY, label: "쉬움", color: "bg-green-400" },
    { type: Difficulty.NORMAL, label: "보통", color: "bg-pink-400" },
    { type: Difficulty.HARD, label: "매움", color: "bg-purple-500" }
  ];

  // 이미지를 좌우 반전해야 하는 캐릭터 목록
  const shouldFlip = (id: string) => ['kuromi', 'mymelody'].includes(id);

  return (
    <div className="flex flex-col h-full w-full z-10 font-['Jua'] relative overflow-hidden select-none">
      {/* Header */}
      <div className="flex-none pt-4 px-4 z-20">
        <div className="w-full flex justify-between items-center">
          <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white shadow-sm">
             <span className="text-cyan-700 text-sm font-bold">🏆 최고기록: {highScore}</span>
          </div>
          <button onClick={toggleMute} className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md border-2 border-white active:scale-90 transition-transform">
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
        <div className="text-center mt-6">
          <h2 className="text-[11px] font-black text-white bg-pink-400/80 px-4 py-1 rounded-full inline-block backdrop-blur-sm tracking-widest uppercase mb-1">Sanrio Fairy Town</h2>
          <div className="flex flex-col items-center justify-center leading-none">
            <h1 className="text-5xl font-black text-white drop-shadow-[0_4px_0_#0e7490]" style={{WebkitTextStroke: '1px #0e7490'}}>무한의</h1>
            <h1 className="text-5xl font-black text-pink-400 drop-shadow-[0_3px_0_white] -mt-1">산리오 계단</h1>
          </div>
        </div>
      </div>

      {/* Character Display */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 relative w-full overflow-hidden">
        <div className="relative aspect-square max-h-[25vh] flex items-center justify-center">
          <div className="w-48 h-48 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center border-[8px] border-white shadow-2xl relative">
            {imgErrors[currentCharacter.id] ? (
              <div className="text-8xl z-10 animate-float drop-shadow-lg">{currentCharacter.emoji}</div>
            ) : (
              <img 
                src={currentCharacter.imageUrl} 
                className={`w-[85%] h-[85%] object-contain z-10 animate-float ${shouldFlip(currentCharacter.id) ? 'scale-x-[-1]' : ''}`} 
                alt={currentCharacter.name} 
                loading="eager"
                onError={() => handleImgError(currentCharacter.id, currentCharacter.imageUrl)}
              />
            )}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-1.5 rounded-full shadow-xl border-2 border-pink-200 z-20 whitespace-nowrap">
              <span className="text-pink-500 font-black text-2xl tracking-tighter">{currentCharacter.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Character Selector */}
      <div className="flex-none pb-8 px-6 w-full max-w-sm mx-auto flex flex-col gap-4 z-20">
        <div className="w-full">
          <p className="text-[12px] text-cyan-800 font-bold mb-2 ml-1 opacity-80 uppercase tracking-wider text-center">친구를 골라주세요</p>
          <div className="flex gap-3 overflow-x-auto py-3 no-scrollbar px-1 snap-x justify-center">
            {CHARACTER_LIST.map((char) => (
              <button
                key={char.id}
                onClick={() => { setSelectedCharId(char.id); soundManager.playStep(); }}
                className={`flex-shrink-0 w-16 h-16 rounded-2xl border-[4px] transition-all overflow-hidden bg-white/90 snap-center flex items-center justify-center ${selectedCharId === char.id ? 'border-pink-400 scale-110 shadow-lg ring-4 ring-pink-100' : 'border-white opacity-60 hover:opacity-100'}`}
              >
                {imgErrors[char.id] ? (
                  <div className="text-3xl">{char.emoji}</div>
                ) : (
                  <img 
                    src={char.imageUrl} 
                    alt={char.name} 
                    className={`w-full h-full object-contain p-1.5 ${shouldFlip(char.id) ? 'scale-x-[-1]' : ''}`} 
                    onError={() => handleImgError(char.id, char.imageUrl)}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Select */}
        <div className="grid grid-cols-3 gap-2">
          {diffs.map((d) => (
            <button
              key={d.type}
              onClick={() => { setSelectedDifficulty(d.type); soundManager.playStep(); }}
              className={`py-3 rounded-2xl border-b-[5px] transition-all active:translate-y-1 active:border-b-0 ${selectedDifficulty === d.type ? `${d.color} text-white border-black/10 scale-105 shadow-md` : 'bg-white/90 text-gray-400 border-gray-100 hover:bg-white'}`}
            >
              <p className="text-sm font-black">{d.label}</p>
            </button>
          ))}
        </div>
        
        {/* Start Button */}
        <button 
          onClick={() => { soundManager.playStart(); onStart(selectedDifficulty, selectedCharId); }} 
          className="w-full text-white text-3xl py-5 rounded-[2.5rem] shadow-[0_10px_20px_rgba(6,182,212,0.3)] border-b-[6px] border-black/10 font-black bg-gradient-to-r from-cyan-400 to-blue-500 active:translate-y-1 active:shadow-none active:border-b-0 transition-all uppercase"
        >
          시작하기!
        </button>
      </div>
    </div>
  );
};

export default Menu;
