import apiClient from './apiClient';
import { PlaceDetail } from '../types/place';
import { ApiResponse } from '../types/api';
import { ApiError } from '../utils/errors';

/**
 * 장소 ID로 상세 정보를 가져오는 함수
 * 백엔드 API를 호출하여 장소의 상세 정보를 조회합니다.
 * 
 * @param placeId - 조회할 장소의 ID
 * @returns 장소 상세 정보
 * @throws API 호출 실패 시 에러 발생
 */
export async function getPlaceDetailsById(placeId: string): Promise<PlaceDetail> {
  console.log('조회할 장소 placeId:', placeId);
  const res = await apiClient.get<ApiResponse<PlaceDetail>>(`/api/places/${placeId}`);
  const payload = res.data;
  
  // API 응답 검증
  if (!payload || payload.success === false) {
    throw new ApiError(payload?.error?.message || 'Failed to fetch place details', res.status, payload?.error);
  }
  if (!payload.data) {
    throw new ApiError('Place details not found', res.status);
  }
  
  return payload.data;
}
