import { useState, useCallback } from 'react';
import { getRoute } from '../services/routeApi';
import { RouteResult, TransportMode } from '../types/route';
import { SearchResult } from '../types/search';

/**
 * 길찾기 관련 상태
 */
interface RouteState {
  isLoading: boolean;
  routeResult: RouteResult | null;
  error: string | null;
}

/**
 * 길찾기 훅의 반환값
 */
interface UseRouteResult extends RouteState {
  startRoute: (params: StartRouteParams) => Promise<void>;
  clearRoute: () => void;
}

/**
 * 길찾기 시작 파라미터
 */
interface StartRouteParams {
  startLocation: SearchResult | string; // 출발지 (장소 정보 또는 "내 위치")
  endLocation: SearchResult; // 도착지
  transportMode: TransportMode; // 교통수단 (driving, walking, cycling, transit)
  userLocation?: { latitude: number; longitude: number }; // 사용자 현재 위치
}

/**
 * 길찾기 기능을 제공하는 커스텀 훅
 */
export const useRoute = (): UseRouteResult => {
  const [state, setState] = useState<RouteState>({
    isLoading: false,
    routeResult: null,
    error: null,
  });

  /**
   * 길찾기 시작
   */
  const startRoute = useCallback(async (params: StartRouteParams) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // 출발지 좌표 결정
      let startLat: number;
      let startLng: number;
      let startAddress: string;
      
      if (typeof params.startLocation === 'string' && params.startLocation === '내 위치') {
        // 현재 위치 사용
        if (!params.userLocation) {
          throw new Error('현재 위치 정보가 필요합니다');
        }
        startLat = params.userLocation.latitude;
        startLng = params.userLocation.longitude;
        startAddress = '내 위치';
      } else if (typeof params.startLocation === 'object') {
        // 장소 정보 사용
        startLat = params.startLocation.lat;
        startLng = params.startLocation.lng;
        startAddress = params.startLocation.placeName;
      } else {
        throw new Error('유효하지 않은 출발지 정보입니다');
      }

      // 도착지 좌표
      const endLat = params.endLocation.lat;
      const endLng = params.endLocation.lng;
      const endAddress = params.endLocation.placeName;

      
      // API 호출 (백엔드 GET 방식에 맞춤)
      const response = await getRoute(startLng, startLat, endLng, endLat, params.transportMode);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          routeResult: response.data!,
          error: null,
        }));
      } else {
        throw new Error(response.error?.message || '길찾기 결과를 받을 수 없습니다');
      }
      
    } catch (error: any) {
      console.error('길찾기 오류:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '길찾기 중 오류가 발생했습니다',
      }));
    }
  }, []);

  /**
   * 길찾기 결과 초기화
   */
  const clearRoute = useCallback(() => {
    setState({
      isLoading: false,
      routeResult: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    startRoute,
    clearRoute,
  };
};