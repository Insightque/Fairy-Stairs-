
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
