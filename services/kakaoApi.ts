import { KAKAO_REST_API_KEY } from "@env";
import { SearchResult } from "../types/search";

export const searchKakaoPlaces = async (
  query: string,
  latitude: number,
  longitude: number
): Promise<SearchResult[]> => {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}&x=${longitude}&y=${latitude}&radius=10000`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      }
    );
    const data = await response.json();

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
