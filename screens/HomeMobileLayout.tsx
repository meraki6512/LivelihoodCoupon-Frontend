import { Platform } from "react-native";
import WebHomeMobileLayout from "./HomeMobileLayout.web";
import MobileHomeMobileLayout from "./HomeMobileLayout.mobile";
import React from "react";
import { SearchResult, SearchOptions } from "../types/search";
import { PageResponse } from "../types/api";
import { RouteResult } from "../types/route";

interface HomeMobileLayoutProps {
  // Props for HomeMobileLayout
  selectedPlaceId: string | null;
  setSelectedPlaceId: (id: string | null) => void;
  showInfoWindow: boolean;
  setShowInfoWindow: (show: boolean) => void;
  selectedMarkerPosition: { lat: number; lng: number } | null;
  setSelectedMarkerPosition: (position: { lat: number; lng: number } | null) => void;
  location: { latitude: number; longitude: number } | null;
  mapCenter: { latitude: number; longitude: number } | null;
  setMapCenter: (center: { latitude: number; longitude: number } | null) => void;
  onMapIdle: (lat: number, lng: number) => void;
  markers: any[]; // Adjust type as needed
  bottomSheetOpen: boolean;
  setBottomSheetOpen: (isOpen: boolean) => void;
  bottomSheetHeight: number;
  setBottomSheetHeight: (height: number) => void;
  showPlaceDetail: boolean;
  setShowPlaceDetail: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  allMarkers: SearchResult[];
  isLoading: boolean;
  errorMsg: string | null;
  onSearch: () => Promise<void>;
  onSelectResult: (item: SearchResult) => void;
  onMarkerPress: (placeId: string, lat?: number, lng?: number) => void;
  searchOptions: SearchOptions;
  setSearchOptions: (options: Partial<SearchOptions>) => void;
  loadingNextPage: boolean;
  loadingAllMarkers: boolean;
  markerCountReachedLimit: boolean;
  onNextPage: () => Promise<void>;
  pagination: Omit<PageResponse<any>, 'content'> | null;
  onSetRouteLocation?: (type: 'departure' | 'arrival', placeInfo: SearchResult) => void;
  onOpenSidebar?: () => void;
  routeResult?: RouteResult | null;
  isRouteLoading?: boolean;
  routeError?: string | null;
  startRoute?: any;
  clearRoute?: () => void;
  showSearchInAreaButton: boolean;
  handleSearchInArea: (currentMapCenter?: { latitude: number; longitude: number }, selectedCategory?: string) => void;
  handleCategorySearch: (categoryName: string) => Promise<void>;
  searchCenter?: { latitude: number; longitude: number } | null;
  setSearchCenter: (center: { latitude: number; longitude: number } | null) => void;
  clearSearchResults: () => void;
  locationError?: string | null;
}

const HomeMobileLayout: React.FC<HomeMobileLayoutProps> = (props) => {
  if (Platform.OS === "web") {
    return <WebHomeMobileLayout {...props} />;
  }
  return <MobileHomeMobileLayout {...props} />;
};

export default HomeMobileLayout;