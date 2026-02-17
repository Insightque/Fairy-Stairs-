
import React, { useState } from 'react';
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

  const currentCharacter = CHARACTER_LIST.find(c => c.id === selectedCharId) || CHARACTER_LIST[0];

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

  return (
    <div className="flex flex-col h-full w-full z-10 font-['Jua'] relative overflow-hidden select-none">
      {/* Header */}
      <div className="flex-none pt-4 px-4 z-20">
        <div className="w-full flex justify-between items-center">
          <div className="bg-white/60 backdrop-blur-md px-4 py-1 rounded-full border border-white shadow-sm">
             <span className="text-cyan-700 text-sm font-bold">🏆 BEST: {highScore}</span>
          </div>
          <button onClick={toggleMute} className="p-2 bg-white/60 backdrop-blur-md rounded-full shadow-md border-2 border-white">
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
        <div className="text-center mt-4">
          <h2 className="text-xs font-black text-cyan-600 bg-white/40 px-3 py-1 rounded-full inline-block backdrop-blur-sm">Sanrio Town</h2>
          <div className="flex flex-col items-center justify-center leading-none mt-1">
            <h1 className="text-4xl font-black text-white drop-shadow-lg" style={{WebkitTextStroke: '1.5px #0891b2'}}>무한의</h1>
            <h1 className="text-4xl font-black text-pink-400 -mt-1">산리오 계단</h1>
          </div>
        </div>
      </div>

      {/* Character Display */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 relative w-full overflow-hidden">
        <div className="relative aspect-square max-h-[25vh] flex items-center justify-center">
          <div className="w-44 h-44 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center border-[6px] border-white shadow-2xl relative">
            <img 
              src={currentCharacter.imageUrl} 
              className="w-[85%] h-[85%] object-contain z-10 animate-float" 
              alt={currentCharacter.name} 
              key={currentCharacter.id}
            />
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-5 py-1 rounded-full shadow-lg border-2 border-pink-200 z-20 whitespace-nowrap">
              <span className="text-pink-500 font-black text-xl">{currentCharacter.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Character Selector (Horizontal Scroll) */}
      <div className="flex-none pb-6 px-6 w-full max-w-sm mx-auto flex flex-col gap-4 z-20">
        <div className="w-full">
          <p className="text-[10px] text-cyan-700 font-bold mb-1 ml-1 opacity-80 uppercase tracking-tighter">친구들 고르기</p>
          <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar px-1 snap-x">
            {CHARACTER_LIST.map((char) => (
              <button
                key={char.id}
                onClick={() => { setSelectedCharId(char.id); soundManager.playStep(); }}
                className={`flex-shrink-0 w-14 h-14 rounded-2xl border-[3px] transition-all overflow-hidden bg-white snap-center ${selectedCharId === char.id ? 'border-pink-400 scale-110 shadow-lg' : 'border-white opacity-60 grayscale-[0.5]'}`}
              >
                <img src={char.imageUrl} alt={char.name} className="w-full h-full object-contain p-1.5" />
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
              className={`py-2.5 rounded-2xl border-b-[4px] transition-all active:translate-y-0.5 ${selectedDifficulty === d.type ? `${d.color} text-white border-black/10 scale-105 shadow-md` : 'bg-white/80 text-gray-400 border-gray-100'}`}
            >
              <p className="text-sm font-black">{d.label}</p>
            </button>
          ))}
        </div>
        
        {/* Start Button */}
        <button 
          onClick={() => { soundManager.playStart(); onStart(selectedDifficulty, selectedCharId); }} 
          className="w-full text-white text-3xl py-4 rounded-[2.5rem] shadow-xl border-b-[6px] border-black/10 font-black bg-gradient-to-r from-cyan-400 to-blue-500 active:translate-y-1 transition-all"
        >
          올라가기!
        </button>
      </div>
    </div>
  );
};

export default Menu;
