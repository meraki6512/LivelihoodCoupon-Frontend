import { ViewStyle } from "react-native";

/**
 * 지도 마커 데이터 타입
 */
export type MarkerData = {
  id?: string; // 마커 ID (선택적)
  latitude: number; // 위도
  longitude: number; // 경도
  place_name: string; // 장소명
};

/**
 * KakaoMap 컴포넌트의 Props 타입
 */
export type KakaoMapProps = {
  latitude: number; // 지도 중심 위도
  longitude: number; // 지도 중심 경도
  style?: ViewStyle; // 지도 스타일 (선택적)
  markers?: MarkerData[]; // 표시할 마커 목록 (선택적)
  onMapCenterChange?: (latitude: number, longitude: number) => void; // 지도 중심 변경 콜백
  onMarkerPress?: (placeId?: string) => void; // 마커 클릭 콜백
};
