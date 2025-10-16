import { useQuery } from '@tanstack/react-query';
import { getParkingLotDetailsById, ParkingLotDetail } from '../services/WebParkingApi';

/**
 * 주차장 상세 정보를 가져오는 커스텀 훅
 * TanStack Query를 사용하여 주차장 상세 정보를 캐싱하고 관리합니다.
 * 
 * @param id - 조회할 주차장의 ID
 * @returns TanStack Query의 결과 객체 (data, isLoading, isError 등)
 */
export function useParkingLotDetail(id: number | null) {
  return useQuery<ParkingLotDetail>({
    queryKey: ['parkingLotDetails', id], // 쿼리 키: 캐싱 및 관리에 사용
    queryFn: () => getParkingLotDetailsById(id as number), // 실제 데이터 fetching 함수
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });
}
