
import { Difficulty, Character } from './types';
import { ASSET_PATHS } from './assets/images';

export const STAIR_HEIGHT = 35;
export const X_STEP = 35;
export const MAX_VISIBLE_STAIRS = 18;
export const INITIAL_TIMER = 100;

export const CHARACTERS: Record<string, Character> = {
  kuromi: { id: 'kuromi', name: '쿠로미', imageUrl: ASSET_PATHS.kuromi, color: 'purple', emoji: '😈' },
  mymelody: { id: 'mymelody', name: '마이멜로디', imageUrl: ASSET_PATHS.mymelody, color: 'pink', emoji: '🐰' },
  hellokitty: { id: 'hellokitty', name: '헬로키티', imageUrl: ASSET_PATHS.hellokitty, color: 'red', emoji: '🎀' },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);

export const STAIR_COLORS = [
  'bg-white',
  'bg-pink-100/80',
  'bg-blue-100/80',
  'bg-purple-100/80',
  'bg-yellow-50/80'
];

export const DIFFICULTY_SETTINGS = {
  [Difficulty.EASY]: { decayMult: 0.5, baseDecay: 6, timerRefill: 15 },
  [Difficulty.NORMAL]: { decayMult: 1.2, baseDecay: 15, timerRefill: 10 },
  [Difficulty.HARD]: { decayMult: 1.8, baseDecay: 20, timerRefill: 7 }
};
