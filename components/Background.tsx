
import React, { useState } from 'react';
import { BACKGROUND_IMAGE } from './assets/BackgroundImage';

const Background: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#b4f0f8]">
      {/* 1. 기본 그라데이션 (이미지 로드 전이나 실패 시 보여짐) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#A1FFCE] to-[#FAFFD1] opacity-100"></div>

      {/* 2. 배경 이미지 */}
      {!hasError && (
        <img
          src={BACKGROUND_IMAGE}
          alt="Background"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            console.error("배경 이미지 로드 실패");
            setHasError(true);
            setIsLoaded(true); // 로딩 상태를 끝내서 fallback이 자연스럽게 보이게 함
          }}
          // 이미지가 로드되면 서서히 나타나게 함 (fade-in)
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            filter: 'brightness(1.05)',
            // 이미지 주소가 data:image/... (Base64) 형식이 아닐 때만 crossOrigin 적용
            ...(BACKGROUND_IMAGE.startsWith('http') ? { crossOrigin: "anonymous" } : {})
          }}
        />
      )}
      
      {/* 3. 오버레이 (글자 가독성을 위해 살짝 흰색 막 + 블러) */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>
      
      {/* 4. 장식용 반짝이 패턴 (이미지가 없어도 심심하지 않게) */}
      <div className="absolute inset-0 opacity-30" 
           style={{ 
             backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2.5px)', 
             backgroundSize: '30px 30px' 
           }}>
      </div>
    </div>
  );
};

export default Background;
