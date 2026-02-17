
export enum Direction {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export enum Difficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD'
}

export enum ItemType {
  // Good Items
  AUTO_CLIMB = 'AUTO_CLIMB', // 10칸 자동 오르기
  SHIELD = 'SHIELD',         // 1회 방어

  // Bad Items
  GIANT = 'GIANT',           // 캐릭터 거대화 (시야 방해)
  SPEED_CURSE = 'SPEED_CURSE' // 타이머 속도 증가
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
  item?: ItemType;
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
