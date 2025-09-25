import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  Animated,
  Keyboard,
  Platform,
} from "react-native";
import { usePlaceStore } from "../store/placeStore";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { useSearch } from "../hooks/useSearch";
import HomeWebLayout from "./HomeWebLayout";
import HomeMobileLayout from "./HomeMobileLayout";

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
    searchOptions,
    setSearchOptions,
    allMarkers,
    loadingNextPage,
    loadingAllMarkers,
    markerCountReachedLimit,
    fetchNextPage,
    pagination,
    fetchAllMarkers,
  } = useSearch();

  // UI 상태 관리
  const [isMenuOpen, setIsMenuOpen] = useState(true); // 사이드메뉴 열림/닫힘 상태
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false); // 모바일 하단 시트 상태
  const sideMenuAnimation = useRef(new Animated.Value(0)).current; // 사이드메뉴 애니메이션

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

  // 최초 검색 성공 후, 모든 마커를 가져오는 로직
  useEffect(() => {
    if (pagination && pagination.currentPage === 1 && !pagination.isLast) {
      if (mapCenter && location) {
        fetchAllMarkers(mapCenter.latitude, mapCenter.longitude, location.latitude, location.longitude);
      }
    }
  }, [pagination]);

  // 사이드메뉴 애니메이션 처리
  useEffect(() => {
    const SIDEMENU_WIDTH = 350; // 사이드메뉴 너비 상수
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
  const handleSearch = useCallback(async () => {
    Keyboard.dismiss();
    if (!mapCenter) {
      alert("지도 중심 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (!location) {
      alert("현재 위치 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    await performSearch(mapCenter.latitude, mapCenter.longitude, location.latitude, location.longitude);
    setBottomSheetOpen(true); // 검색 후 하단 시트 열기
  }, [mapCenter, location, performSearch]);

  const handleNextPage = useCallback(async () => {
    if (!mapCenter) return;
    if (!location) {
      alert("현재 위치 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    await fetchNextPage(mapCenter.latitude, mapCenter.longitude, location.latitude, location.longitude);
  }, [mapCenter, location, fetchNextPage]);

  /**
   * 검색 결과 선택 핸들러
   * 선택된 장소로 지도를 이동하고 상세 정보를 표시합니다.
   */
  const handleSelectResult = useCallback((item: SearchResult) => {
    setMapCenter({ latitude: item.lat, longitude: item.lng });
    if (item.placeId) {
      setSelectedPlaceId(item.placeId);
    }
    setBottomSheetOpen(false); // 결과 선택 후 하단 시트 닫기
  }, [setSelectedPlaceId]);

  // 로딩 및 에러 상태 계산
  const isLoading = locationLoading || searchLoading;
  const errorMsg = (locationError || searchError) ? String(locationError || searchError) : null;

  const markers = useMemo(() => {
    return [
      ...(location ? [{
        placeId: "user-location",
        placeName: "내 위치",
        lat: location.latitude,
        lng: location.longitude,
        markerType: "userLocation",
      }] : []),
      ...allMarkers.map(marker => ({
        ...marker,
        markerType: marker.placeId === selectedPlaceId ? 'selected' : 'default'
      }))
    ];
  }, [location, allMarkers, selectedPlaceId]);

  // 플랫폼에 따라 적절한 레이아웃 렌더링
  if (Platform.OS === 'web') {
    return (
      <HomeWebLayout
        selectedPlaceId={selectedPlaceId}
        setSelectedPlaceId={setSelectedPlaceId}
        location={location}
        mapCenter={mapCenter}
        setMapCenter={setMapCenter}
        markers={markers}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        sideMenuAnimation={sideMenuAnimation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        allMarkers={allMarkers}
        isLoading={isLoading}
        errorMsg={errorMsg}
        onSearch={handleSearch}
        onSelectResult={handleSelectResult}
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
        loadingNextPage={loadingNextPage}
        loadingAllMarkers={loadingAllMarkers}
        markerCountReachedLimit={markerCountReachedLimit}
        onNextPage={handleNextPage}
        pagination={pagination}
      />
    );
  } else {
    return (
      <HomeMobileLayout
        selectedPlaceId={selectedPlaceId}
        setSelectedPlaceId={setSelectedPlaceId}
        location={location}
        mapCenter={mapCenter}
        setMapCenter={setMapCenter}
        markers={markers}
        bottomSheetOpen={bottomSheetOpen}
        setBottomSheetOpen={setBottomSheetOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        allMarkers={allMarkers}
        isLoading={isLoading}
        errorMsg={errorMsg}
        onSearch={handleSearch}
        onSelectResult={handleSelectResult}
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
        loadingNextPage={loadingNextPage}
        loadingAllMarkers={loadingAllMarkers}
        markerCountReachedLimit={markerCountReachedLimit}
        onNextPage={handleNextPage}
        pagination={pagination}
      />
    );
  }
}