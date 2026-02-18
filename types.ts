
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
  // Coin Items
  COIN = 'COIN',             // 1코인
  BIG_COIN = 'BIG_COIN',     // 10코인

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
  totalCoins: number;   // 전체 보유 코인 (저장됨)
  sessionCoins: number; // 이번 게임에서 획득한 코인
  isGameOver: boolean;
  gameStarted: boolean;
  timer: number;
  unlockedCharacters: string[];
  selectedCharacter: string;
  currentStairIndex: number;
  difficulty: Difficulty;
  reviveCount: number;  // 이어하기 횟수 (이어하기 비용 계산용)
  isButtonSwapped: boolean; // 버튼 위치 변경 여부 (True: 방향전환|오르기, False: 오르기|방향전환)
}
