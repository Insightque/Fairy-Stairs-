
import { CHARACTER_MESSAGES } from '../assets/messages';

export async function generateGameComment(characterId: string, score: number, reason: string): Promise<string> {
  // 인위적인 지연시간을 주어 로딩 효과를 유지함 (선택사항)
  await new Promise(resolve => setTimeout(resolve, 500));

  const charMsgs = CHARACTER_MESSAGES[characterId] || CHARACTER_MESSAGES.kuromi;
  const messages = reason === 'TIME_OVER' ? charMsgs.timeOver : charMsgs.wrongStep;
  
  // 랜덤하게 메시지 선택
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}
