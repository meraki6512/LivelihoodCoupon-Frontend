import { useQuery } from '@tanstack/react-query';
import { getPlaceDetailsById } from '../services/placeApi';
import { PlaceDetail } from '../types/place';

/**
 * 장소 상세 정보를 가져오는 커스텀 훅
 * TanStack Query를 사용하여 장소 상세 정보를 캐싱하고 관리합니다.
 * 
 * @param placeId - 조회할 장소의 ID
 * @returns TanStack Query의 결과 객체 (data, isLoading, isError 등)
 */
export function usePlaceDetail(placeId: string | null) {
  return useQuery<PlaceDetail>({
    queryKey: ['placeDetails', placeId], // 쿼리 키: 캐싱 및 관리에 사용
    queryFn: () => getPlaceDetailsById(placeId as string), // 실제 데이터 fetching 함수
    enabled: !!placeId, // placeId가 있을 때만 쿼리 실행
  });
}


