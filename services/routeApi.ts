import apiClient from './apiClient';
import { RouteResponse, TransportMode, CustomApiResponse } from '../types/route';
import { ApiError } from '../utils/errors';

/**
 * 길찾기 API를 호출하는 함수 (백엔드 GET /api/routes/search에 맞춤)
 * 
 * @param startLng - 출발지 경도
 * @param startLat - 출발지 위도
 * @param endLng - 도착지 경도
 * @param endLat - 도착지 위도
 * @param routeType - 경로 타입
 * @returns 길찾기 결과
 */
export const getRoute = async (
  startLng: number,
  startLat: number,
  endLng: number,
  endLat: number,
  routeType: TransportMode = 'driving'
): Promise<RouteResponse> => {
  try {
    
    const response = await apiClient.get<CustomApiResponse<any>>('/api/routes/search', {
      params: {
        startLng,
        startLat,
        endLng,
        endLat,
        routeType,
      },
    });
    const payload = response.data;
    
    if (!payload || !payload.success) {
      throw new ApiError(
        payload?.error?.message || '길찾기 요청에 실패했습니다', 
        response.status, 
        payload?.error
      );
    }
    
    if (!payload.data) {
      throw new ApiError('길찾기 결과를 찾을 수 없습니다', response.status);
    }
    
    return payload as RouteResponse;
    
  } catch (error: any) {
    console.error('길찾기 API 호출 오류:', error);
    
    if (error.response) {
      // 서버에서 응답을 받았지만 에러 상태
      throw new ApiError(
        error.response.data?.error?.message || '길찾기 서버 오류가 발생했습니다',
        error.response.status,
        error.response.data?.error
      );
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      throw new ApiError('길찾기 서버에 연결할 수 없습니다', 0);
    } else {
      // 요청 설정 중 오류 발생
      throw new ApiError('길찾기 요청 중 오류가 발생했습니다', 500);
    }
  }
};
