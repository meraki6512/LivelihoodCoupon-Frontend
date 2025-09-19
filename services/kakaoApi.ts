import { KAKAO_REST_API_KEY } from "@env";
import { SearchResult } from "../types/search";

/**
 * 카카오 장소 검색 API를 호출하는 함수
 * 키워드로 장소를 검색하고 결과를 반환합니다.
 * 
 * @param query - 검색할 키워드
 * @param latitude - 검색 중심 위도
 * @param longitude - 검색 중심 경도
 * @returns 검색 결과 배열
 */
export const searchKakaoPlaces = async (
  query: string,
  latitude: number,
  longitude: number
): Promise<SearchResult[]> => {
  try {
    // 카카오 장소 검색 API 호출
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}&x=${longitude}&y=${latitude}&radius=10000`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      }
    );
    const data = await response.json();

    // 검색 결과가 있는 경우 SearchResult 형태로 변환
    if (data.documents && data.documents.length > 0) {
      return data.documents.map((doc: any) => ({
        id: String(doc.id),
        latitude: parseFloat(doc.y),
        longitude: parseFloat(doc.x),
        place_name: doc.place_name,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("키워드 검색 실패:", error);
    throw new Error("키워드 검색 중 오류가 발생했습니다.");
  }
};
