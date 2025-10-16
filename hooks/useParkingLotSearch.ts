import { useState, useCallback } from 'react';
import { searchParkingLots, ParkingLot, SearchParkingLotsParams } from '../services/WebParkingApi';
import { PageResponse } from '../types/api';

// 1. 상태(State) 정의
interface ParkingLotState {
  parkingLots: ParkingLot[];
  loading: boolean;
  error: string | null;
  pagination: (PageResponse<ParkingLot> & { isLast: boolean }) | null;
}

// 4. 커스텀 훅(Custom Hook) 정의
export const useParkingLotSearch = () => {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<(PageResponse<ParkingLot> & { isLast: boolean }) | null>(null);

  const fetchParkingLots = useCallback(async (
    lat: number,
    lng: number,
    options?: {
      query?: string;
      radius?: number;
      page?: number;
      size?: number;
      sort?: 'distance' | 'accuracy';
    }
  ) => {
    setLoading(true);
    setError(null);
    setParkingLots([]); // Reset parkingLots on new search
    setPagination(null); // Reset pagination on new search

    try {
      const response = await searchParkingLots({
        lat,
        lng,
        ...options,
      });
      setParkingLots(response.content);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        isLast: response.last,
        startPage: response.startPage,
        endPage: response.endPage,
        hasPrev: response.hasPrev,
        hasNext: response.hasNext,
        blockSize: response.blockSize,
        searchCenterLat: response.searchCenterLat,
        searchCenterLng: response.searchCenterLng,
      });
    } catch (err: any) {
      console.error("주변 주차장 검색 중 오류 발생:", err);
      setError(err.message || '주변 주차장 검색 중 오류가 발생했습니다.');
      setParkingLots([]); // Ensure parkingLots is empty on error
      setPagination(null); // Ensure pagination is reset on error
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    parkingLots,
    loading,
    error,
    pagination,
    fetchParkingLots,
  };
};