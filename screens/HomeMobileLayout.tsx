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
import CustomBottomSheet from "../components/search/CustomBottomSheet";
import { SearchResult, SearchOptions } from "../types/search";
import { PageResponse } from "../types/api";
import { styles as mobileStyles } from "./Home.styles";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeMobileLayoutProps {
  selectedPlaceId: string | null;
  setSelectedPlaceId: (id: string | null) => void;
  showInfoWindow: boolean;
  setShowInfoWindow: (show: boolean) => void;
  selectedMarkerPosition: { lat: number; lng: number } | null;
  location: { latitude: number; longitude: number } | null;
  mapCenter: { latitude: number; longitude: number } | null;
  setMapCenter: (center: { latitude: number; longitude: number }) => void;
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
  onSearchNearMe: () => Promise<void>; // Add this prop
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
}

const HomeMobileLayout: React.FC<HomeMobileLayoutProps> = ({
  selectedPlaceId,
  setSelectedPlaceId,
  showInfoWindow,
  setShowInfoWindow,
  selectedMarkerPosition,
  location,
  mapCenter,
  setMapCenter,
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
  onSearchNearMe, // Destructure the new prop
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

      <CustomBottomSheet
        isOpen={bottomSheetOpen}
        onToggle={() => setBottomSheetOpen(!bottomSheetOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={onSearch}
        onSearchNearMe={onSearchNearMe} // Pass the new prop
        searchResults={searchResults}
        allMarkers={allMarkers}
        isLoading={isLoading}
        errorMsg={errorMsg}
        onSelectResult={onSelectResult}
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
        loadingNextPage={loadingNextPage}
        loadingAllMarkers={loadingAllMarkers}
        markerCountReachedLimit={markerCountReachedLimit}
        onNextPage={onNextPage}
        pagination={pagination}
        onSetRouteLocation={onSetRouteLocation}
      />

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
            onMapCenterChange={(lat, lng) =>
              setMapCenter({ latitude: lat, longitude: lng })
            }
            onMarkerPress={(id, lat, lng) => id && onMarkerPress(id, lat, lng)}
            showInfoWindow={showInfoWindow}
            selectedPlaceId={selectedPlaceId || undefined}
            selectedMarkerLat={selectedMarkerPosition?.lat}
            selectedMarkerLng={selectedMarkerPosition?.lng}
            onCloseInfoWindow={() => setShowInfoWindow(false)}
            onSetRouteLocation={onSetRouteLocation}
          />
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

export default HomeMobileLayout;
