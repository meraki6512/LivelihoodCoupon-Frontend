import { Platform } from "react-native";
import WebSharedSearch from "./SharedSearch.web";
import MobileSharedSearch from "./SharedSearch.mobile";
import React from "react";
import { SearchResult, SearchOptions, AutocompleteResponse } from '../../types/search';
import { PageResponse } from '../../types/api';

interface SharedSearchProps {
  isWebView: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (query?: string) => void;
  onClearSearch: () => void;
  searchResults: SearchResult[];
  allMarkers: SearchResult[];
  isLoading: boolean;
  errorMsg?: string | null;
  onSelectResult: (item: SearchResult) => void;
  searchOptions: SearchOptions;
  setSearchOptions: (options: Partial<SearchOptions>) => void;
  loadingNextPage: boolean;
  loadingAllMarkers: boolean;
  markerCountReachedLimit: boolean;
  onNextPage: () => void;
  pagination: Omit<PageResponse<any>, 'content'> | null;

  // from useSharedSearch hook
  activeTab: 'search' | 'route';
  setActiveTab: (tab: 'search' | 'route') => void;
  startLocation: string;
  setStartLocation: (location: string) => void;
  endLocation: string;
  setEndLocation: (location: string) => void;
  startLocationResults: SearchResult[];
  endLocationResults: SearchResult[];
  isSearchingStart: boolean;
  isSearchingEnd: boolean;
  showStartResults: boolean;
  setShowStartResults: (show: boolean) => void;
  showEndResults: boolean;
  setShowEndResults: (show: boolean) => void;
  selectedTransportMode: 'driving' | 'transit' | 'walking' | 'cycling';
  setSelectedTransportMode: (mode: 'driving' | 'transit' | 'walking' | 'cycling') => void;
  autocompleteSuggestions: AutocompleteResponse[];
  showAutocomplete: boolean;
  setShowAutocomplete: (show: boolean) => void;
  debouncedAutocomplete: (query: string) => void;
  debouncedSearchStartLocation: (query: string) => void;
  debouncedSearchEndLocation: (query: string) => void;
  handleTextEdit: () => void;
  startRoute: any;
  isRouteLoading: boolean;
  routeResult: any;
  routeError: string | null;
  clearRoute: () => void;
  searchLocation: { lat: number; lng: number };
  location: { latitude: number; longitude: number } | null;
  startLocationObject: SearchResult | null;
  setStartLocationObject: (loc: SearchResult | null) => void;
  endLocationObject: SearchResult | null;
  setEndLocationObject: (loc: SearchResult | null) => void;
}

const MobileSharedSearch: React.FC<SharedSearchProps> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>SharedSearch Mobile - To be implemented by team member</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default MobileSharedSearch;
