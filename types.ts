
export enum Direction {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export enum Difficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD'
}

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  color: string;
  emoji: string;
}

export interface StairData {
  id: number;
  direction: Direction;
  x: number;
  y: number;
}

export interface GameState {
  score: number;
  highScore: number;
  isGameOver: boolean;
  gameStarted: boolean;
  timer: number;
  unlockedCharacters: string[];
  selectedCharacter: string;
  currentStairIndex: number;
  difficulty: Difficulty;
}
