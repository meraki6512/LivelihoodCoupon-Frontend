import apiClient from './apiClient';
import { ParkingLotSearchResponse, ParkingLotDetailResponse } from '../types/parking';

export interface ParkingLotSearchParams {
  lat: number;
  lng: number;
  radius?: number;
  page?: number;
  size?: number;
}

export const parkingApi = {
  // 주변 주차장 검색
  searchNearbyParkingLots: async (params: ParkingLotSearchParams): Promise<ParkingLotSearchResponse> => {
    const queryParams = new URLSearchParams({
      lat: params.lat.toString(),
      lng: params.lng.toString(),
      ...(params.radius && { radius: params.radius.toString() }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.size && { size: params.size.toString() }),
    });

    const response = await apiClient.get(`/api/searches/parkinglots-es?${queryParams}`);
    return response.data;
  },

  // 주차장 상세 정보 조회
  getParkingLotDetail: async (id: number): Promise<ParkingLotDetailResponse> => {
    const response = await apiClient.get(`/api/parkinglots/${id}`);
    return response.data;
  },
};
