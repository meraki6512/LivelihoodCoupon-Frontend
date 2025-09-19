import { useState, useEffect } from "react";
import * as Location from "expo-location";

/**
 * 위치 정보 상태 인터페이스
 */
interface LocationState {
  latitude: number; // 위도
  longitude: number; // 경도
}

/**
 * useCurrentLocation 훅의 반환값 인터페이스
 */
interface UseCurrentLocationResult {
  location: LocationState | null; // 현재 위치 정보
  error: string | null; // 에러 메시지
  loading: boolean; // 로딩 상태
}

/**
 * 현재 위치를 가져오는 커스텀 훅
 * 위치 권한을 요청하고 현재 위치를 가져옵니다.
 */
export const useCurrentLocation = (): UseCurrentLocationResult => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    /**
     * 현재 위치를 가져오는 비동기 함수
     * 위치 권한을 요청하고 현재 위치를 가져옵니다.
     */
    const getLocation = async () => {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("위치 접근 권한이 거부되었습니다.");
        setLoading(false);
        return;
      }

      try {
        const { coords } = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
      } catch (err) {
        console.error("위치 정보를 가져오는 데 실패했습니다:", err);
        setError("위치 정보를 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  return { location, error, loading };
};
