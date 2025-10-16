import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity, // Add this import
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'; // Change this import
import { Ionicons } from '@expo/vector-icons'; // Add this import
import KakaoMap from "../components/KakaoMap";
import Header from "../components/layout/Header";
import { SearchResult, SearchOptions } from "../types/search";
import { PageResponse } from "../types/api";
import { RouteResult } from "../types/route";
import { mobileStyles } from "./HomeMobileLayout.styles";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeMobileLayoutProps {
  // Props for HomeMobileLayout
  selectedPlaceId: string | null;
  setSelectedPlaceId: (id: string | null) => void;
  showInfoWindow: boolean;
  setShowInfoWindow: (show: boolean) => void;
  selectedMarkerPosition: { lat: number; lng: number } | null;
  location: { latitude: number; longitude: number } | null;
  mapCenter: { latitude: number; longitude: number } | null;
  setMapCenter: (center: { latitude: number; longitude: number }) => void;
  onMapIdle: (lat: number, lng: number) => void;
  markers: any[]; // Adjust type as needed
  bottomSheetOpen: boolean;
  setBottomSheetOpen: (isOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  allMarkers: SearchResult[];
  isLoading: boolean;
  errorMsg: string | null;
  onSearch: () => Promise<void>;
  onClearSearch: () => void; // New prop
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
  routeResult: RouteResult | null;
  isRouteLoading: boolean;
  routeError: string | null;
  startRoute: any;
  clearRoute: () => void;
  showSearchInAreaButton: boolean;
  handleSearchInArea: () => void;
  activeTab: 'search' | 'route'; // Add activeTab here
  setActiveTab: (tab: 'search' | 'route') => void; // Add activeTab here
  // New props from useSharedSearch
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
  autocompleteSuggestions: any[];
  showAutocomplete: boolean;
  setShowAutocomplete: (show: boolean) => void;
  debouncedAutocomplete: (query: string) => void;
  debouncedSearchStartLocation: (query: string) => void;
  debouncedSearchEndLocation: (query: string) => void;
  handleTextEdit: () => void;
  searchLocation: { lat: number; lng: number };
  sharedSearchLocationFromHook: { latitude: number; longitude: number } | null;
  startLocationObject: SearchResult | null;
  setStartLocationObject: (loc: SearchResult | null) => void;
  endLocationObject: SearchResult | null;
  setEndLocationObject: (loc: SearchResult | null) => void;
}

const WebHomeMobileLayout: React.FC<HomeMobileLayoutProps> = ({
  selectedPlaceId,
  setSelectedPlaceId,
  showInfoWindow,
  setShowInfoWindow,
  selectedMarkerPosition,
  location,
  mapCenter,
  setMapCenter,
  onMapIdle,
  markers,
  bottomSheetOpen,
  setBottomSheetOpen,
  searchQuery,
  setSearchQuery,
  searchResults,
  allMarkers,
  isLoading,
  errorMsg,
  onSearch,
  onClearSearch,
  onSelectResult,
  onMarkerPress,
  searchOptions,
  setSearchOptions,
  loadingNextPage,
  loadingAllMarkers,
  markerCountReachedLimit,
  onNextPage,
  pagination,
  onSetRouteLocation,
  onOpenSidebar,
  routeResult,
  isRouteLoading,
  routeError,
  startRoute,
  clearRoute,
  showSearchInAreaButton,
  handleSearchInArea,
  activeTab,
  setActiveTab,
  // New props from useSharedSearch
  startLocation,
  setStartLocation,
  endLocation,
  setEndLocation,
  startLocationResults,
  endLocationResults,
  isSearchingStart,
  isSearchingEnd,
  showStartResults,
  setShowStartResults,
  showEndResults,
  setShowEndResults,
  selectedTransportMode,
  setSelectedTransportMode,
  autocompleteSuggestions,
  showAutocomplete,
  setShowAutocomplete,
  debouncedAutocomplete,
  debouncedSearchStartLocation,
  debouncedSearchEndLocation,
  handleTextEdit,
  searchLocation,
  sharedSearchLocationFromHook,
  startLocationObject,
  setStartLocationObject,
  endLocationObject,
  setEndLocationObject,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={mobileStyles.safeAreaContainer}>
      <Header />
      {errorMsg && (
        <View style={mobileStyles.errorContainer}>
          <Text style={mobileStyles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {bottomSheetOpen && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: insets.bottom, backgroundColor: 'white', zIndex: 9 }} />
      )}

      {mapCenter ? (
        <>
          <KakaoMap
            latitude={mapCenter.latitude}
            longitude={mapCenter.longitude}
            style={mobileStyles.mapFullScreen}
            markers={markers}
            routeResult={routeResult}
            onMapIdle={onMapIdle}
            onMarkerPress={(id, lat, lng) => id && onMarkerPress(id, lat, lng)}
            showInfoWindow={showInfoWindow}
            selectedPlaceId={selectedPlaceId || undefined}
            selectedMarkerLat={selectedMarkerPosition?.lat}
            selectedMarkerLng={selectedMarkerPosition?.lng}
            onCloseInfoWindow={() => setShowInfoWindow(false)}
            onSetRouteLocation={onSetRouteLocation}
          />
          {showSearchInAreaButton && (
            <TouchableOpacity
              style={mobileStyles.searchInAreaButton}
              onPress={handleSearchInArea}
            >
              <Text style={mobileStyles.searchInAreaButtonText}>현재 지도에서 검색</Text>
            </TouchableOpacity>
          )}
          {location && (
            <TouchableOpacity 
              style={mobileStyles.currentLocationButton}
              onPress={() => setMapCenter({ latitude: location.latitude, longitude: location.longitude })}>
              <Ionicons name="locate" size={24} color="#000" />
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={mobileStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>지도를 불러오는 중입니다...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default WebHomeMobileLayout;