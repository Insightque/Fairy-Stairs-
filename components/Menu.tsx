
import React, { useState, useEffect } from 'react';
import { Difficulty, Character } from '../types';
import { soundManager } from './SoundManager';

interface MenuProps {
  highScore: number;
  onStart: (difficulty: Difficulty, characterId: string) => void;
  initialCharacterId: string;
}

const CHARACTERS: (Character & { emoji: string })[] = [
  { id: 'kuromi', name: '쿠로미', imageUrl: 'https://raw.githubusercontent.com/Aris-In/Kawaii-Assets/main/kuromi.png', color: 'bg-purple-100', emoji: '😈' },
  { id: 'cinnamoroll', name: '시나모롤', imageUrl: 'https://raw.githubusercontent.com/Aris-In/Kawaii-Assets/main/cinnamoroll.png', color: 'bg-blue-50', emoji: '☁️' },
  { id: 'mymelody', name: '마이멜로디', imageUrl: 'https://raw.githubusercontent.com/Aris-In/Kawaii-Assets/main/mymelody.png', color: 'bg-pink-100', emoji: '🐰' },
  { id: 'pompompurin', name: '폼폼푸린', imageUrl: 'https://raw.githubusercontent.com/Aris-In/Kawaii-Assets/main/pompompurin.png', color: 'bg-yellow-100', emoji: '🍮' },
];

