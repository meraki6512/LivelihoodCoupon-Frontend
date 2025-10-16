import { useReducer, useCallback } from "react";
import {
  EXPO_PUBLIC_SEARCH_LIST_PAGE_LIMIT,
  EXPO_PUBLIC_SEARCH_MARKER_PAGE_LIMIT,
  EXPO_PUBLIC_SEARCH_MARKER_TOTAL_LIMIT,
} from "@env";
import { searchPlaces } from "../services/searchApi";
import { SearchResult, SearchOptions } from "../types/search";
import { PageResponse } from "../types/api";

type CachedResult = {
  listResults: SearchResult[];
  allMapMarkers: SearchResult[];
  pagination: Omit<PageResponse<any>, 'content'> | null;
  searchCenter: { lat: number; lng: number } | null;
  markerCountReachedLimit: boolean;
};

interface SearchState {
  searchQuery: string;
  searchOptions: SearchOptions;
  searchCenter: { lat: number; lng: number } | null;

  listResults: SearchResult[];
  allMapMarkers: SearchResult[];
  pagination: Omit<PageResponse<any>, 'content'> | null;
  
  currentSearchCache: Partial<Record<'distance' | 'accuracy', CachedResult>>;

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
  | { type: 'FINISH_ALL_MARKERS_LOAD'; payload: { limitReached: boolean } }
  | { type: 'SET_CACHED_RESULTS'; payload: CachedResult };

// --- 2. 초기 상태 및 리듀서 ---

const initialState: SearchState = {
  searchQuery: "",
  searchOptions: { radius: 1, sort: 'distance' },
  searchCenter: null,
  listResults: [],
  allMapMarkers: [],
  pagination: null,
  currentSearchCache: {},
  loading: false,
  loadingNextPage: false,
  loadingAllMarkers: false,
  markerCountReachedLimit: false,
  error: null,
};

const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      if (action.payload !== state.searchQuery) {
        return { ...state, searchQuery: action.payload, currentSearchCache: {} };
      }
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
      const { content, requestLat, requestLng, forceLocationSearch, ...pageInfo } = action.payload;

      const newSearchCenter = { lat: requestLat, lng: requestLng };
      
      const newResult: CachedResult = {
        listResults: content,
        allMapMarkers: content,
        pagination: pageInfo,
        searchCenter: newSearchCenter,
        markerCountReachedLimit: state.markerCountReachedLimit,
      };

