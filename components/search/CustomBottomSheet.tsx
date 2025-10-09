import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
  FlatList,
  ActivityIndicator,
  TextInput,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../search/SearchBar';
import { SearchResult, SearchOptions } from '../../types/search';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchOptionsComponent from './SearchOptionsComponent';
import { useRoute } from '../../hooks/useRoute';
import { getAutocompleteSuggestions, searchPlaces } from '../../services/searchApi';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import RouteResultComponent from '../route/RouteResult';
import { PageResponse } from '../../types/api';
import SearchResultItem from './SearchResultItem';
import { RouteResult } from '../../types/route';
import { AutocompleteResponse } from '../../types/search';

interface CustomBottomSheetProps {
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onSearchNearMe: () => void; // Add this prop
  searchResults: SearchResult[];
  allMarkers: SearchResult[];
  isLoading: boolean;
  errorMsg?: string | null; // Made optional
  onSelectResult: (item: SearchResult) => void;
  searchOptions: SearchOptions;
  setSearchOptions: (options: Partial<SearchOptions>) => void;
  loadingNextPage: boolean;
  loadingAllMarkers: boolean;
  markerCountReachedLimit: boolean;
  onNextPage: () => void;
  pagination: Omit<PageResponse<any>, 'content'> | null;
  onSetRouteLocation?: (type: 'departure' | 'arrival', placeInfo: SearchResult) => void;
  // 외부에서 전달받은 길찾기 관련 props
  routeResult?: RouteResult | null;
  isRouteLoading?: boolean;
  routeError?: string | null;
  startRoute?: any;
  clearRoute?: () => void;
}

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  isOpen,
  onToggle,
  searchQuery,
  setSearchQuery,
  onSearch,
  onSearchNearMe, // Destructure the new prop
  searchResults,
  allMarkers,
  isLoading,
  errorMsg,
  onSelectResult,
  searchOptions,
  setSearchOptions,
  loadingNextPage,
  loadingAllMarkers,
  markerCountReachedLimit,
  onNextPage,
  pagination,
  onSetRouteLocation,
  routeResult: externalRouteResult,
  isRouteLoading: externalIsRouteLoading,
  routeError: externalRouteError,
  startRoute: externalStartRoute,
  clearRoute: externalClearRoute,
}) => {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const USABLE_SCREEN_HEIGHT = SCREEN_HEIGHT - insets.bottom;
  const BOTTOM_SHEET_HEIGHT = USABLE_SCREEN_HEIGHT * 0.5;
  const EXPANDED_BOTTOM_SHEET_HEIGHT = USABLE_SCREEN_HEIGHT * 0.75; // 검색 결과 표시 시 더 큰 높이
  const CLOSED_HEIGHT = 70;

  const bottomSheetAnimation = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT - CLOSED_HEIGHT)).current;
  const [showSearchOptions, setShowSearchOptions] = useState(false); // New state for toggle
  const [activeTab, setActiveTab] = useState<'search' | 'route'>('search'); // 탭 상태 관리
  const [keyboardHeight, setKeyboardHeight] = useState(0); // 키보드 높이 상태
  const routeScrollViewRef = useRef<ScrollView>(null); // 길찾기 탭 스크롤뷰 참조
  
  // 현재 위치 및 디바운스 타이머
  const { location } = useCurrentLocation();
  const startSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 길찾기 관련 상태
  const [startLocation, setStartLocation] = useState('내 위치');
  const [endLocation, setEndLocation] = useState('');
  const [startLocationResults, setStartLocationResults] = useState<SearchResult[]>([]);
  const [endLocationResults, setEndLocationResults] = useState<SearchResult[]>([]);
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  const [isSearchingEnd, setIsSearchingEnd] = useState(false);
  const [showStartResults, setShowStartResults] = useState(false);
  const [showEndResults, setShowEndResults] = useState(false);
  const [selectedTransportMode, setSelectedTransportMode] = useState<'driving' | 'transit' | 'walking' | 'cycling'>('driving');
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<AutocompleteResponse[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // 길찾기 관련 상태 (외부에서 전달받은 props 우선 사용, 없으면 내부 훅 사용)
  const internalRoute = useRoute();
  const startRoute = externalStartRoute || internalRoute.startRoute;
  const isRouteLoading = externalIsRouteLoading !== undefined ? externalIsRouteLoading : internalRoute.isLoading;
  const routeResult = externalRouteResult !== undefined ? externalRouteResult : internalRoute.routeResult;
  const routeError = externalRouteError !== undefined ? externalRouteError : internalRoute.error;
  const clearRoute = externalClearRoute || internalRoute.clearRoute;

  // 텍스트 편집 시 길찾기 결과 초기화
  const handleTextEdit = () => {
    if (routeResult) {
      clearRoute();
    }
  };

  useEffect(() => {
    Animated.timing(bottomSheetAnimation, {
      toValue: isOpen ? 0 : BOTTOM_SHEET_HEIGHT - CLOSED_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  // 키보드 이벤트 리스너
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        const keyboardHeight = event.endCoordinates.height;
        setKeyboardHeight(keyboardHeight);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // 기본 위치 (서울 시청) - 현재 위치를 가져올 수 없을 때 사용
  const defaultLocation = { latitude: 37.5665, longitude: 126.9780 };
  const searchLocation = location || defaultLocation;

  const debouncedAutocomplete = (query: string) => {
    if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current);
    }
    autocompleteTimeoutRef.current = setTimeout(async () => {
        if (query.trim().length > 0) {
            try {
                const suggestions = await getAutocompleteSuggestions(query);
                setAutocompleteSuggestions(suggestions);
                setShowAutocomplete(true);
            } catch (error) {
                console.error('Autocomplete error:', error);
                setAutocompleteSuggestions([]);
            }
        } else {
            setAutocompleteSuggestions([]);
            setShowAutocomplete(false);
        }
    }, 300);
  };

  // 디바운스된 출발지 검색 함수
  const debouncedSearchStartLocation = async (query: string) => {
    if (!query.trim()) {
      setStartLocationResults([]);
      setShowStartResults(false);
      return;
    }

    // 이전 타이머 취소
    if (startSearchTimeoutRef.current) {
      clearTimeout(startSearchTimeoutRef.current);
    }

    // 새 타이머 설정
    startSearchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingStart(true);
      try {
        const results = await searchPlaces(
          query,
          searchLocation.latitude,
          searchLocation.longitude,
          3000, // radius - 1km에서 3km로 증가
          'distance', // sort
          1, // page
          searchLocation.latitude, // userLat
          searchLocation.longitude // userLng
        );
        setStartLocationResults(results.content.slice(0, 10)); // 상위 10개 표시
        setShowStartResults(true);
      } catch (error) {
        console.error('출발지 검색 오류:', error);
        setStartLocationResults([]);
        setShowStartResults(false);
      } finally {
        setIsSearchingStart(false);
      }
    }, 500);
  };

  // 디바운스된 목적지 검색 함수
  const debouncedSearchEndLocation = async (query: string) => {
    if (!query.trim()) {
      setEndLocationResults([]);
      setShowEndResults(false);
      return;
    }

    // 이전 타이머 취소
    if (endSearchTimeoutRef.current) {
      clearTimeout(endSearchTimeoutRef.current);
    }

    // 새 타이머 설정
    endSearchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingEnd(true);
      try {
        const results = await searchPlaces(
          query,
          searchLocation.latitude,
          searchLocation.longitude,
          3000, // radius - 1km에서 3km로 증가
          'distance', // sort
          1, // page
          searchLocation.latitude, // userLat
          searchLocation.longitude // userLng
        );
        setEndLocationResults(results.content.slice(0, 10)); // 상위 10개 표시
        setShowEndResults(true);
      } catch (error) {
        console.error('목적지 검색 오류:', error);
        setEndLocationResults([]);
        setShowEndResults(false);
      } finally {
        setIsSearchingEnd(false);
      }
    }, 500);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (startSearchTimeoutRef.current) {
        clearTimeout(startSearchTimeoutRef.current);
      }
      if (endSearchTimeoutRef.current) {
        clearTimeout(endSearchTimeoutRef.current);
      }
    };
  }, []);

  // InfoWindow에서 길찾기 위치 설정 함수
  const handleSetRouteLocation = (type: 'departure' | 'arrival', placeInfo: SearchResult) => {
    console.log('길찾기 탭으로 전환 시작, 현재 탭:', activeTab);
    console.log('하단바 열림 상태:', isOpen);
    
    // 하단바가 닫혀있으면 열기
    if (!isOpen) {
      onToggle();
    }
    
    // 길찾기 탭으로 전환
    setActiveTab('route');
    
    // 선택된 타입에 따라 출발지 또는 목적지 설정
    if (type === 'departure') {
      console.log('출발지 설정:', placeInfo.placeName);
      setStartLocation(placeInfo.placeName);
    } else {
      console.log('목적지 설정:', placeInfo.placeName);
      setEndLocation(placeInfo.placeName);
      // 도착지 설정 시 출발지가 비어있으면 "내 위치"로 설정
      if (!startLocation || startLocation.trim() === '') {
        console.log('출발지가 비어있어서 "내 위치"로 설정');
        setStartLocation('내 위치');
      }
    }
    
    // 검색 결과 리스트 숨기기
    setShowStartResults(false);
    setShowEndResults(false);
    
    console.log(`${type} 설정 완료:`, placeInfo.placeName);
  };

  // 전역 함수로 등록하여 KakaoMap에서 호출할 수 있도록 함
  useEffect(() => {
    (global as any).setRouteLocationFromInfoWindow = handleSetRouteLocation;
    console.log('전역 함수 등록됨:', (global as any).setRouteLocationFromInfoWindow);
  }, [activeTab, isOpen, startLocation]);

  // Local search handler to auto-collapse options
  const handleLocalSearch = () => {
    onSearch(); // Call original onSearch prop
    setShowSearchOptions(false); // Auto-collapse options
  };

  const renderFooter = () => {
    // 더 이상 로드할 페이지가 없으면 로딩 스피너를 표시하지 않음
    if (!loadingNextPage || !pagination || pagination.isLast || pagination.currentPage >= pagination.totalPages) {
      return null;
    }
    return <ActivityIndicator style={{ paddingVertical: 20 }} size="large" color="#007bff" />;
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />;
    }
    if (errorMsg) {
      return <Text style={styles.errorText}>{String(errorMsg)}</Text>;
    }
    if (searchResults.length > 0) {
      return (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.placeId}
          renderItem={({ item }) => <SearchResultItem item={item} onPress={onSelectResult} />}
          onEndReached={onNextPage}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      );
    }
    return <Text style={styles.noResultText}>검색 결과가 없거나, 검색을 시작하세요.</Text>;
  };

  // 검색 결과 표시 여부에 따른 동적 높이 계산
  const hasSearchResults = showStartResults || showEndResults;
  const baseHeight = hasSearchResults ? EXPANDED_BOTTOM_SHEET_HEIGHT : BOTTOM_SHEET_HEIGHT;
  const dynamicHeight = baseHeight + keyboardHeight;

  // 검색 결과 표시 시 하단바 높이 애니메이션
  useEffect(() => {
    if (isOpen && hasSearchResults) {
      Animated.timing(bottomSheetAnimation, {
        toValue: 0, // 최대 확장
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (isOpen && !hasSearchResults) {
      Animated.timing(bottomSheetAnimation, {
        toValue: 0, // 기본 높이
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [hasSearchResults, isOpen]);

  // 길찾기 결과가 있을 때 자동으로 스크롤다운 (적당한 위치까지만)
  useEffect(() => {
    if (routeResult && routeScrollViewRef.current) {
      // 약간의 지연을 두고 스크롤다운 (컴포넌트 렌더링 완료 후)
      setTimeout(() => {
        // 길찾기 완료 버튼 아래쪽으로 적당히 스크롤 (300px 정도)
        routeScrollViewRef.current?.scrollTo({ y: 300, animated: true });
      }, 300);
    }
  }, [routeResult]);

  return (
    <>
    <Animated.View
      style={[
        styles.bottomSheetContainer,
        {
          height: dynamicHeight,
          bottom: insets.bottom,
          transform: [{ translateY: bottomSheetAnimation }],
        },
      ]}
      pointerEvents="auto" // 바텀시트는 항상 활성화
    >
      <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
        <Ionicons name={isOpen ? "chevron-down" : "chevron-up"} size={24} color="#495057" />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.contentContainer}>
          {/* 탭 헤더 */}
          <View style={styles.tabHeader}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'search' && styles.activeTabButton]}
              onPress={() => setActiveTab('search')}
            >
              <Ionicons name="search-outline" size={20} color={activeTab === 'search' ? '#007bff' : '#6c757d'} />
              <Text style={[styles.tabButtonText, activeTab === 'search' && styles.activeTabButtonText]}>검색</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'route' && styles.activeTabButton]}
              onPress={() => setActiveTab('route')}
            >
              <Ionicons name="navigate-outline" size={20} color={activeTab === 'route' ? '#007bff' : '#6c757d'} />
              <Text style={[styles.tabButtonText, activeTab === 'route' && styles.activeTabButtonText]}>길찾기</Text>
            </TouchableOpacity>
          </View>

          {/* 탭 내용 */}
          {activeTab === 'search' ? (
            <View style={styles.searchTabContent}>
              <SearchBar 
                searchQuery={searchQuery} 
                setSearchQuery={(text) => {
                  setSearchQuery(text);
                  debouncedAutocomplete(text);
                }}
                onSearch={handleLocalSearch} 
                showSearchOptions={showSearchOptions} 
                onToggleSearchOptions={() => setShowSearchOptions(!showSearchOptions)} 
              />
              {showAutocomplete && autocompleteSuggestions.length > 0 && (
                <FlatList
                  data={autocompleteSuggestions}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => {
                        setSearchQuery(item.word);
                        setShowAutocomplete(false);
                      }}
                    >
                      <Text>{item.word}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionsList}
                />
              )}
              <TouchableOpacity onPress={onSearchNearMe} style={styles.searchNearMeButton}>
                <Ionicons name="locate-outline" size={20} color="#fff" />
                <Text style={styles.searchNearMeButtonText}>내 주변 검색</Text>
              </TouchableOpacity>
              {showSearchOptions && (
                <SearchOptionsComponent searchOptions={searchOptions} setSearchOptions={setSearchOptions} />
              )}
              {pagination && searchResults.length > 0 && (
                <View style={styles.resultCountContainer}>
                  <Text style={styles.resultCountText}>총 {pagination.totalElements}개 결과</Text>
                  {loadingAllMarkers && (
                    <Text style={styles.markerStatusText}>
                      (전체 마커 로딩중...)
                    </Text>
                  )}
                  {markerCountReachedLimit && (
                    <Text style={styles.markerStatusText}>
                      (지도에 {allMarkers.length}개만 표시)
                    </Text>
                  )}
                </View>
              )}
              {renderContent()}
            </View>
          ) : (
            <ScrollView 
              ref={routeScrollViewRef}
              style={styles.routeTabContent}
              contentContainerStyle={styles.routeTabScrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {/* 교통수단 선택 아이콘들 */}
              <View style={styles.transportModeWrapper}>
                <View style={styles.transportModeContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.transportModeButton,
                      selectedTransportMode === 'driving' && styles.transportModeButtonSelected
                    ]}
                    onPress={() => {
                      handleTextEdit();
                      setSelectedTransportMode('driving');
                    }}
                  >
                    <Ionicons 
                      name="car-outline" 
                      size={20} 
                      color={selectedTransportMode === 'driving' ? '#007bff' : '#666'} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.transportModeButton,
                      styles.transportModeButtonDisabled, // 대중교통 미구현
                      selectedTransportMode === 'transit' && styles.transportModeButtonSelected
                    ]}
                    // onPress={() => setSelectedTransportMode('transit')}
                    onPress={() => {
                      // 대중교통은 미구현 상태로 비활성화
                      console.log('대중교통 모드는 아직 구현되지 않았습니다.');
                    }}
                    disabled={true}
                  >
                    <Ionicons 
                      name="bus-outline" 
                      size={20} 
                      // color={selectedTransportMode === 'transit' ? '#007bff' : '#666'} 
                      color="#ccc" 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.transportModeButton,
                      selectedTransportMode === 'walking' && styles.transportModeButtonSelected
                    ]}
                    onPress={() => {
                      handleTextEdit();
                      setSelectedTransportMode('walking');
                    }}
                  >
                    <Ionicons 
                      name="walk-outline" 
                      size={20} 
                      color={selectedTransportMode === 'walking' ? '#007bff' : '#666'} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.transportModeButton,
                      selectedTransportMode === 'cycling' && styles.transportModeButtonSelected
                    ]}
                    onPress={() => {
                      handleTextEdit();
                      setSelectedTransportMode('cycling');
                    }}
                  >
                    <Ionicons 
                      name="bicycle-outline" 
                      size={20} 
                      color={selectedTransportMode === 'cycling' ? '#007bff' : '#666'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 출발지/목적지 입력 영역 */}
              <View style={styles.routeInputsContainer}>
                {/* 출발지 입력 */}
                <View style={styles.routeInputContainer}>
                  <View style={styles.routeInputWrapper}>
                    <TextInput
                      style={styles.routeTextInput}
                      placeholder="출발지를 입력하세요"
                      value={startLocation}
                      onChangeText={(text) => {
                        handleTextEdit();
                        setStartLocation(text);
                        debouncedSearchStartLocation(text);
                      }}
                      onFocus={handleTextEdit}
                      selectionColor="transparent"
                      underlineColorAndroid="transparent"
                    />
                    {isSearchingStart && (
                      <ActivityIndicator size="small" color="#007bff" style={styles.searchIndicator} />
                    )}
                  </View>
                  
                  {/* 현재 위치 버튼 */}
                  <TouchableOpacity 
                    style={[
                      styles.currentLocationButton,
                      !location && styles.currentLocationButtonDisabled
                    ]}
                    onPress={() => {
                      if (location) {
                        handleTextEdit();
                        setStartLocation('내 위치');
                        setShowStartResults(false);
                      }
                    }}
                    disabled={!location}
                  >
                    <Ionicons 
                      name="compass-outline" 
                      size={16} 
                      color={location ? "#007bff" : "#ccc"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* 목적지 입력 */}
                <View style={styles.routeInputContainer}>
                  <View style={styles.routeInputWrapper}>
                    <TextInput
                      style={styles.routeTextInput}
                      placeholder="도착지를 입력하세요"
                      value={endLocation}
                      onChangeText={(text) => {
                        handleTextEdit();
                        setEndLocation(text);
                        debouncedSearchEndLocation(text);
                      }}
                      onFocus={handleTextEdit}
                      selectionColor="transparent"
                      underlineColorAndroid="transparent"
                    />
                    {isSearchingEnd && (
                      <ActivityIndicator size="small" color="#007bff" style={styles.searchIndicator} />
                    )}
                  </View>
                  
                  
                  {/* 바꾸기 버튼 */}
                  <TouchableOpacity 
                    style={styles.swapButton}
                    onPress={() => {
                      const tempStart = startLocation;
                      const tempEnd = endLocation;
                      
                      console.log('바꾸기 버튼 클릭');
                      console.log('tempStart:', tempStart, 'tempEnd:', tempEnd);
                      console.log('tempStart === "내 위치":', tempStart === '내 위치');
                      
                      // 출발지와 목적지를 서로 교체
                      if (tempStart === '내 위치') {
                        // 출발지가 "내 위치"인 경우, 목적지에 "내 위치" 설정
                        setStartLocation(tempEnd);
                        setEndLocation('내 위치');
                      } else {
                        // 일반적인 경우: 단순 교체
                        setStartLocation(tempEnd);
                        setEndLocation(tempStart);
                      }
                      
                      // 상태 변경 후 길찾기 결과 초기화
                      handleTextEdit();
                      
                      console.log('바꾸기 후 상태:', { startLocation: tempEnd, endLocation: tempStart === '내 위치' ? '내 위치' : tempStart });
                    }}
                  >
                    <Ionicons name="swap-vertical-outline" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 길찾기 시작 버튼 */}
              <TouchableOpacity 
                style={[
                  styles.routeButton, 
                  (!endLocation.trim() || isRouteLoading || !!routeResult) && styles.routeButtonDisabled
                ]}
                disabled={!endLocation.trim() || isRouteLoading || !!routeResult}
                onPress={async () => {
                  try {
                    console.log('모바일 길찾기 시작 버튼 클릭');
                    console.log('버튼 상태:', { 
                      endLocation: endLocation, 
                      isRouteLoading: isRouteLoading, 
                      routeResult: !!routeResult,
                      disabled: !endLocation.trim() || isRouteLoading || !!routeResult
                    });
                    
                  // 도착지가 비어있으면 에러
                  if (!endLocation.trim()) {
                    alert('도착지를 입력해주세요.');
                    return;
                  }

                  // 출발지 데이터 처리
                  let startLocationData: SearchResult | string;
                  console.log('출발지 값:', startLocation, '타입:', typeof startLocation);
                  
                  if (typeof startLocation === 'string' && startLocation.trim() === '내 위치') {
                    // 출발지가 "내 위치"인 경우
                    startLocationData = '내 위치';
                    console.log('출발지: 내 위치로 설정');
                  } else if (typeof startLocation === 'string') {
                    // 출발지가 일반 문자열인 경우, 검색 결과에서 찾기
                    console.log('출발지 검색 결과에서 찾기:', startLocation);
                    console.log('startLocationResults:', startLocationResults);
                    console.log('endLocationResults:', endLocationResults);
                    
                    // 먼저 startLocationResults에서 찾기
                    let foundStartLocation = startLocationResults.find(item => 
                      item.placeName === startLocation || 
                      item.placeName.includes(startLocation) || 
                      startLocation.includes(item.placeName)
                    );
                    console.log('startLocationResults에서 찾은 결과:', foundStartLocation);
                    
                    // 없으면 endLocationResults에서도 찾기
                    if (!foundStartLocation) {
                      foundStartLocation = endLocationResults.find(item => 
                        item.placeName === startLocation || 
                        item.placeName.includes(startLocation) || 
                        startLocation.includes(item.placeName)
                      );
                      console.log('endLocationResults에서 찾은 결과:', foundStartLocation);
                    }
                    
                    if (!foundStartLocation) {
                      console.log('최종적으로 찾지 못함. startLocationResults 개수:', startLocationResults.length, 'endLocationResults 개수:', endLocationResults.length);
                      alert('출발지 정보를 찾을 수 없습니다. 다시 검색해주세요.');
                      return;
                    }
                    
                    startLocationData = foundStartLocation;
                    console.log('출발지 데이터 찾음:', startLocationData);
                  } else {
                    // 이미 SearchResult 객체인 경우
                    startLocationData = startLocation;
                    console.log('출발지 이미 객체:', startLocationData);
                  }

                  // 도착지 데이터 처리
                    let endLocationData: SearchResult | null = null;
                    
                    console.log('목적지 값:', endLocation, '타입:', typeof endLocation);
                    console.log('목적지 trim 후:', endLocation.trim());
                    console.log('목적지 trim 후 길이:', endLocation.trim().length);
                    console.log('조건 확인:', endLocation.trim() === '내 위치');
                    
                    if (endLocation.trim() === '내 위치') {
                      // 목적지가 "내 위치"인 경우, 현재 위치 정보 사용
                      if (!location) {
                        alert('현재 위치 정보를 가져올 수 없습니다.');
                        return;
                      }
                      endLocationData = {
                        placeId: 'current-location',
                        placeName: '내 위치',
                        lat: location.latitude,
                        lng: location.longitude,
                        roadAddress: '내 위치',
                        lotAddress: '',
                        phone: '',
                        categoryGroupName: '',
                        placeUrl: '',
                        distance: 0
                      };
                      console.log('내 위치 데이터 생성 완료:', endLocationData);
                    } else {
                      // 일반 장소인 경우 검색 결과에서 찾기
                      console.log('검색할 목적지:', endLocation);
                      console.log('endLocationResults:', endLocationResults);
                      console.log('startLocationResults:', startLocationResults);
                      
                      // 먼저 정확한 매칭으로 endLocationResults에서 찾기
                      endLocationData = endLocationResults.find(item => item.placeName === endLocation) || null;
                      console.log('endLocationResults에서 정확한 매칭 결과:', endLocationData);
                      
                      // 없으면 부분 매칭으로 endLocationResults에서 찾기
                      if (!endLocationData) {
                        endLocationData = endLocationResults.find(item => item.placeName.includes(endLocation) || endLocation.includes(item.placeName)) || null;
                        console.log('endLocationResults에서 부분 매칭 결과:', endLocationData);
                      }
                      
                      // 없으면 정확한 매칭으로 startLocationResults에서 찾기
                      if (!endLocationData) {
                        endLocationData = startLocationResults.find(item => item.placeName === endLocation) || null;
                        console.log('startLocationResults에서 정확한 매칭 결과:', endLocationData);
                      }
                      
                      // 없으면 부분 매칭으로 startLocationResults에서 찾기
                      if (!endLocationData) {
                        endLocationData = startLocationResults.find(item => item.placeName.includes(endLocation) || endLocation.includes(item.placeName)) || null;
                        console.log('startLocationResults에서 부분 매칭 결과:', endLocationData);
                      }
                      
                      if (!endLocationData) {
                        console.log('최종적으로 찾지 못함. endLocationResults 개수:', endLocationResults.length, 'startLocationResults 개수:', startLocationResults.length);
                        alert('도착지 정보를 찾을 수 없습니다. 다시 검색해주세요.');
                        return;
                      }
                    }

                    await startRoute({
                      startLocation: startLocationData,
                      endLocation: endLocationData!,
                      transportMode: selectedTransportMode,
                      userLocation: searchLocation || undefined,
                    });
                    
                    console.log('모바일 길찾기 요청 완료');
                    onToggle(); // Close bottom sheet after successful route search
                    
                  } catch (error: any) {
                    console.error('모바일 길찾기 오류:', error);
                    alert(error.message || '길찾기 중 오류가 발생했습니다.');
                  }
                }}
              >
                <Ionicons name="navigate-outline" size={20} color="#fff" />
                <Text style={styles.routeButtonText}>
                  {isRouteLoading ? '길찾기 중...' : routeResult ? '길찾기 완료' : '길찾기 시작'}
                </Text>
              </TouchableOpacity>

              {/* 출발지 검색 결과 리스트 */}
              {showStartResults && (
                <View style={styles.searchResultsList}>
                  <Text style={styles.searchResultsTitle}>출발지 검색 결과</Text>
                  {startLocationResults.length > 0 ? (
                    <ScrollView 
                      style={styles.searchResultsScrollContainer}
                      showsVerticalScrollIndicator={false}
                    >
                      {startLocationResults.map((item) => (
                        <TouchableOpacity
                          key={item.placeId}
                          style={styles.searchResultItem}
                          onPress={() => {
                            handleTextEdit();
                            setStartLocation(item.placeName);
                            setShowStartResults(false);
                          }}
                        >
                          <View style={styles.searchResultContent}>
                            <Text style={styles.searchResultTitle}>{item.placeName}</Text>
                            <Text style={styles.searchResultAddress}>{item.roadAddress}</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.departButton}
                            onPress={() => {
                              handleTextEdit();
                              setStartLocation(item.placeName);
                              setShowStartResults(false);
                            }}
                          >
                            <Text style={styles.departButtonText}>출발</Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>검색 결과가 없습니다</Text>
                    </View>
                  )}
                </View>
              )}

              {/* 목적지 검색 결과 리스트 */}
              {showEndResults && (
                <View style={styles.searchResultsList}>
                  <Text style={styles.searchResultsTitle}>목적지 검색 결과</Text>
                  {endLocationResults.length > 0 ? (
                    <ScrollView 
                      style={styles.searchResultsScrollContainer}
                      showsVerticalScrollIndicator={false}
                    >
                      {endLocationResults.map((item) => (
                        <TouchableOpacity
                          key={item.placeId}
                          style={styles.searchResultItem}
                          onPress={() => {
                            handleTextEdit();
                            setEndLocation(item.placeName);
                            setShowEndResults(false);
                          }}
                        >
                          <View style={styles.searchResultContent}>
                            <Text style={styles.searchResultTitle}>{item.placeName}</Text>
                            <Text style={styles.searchResultAddress}>{item.roadAddress}</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.departButton}
                            onPress={() => {
                              handleTextEdit();
                              setEndLocation(item.placeName);
                              setShowEndResults(false);
                            }}
                          >
                            <Text style={styles.departButtonText}>도착</Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>검색 결과가 없습니다</Text>
                    </View>
                  )}
                </View>
              )}


              {/* 길찾기 에러 표시 */}
              {routeError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{routeError}</Text>
                  <TouchableOpacity onPress={clearRoute} style={styles.errorCloseButton}>
                    <Ionicons name="close-outline" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}

              {/* 길찾기 결과 */}
              {routeResult && (
                <RouteResultComponent 
                  routeResult={routeResult}
                  onClose={clearRoute}
                />
              )}
            </ScrollView>
          )}
        </View>
      )}
    </Animated.View>
    
    </>
  );
};

