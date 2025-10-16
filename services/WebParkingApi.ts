// services/WebParkingApi.ts
import apiClient from './apiClient';
import {ApiResponse, PageResponse} from '../types/api';

// API 응답 예시를 기반으로 타입 정의
export interface ParkingLot {
  id: number;
  parkingLotNm: string;
  roadAddress: string;
  lotAddress: string;
  parkingChargeInfo: string;
  lat: number;
  lng: number;
  distance: number;
}

export interface ParkingLotDetail {
  id: number;
  parkingLotNm: string;
  roadAddress: string;
  lotAddress: string;
  parkingCapacity: string;
  operDay: string;
  weekOpenTime: string;
  weekCloseTime: string;
  satOpenTime: string;
  satCloseTime: string;
  holidayOpenTime: string;
  holidayCloseTime: string;
  parkingChargeInfo: string;
  paymentMethod: string;
  specialComment: string;
  phoneNumber: string;
  lat: number;
  lng: number;
}

export interface SearchParkingLotsParams {
  lat: number;
  lng: number;
  query?: string;
  radius?: number;
  page?: number;
  size?: number;
  sort?: 'distance' | 'accuracy';
}

export const searchParkingLots = async (
  params: SearchParkingLotsParams,
): Promise<PageResponse<ParkingLot>> => {
  const response = await apiClient.get<ApiResponse<PageResponse<ParkingLot>>>('/api/searches/parkinglots-es', {
    params,
  });
  return response.data.data;
};

export const getParkingLotDetailsById = async (id: number): Promise<ParkingLotDetail> => {
  const response = await apiClient.get<ApiResponse<ParkingLotDetail>>(`/api/parkinglots/${id}`);
  return response.data.data;
};
