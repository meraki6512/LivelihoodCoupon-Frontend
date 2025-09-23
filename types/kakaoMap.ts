import { ViewStyle } from "react-native";

/**
 * 지도 마커 데이터 타입
 */
export type MarkerData = {
  placeId: string; // 마커 ID (SearchResult의 placeId와 매핑)
  lat: number; // 위도 (SearchResult의 lat과 매핑)
  lng: number; // 경도 (SearchResult의 lng과 매핑)
  placeName: string; // 장소명 (SearchResult의 placeName과 매핑)
  categoryGroupName?: string; // 카테고리 그룹명 (SearchResult의 category_group_name과 매핑)
  markerType?: string; // 마커 타입 (예: 'default', 'selected', 'categoryA')
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
