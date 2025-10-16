/**
 * 백엔드 API의 검색 결과(SearchResponse)에 해당하는 타입
 */
export type SearchResult = {
  placeId: string;
  placeName: string;
  roadAddress: string;
  roadAddressDong: string;
  lotAddress: string;
  lat: number;
  lng: number;
  phone: string;
  categoryGroupName: string;
  placeUrl: string;
  distance: number;
    parkingChargeInfo?: string; // Add parkingChargeInfo here
};

export interface SearchOptions {
  radius: number;
  sort: string;
  forceLocationSearch?: boolean;
}

export interface AutocompleteResponse {
  word: string;
}

export interface SearchRequest {
  query: string;
  lat: number;
  lng: number;
  radius: number;
  userLat: number;
  userLng: number;
  page: number;
  size: number;
  sort: 'distance' | 'popularity';
  forceLocationSearch?: boolean;
}
