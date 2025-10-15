import { useReducer, useCallback } from "react";
import { searchPlaces } from "../services/searchApi";
import { SearchResult, SearchOptions } from "../types/search";
import { PageResponse } from "../types/api";
interface SearchState {
  searchQuery: string;
  searchOptions: SearchOptions;
  
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
  | { type: 'SEARCH_SUCCESS'; payload: PageResponse<SearchResult> }
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
  searchOptions: { radius: 1000, sort: 'accuracy' }, // 기본값을 정확순으로 설정
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
        markerCountReachedLimit: false, // 검색 시작 시 리셋
      };

    case 'SEARCH_SUCCESS':
      const { content, ...pageInfo } = action.payload;
      return {
        ...state,
        loading: false,
        listResults: content,
        allMapMarkers: content,
        pagination: pageInfo,
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
      return { 
        ...state, 
        searchQuery: '', 
        listResults: [], 
        allMapMarkers: [], 
        pagination: null, 
        markerCountReachedLimit: false 
      };

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

  const performSearch = useCallback(async (latitude: number, longitude: number, userLatitude: number, userLongitude: number) => {
    if (!state.searchQuery.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    dispatch({ type: 'START_SEARCH' });
    try {
      const firstPageData = await searchPlaces(state.searchQuery, latitude, longitude, state.searchOptions.radius, state.searchOptions.sort, 1, userLatitude, userLongitude);
      // 검색 결과가 없어도 성공으로 처리 (오류가 아님)
      dispatch({ type: 'SEARCH_SUCCESS', payload: firstPageData });
    } catch (err: any) {
      console.error('Search error:', err);
      dispatch({ type: 'SEARCH_FAILURE', payload: err.message || "검색 중 오류가 발생했습니다." });
    }
  }, [state.searchQuery, state.searchOptions]);

  // 검색어를 직접 전달하는 검색 함수
  const performSearchWithQuery = useCallback(async (query: string, latitude: number, longitude: number, userLatitude: number, userLongitude: number) => {
    // performSearchWithQuery 호출
    
    if (!query.trim()) {
      return;
    }
    
    dispatch({ type: 'START_SEARCH' });
    
    try {
      
      const firstPageData = await searchPlaces(query, latitude, longitude, state.searchOptions.radius, state.searchOptions.sort, 1, userLatitude, userLongitude);
      
      // 검색 결과가 없어도 성공으로 처리 (오류가 아님)
      dispatch({ type: 'SEARCH_SUCCESS', payload: firstPageData });
    } catch (err: any) {
      // Search error
      dispatch({ type: 'SEARCH_FAILURE', payload: err.message || "검색 중 오류가 발생했습니다." });
    }
  }, [state.searchOptions]);

        const fetchNextPage = useCallback(async (latitude: number, longitude: number, userLatitude: number, userLongitude: number) => {
          if (state.loadingNextPage || !state.pagination || state.pagination.isLast || state.pagination.currentPage >= 10) return;
          dispatch({ type: 'START_NEXT_PAGE' });
          try {
            const nextPage = state.pagination.currentPage + 1;
            const resultsData = await searchPlaces(state.searchQuery, latitude, longitude, state.searchOptions.radius, state.searchOptions.sort, nextPage, userLatitude, userLongitude);
            dispatch({ type: 'NEXT_PAGE_SUCCESS', payload: resultsData });
          } catch (err: any) {
            // 다음 페이지 로딩 중 오류
            dispatch({ type: 'SEARCH_FAILURE', payload: err.message || "다음 페이지 로딩 중 오류가 발생했습니다." });
          }
        }, [state.pagination, state.loadingNextPage, state.searchQuery, state.searchOptions]);
      
        const fetchAllMarkers = useCallback(async (latitude: number, longitude: number, userLatitude: number, userLongitude: number) => {
          if (!state.pagination || state.loadingAllMarkers || state.pagination.isLast) {
            return;
          }
          
          dispatch({ type: 'START_ALL_MARKERS_LOAD' });
      
          const MAX_PAGES_FOR_MARKERS = 10;
          const startPage = state.pagination.currentPage + 1;
          let allNewMarkers: SearchResult[] = [];
          let limitReached = false;
    try {
      // 순차적으로 페이지를 가져오도록 변경 (동시 호출 대신)
      for (let i = 0; i < MAX_PAGES_FOR_MARKERS; i++) {
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
            userLongitude
          );
          
          allNewMarkers = [...allNewMarkers, ...pageData.content];
          
          // 마지막 페이지이면 중단
          if (pageData.isLast) {
            limitReached = false; // 자연스러운 끝
            break;
          }
          
          // 너무 많은 마커가 쌓이면 중단 (성능 고려)
          if (allNewMarkers.length > 400) {
            limitReached = true;
            break;
          }
        } catch (pageError) {
          // Failed to fetch page
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
      // Error fetching all markers
      dispatch({ type: 'FINISH_ALL_MARKERS_LOAD', payload: { limitReached: true } });
    }
  }, [state.pagination, state.searchQuery, state.searchOptions, state.loadingAllMarkers]);

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
    pagination: state.pagination,
  };
};