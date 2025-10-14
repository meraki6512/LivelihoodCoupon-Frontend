import { ViewStyle } from "react-native";
import { RouteResult } from "./route";

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
  roadAddress?: string; // 도로명 주소
  roadAddressDong?: string; // 도로명 주소(동)
  lotAddress?: string; // 지번 주소
  phone?: string; // 전화번호
  placeUrl?: string; // 장소 URL
};

/**
 * KakaoMap 컴포넌트의 Props 타입
 */
export type KakaoMapProps = {
  latitude: number; // 지도 중심 위도
  longitude: number; // 지도 중심 경도
  style?: ViewStyle; // 지도 스타일 (선택적)
  markers?: MarkerData[]; // 표시할 마커 목록 (선택적)
  routeResult?: RouteResult | null; // 길찾기 결과 (경로 표시용)
  onMapIdle?: (latitude: number, longitude: number) => void; // 지도 이동 멈춤 콜백
  onMarkerPress?: (placeId?: string, lat?: number, lng?: number) => void; // 마커 클릭 콜백
  showInfoWindow?: boolean; // InfoWindow 표시 여부
  selectedPlaceId?: string; // 선택된 장소 ID
  selectedMarkerLat?: number; // 선택된 마커의 위도
  selectedMarkerLng?: number; // 선택된 마커의 경도
  onCloseInfoWindow?: () => void; // InfoWindow 닫기 콜백
  onSetRouteLocation?: (type: 'departure' | 'arrival', placeInfo: any) => void; // 길찾기 위치 설정 콜백
};