const Menu: React.FC<MenuProps> = ({ highScore, onStart, initialCharacterId }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.NORMAL);
  const [selectedCharId, setSelectedCharId] = useState(initialCharacterId);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const currentCharacter = CHARACTERS.find(c => c.id === selectedCharId) || CHARACTERS[0];

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundManager.setMute(nextMute);
    if (!nextMute) soundManager.playStep();
  };

  const difficulties = [
    { type: Difficulty.EASY, label: "EASY", color: "bg-green-400", desc: "느긋하게" },
    { type: Difficulty.NORMAL, label: "NORMAL", color: "bg-pink-400", desc: "적당히" },
    { type: Difficulty.HARD, label: "HARD", color: "bg-purple-500", desc: "빠르게!" }
  ];

  const handleStart = () => {
    soundManager.playStart();
    onStart(selectedDifficulty, selectedCharId);
  };

  return (
    <div className="flex flex-col h-full w-full z-10 font-['Jua'] relative overflow-hidden select-none">
       {/* 배경 장식 */}
       <div className="absolute top-10 left-10 text-4xl opacity-50 animate-pulse text-white pointer-events-none">✨</div>
       <div className="absolute top-40 right-5 text-3xl opacity-30 text-cyan-200 pointer-events-none">☁️</div>

      {/* 상단: 음소거 버튼 & 타이틀 (고정 영역) */}
      <div className="flex-none pt-4 px-4 z-20">
        <div className="w-full flex justify-end mb-1">
          <button 
            onClick={toggleMute}
            className="p-2 bg-white/60 backdrop-blur-md rounded-full shadow-md hover:scale-110 transition-transform border-2 border-white"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        <div className="text-center transform origin-top transition-transform scale-90 sm:scale-100">
          <h2 className="text-sm sm:text-lg font-black text-cyan-600 italic tracking-tighter mb-1 opacity-90 bg-white/40 px-3 py-1 rounded-full inline-block backdrop-blur-sm">Sophia Jiyu's</h2>
          <div className="flex flex-col items-center justify-center leading-none">
            <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-[0_3px_0_rgba(34,211,238,1)] stroke-cyan-500" style={{WebkitTextStroke: '1.5px #0891b2'}}>FAIRY</h1>
            <h1 className="text-4xl sm:text-5xl font-black text-pink-400 -mt-2 drop-shadow-sm">STAIRS</h1>
          </div>
        </div>
      </div>

      {/* 중단: 캐릭터 미리보기 (유연한 공간 - 화면 작으면 줄어듬) */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-2 relative w-full overflow-hidden">
        <div className="relative aspect-square h-full max-h-[35vh] min-h-[120px] w-auto flex items-center justify-center p-2">
          <div className={`w-full h-full bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center border-[6px] border-white shadow-[0_8px_30px_rgba(103,232,249,0.5)] relative transition-colors duration-500`}>
            {!imageErrors[currentCharacter.id] ? (
              <img 
                src={currentCharacter.imageUrl}
                onError={() => handleImageError(currentCharacter.id)}
                className="w-[70%] h-[70%] object-contain z-10 animate-floating"
                alt={currentCharacter.name}
              />
            ) : (
              <div className="text-[4rem] sm:text-[5rem] leading-none animate-floating filter drop-shadow-xl select-none">
                {currentCharacter.emoji}
              </div>
            )}
            <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md border-2 border-cyan-200 z-20 whitespace-nowrap">
              <span className="text-cyan-600 font-black text-base sm:text-lg">{currentCharacter.name}</span>
            </div>
            <div className="absolute inset-0 bg-cyan-300/10 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 하단: 컨트롤 패널 (고정 영역이지만 간격 조정) */}
      <div className="flex-none pb-6 sm:pb-8 px-6 w-full max-w-sm mx-auto flex flex-col gap-2 sm:gap-3 z-20">
        {/* 캐릭터 선택 */}
        <div className="flex justify-center gap-2 sm:gap-3 overflow-x-auto py-1 no-scrollbar items-center min-h-[60px]">
          {CHARACTERS.map((char) => (
            <button
              key={char.id}
              onClick={() => {
                setSelectedCharId(char.id);
                soundManager.playStep();
              }}
              className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-[3px] transition-all overflow-hidden flex items-center justify-center ${
                selectedCharId === char.id 
                ? 'border-cyan-400 scale-110 shadow-lg bg-white' 
                : 'border-white bg-white/40 grayscale opacity-70'
              }`}
            >
              {!imageErrors[char.id] ? (
                <img src={char.imageUrl} alt={char.name} className="w-full h-full object-contain p-1" onError={() => handleImageError(char.id)} />
              ) : (
                <span className="text-xl sm:text-2xl">{char.emoji}</span>
              )}
            </button>
          ))}
        </div>

        {/* 점수판 */}
        <div className="bg-white/60 backdrop-blur-md p-1.5 sm:p-2 rounded-[1.2rem] border-[3px] border-white shadow-sm flex items-center justify-between px-4 sm:px-6">
          <p className="text-[10px] text-cyan-600 font-bold tracking-widest uppercase mb-0 text-left">Best Score</p>
          <p className="text-xl sm:text-2xl font-black text-cyan-800 leading-none">{highScore}</p>
        </div>

        {/* 난이도 선택 */}
        <div className="grid grid-cols-3 gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff.type}
              onClick={() => {
                setSelectedDifficulty(diff.type);
                soundManager.playStep();
              }}
              className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-b-[3px] transition-all duration-200 ${
                selectedDifficulty === diff.type 
                ? `${diff.color} text-white border-black/10 scale-105 shadow-md` 
                : 'bg-white/80 text-gray-400 border-gray-200 opacity-80'
              }`}
            >
              <p className="text-xs sm:text-sm font-black leading-tight">{diff.label}</p>
              <p className="text-[8px] sm:text-[9px] font-bold opacity-80">{diff.desc}</p>
            </button>
          ))}
        </div>
        
        {/* 시작 버튼 */}
        <div className="pt-1">
          <button 
            onClick={handleStart}
            className={`w-full text-white text-2xl sm:text-3xl py-2.5 sm:py-3 rounded-[2rem] shadow-[0_6px_15px_rgba(34,211,238,0.4)] border-b-[6px] border-black/10 font-black transition-all active:translate-y-1 active:shadow-none animate-pulse bg-gradient-to-r from-cyan-400 to-blue-400`}
          >
            GO UP!
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menu;
