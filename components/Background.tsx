
import React from 'react';
import { ASSET_PATHS } from '../assets/images';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#e0f7fa]">
      {/* 1. 메인 배경 이미지 (로컬 images/background.png) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-100"
        style={{ 
          backgroundImage: `url('${ASSET_PATHS.background}')`,
        }}
      />

      {/* 2. 게임 요소 가독성을 위한 최소한의 블러와 오버레이 */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px]"></div>

      {/* 3. 몽환적인 분위기를 위한 상단/하단 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10"></div>

      {/* 4. 장식용 별가루/반짝이 효과 (배경을 해치지 않는 수준) */}
      <div className="absolute inset-0 opacity-10" 
           style={{ 
             backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1.5px)`,
             backgroundSize: '60px 60px',
           }}>
      </div>
      
      {/* 5. 부드러운 애니메이션 광원 */}
      <div className="absolute top-[-15%] left-[-15%] w-[70%] h-[70%] bg-pink-100/20 blur-[130px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[70%] h-[70%] bg-blue-100/20 blur-[130px] rounded-full animate-pulse"></div>
    </div>
  );
};

export default Background;
