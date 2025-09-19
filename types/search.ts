/**
 * 검색 결과 타입
 * 카카오 장소 검색 API의 응답을 변환한 형태입니다.
 */
export type SearchResult = {
  id: string; // 장소 고유 ID
  latitude: number; // 위도
  longitude: number; // 경도
  place_name: string; // 장소명
};
