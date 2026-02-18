
import React, { useState, useEffect } from 'react';
import { Difficulty, GameState } from '../types';
import { CHARACTER_LIST, CHARACTER_PRICES } from '../constants';
import { soundManager } from '../services/soundManager';
import { CoinIcon, SettingsIcon, ArrowIcon, TurnIcon } from './Icons';
import { Direction } from '../types';

interface MenuProps {
  highScore: number;
  totalCoins: number;
  unlockedCharacters: string[];
  isButtonSwapped: boolean;
  onStart: (difficulty: Difficulty, characterId: string) => void;
  onPurchase: (characterId: string) => boolean;
  initialCharacterId: string;
  onImportData: (data: Partial<GameState>) => void;
  onResetData: () => void;
  onToggleButtonSwap: () => void;
}

const Menu: React.FC<MenuProps> = ({ 
  highScore, totalCoins, unlockedCharacters, isButtonSwapped, onStart, onPurchase, initialCharacterId, onImportData, onResetData, onToggleButtonSwap
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.NORMAL);
  const [selectedCharId, setSelectedCharId] = useState(initialCharacterId);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  
  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [importCode, setImportCode] = useState("");

  const currentCharacter = CHARACTER_LIST.find(c => c.id === selectedCharId) || CHARACTER_LIST[0];
  const isLocked = !unlockedCharacters.includes(selectedCharId);
  const price = CHARACTER_PRICES[selectedCharId];
  const canAfford = totalCoins >= price;

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

  const shouldFlip = (id: string) => ['kuromi', 'mymelody'].includes(id);

  const handleStartOrBuy = () => {
    if (isLocked) {
      if (canAfford) {
        soundManager.playCoin();
        onPurchase(selectedCharId);
      } else {
        soundManager.playFail(); 
      }
    } else {
      soundManager.playStart();
      onStart(selectedDifficulty, selectedCharId);
    }
  };

  // --- Settings Handlers ---

  const handleSaveData = () => {
    const dataToSave = {
      highScore,
      totalCoins,
      unlockedCharacters,
      isButtonSwapped
    };
    const encoded = btoa(JSON.stringify(dataToSave));
    navigator.clipboard.writeText(encoded).then(() => {
        alert("✨ 저장 코드가 복사되었습니다! 메모장에 붙여넣어 보관하세요.");
    }).catch(() => {
        alert("복사에 실패했습니다. 권한을 확인해주세요.");
    });
  };

  const handleLoadData = () => {
    if (!importCode) {
        alert("저장 코드를 입력해주세요!");
        return;
    }
    try {
        const decoded = atob(importCode);
        const parsed = JSON.parse(decoded);
        
        if (typeof parsed.highScore === 'number' && typeof parsed.totalCoins === 'number' && Array.isArray(parsed.unlockedCharacters)) {
            if (window.confirm("현재 데이터를 덮어쓰고 불러오시겠습니까?")) {
                onImportData(parsed);
                setIsSettingsOpen(false);
                setImportCode("");
                alert("✨ 데이터 불러오기 성공!");
            }
        } else {
            alert("잘못된 코드 형식입니다.");
        }
    } catch (e) {
        alert("코드를 읽을 수 없습니다. 올바른 저장 코드인지 확인해주세요.");
    }
  };

  const handleReset = () => {
    const confirm1 = window.confirm("정말로 모든 기록을 초기화하시겠습니까? (되돌릴 수 없습니다!)");
    if (confirm1) {
        const confirm2 = window.confirm("진짜로요? 모든 코인과 캐릭터가 사라집니다! 😭");
        if (confirm2) {
            onResetData();
            setIsSettingsOpen(false);
            alert("초기화되었습니다.");
        }
    }
  };

  return (
    <div className="flex flex-col h-full w-full z-10 font-['Jua'] relative overflow-hidden select-none">
      {/* Header */}
      <div className="flex-none pt-4 px-4 z-20">
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-2">
            <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white shadow-sm flex items-center gap-1.5">
               <CoinIcon className="w-5 h-5" />
               <span className="text-cyan-700 text-sm font-bold">{totalCoins}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white shadow-sm">
               <span className="text-cyan-700 text-sm font-bold">🏆 {highScore}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md border-2 border-white active:scale-90 transition-transform">
               <SettingsIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={toggleMute} className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md border-2 border-white active:scale-90 transition-transform">
                {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
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
          <div className={`w-48 h-48 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center border-[8px] border-white shadow-2xl relative transition-all ${isLocked ? 'grayscale opacity-90' : ''}`}>
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
            
            {/* Lock Overlay */}
            {isLocked && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/20 rounded-full backdrop-blur-[1px]">
                <div className="text-5xl mb-1">🔒</div>
              </div>
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
          <p className="text-[12px] text-cyan-800 font-bold mb-2 ml-1 opacity-80 uppercase tracking-wider text-center">
            {isLocked ? "캐릭터를 구매하세요" : "친구를 골라주세요"}
          </p>
          <div className="flex gap-3 overflow-x-auto py-3 no-scrollbar px-1 snap-x justify-center">
            {CHARACTER_LIST.map((char) => {
              const locked = !unlockedCharacters.includes(char.id);
              return (
                <button
                  key={char.id}
                  onClick={() => { setSelectedCharId(char.id); soundManager.playStep(); }}
                  className={`flex-shrink-0 w-16 h-16 rounded-2xl border-[4px] transition-all overflow-hidden bg-white/90 snap-center flex items-center justify-center relative ${selectedCharId === char.id ? 'border-pink-400 scale-110 shadow-lg ring-4 ring-pink-100' : 'border-white opacity-60 hover:opacity-100'} ${locked ? 'grayscale' : ''}`}
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
                  {locked && <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-xl">🔒</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Select (Hide when locked to focus on purchase) */}
        {!isLocked && (
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
        )}
        
        {/* Start / Buy Button */}
        <button 
          onClick={handleStartOrBuy} 
          className={`w-full text-white text-2xl py-5 rounded-[2.5rem] shadow-[0_10px_20px_rgba(6,182,212,0.3)] border-b-[6px] border-black/10 font-black active:translate-y-1 active:shadow-none active:border-b-0 transition-all uppercase flex items-center justify-center gap-2
            ${isLocked 
              ? canAfford ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}
        >
          {isLocked ? (
            <>
              <span>구매하기</span>
              <span className="bg-black/20 px-3 py-1 rounded-full text-lg flex items-center gap-1">
                <CoinIcon className="w-6 h-6" /> {price}
              </span>
            </>
          ) : (
            "시작하기!"
          )}
        </button>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl border-[4px] border-pink-200 relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pink-100 text-pink-500 font-black px-4 py-1 rounded-full border-2 border-white shadow-sm">
                    설정
                </div>
                <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>

                <div className="mt-4 flex flex-col gap-4">
                    {/* Controls Config Section */}
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <h3 className="font-bold text-purple-700 mb-2 flex items-center gap-2">🎮 컨트롤 설정</h3>
                        <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-purple-50 shadow-sm">
                           <div className="flex gap-2 text-gray-600 text-sm font-bold items-center">
                              <span>버튼 위치 변경</span>
                           </div>
                           <button 
                             onClick={() => { onToggleButtonSwap(); soundManager.playStep(); }}
                             className={`relative w-12 h-6 rounded-full transition-colors ${isButtonSwapped ? 'bg-purple-500' : 'bg-gray-300'}`}
                           >
                              <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isButtonSwapped ? 'translate-x-6' : ''}`} />
                           </button>
                        </div>
                        <div className="flex justify-center mt-3 gap-4 text-xs font-bold text-gray-500 opacity-80">
                            {isButtonSwapped ? (
                                <div className="flex gap-1 items-center"><span className="bg-gray-200 p-1 rounded">방향전환</span> <span className="bg-pink-200 p-1 rounded">오르기</span></div>
                            ) : (
                                <div className="flex gap-1 items-center"><span className="bg-pink-200 p-1 rounded">오르기</span> <span className="bg-gray-200 p-1 rounded">방향전환</span></div>
                            )}
                        </div>
                    </div>

                    {/* Save Section */}
                    <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                        <h3 className="font-bold text-cyan-700 mb-1 flex items-center gap-2">📤 기록 저장 (내보내기)</h3>
                        <p className="text-xs text-cyan-600/80 mb-3 word-keep-all">
                            현재 기록(코인, 캐릭터)을 코드로 복사합니다. 다른 곳에 붙여넣어 보관하세요.
                        </p>
                        <button 
                            onClick={handleSaveData}
                            className="w-full py-2 bg-cyan-500 text-white rounded-lg font-bold shadow-md active:scale-95 transition-transform"
                        >
                            코드 복사하기
                        </button>
                    </div>

                    {/* Load Section */}
                    <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                        <h3 className="font-bold text-pink-700 mb-1 flex items-center gap-2">📥 기록 불러오기</h3>
                        <textarea 
                            value={importCode}
                            onChange={(e) => setImportCode(e.target.value)}
                            placeholder="저장된 코드를 여기에 붙여넣으세요..."
                            className="w-full text-xs p-2 rounded-lg border border-pink-200 mb-2 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none h-16"
                        />
                        <button 
                            onClick={handleLoadData}
                            className="w-full py-2 bg-pink-400 text-white rounded-lg font-bold shadow-md active:scale-95 transition-transform"
                        >
                            불러오기
                        </button>
                    </div>

                    {/* Reset Section */}
                    <div className="pt-2 border-t border-gray-100">
                        <button 
                            onClick={handleReset}
                            className="w-full text-xs text-red-400 underline hover:text-red-600"
                        >
                            모든 데이터 초기화
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
