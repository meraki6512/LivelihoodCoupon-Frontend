import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  FlatList,
  Pressable, // Add Pressable
  Animated,
  Keyboard,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import KakaoMap from "../components/KakaoMap";
import { SearchResult } from "../types/search";
import PlaceDetailPanel from "../components/place/PlaceDetailPanel";
import { usePlaceStore } from "../store/placeStore";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { useKakaoSearch } from "../hooks/useKakaoSearch";
import { styles } from "./Home.styles";

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

  const [selectedPlace, setSelectedPlace] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const animation = useRef(new Animated.Value(0)).current;
  const [mapCenter, setMapCenter] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // 지도 중심 좌표 상태 추가

  useEffect(() => {
    if (location && !mapCenter) {
      setSelectedPlace({ latitude: location.latitude, longitude: location.longitude });
      setMapCenter({ latitude: location.latitude, longitude: location.longitude });
    }
  }, [location, mapCenter]);

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!mapCenter) {
      alert("지도 중심 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    await performSearch(mapCenter.latitude, mapCenter.longitude);
    if (searchResults.length > 0) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSelectResult = (item: SearchResult) => {
    setSelectedPlace({ latitude: item.latitude, longitude: item.longitude });
    if (item.id) {
      setSelectedPlaceId(item.id);
    }
    clearSearchResults();
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const isLoading = locationLoading || searchLoading;
  const errorMsg = locationError || searchError;

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.text}>민생회복 소비쿠폰 사용처</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="장소를 검색하세요..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>검색</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#0000ff"
            style={styles.loadingIndicator}
          />
        )}
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      </View>

      {searchResults.length > 0 && (
        <Animated.View
          style={[
            styles.resultList,
            {
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable onPress={() => handleSelectResult(item)}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultItemText}>{item.place_name}</Text>
                </View>
              </Pressable>
            )}
          />
        </Animated.View>
      )}

      {mapCenter ? ( // mapCenter가 있을 때만 렌더링
        <KakaoMap
          latitude={mapCenter.latitude}
          longitude={mapCenter.longitude}
          style={styles.mapFullScreen}
          markers={searchResults}
          onMapCenterChange={(lat, lng) =>
            setMapCenter({ latitude: lat, longitude: lng })
          }
          onMarkerPress={(id) => id && setSelectedPlaceId(id)}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>지도를 불러오는 중입니다...</Text>
        </View>
      )}

      {selectedPlaceId && (
        <PlaceDetailPanel placeId={selectedPlaceId} />
      )}
    </SafeAreaView>
  );
}
