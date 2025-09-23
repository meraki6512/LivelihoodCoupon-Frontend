import { useState, useCallback } from "react";
import { searchPlaces } from "../services/searchApi";
import { SearchResult } from "../types/search";
import { PageResponse } from "../types/api";

export interface SearchOptions {
  radius: number;
  sort: string;
}

interface UseSearchResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchOptions: SearchOptions;
  setSearchOptions: (options: Partial<SearchOptions>) => void;
  searchResults: SearchResult[]; // 목록용 (페이징)
  allMarkers: SearchResult[]; // 지도용 (전체)
  loading: boolean;
  loadingNextPage: boolean;
  error: string | null;
  performSearch: (latitude: number, longitude: number, userLatitude: number, userLongitude: number) => Promise<void>;
  fetchNextPage: (latitude: number, longitude: number, userLatitude: number, userLongitude: number) => Promise<void>;
  clearSearchResults: () => void;
  pagination: Omit<PageResponse<any>, 'content'> | null;
}

const MAX_PAGES_FOR_MARKERS = 10; // 무한 루프 방지를 위한 최대 페이지 제한

export const useSearch = (): UseSearchResult => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOptions, setSearchOptionsState] = useState<SearchOptions>({ radius: 1000, sort: 'distance' });
  
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allMarkers, setAllMarkers] = useState<SearchResult[]>([]);
  const [pagination, setPagination] = useState<Omit<PageResponse<any>, 'content'> | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingNextPage, setLoadingNextPage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setSearchOptions = (options: Partial<SearchOptions>) => {
    setSearchOptionsState(prev => ({ ...prev, ...options }));
  };

  const fetchAndSetAllMarkers = async (
    query: string, 
    lat: number, 
    lng: number, 
    radius: number, 
    sort: string, 
    firstPageContent: SearchResult[], 
    pageInfo: Omit<PageResponse<any>, 'content'>
  ) => {
    let allResults = [...firstPageContent];
    let currentPage = pageInfo.currentPage + 1;
    let hasNext = !pageInfo.isLast;

    while (hasNext && currentPage <= MAX_PAGES_FOR_MARKERS) {
      try {
        console.log(`Fetching page ${currentPage} for markers...`);
        const result = await searchPlaces(query, lat, lng, radius, sort, currentPage);
        const uniqueNewContent = result.content.filter(
          (newItem) => !allResults.some((existingItem) => existingItem.placeId === newItem.placeId)
        );
        allResults.push(...uniqueNewContent);
        
        hasNext = !result.isLast;
        currentPage++;

      } catch (e) {
        console.error(`Error fetching page ${currentPage} for markers:`, e);
        hasNext = false; // Stop on error
      }
    }

    if (currentPage > MAX_PAGES_FOR_MARKERS) {
      console.warn(`Marker fetch stopped at max pages (${MAX_PAGES_FOR_MARKERS}).`);
    }

    setAllMarkers(allResults);
  };

  const performSearch = useCallback(
    async (latitude: number, longitude: number, userLatitude: number, userLongitude: number) => {
      if (!searchQuery.trim()) {
        alert("검색어를 입력해주세요.");
        return;
      }

      setLoading(true);
      setSearchResults([]);
      setAllMarkers([]);
      setError(null);

      try {
        const firstPageData = await searchPlaces(
          searchQuery,
          latitude,
          longitude,
          searchOptions.radius,
          searchOptions.sort,
          1,
          userLatitude,
          userLongitude
        );
        
        const { content, ...pageInfo } = firstPageData;

        setSearchResults(content);
        setPagination(pageInfo);

        if (content.length === 0) {
          alert("검색 결과가 없습니다.");
        } else {
          fetchAndSetAllMarkers(searchQuery, latitude, longitude, searchOptions.radius, searchOptions.sort, content, pageInfo);
        }

      } catch (err: any) {
        setError(err.message || "검색 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, searchOptions]
  );

  const fetchNextPage = useCallback(async (latitude: number, longitude: number, userLatitude: number, userLongitude: number) => {
    if (loadingNextPage || !pagination || pagination.isLast) {
      return;
    }

    setLoadingNextPage(true);
    try {
      const nextPage = pagination.currentPage + 1;
      const resultsData = await searchPlaces(
        searchQuery,
        latitude,
        longitude,
        searchOptions.radius,
        searchOptions.sort,
        nextPage,
        userLatitude,
        userLongitude
      );
      const { content, ...pageInfo } = resultsData;
      // Filter out duplicates based on placeId before adding to searchResults
      const uniqueNewContent = content.filter(
        (newItem) => !searchResults.some((existingItem) => existingItem.placeId === newItem.placeId)
      );
      setSearchResults(prev => [...prev, ...uniqueNewContent]);
      setPagination(pageInfo);
    } catch (err: any) {
      setError(err.message || "다음 페이지 로딩 중 오류가 발생했습니다.");
    } finally {
      setLoadingNextPage(false);
    }
  }, [pagination, loadingNextPage, searchQuery, searchOptions]);

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setAllMarkers([]);
    setPagination(null);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchOptions,
    setSearchOptions,
    searchResults,
    allMarkers,
    loading,
    loadingNextPage,
    error,
    performSearch,
    fetchNextPage,
    clearSearchResults,
    pagination,
  };
};
