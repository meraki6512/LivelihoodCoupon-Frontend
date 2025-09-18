import { useQuery } from '@tanstack/react-query';
import { getPlaceDetailsById } from '../services/placeApi';
import { PlaceDetail } from '../types/place';

/**
 * PlaceDetailPanel 컴포넌트는 usePlaceDetail 훅을 호출하기만 하면 
 * 로딩 상태(isLoading), 에러 상태(isError), 데이터(data)를 알아서 받아볼 수 있는 등
 * 모든 비동기 로직이 훅 안에 캡슐화되어 있음
 */
export function usePlaceDetail(placeId: string | null) {
  return useQuery<PlaceDetail>({
    queryKey: ['placeDetails', placeId], // 쿼리 키: 캐싱 및 관리에 사용
    queryFn: () => getPlaceDetailsById(placeId as string), // 실제 데이터 fetching 함수
    enabled: !!placeId, // placeId가 있을 때만 쿼리 실행
  });
}


