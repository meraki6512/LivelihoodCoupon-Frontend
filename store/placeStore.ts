import { create } from 'zustand';

/**
 * 장소 관련 전역 상태 타입
 */
type PlaceState = {
  selectedPlaceId: string | null; // 현재 선택된 장소 ID
  setSelectedPlaceId: (id: string | null) => void; // 선택된 장소 ID 설정 함수
};

/**
 * 장소 관련 전역 상태를 관리하는 Zustand 스토어
 * 선택된 장소의 ID를 전역적으로 관리합니다.
 */
export const usePlaceStore = create<PlaceState>((set) => ({
  selectedPlaceId: null,
  setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),
}));


