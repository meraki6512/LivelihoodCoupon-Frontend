import { useReducer, useCallback } from "react";
import {
  EXPO_PUBLIC_SEARCH_LIST_PAGE_LIMIT,
  EXPO_PUBLIC_SEARCH_MARKER_PAGE_LIMIT,
  EXPO_PUBLIC_SEARCH_MARKER_TOTAL_LIMIT,
} from "@env";
import { searchPlaces } from "../services/searchApi";
import { SearchResult, SearchOptions } from "../types/search";
import { PageResponse } from "../types/api";
interface SearchState {
  searchQuery: string;
  searchOptions: SearchOptions;
  searchCenter: { lat: number; lng: number } | null;

  listResults: SearchResult[];
  allMapMarkers: SearchResult[];
  pagination: Omit<PageResponse<any>, 'content'> | null;
  
  loading: boolean;
  loadingNextPage: boolean;
  loadingAllMarkers: boolean;
  markerCountReachedLimit: boolean; // 마커 로딩 제한에 도달했는지 여부
  error: string | null;
}

type SearchAction =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_OPTIONS'; payload: Partial<SearchOptions> }
  | { type: 'START_SEARCH' }
  | { type: 'SEARCH_SUCCESS'; payload: PageResponse<SearchResult> & { requestLat: number; requestLng: number; forceLocationSearch: boolean } }
  | { type: 'SEARCH_FAILURE'; payload: string }
  | { type: 'START_NEXT_PAGE' }
  | { type: 'NEXT_PAGE_SUCCESS'; payload: PageResponse<SearchResult> }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'START_ALL_MARKERS_LOAD' }
  | { type: 'APPEND_MARKERS'; payload: SearchResult[] }
  | { type: 'FINISH_ALL_MARKERS_LOAD'; payload: { limitReached: boolean } };

// --- 2. 초기 상태 및 리듀서 ---

const initialState: SearchState = {
  searchQuery: "",
  searchOptions: { radius: 1, sort: 'distance' },
  searchCenter: null,
  listResults: [],
  allMapMarkers: [],
  pagination: null,
  loading: false,
  loadingNextPage: false,
  loadingAllMarkers: false,
  markerCountReachedLimit: false,
  error: null,
};

const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SEARCH_OPTIONS':
      return { ...state, searchOptions: { ...state.searchOptions, ...action.payload } };

    case 'START_SEARCH':
      return {
        ...state,
        loading: true,
        error: null,
        listResults: [],
        allMapMarkers: [],
        pagination: null,
        searchCenter: null,
        markerCountReachedLimit: false, // 검색 시작 시 리셋
      };

    case 'SEARCH_SUCCESS':
      const { content, searchCenterLat, searchCenterLng, requestLat, requestLng, forceLocationSearch, ...pageInfo } = action.payload;
      console.log("SEARCH_SUCCESS payload:", action.payload);
      console.log("searchCenterLat from API:", searchCenterLat);
      console.log("searchCenterLng from API:", searchCenterLng);

      let newSearchCenter: { lat: number; lng: number } | null = null;
      if (forceLocationSearch) {
        newSearchCenter = { lat: requestLat, lng: requestLng };
      } else if (searchCenterLat && searchCenterLng) {
        newSearchCenter = { lat: searchCenterLat, lng: searchCenterLng };
      } else {
        newSearchCenter = state.searchCenter; // Fallback to current searchCenter if no new info
      }

      return {
        ...state,
        loading: false,
        listResults: content,
        allMapMarkers: content,
        pagination: pageInfo,
        searchCenter: newSearchCenter,
      };

    case 'SEARCH_FAILURE':
      return { ...state, loading: false, loadingAllMarkers: false, error: action.payload };

    case 'START_NEXT_PAGE':
      return { ...state, loadingNextPage: true };

    case 'NEXT_PAGE_SUCCESS':
      const { content: newContent, ...newPageInfo } = action.payload;
      const uniqueNewContent = newContent.filter(
        (newItem) => !state.listResults.some((existingItem) => existingItem.placeId === newItem.placeId)
      );
      return {
        ...state,
        loadingNextPage: false,
        listResults: [...state.listResults, ...uniqueNewContent],
        pagination: state.pagination ? {
          ...state.pagination,
          currentPage: newPageInfo.currentPage,
          isLast: newPageInfo.isLast,
        } : newPageInfo,
      };

    case 'CLEAR_SEARCH':
      return { ...state, listResults: [], allMapMarkers: [], pagination: null, searchCenter: null, markerCountReachedLimit: false };

    case 'START_ALL_MARKERS_LOAD':
      return { ...state, loadingAllMarkers: true };

    case 'APPEND_MARKERS':
      const uniqueNewMarkers = action.payload.filter(
        (newItem) => !state.allMapMarkers.some((existingItem) => existingItem.placeId === newItem.placeId)
      );
      return {
        ...state,
        allMapMarkers: [...state.allMapMarkers, ...uniqueNewMarkers],
      };
    
    case 'FINISH_ALL_MARKERS_LOAD':
      return { 
        ...state, 
        loadingAllMarkers: false,
        markerCountReachedLimit: action.payload.limitReached,
      };

    default:
      return state;
  }
};

