/**
 * 장소 상세 정보 타입
 * PlaceDetailPanel에서 표시되는 모든 장소 정보를 포함합니다.
 */
export type PlaceDetail = {
  placeId: string; // 장소 고유 ID
  placeName: string; // 장소명
  roadAddress: string; // 도로명 주소
  lotAddress: string; // 지번 주소
  phone: string; // 전화번호
  category: string; // 카테고리
  placeUrl: string; // 장소 URL
  lat: number; // 위도
  lng: number; // 경도
};


