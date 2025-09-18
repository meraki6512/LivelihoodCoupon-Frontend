import { useState, useEffect } from "react";
import * as Location from "expo-location";

interface LocationState {
  latitude: number;
  longitude: number;
}

interface UseCurrentLocationResult {
  location: LocationState | null;
  error: string | null;
  loading: boolean;
}

export const useCurrentLocation = (): UseCurrentLocationResult => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
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
