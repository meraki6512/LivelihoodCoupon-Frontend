import { useState, useCallback } from "react";
import { searchKakaoPlaces } from "../services/kakaoApi";
import { SearchResult } from "../types/search";

/**
 * useKakaoSearch 훅의 반환값 인터페이스
 */
interface UseKakaoSearchResult {
  searchQuery: string; // 검색 쿼리
  setSearchQuery: (query: string) => void; // 검색 쿼리 설정 함수
  searchResults: SearchResult[]; // 검색 결과 목록
  loading: boolean; // 로딩 상태
  error: string | null; // 에러 메시지
  performSearch: (latitude: number, longitude: number) => Promise<void>; // 검색 실행 함수
  clearSearchResults: () => void; // 검색 결과 초기화 함수
}

/**
 * 카카오 장소 검색을 관리하는 커스텀 훅
 * 검색 쿼리 상태와 검색 실행 로직을 제공합니다.
 */
export const useKakaoSearch = (): UseKakaoSearchResult => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 검색을 실행하는 함수
   * @param latitude - 검색 중심 위도
   * @param longitude - 검색 중심 경도
   */
  const performSearch = useCallback(
    async (latitude: number, longitude: number) => {
      if (!searchQuery.trim()) {
        alert("검색어를 입력해주세요.");
        return;
      }

      setLoading(true);
      setSearchResults([]);
      setError(null);

      try {
        const results = await searchKakaoPlaces(
          searchQuery,
          latitude,
          longitude
        );
        setSearchResults(results);
        if (results.length === 0) {
          alert("검색 결과가 없습니다.");
        }
      } catch (err: any) {
        setError(err.message || "검색 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [searchQuery]
  );

  /**
   * 검색 결과를 초기화하는 함수
   */
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    error,
    performSearch,
    clearSearchResults,
  };
};
