
import React from 'react';
import { Direction } from '../types';

interface IconProps {
  className?: string;
  color?: string;
  direction?: Direction;
}

export const ArrowIcon: React.FC<IconProps> = ({ direction, className, color }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color || "currentColor"} 
    strokeWidth="4" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={{ transform: direction === Direction.LEFT ? 'scaleX(-1)' : 'none' }}
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export const TurnIcon: React.FC<IconProps> = ({ className, color }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color || "currentColor"} 
    strokeWidth="3.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const CoinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="url(#coinGradient)" stroke="#D97706" strokeWidth="2"/>
    <circle cx="16" cy="16" r="10" stroke="#FDE047" strokeWidth="1.5" opacity="0.8"/>
    <path d="M16 8L18.5 13H24L19.5 16.5L21 22L16 18.5L11 22L12.5 16.5L8 13H13.5L16 8Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.5"/>
    <defs>
      <linearGradient id="coinGradient" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FCD34D"/>
        <stop offset="1" stopColor="#F59E0B"/>
      </linearGradient>
    </defs>
  </svg>
);