// --- 3. 커스텀 훅 ---

export const useSearch = () => {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setSearchOptions = (options: Partial<SearchOptions>) => {
    dispatch({ type: 'SET_SEARCH_OPTIONS', payload: options });
  };

  const performSearch = useCallback(async (latitude: number, longitude: number, userLatitude: number, userLongitude: number, overrideForceLocationSearch?: boolean, query?: string) => {
    const searchQuery = query ?? state.searchQuery;
    if (!searchQuery.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    dispatch({ type: 'START_SEARCH' });
    try {
      const effectiveForceLocationSearch = overrideForceLocationSearch !== undefined
        ? overrideForceLocationSearch
        : state.searchOptions.forceLocationSearch;

      const search = async (radius: number) => {
        return await searchPlaces(
          searchQuery,
          latitude,
          longitude,
          radius, // Use provided radius
          state.searchOptions.sort,
          1,
          userLatitude,
          userLongitude,
          effectiveForceLocationSearch
        );
      };

      let finalSearchData = null;

      // 1. Try 1km
      finalSearchData = await search(1);
      if (finalSearchData.content.length > 0) {
        dispatch({ type: 'SEARCH_SUCCESS', payload: { ...finalSearchData, requestLat: latitude, requestLng: longitude, forceLocationSearch: effectiveForceLocationSearch || false } });
        return;
      }

      // 2. Try 10km
      finalSearchData = await search(10);
      if (finalSearchData.content.length > 0) {
        dispatch({ type: 'SEARCH_SUCCESS', payload: { ...finalSearchData, requestLat: latitude, requestLng: longitude, forceLocationSearch: effectiveForceLocationSearch || false } });
        return;
      }

      // 2.5. Try 50km
      finalSearchData = await search(50);
      if (finalSearchData.content.length > 0) {
        dispatch({ type: 'SEARCH_SUCCESS', payload: { ...finalSearchData, requestLat: latitude, requestLng: longitude, forceLocationSearch: effectiveForceLocationSearch || false } });
        return;
      }

      // 3. Try 100km
      finalSearchData = await search(100);
      if (finalSearchData.content.length > 0) {
        dispatch({ type: 'SEARCH_SUCCESS', payload: { ...finalSearchData, requestLat: latitude, requestLng: longitude, forceLocationSearch: effectiveForceLocationSearch || false } });
        return;
      }

      // 4. No results up to 100km, try 1000km automatically
      finalSearchData = await search(1000);
      if (finalSearchData.content.length === 0) {
        alert("검색 결과가 없습니다.");
      }
      dispatch({ type: 'SEARCH_SUCCESS', payload: { ...finalSearchData, requestLat: latitude, requestLng: longitude, forceLocationSearch: effectiveForceLocationSearch || false } });

    } catch (err: any) {
      dispatch({ type: 'SEARCH_FAILURE', payload: err.message || "검색 중 오류가 발생했습니다." });
    }
  }, [state.searchQuery, state.searchOptions]);

        const fetchNextPage = useCallback(async (latitude: number, longitude: number, userLatitude: number, userLongitude: number) => {
          const listPageLimit = Number(EXPO_PUBLIC_SEARCH_LIST_PAGE_LIMIT) || 10;
          if (state.loadingNextPage || !state.pagination || state.pagination.isLast || state.pagination.currentPage >= listPageLimit) return;
          dispatch({ type: 'START_NEXT_PAGE' });
          try {
            const nextPage = state.pagination.currentPage + 1;
            const resultsData = await searchPlaces(state.searchQuery, latitude, longitude, state.searchOptions.radius, state.searchOptions.sort, nextPage, userLatitude, userLongitude, state.searchOptions.forceLocationSearch);
            dispatch({ type: 'NEXT_PAGE_SUCCESS', payload: resultsData });
          } catch (err: any) {
            console.error("다음 페이지 로딩 중 오류:", err);
            dispatch({ type: 'SEARCH_FAILURE', payload: err.message || "다음 페이지 로딩 중 오류가 발생했습니다." });
          }
        }, [state.pagination, state.loadingNextPage, state.searchQuery, state.searchOptions]); // Add initialSearchCoordinates to dependencies

        const fetchAllMarkers = useCallback(async (latitude: number, longitude: number, userLatitude: number, userLongitude: number) => {
          if (!state.pagination || state.loadingAllMarkers || state.pagination.isLast) {
            return;
          }

          const markerPageLimit = Number(EXPO_PUBLIC_SEARCH_MARKER_PAGE_LIMIT) || 10;
          const markerTotalLimit = Number(EXPO_PUBLIC_SEARCH_MARKER_TOTAL_LIMIT) || 100;
          const startPage = state.pagination.currentPage + 1;
          let allNewMarkers: SearchResult[] = [];
          let limitReached = false;
    try {
      // 순차적으로 페이지를 가져오도록 변경 (동시 호출 대신)
      for (let i = 0; i < markerPageLimit; i++) {
        const pageNum = startPage + i;

        try {
          const pageData = await searchPlaces(
            state.searchQuery,
            latitude,
            longitude,
            state.searchOptions.radius,
            state.searchOptions.sort,
            pageNum,
            userLatitude,
            userLongitude,
            state.searchOptions.forceLocationSearch
          );

          allNewMarkers = [...allNewMarkers, ...pageData.content];

          // 마지막 페이지이면 중단
          if (pageData.isLast) {
            limitReached = false; // 자연스러운 끝
            break;
          }

          // 너무 많은 마커가 쌓이면 중단 (성능 고려)
          if (allNewMarkers.length > markerTotalLimit) {
            limitReached = true;
            break;
          }
        } catch (pageError) {
          console.error(`Failed to fetch page ${pageNum}:`, pageError);
          // 개별 페이지 에러 시 중단하지 않고 계속 진행
          continue;
        }
      }

      // Dispatch the new markers
      if (allNewMarkers.length > 0) {
        dispatch({ type: 'APPEND_MARKERS', payload: allNewMarkers });
      }

      dispatch({ type: 'FINISH_ALL_MARKERS_LOAD', payload: { limitReached } });
    } catch (error) {
      console.error("Error fetching all markers:", error);
      dispatch({ type: 'FINISH_ALL_MARKERS_LOAD', payload: { limitReached: true } });
    }
  }, [state.pagination, state.searchQuery, state.searchOptions, state.loadingAllMarkers]);

  const clearSearchResults = () => {
    dispatch({ type: 'CLEAR_SEARCH' });
  };

  console.log("useSearch hook returning state. searchCenter:", state.searchCenter);

  return {
    searchQuery: state.searchQuery,
    setSearchQuery,
    searchOptions: state.searchOptions,
    setSearchOptions,
    searchResults: state.listResults,
    allMarkers: state.allMapMarkers,
    loading: state.loading,
    loadingNextPage: state.loadingNextPage,
    loadingAllMarkers: state.loadingAllMarkers,
    markerCountReachedLimit: state.markerCountReachedLimit,
    error: state.error,
    performSearch,
    fetchNextPage,
    fetchAllMarkers,
    clearSearchResults,
    searchCenter: state.searchCenter,
    pagination: state.pagination,
  };
};
