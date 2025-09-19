import { useState, useEffect } from "react";
import { KAKAO_MAP_JS_KEY } from "@env";

/**
 * 전역 Window 객체에 kakao 타입 선언
 */
declare global {
  interface Window {
    kakao: any;
  }
}

/**
 * 카카오맵 스크립트 로딩을 관리하는 커스텀 훅
 * 카카오맵 SDK와 MarkerClusterer 라이브러리를 동적으로 로드합니다.
 */
export const useKakaoMapScript = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 이미 카카오맵이 로드되어 있는 경우
    if (window.kakao && window.kakao.maps) {
      setIsLoaded(true);
      return;
    }

    // 카카오맵 스크립트 동적 로드
    const script = document.createElement("script");
    const sdkUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_JS_KEY}&libraries=services,clusterer&autoload=false`;
    script.src = sdkUrl;
    script.async = true;

    /**
     * 스크립트 로드 성공 핸들러
     * MarkerClusterer 라이브러리까지 로드되었는지 확인합니다.
     */
    const onLoad = () => {
      window.kakao.maps.load(() => {
        if (window.kakao.maps.MarkerClusterer) {
          setIsLoaded(true);
        } else {
          setError("Kakao Maps MarkerClusterer library not loaded.");
        }
      });
    };

    /**
     * 스크립트 로드 실패 핸들러
     * API 키나 허용된 도메인 설정을 확인하도록 안내합니다.
     */
    const onError = () => {
      const message = `Failed to load Kakao Maps SDK. Check appkey and allowed domains. url=${sdkUrl}`;
      console.error(message);
      setError(message);
    };

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    document.head.appendChild(script);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거 및 스크립트 삭제
    return () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      document.head.removeChild(script);
    };
  }, []);

  return { isLoaded, error };
};
