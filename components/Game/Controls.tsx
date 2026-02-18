
import React from 'react';
import { Direction } from '../../types';
import { ArrowIcon, TurnIcon } from '../Icons';

interface ControlsProps {
  charDirection: Direction;
  onAction: (action: 'CLIMB' | 'TURN') => void;
  isButtonSwapped: boolean;
}

const Controls: React.FC<ControlsProps> = ({ charDirection, onAction, isButtonSwapped }) => {
  const handlePress = (e: React.PointerEvent, action: 'CLIMB' | 'TURN') => {
    e.preventDefault();
    onAction(action);
  };

  const ClimbButton = (
    <button
      key="climb"
      className="flex-1 rounded-[1.5rem] bg-gradient-to-b from-pink-400 to-pink-500 border-b-[8px] border-pink-700 active:border-b-0 active:translate-y-2 transition-all shadow-lg flex flex-col items-center justify-center group touch-manipulation relative overflow-hidden"
      onPointerDown={(e) => handlePress(e, 'CLIMB')}
    >
      <div className="mb-1 p-2 bg-white/20 rounded-full group-active:scale-90 transition-transform">
        <ArrowIcon direction={charDirection} className="w-8 h-8 text-white drop-shadow-md" color="white" />
      </div>
      <span className="text-white font-black text-xl drop-shadow-sm">오르기</span>
      <span className="text-[10px] text-pink-100 font-bold mt-1 opacity-80 uppercase">
        {charDirection === Direction.LEFT ? 'Left' : 'Right'}
      </span>
    </button>
  );

  const TurnButton = (
    <button
      key="turn"
      className="flex-1 rounded-[1.5rem] bg-white border-b-[8px] border-gray-200 active:border-b-0 active:translate-y-2 transition-all shadow-lg flex flex-col items-center justify-center group touch-manipulation relative"
      onPointerDown={(e) => handlePress(e, 'TURN')}
    >
      <div className="mb-1 p-2 bg-gray-100 rounded-full group-active:scale-90 transition-transform">
        <TurnIcon className="w-6 h-6 text-gray-400" />
      </div>
      <span className="text-gray-500 font-black text-lg">방향전환</span>
      <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Turn</span>
    </button>
  );

  return (
    <div className="h-[25%] min-h-[120px] max-h-[180px] w-full flex gap-3 p-4 pb-6 z-20 items-stretch font-['Jua']">
      {isButtonSwapped ? [TurnButton, ClimbButton] : [ClimbButton, TurnButton]}
    </div>
  );
};

export default Controls;
