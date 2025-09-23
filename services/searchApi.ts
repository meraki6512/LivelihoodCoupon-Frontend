import axios from 'axios';
import { SearchResult } from '../types/search';
import { ApiResponse, PageResponse } from '../types/api';
import { API_BASE_URL } from '@env';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

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
      throw new Error(payload?.error?.message || 'Failed to search places');
    }

    if (!payload.data) {
      throw new Error('Search results data not found');
    }
    
    return payload.data;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || 'An unknown error occurred');
    }
    throw new Error('An unknown error occurred during search');
  }
};
