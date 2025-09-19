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

// 사이드메뉴 너비 상수
const SIDEMENU_WIDTH = 350;

/**
 * Home 컴포넌트
 * 앱의 메인 화면으로, 지도와 검색 기능을 제공합니다.
 * 웹과 모바일 플랫폼에 따라 다른 레이아웃을 렌더링합니다.
 */
export default function Home() {
  // 전역 상태 관리
  const selectedPlaceId = usePlaceStore((s) => s.selectedPlaceId);
  const setSelectedPlaceId = usePlaceStore((s) => s.setSelectedPlaceId);
  
  // 현재 위치 및 검색 관련 훅
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

  // UI 상태 관리
  const [isMenuOpen, setIsMenuOpen] = useState(true); // 사이드메뉴 열림/닫힘 상태
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false); // 모바일 하단 시트 상태
  const sideMenuAnimation = useRef(new Animated.Value(0)).current; // 사이드메뉴 애니메이션
  const insets = useSafeAreaInsets(); // 안전 영역 정보

  // 지도 중심 좌표 상태
  const [mapCenter, setMapCenter] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // 현재 위치가 로드되면 지도 중심을 설정
  useEffect(() => {
    if (location && !mapCenter) {
      setMapCenter({ latitude: location.latitude, longitude: location.longitude });
    }
  }, [location, mapCenter]);

  // 사이드메뉴 애니메이션 처리
  useEffect(() => {
    Animated.timing(sideMenuAnimation, {
      toValue: isMenuOpen ? 0 : -SIDEMENU_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isMenuOpen]);

  /**
   * 검색 실행 핸들러
   * 키보드를 닫고 현재 지도 중심 좌표를 기준으로 검색을 수행합니다.
   */
  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!mapCenter) {
      alert("지도 중심 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    await performSearch(mapCenter.latitude, mapCenter.longitude);
    setBottomSheetOpen(true); // 검색 후 하단 시트 열기
  };

  /**
   * 검색 결과 선택 핸들러
   * 선택된 장소로 지도를 이동하고 상세 정보를 표시합니다.
   */
  const handleSelectResult = (item: SearchResult) => {
    setMapCenter({ latitude: item.latitude, longitude: item.longitude });
    if (item.id) {
      setSelectedPlaceId(item.id);
    }
    setBottomSheetOpen(false); // 결과 선택 후 하단 시트 닫기
  };

  // 로딩 및 에러 상태 계산
  const isLoading = locationLoading || searchLoading;
  const errorMsg = (locationError || searchError) ? String(locationError || searchError) : null;

  /**
   * 웹 레이아웃 렌더링
   * 사이드메뉴와 지도를 나란히 배치하는 레이아웃
   */
  const renderWebLayout = () => (
    <View style={webStyles.container}>
      <Header />
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

  /**
   * 모바일 레이아웃 렌더링
   * 전체 화면 지도와 하단 시트를 사용하는 레이아웃
   */
  const renderMobileLayout = () => (
    <SafeAreaView style={mobileStyles.safeAreaContainer}>
      <Header />
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

  // 플랫폼에 따라 적절한 레이아웃 렌더링
  return Platform.OS === 'web' ? renderWebLayout() : renderMobileLayout();
}

// 웹용 스타일 정의
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