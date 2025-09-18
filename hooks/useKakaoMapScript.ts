import { useState, useEffect } from "react";
import { KAKAO_MAP_JS_KEY } from "@env";

declare global {
  interface Window {
    kakao: any;
  }
}

export const useKakaoMapScript = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Event | string | null>(null);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_JS_KEY}&libraries=services,clusterer&autoload=false`;
    script.async = true;

    const onLoad = () => {
      window.kakao.maps.load(() => {
        if (window.kakao.maps.MarkerClusterer) {
          setIsLoaded(true);
        } else {
          setError("Kakao Maps MarkerClusterer library not loaded.");
        }
      });
    };

    const onError = (e: Event | string) => {
      setError(e);
    };

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      document.head.removeChild(script);
    };
  }, []);

  return { isLoaded, error };
};
