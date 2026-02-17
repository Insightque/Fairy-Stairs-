
/**
 * Sanrio Character & Background Assets
 * 
 * [이미지 경로 설정]
 * 현재 로컬 경로(/assets/images/...)는 환경에 따라 404 에러가 발생할 수 있습니다.
 * 안정적인 실행을 위해 온라인 URL(Imgur)을 기본값으로 사용합니다.
 */

export const ASSET_PATHS = {
  // 에러 수정: 로컬 경로 대신 작동하는 Imgur 링크 사용
  kuromi: "https://i.imgur.com/PVUt6fE.png",
  hellokitty: "https://i.imgur.com/IdQc3Cd.gif",
  mymelody: "https://i.imgur.com/ZDjGvQ7.gif",
  pompompurin: "https://i.imgur.com/x1rmmGC.gif",
  
  // 배경 이미지 (Unsplash Source)
  background: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop"
};