const styles = StyleSheet.create({
  bottomSheetContainer: {
    width: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    left: 0,
    zIndex: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 15,
      },
      web: {
        boxShadow: '0px -5px 6px rgba(0,0,0,0.25)',
      },
    }),
  },
  contentContainer: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  toggleButton: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    padding: 5,
  },
  errorText: {
    color: 'red', // '#721c24',
    textAlign: 'center',
    marginTop: 20,    
    fontSize: 14,
    flex: 1,
  },
  noResultText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6c757d',
  },
  resultCountContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
    marginRight: 5,
  },
  resultCountText: {
    fontSize: 14,
    color: '#6c757d',
  },
  markerStatusText: {
    fontSize: 12,
    color: '#868e96',
    marginTop: 2,
  },
  searchNearMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  searchNearMeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  // 탭 관련 스타일
  tabHeader: {
    flexDirection: 'row',
    marginBottom: 8, // 16에서 8로 줄임
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#007bff',
  },
  tabButtonText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#007bff',
    fontWeight: '600',
  },
  // 검색 탭 스타일
  searchTabContent: {
    flex: 1,
    paddingVertical: 20,
  },
  // 길찾기 탭 스타일
  routeTabContent: {
    flex: 1,
  },
  routeTabScrollContent: {
    paddingVertical: 20,
    paddingBottom: 30, 
    flexGrow: 1,
  },
  // 교통수단 선택 스타일
  transportModeWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  transportModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -10,
    paddingHorizontal: 16,
    width: '100%',
  },
  transportModeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10, 
    borderRadius: 4, 
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 45, 
    alignItems: 'center',
    justifyContent: 'center',
  },
    transportModeButtonSelected: {
      backgroundColor: '#e3f2fd',
      borderColor: '#007bff',
      borderWidth: 2,
    },
    transportModeButtonDisabled: {
      backgroundColor: '#f5f5f5',
      borderColor: '#e0e0e0',
      opacity: 0.6,
    },
  // 입력 필드 스타일
  routeInputsContainer: {
    marginBottom: 16,
  },
  routeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  routeInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 6,
    minHeight: 6,
  },
  searchIndicator: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  currentLocationButton: {
    padding: 4,
    marginLeft: 8,
  },
  currentLocationButtonDisabled: {
    opacity: 0.6,
  },
  swapButton: {
    padding: 4,
    marginLeft: 8,
  },
  // 길찾기 버튼 스타일
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 0,
    marginBottom: 16,
  },
  routeButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  routeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // 검색 결과 리스트 스타일
  searchResultsList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 8,
    paddingVertical: 8,
    maxHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  searchResultsScrollContainer: {
    maxHeight: 160,
  },
  noResultsContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    margin: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  noResultsText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    backgroundColor: '#fff',
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 12,
    color: '#666',
  },
  departButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  departButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
  suggestionsList: {
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 5,
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default React.memo(CustomBottomSheet);
