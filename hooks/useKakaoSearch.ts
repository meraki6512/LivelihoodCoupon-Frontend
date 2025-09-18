import { useState, useCallback } from "react";
import { searchKakaoPlaces } from "../services/kakaoApi";
import { SearchResult } from "../types/search";

interface UseKakaoSearchResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  loading: boolean;
  error: string | null;
  performSearch: (latitude: number, longitude: number) => Promise<void>;
  clearSearchResults: () => void;
}

export const useKakaoSearch = (): UseKakaoSearchResult => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