      return {
        ...state,
        loading: false,
        listResults: content,
        allMapMarkers: content,
        pagination: pageInfo,
        searchCenter: newSearchCenter,
        currentSearchCache: {
          ...state.currentSearchCache,
          [state.searchOptions.sort]: newResult,
        },
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
      return { ...state, listResults: [], allMapMarkers: [], pagination: null, searchCenter: null, markerCountReachedLimit: false, currentSearchCache: {} };

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
    
    case 'SET_CACHED_RESULTS':
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null,
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

  const performSearch = useCallback(async (latitude: number, longitude: number, userLatitude: number, userLongitude: number, overrideForceLocationSearch?: boolean, query?: string, useCache: boolean = true) => {
    const searchQuery = query ?? state.searchQuery;
    if (!searchQuery.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    if (useCache) {
    const cached = state.currentSearchCache[state.searchOptions.sort];
    if (cached) {
      dispatch({ type: 'SET_CACHED_RESULTS', payload: cached });
      return;
    }
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

      let finalSearchData: (PageResponse<SearchResult> & { requestLat: number; requestLng: number; forceLocationSearch: boolean }) | null = null;
      let effectiveRadiusForSearch = state.searchOptions.radius; // Keep track of the radius that yielded results

      const radiiToTry = state.searchOptions.sort === 'accuracy' ? [1000] : [1, 10, 50, 100, 1000];

      for (const r of radiiToTry) {
        const currentSearchRadius = state.searchOptions.sort === 'accuracy' ? 1000 : r;
        const searchResult = await search(currentSearchRadius);
        if (searchResult.content.length > 0) {
          finalSearchData = { ...searchResult, requestLat: latitude, requestLng: longitude, forceLocationSearch: effectiveForceLocationSearch || false };
          effectiveRadiusForSearch = currentSearchRadius; // Store the radius that found results
          break;
        }
      }

      if (!finalSearchData) {
        // If no results found even after trying all radii, perform a final search with 1000km
        // This also covers the case where 'accuracy' sort found no results in its single 1000km attempt
        const searchResult = await search(1000);
        finalSearchData = { ...searchResult, requestLat: latitude, requestLng: longitude, forceLocationSearch: effectiveForceLocationSearch || false };
        effectiveRadiusForSearch = 1000;
        if (finalSearchData.content.length === 0) {
          alert("검색 결과가 없습니다.");
        }
      }

      // Update searchOptions with the effective radius that found results
      // This is crucial for fetchNextPage to use the correct radius
      dispatch({ type: 'SET_SEARCH_OPTIONS', payload: { radius: effectiveRadiusForSearch } });
      dispatch({ type: 'SEARCH_SUCCESS', payload: finalSearchData });

    } catch (err: any) {
      dispatch({ type: 'SEARCH_FAILURE', payload: err.message || "검색 중 오류가 발생했습니다." });
    }
  }, [state.searchQuery, state.searchOptions, state.currentSearchCache]);

    const fetchNextPage = useCallback(async (userLatitude: number, userLongitude: number) => {
          const listPageLimit = Number(EXPO_PUBLIC_SEARCH_LIST_PAGE_LIMIT) || 10;
        if (state.loadingNextPage || !state.pagination || state.pagination.isLast || !state.searchCenter || state.pagination.currentPage >= listPageLimit) return;
        dispatch({ type: 'START_NEXT_PAGE' });
          try {
            const nextPage = state.pagination.currentPage + 1;
              const { lat, lng } = state.searchCenter;
              const resultsData = await searchPlaces(state.searchQuery, lat, lng, state.searchOptions.radius, state.searchOptions.sort, nextPage, userLatitude, userLongitude, state.searchOptions.forceLocationSearch);
            dispatch({ type: 'NEXT_PAGE_SUCCESS', payload: resultsData });
          } catch (err: any) {
            console.error("다음 페이지 로딩 중 오류:", err);
            dispatch({ type: 'SEARCH_FAILURE', payload: err.message || "다음 페이지 로딩 중 오류가 발생했습니다." });
          }
    }, [state.pagination, state.loadingNextPage, state.searchQuery, state.searchOptions, state.searchCenter]);

    const fetchAllMarkers = useCallback(async (userLatitude: number, userLongitude: number) => {
          if (!state.pagination || state.loadingAllMarkers || state.pagination.isLast || !state.searchCenter) {
            return;
          }

        const { lat, lng } = state.searchCenter;

          const markerPageLimit = Number(EXPO_PUBLIC_SEARCH_MARKER_PAGE_LIMIT) || 10;
        const markerTotalLimit = Number(EXPO_PUBLIC_SEARCH_MARKER_TOTAL_LIMIT) || 1000;
        const startPage = state.pagination.currentPage + 1;
          let allNewMarkers: SearchResult[] = [];
          let limitReached = false;
    try {
      for (let i = 0; i < markerPageLimit; i++) {
        const pageNum = startPage + i;

        try {
          const pageData = await searchPlaces(
            state.searchQuery,
            lat,
            lng,
            state.searchOptions.radius,
            state.searchOptions.sort,
            pageNum,
            userLatitude,
            userLongitude,
            state.searchOptions.forceLocationSearch
          );

          allNewMarkers = [...allNewMarkers, ...pageData.content];

          if (pageData.isLast) {
            limitReached = false;
            break;
          }

          if (allNewMarkers.length > markerTotalLimit) {
            limitReached = true;
            break;
          }
        } catch (pageError) {
          console.error(`Failed to fetch page ${pageNum}:`, pageError);
          continue;
        }
      }

      if (allNewMarkers.length > 0) {
        dispatch({ type: 'APPEND_MARKERS', payload: allNewMarkers });
      }

      dispatch({ type: 'FINISH_ALL_MARKERS_LOAD', payload: { limitReached } });
    } catch (error) {
      console.error("Error fetching all markers:", error);
      dispatch({ type: 'FINISH_ALL_MARKERS_LOAD', payload: { limitReached: true } });
    }
    }, [state.pagination, state.searchQuery, state.searchOptions, state.loadingAllMarkers, state.searchCenter]);

  const performSearchWithQuery = useCallback(async (query: string, latitude: number, longitude: number, userLatitude: number, userLongitude: number) => {
    if (!query.trim()) {
      return;
    }
    
    // This function starts a new search, so we don't check cache here.
    // The reducer for SET_SEARCH_QUERY will clear the cache.
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    dispatch({ type: 'START_SEARCH' });

    try {
      const search = async (radius: number) => {
        return await searchPlaces(
          query,
          latitude,
          longitude,
          radius,
          state.searchOptions.sort,
          1,
          userLatitude,
          userLongitude,
          state.searchOptions.forceLocationSearch
        );
      };

      let finalSearchData: (PageResponse<SearchResult> & { requestLat: number; requestLng: number; forceLocationSearch: boolean }) | null = null;
      let effectiveRadiusForSearch = state.searchOptions.radius; // Keep track of the radius that yielded results

      const radiiToTry = state.searchOptions.sort === 'accuracy' ? [1000] : [1, 10, 50, 100, 1000];

      for (const r of radiiToTry) {
        const currentSearchRadius = state.searchOptions.sort === 'accuracy' ? 1000 : r;
        const searchResult = await search(currentSearchRadius);
        if (searchResult.content.length > 0) {
          finalSearchData = { ...searchResult, requestLat: latitude, requestLng: longitude, forceLocationSearch: state.searchOptions.forceLocationSearch || false };
          effectiveRadiusForSearch = currentSearchRadius; // Store the radius that found results
          break;
        }
      }

      if (!finalSearchData) {
        // If no results found even after trying all radii, perform a final search with 1000km
        const searchResult = await search(1000);
        finalSearchData = { ...searchResult, requestLat: latitude, requestLng: longitude, forceLocationSearch: state.searchOptions.forceLocationSearch || false };
        effectiveRadiusForSearch = 1000;
        if (finalSearchData.content.length === 0) {
          alert("검색 결과가 없습니다.");
        }
      }

      // Update searchOptions with the effective radius that found results
      // This is crucial for fetchNextPage to use the correct radius
      dispatch({ type: 'SET_SEARCH_OPTIONS', payload: { radius: effectiveRadiusForSearch } });
      dispatch({ type: 'SEARCH_SUCCESS', payload: finalSearchData });

    } catch (err: any) {
      console.error('Search error:', err);
      dispatch({ type: 'SEARCH_FAILURE', payload: err.message || "검색 중 오류가 발생했습니다." });
    }
  }, [state.searchOptions]);

  const clearSearchResults = () => {
    dispatch({ type: 'CLEAR_SEARCH' });
  };


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
    performSearchWithQuery,
    fetchNextPage,
    fetchAllMarkers,
    clearSearchResults,
    searchCenter: state.searchCenter,
    pagination: state.pagination,
  };
};