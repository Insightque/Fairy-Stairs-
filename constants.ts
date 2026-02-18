
import { Difficulty, Character, ItemType } from './types';
import { ASSET_PATHS } from './assets/images';

export const STAIR_HEIGHT = 35;
export const X_STEP = 35;
export const MAX_VISIBLE_STAIRS = 18;
export const INITIAL_TIMER = 100;

export const CHARACTERS: Record<string, Character> = {
  kuromi: { id: 'kuromi', name: '쿠로미', imageUrl: ASSET_PATHS.kuromi, color: 'purple', emoji: '😈' },
  mymelody: { id: 'mymelody', name: '마이멜로디', imageUrl: ASSET_PATHS.mymelody, color: 'pink', emoji: '🐰' },
  hellokitty: { id: 'hellokitty', name: '헬로키티', imageUrl: ASSET_PATHS.hellokitty, color: 'red', emoji: '🎀' },
  pompompurin: { id: 'pompompurin', name: '폼폼푸린', imageUrl: ASSET_PATHS.pompompurin, color: 'yellow', emoji: '🍮' },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);

export const CHARACTER_PRICES: Record<string, number> = {
  kuromi: 0,
  mymelody: 300,
  hellokitty: 600,
  pompompurin: 900
};

export const STAIR_COLORS = [
  'bg-white',
  'bg-pink-100/80',
  'bg-blue-100/80',
  'bg-purple-100/80',
  'bg-yellow-50/80'
];

export const DIFFICULTY_SETTINGS = {
  [Difficulty.EASY]: { decayMult: 1.2, baseDecay: 15, timerRefill: 10 },
  [Difficulty.NORMAL]: { decayMult: 1.5, baseDecay: 17, timerRefill: 8 },
  [Difficulty.HARD]: { decayMult: 1.8, baseDecay: 20, timerRefill: 7 }
};

export const ITEM_INFO: Record<ItemType, { emoji: string, label: string, duration?: number, value?: number }> = {
  [ItemType.COIN]: { emoji: '🪙', label: '코인', value: 1 },
  [ItemType.BIG_COIN]: { emoji: '💰', label: '왕동전', value: 10 },
  [ItemType.AUTO_CLIMB]: { emoji: '🚀', label: '부스터' },
  [ItemType.SHIELD]: { emoji: '🛡️', label: '방패' },
  [ItemType.GIANT]: { emoji: '🍄', label: '거대화', duration: 10000 },
  [ItemType.SPEED_CURSE]: { emoji: '⏰', label: '시간가속', duration: 10000 },
};
