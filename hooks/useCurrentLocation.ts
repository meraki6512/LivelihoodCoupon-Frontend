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
      setError(null); // 에러 초기화
      
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("위치 접근 권한이 거부되었습니다. 설정에서 위치 권한을 허용해주세요.");
          setLoading(false);
          return;
        }

        // 위치 서비스가 활성화되어 있는지 확인
        const isLocationEnabled = await Location.hasServicesEnabledAsync();
        if (!isLocationEnabled) {
          setError("위치 서비스가 비활성화되어 있습니다. 설정에서 위치 서비스를 켜주세요.");
          setLoading(false);
          return;
        }

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
      } catch (err: any) {
        console.error("위치 정보를 가져오는 데 실패했습니다:", err);
        if (err.code === 'E_LOCATION_SERVICES_DISABLED') {
          setError("위치 서비스가 비활성화되어 있습니다.");
        } else if (err.code === 'E_LOCATION_UNAVAILABLE') {
          setError("위치 정보를 사용할 수 없습니다. 네트워크 연결을 확인해주세요.");
        } else {
          setError("위치 정보를 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  return { location, error, loading };
};
