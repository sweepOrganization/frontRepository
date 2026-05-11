import type { KakaoApi } from "./kakaoMap";

declare global {
  interface Window {
    kakao?: KakaoApi;
  }
}

export {};
