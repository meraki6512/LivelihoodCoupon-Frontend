import apiClient from './apiClient';
import { SearchResult } from '../types/search';
import { ApiResponse, PageResponse } from '../types/api';
import { ApiError } from '../utils/errors';

/**
 * 백엔드 API를 통해 장소를 검색하는 함수
 * 
 * @param query - 검색 키워드
 * @param lat - 중심 위도
 * @param lng - 중심 경도
 * @param radius - 검색 반경 (미터)
 * @param sort - 정렬 기준
 * @param page - 조회할 페이지 번호
 * @returns 검색 결과 페이징 객체
 */
export const searchPlaces = async (
  query: string,
  lat: number,
  lng: number,
  radius: number,
  sort: string,
  page: number = 1,
  userLat: number, // 사용자 실제 위도
  userLng: number, // 사용자 실제 경도
): Promise<PageResponse<SearchResult>> => {
  try {
    const response = await apiClient.get<ApiResponse<PageResponse<SearchResult>>>('/api/search', {
      params: {
        query,
        lat,
        lng,
        radius,
        sort,
        page,
        userLat: userLat, // 사용자 위치 기반 거리 계산을 위해 추가
        userLng: userLng,
      },
    });

    const payload = response.data;

    if (!payload || !payload.success) {
      throw new ApiError(payload?.error?.message || 'Failed to search places', response.status, payload?.error);
    }

    if (!payload.data) {
      throw new ApiError('Search results data not found', response.status);
    }
    
    return payload.data;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data?.error?.message || 'An unknown error occurred', error.response?.status || 500, error.response?.data?.error);
    }
    throw new ApiError('An unknown error occurred during search', 500);
  }
};
