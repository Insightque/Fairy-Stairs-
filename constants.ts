
import { Difficulty, Character } from './types';
import { ASSET_PATHS } from './assets/images';

export const STAIR_HEIGHT = 35;
export const X_STEP = 35;
export const MAX_VISIBLE_STAIRS = 18;
export const INITIAL_TIMER = 100;

export const CHARACTERS: Record<string, Character> = {
  kuromi: { id: 'kuromi', name: '쿠로미', imageUrl: ASSET_PATHS.kuromi, color: 'purple', emoji: '😈' },
  hellokitty: { id: 'hellokitty', name: '헬로키티', imageUrl: ASSET_PATHS.hellokitty, color: 'red', emoji: '🎀' },
  cinnamoroll: { id: 'cinnamoroll', name: '시나모롤', imageUrl: ASSET_PATHS.cinnamoroll, color: 'blue', emoji: '☁️' },
  mymelody: { id: 'mymelody', name: '마이멜로디', imageUrl: ASSET_PATHS.mymelody, color: 'pink', emoji: '🐰' },
  pompompurin: { id: 'pompompurin', name: '폼폼푸린', imageUrl: ASSET_PATHS.pompompurin, color: 'yellow', emoji: '🍮' },
  pochacco: { id: 'pochacco', name: '포차코', imageUrl: ASSET_PATHS.pochacco, color: 'green', emoji: '🐶' },
  keroppi: { id: 'keroppi', name: '케로피', imageUrl: ASSET_PATHS.keroppi, color: 'green', emoji: '🐸' },
  hangyodon: { id: 'hangyodon', name: '한교동', imageUrl: ASSET_PATHS.hangyodon, color: 'cyan', emoji: '🐟' },
  badtzmaru: { id: 'badtzmaru', name: '배드바츠마루', imageUrl: ASSET_PATHS.badtzmaru, color: 'black', emoji: '🐧' },
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
  [Difficulty.NORMAL]: { decayMult: 1.0, baseDecay: 12, timerRefill: 10 },
  [Difficulty.HARD]: { decayMult: 1.6, baseDecay: 18, timerRefill: 7 }
};
