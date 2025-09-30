import { create } from 'zustand';

/**
 * 장소 관련 전역 상태 타입
 */
type PlaceState = {
  selectedPlaceId: string | null; // 현재 선택된 장소 ID (마커 선택 상태)
  setSelectedPlaceId: (id: string | null) => void; // 선택된 장소 ID 설정 함수
  showInfoWindow: boolean; // InfoWindow 표시 여부
  setShowInfoWindow: (show: boolean) => void; // InfoWindow 표시 상태 설정 함수
  selectedMarkerPosition: { lat: number; lng: number } | null; // 선택된 마커의 좌표
  setSelectedMarkerPosition: (position: { lat: number; lng: number } | null) => void; // 선택된 마커 좌표 설정 함수
  mapCenter: { latitude: number; longitude: number } | null; // 지도 중심점
  setMapCenter: (center: { latitude: number; longitude: number } | null) => void; // 지도 중심점 설정 함수
};

/**
 * 장소 관련 전역 상태를 관리하는 Zustand 스토어
 * 선택된 장소의 ID를 전역적으로 관리합니다.
 */
export const usePlaceStore = create<PlaceState>((set) => ({
  selectedPlaceId: null,
  setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),
  showInfoWindow: false,
  setShowInfoWindow: (show) => set({ showInfoWindow: show }),
  selectedMarkerPosition: null,
  setSelectedMarkerPosition: (position) => set({ selectedMarkerPosition: position }),
  mapCenter: null,
  setMapCenter: (center) => set({ mapCenter: center }),
}));


