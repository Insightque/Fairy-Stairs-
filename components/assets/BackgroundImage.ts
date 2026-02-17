
/**
 * 배경 이미지를 코드(Base64 문자열)로 관리하는 파일입니다.
 * 외부 서버 상태와 상관없이 항상 이미지가 나오게 하려면 이 방식을 사용하세요.
 * 
 * [적용 방법]
 * 1. 원하는 이미지(산리오 등)를 준비합니다.
 * 2. https://www.base64-image.de/ 사이트에 접속하여 이미지를 업로드합니다.
 * 3. 'Copy Image' 버튼을 눌러 코드를 복사합니다.
 * 4. 아래 `BASE64_IMAGE_CODE` 변수의 따옴표("") 안에 붙여넣으세요.
 */

// 현재는 예시로 안정적인 Unsplash 이미지를 사용합니다. (파스텔 톤 구름/소다 느낌)
// 원하시는 이미지 코드를 생성하신 후 아래 내용을 지우고 붙여넣으시면 됩니다.
export const BASE64_IMAGE_CODE = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop";

/**
 * 만약 코드로 변환한 뒤에는 아래와 같은 형식이 됩니다:
 * export const BASE64_IMAGE_CODE = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...";
 */

export const BACKGROUND_IMAGE = BASE64_IMAGE_CODE;
