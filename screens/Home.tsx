import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import KakaoMap from "../components/KakaoMap";
import { SearchResult } from "../types/search";
import PlaceDetailPanel from "../components/place/PlaceDetailPanel";
import { usePlaceStore } from "../store/placeStore";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { useKakaoSearch } from "../hooks/useKakaoSearch";
import { styles as mobileStyles } from "./Home.styles";
import Header from "../components/layout/Header";
import SideMenu from "../components/layout/SideMenu";
import CustomBottomSheet from "../components/search/CustomBottomSheet";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SIDEMENU_WIDTH = 350;

export default function Home() {
  const selectedPlaceId = usePlaceStore((s) => s.selectedPlaceId);
  const setSelectedPlaceId = usePlaceStore((s) => s.setSelectedPlaceId);
  const { location, error: locationError, loading: locationLoading } = useCurrentLocation();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading: searchLoading,
    error: searchError,
    performSearch,
    clearSearchResults,
  } = useKakaoSearch();

  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const sideMenuAnimation = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const [mapCenter, setMapCenter] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (location && !mapCenter) {
      setMapCenter({ latitude: location.latitude, longitude: location.longitude });
    }
  }, [location, mapCenter]);

  useEffect(() => {
    Animated.timing(sideMenuAnimation, {
      toValue: isMenuOpen ? 0 : -SIDEMENU_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isMenuOpen]);

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!mapCenter) {
      alert("지도 중심 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    await performSearch(mapCenter.latitude, mapCenter.longitude);
    setBottomSheetOpen(true); // Open bottom sheet after search
  };

  const handleSelectResult = (item: SearchResult) => {
    setMapCenter({ latitude: item.latitude, longitude: item.longitude });
    if (item.id) {
      setSelectedPlaceId(item.id);
    }
    setBottomSheetOpen(false); // Close bottom sheet after selecting a result
  };

  const isLoading = locationLoading || searchLoading;
  const errorMsg = locationError || searchError;

  const renderWebLayout = () => (
    <View style={webStyles.container}>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />
      <View style={webStyles.mainContainer}>
        <SideMenu
          isOpen={isMenuOpen}
          searchResults={searchResults}
          onSelectResult={handleSelectResult}
          isLoading={searchLoading}
          errorMsg={errorMsg}
          onToggle={() => setIsMenuOpen(!isMenuOpen)}
          style={{ transform: [{ translateX: sideMenuAnimation }] }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
        />
        <View style={webStyles.mapContainer}>
          {mapCenter ? (
            <KakaoMap
              latitude={mapCenter.latitude}
              longitude={mapCenter.longitude}
              markers={searchResults}
              onMapCenterChange={(lat, lng) =>
                setMapCenter({ latitude: lat, longitude: lng })
              }
              onMarkerPress={(id) => id && setSelectedPlaceId(id)}
            />
          ) : (
            <View style={webStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text>지도를 불러오는 중입니다...</Text>
            </View>
          )}
        </View>
      </View>
      {selectedPlaceId && (
        <PlaceDetailPanel placeId={selectedPlaceId} />
      )}
    </View>
  );

  const renderMobileLayout = () => (
    <SafeAreaView style={mobileStyles.safeAreaContainer}>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />
      {isLoading && (
        <ActivityIndicator
          size="small"
          color="#0000ff"
          style={mobileStyles.loadingIndicator}
        />
      )}
      {errorMsg && <Text style={mobileStyles.errorText}>{errorMsg}</Text>}

      <CustomBottomSheet
        isOpen={bottomSheetOpen}
        onToggle={() => setBottomSheetOpen(!bottomSheetOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        searchResults={searchResults}
        isLoading={searchLoading}
        errorMsg={searchError}
        onSelectResult={handleSelectResult}
      />

      {bottomSheetOpen && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: insets.bottom, backgroundColor: 'white', zIndex: 9 }} />
      )}

      {mapCenter ? (
        <KakaoMap
          latitude={mapCenter.latitude}
          longitude={mapCenter.longitude}
          style={mobileStyles.mapFullScreen}
          markers={searchResults}
          onMapCenterChange={(lat, lng) =>
            setMapCenter({ latitude: lat, longitude: lng })
          }
          onMarkerPress={(id) => id && setSelectedPlaceId(id)}
        />
      ) : (
        <View style={mobileStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>지도를 불러오는 중입니다...</Text>
        </View>
      )}
      {selectedPlaceId && (
        <PlaceDetailPanel placeId={selectedPlaceId} />
      )}
    </SafeAreaView>
  );

  return Platform.OS === 'web' ? renderWebLayout() : renderMobileLayout();
}

const webStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  mapContainer: {
    flex: 1,
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});