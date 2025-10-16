import { Platform } from "react-native";
import { useSearch as useSearchWeb } from "./useSearch.web";
import { useSearch as useSearchMobile } from "./useSearch.mobile";
import { SearchResult, SearchOptions } from "../types/search";
import { PageResponse } from "../types/api";

export const useSearch = (): {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchOptions: SearchOptions;
    setSearchOptions: (options: Partial<SearchOptions>) => void;
    searchResults: SearchResult[];
    allMarkers: SearchResult[];
    loading: boolean;
    loadingNextPage: boolean;
    loadingAllMarkers: boolean;
    markerCountReachedLimit: boolean;
    error: string | null;
    performSearch: (latitude: number, longitude: number, userLatitude: number, userLongitude: number) => Promise<void>;
    performSearchWithQuery: (query: string, latitude: number, longitude: number, userLatitude: number, userLongitude: number) => Promise<void>;
    fetchNextPage: (latitude: number, longitude: number, userLatitude: number, userLongitude: number) => Promise<void>;
    fetchAllMarkers: (latitude: number, longitude: number, userLatitude: number, userLongitude: number) => Promise<void>;
    clearSearchResults: () => void;
    pagination: Omit<PageResponse<any>, 'content'> | null;
} => {
    const webHook = useSearchWeb();
    const mobileHook = useSearchMobile();
    
    return Platform.OS === "web" ? webHook : mobileHook;
};
