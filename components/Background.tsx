
import React, { useState } from 'react';
import { ASSET_PATHS } from '../assets/images';

const Background: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#b9e9f3]">
      {/* 1. Base Sky Gradient (제공된 이미지의 배경색감) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#b9e9f3] via-[#d4f3f8] to-[#ffffff]"></div>

      {/* 2. Soft Cloud-like Overlay */}
      <div className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #fff, transparent 70%)',
          transform: 'scale(2)'
        }}
      />
      
      {/* 3. Decorative Sparkle & Stars (이미지에 있는 별 장식 재현) */}
      <div className="absolute inset-0 opacity-30" 
           style={{ 
             backgroundImage: `radial-gradient(circle, #fff 1.5px, transparent 2px), 
                               radial-gradient(circle, #fff 1px, transparent 1.5px)`,
             backgroundSize: '80px 80px, 120px 120px',
             backgroundPosition: '0 0, 40px 40px'
           }}>
      </div>

      {/* 4. Sanrio Theme Elements (Soft Gradients for character focus) */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-pink-200/30 blur-[60px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-200/30 blur-[80px] rounded-full animate-pulse"></div>
    </div>
  );
};

export default Background;
