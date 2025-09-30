import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { SearchResult, SearchOptions } from '../../types/search';
import SearchBar from '../search/SearchBar';
import { Ionicons } from '@expo/vector-icons';
import SearchOptionsComponent from '../search/SearchOptionsComponent';
import { PageResponse } from '../../types/api';
import SearchResultItem from '../search/SearchResultItem';
import { searchPlaces } from '../../services/searchApi';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';

interface SideMenuProps {
  isOpen: boolean;
  searchResults: SearchResult[];
  allMarkers: SearchResult[];
  onSelectResult: (item: SearchResult) => void;
  isLoading: boolean;
  errorMsg?: string | null; // Made optional
  onToggle: () => void;
  style: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
    onSearch: () => void;
    onSearchNearMe: () => void; // Add this prop
    searchOptions: SearchOptions;
    setSearchOptions: (options: Partial<SearchOptions>) => void;
    loadingNextPage: boolean;
    loadingAllMarkers: boolean;
    markerCountReachedLimit: boolean;
    onNextPage: () => void;
    pagination: Omit<PageResponse<any>, 'content'> | null;
    // 길찾기 연동을 위한 새로운 props
    onSetRouteLocation?: (type: 'departure' | 'arrival', placeInfo: SearchResult) => void;
    onOpenSidebar?: () => void; // 사이드바 열기 함수
  }
  
  const SideMenu: React.FC<SideMenuProps> = ({
    isOpen,
    searchResults,
    allMarkers,
    onSelectResult,
    isLoading,
    errorMsg,
    onToggle,
    style,
    searchQuery,
    setSearchQuery,
    onSearch,
    onSearchNearMe, // Destructure the new prop
    searchOptions,
    setSearchOptions,
    loadingNextPage,
    loadingAllMarkers,
    markerCountReachedLimit,
    onNextPage,
    pagination,
    onSetRouteLocation, // 새로운 prop 추가
    onOpenSidebar, // 사이드바 열기 함수 추가
  }) => {
    const [activeTab, setActiveTab] = useState<'search' | 'route'>('search');
    const [startLocation, setStartLocation] = useState('내 위치');
    const [endLocation, setEndLocation] = useState('');
    const [isEditingStart, setIsEditingStart] = useState(false);
    const [lastSelectedStartLocation, setLastSelectedStartLocation] = useState('내 위치');
    const [startLocationResults, setStartLocationResults] = useState<SearchResult[]>([]);
    const [endLocationResults, setEndLocationResults] = useState<SearchResult[]>([]);
    const [isSearchingStart, setIsSearchingStart] = useState(false);
    const [isSearchingEnd, setIsSearchingEnd] = useState(false);
  const [showStartResults, setShowStartResults] = useState(false);
  const [showEndResults, setShowEndResults] = useState(false);
  const [pressedStartButtons, setPressedStartButtons] = useState<Set<string>>(new Set());
  const [pressedEndButtons, setPressedEndButtons] = useState<Set<string>>(new Set());
  const [hoveredStartButtons, setHoveredStartButtons] = useState<Set<string>>(new Set());
  const [hoveredEndButtons, setHoveredEndButtons] = useState<Set<string>>(new Set());
  
  // 중복 검색 방지를 위한 상태
  const [isSearchingStartInProgress, setIsSearchingStartInProgress] = useState(false);
  const [isSearchingEndInProgress, setIsSearchingEndInProgress] = useState(false);
  const [lastStartQuery, setLastStartQuery] = useState<string>('');
  const [lastEndQuery, setLastEndQuery] = useState<string>('');
  
  // 교통수단 선택 상태
  const [selectedTransportMode, setSelectedTransportMode] = useState<'car' | 'transit' | 'walking' | 'bicycle'>('walking');

  // InfoWindow에서 길찾기 위치 설정 함수
  const handleSetRouteLocationInternal = (type: 'departure' | 'arrival', placeInfo: SearchResult) => {
    console.log('길찾기 탭으로 전환 시작, 현재 탭:', activeTab);
    console.log('사이드바 열림 상태:', isOpen);
    console.log('onOpenSidebar 함수 존재:', !!onOpenSidebar);
    
    // InfoWindow에서 길찾기 선택 시 항상 사이드바 열기
    console.log('사이드바 강제 열기');
    if (onOpenSidebar) {
      onOpenSidebar();
    } else {
      onToggle();
    }
    
    // 길찾기 탭으로 전환
    setActiveTab('route');
    
    // 선택된 타입에 따라 출발지 또는 목적지 설정
    if (type === 'departure') {
      console.log('출발지 설정:', placeInfo.placeName);
      setStartLocation(placeInfo.placeName);
      setLastSelectedStartLocation(placeInfo.placeName);
    } else {
      console.log('목적지 설정:', placeInfo.placeName);
      setEndLocation(placeInfo.placeName);
      // 도착지 설정 시 출발지가 비어있으면 "내 위치"로 설정
      if (!startLocation || startLocation.trim() === '') {
        console.log('출발지가 비어있어서 "내 위치"로 설정');
        setStartLocation('내 위치');
        setLastSelectedStartLocation('내 위치');
      }
    }
    
    // 검색 결과 리스트 숨기기
    setShowStartResults(false);
    setShowEndResults(false);
    
    console.log(`${type} 설정 완료:`, placeInfo.placeName);
  };

  // 외부에서 호출되는 길찾기 위치 설정 함수 (prop으로 받은 함수 사용)
  useEffect(() => {
    // 전역 함수로 등록하여 KakaoMap에서 호출할 수 있도록 함
    (window as any).setRouteLocationFromInfoWindow = (type: 'departure' | 'arrival', placeInfo: SearchResult) => {
      console.log('전역 함수 호출됨:', type, placeInfo);
      handleSetRouteLocationInternal(type, placeInfo);
      if (onSetRouteLocation) {
        onSetRouteLocation(type, placeInfo);
      }
    };
    
    console.log('전역 함수 등록됨:', (window as any).setRouteLocationFromInfoWindow);
  }, [onSetRouteLocation]);
  
  // 디바운스를 위한 타이머 참조
  const startSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const { location } = useCurrentLocation();
  
    // 출발지 검색 함수
    const searchStartLocation = async (query: string) => {
      if (!query.trim() || !location) return;
      
      // 중복 검색 방지: 동일한 쿼리로 이미 검색 중이거나 검색했으면 스킵
      if (isSearchingStartInProgress || lastStartQuery === query) {
        return;
      }

      setIsSearchingStartInProgress(true);
      setLastStartQuery(query);
      setIsSearchingStart(true);
      
      try {
        const results = await searchPlaces(
          query,
          location.latitude,
          location.longitude,
          5000, // 5km 반경
          'distance', // 거리순
          1,
          location.latitude,
          location.longitude
        );
        console.log('출발지 검색 결과:', results.content.length, '개');
        setStartLocationResults(results.content.slice(0, 10)); // 상위 10개 표시
        setShowStartResults(true);
      } catch (error) {
        console.error('출발지 검색 실패:', error);
        setStartLocationResults([]);
      } finally {
        setIsSearchingStart(false);
        setIsSearchingStartInProgress(false);
      }
    };

    // 디바운스된 출발지 검색 함수
    const debouncedSearchStartLocation = (query: string) => {
      // 기존 타이머 취소
      if (startSearchTimeoutRef.current) {
        clearTimeout(startSearchTimeoutRef.current);
      }
      
      // 새로운 타이머 설정 (500ms 후 실행)
      startSearchTimeoutRef.current = setTimeout(() => {
        if (query.trim().length > 1) {
          searchStartLocation(query);
        } else {
          setShowStartResults(false);
          setStartLocationResults([]);
        }
      }, 500);
    };

    // 목적지 검색 함수
    const searchEndLocation = async (query: string) => {
      if (!query.trim() || !location) return;
      
      // 중복 검색 방지: 동일한 쿼리로 이미 검색 중이거나 검색했으면 스킵
      if (isSearchingEndInProgress || lastEndQuery === query) {
        return;
      }

      setIsSearchingEndInProgress(true);
      setLastEndQuery(query);
      setIsSearchingEnd(true);
      
      try {
        const results = await searchPlaces(
          query,
          location.latitude,
          location.longitude,
          5000, // 5km 반경
          'distance', // 거리순
          1,
          location.latitude,
          location.longitude
        );
        console.log('목적지 검색 결과:', results.content.length, '개');
        setEndLocationResults(results.content.slice(0, 10)); // 상위 10개 표시
        setShowEndResults(true);
      } catch (error) {
        console.error('목적지 검색 실패:', error);
        setEndLocationResults([]);
      } finally {
        setIsSearchingEnd(false);
        setIsSearchingEndInProgress(false);
      }
    };

    // 디바운스된 목적지 검색 함수
    const debouncedSearchEndLocation = (query: string) => {
      // 기존 타이머 취소
      if (endSearchTimeoutRef.current) {
        clearTimeout(endSearchTimeoutRef.current);
      }
      
      // 새로운 타이머 설정 (500ms 후 실행)
      endSearchTimeoutRef.current = setTimeout(() => {
        if (query.trim().length > 1) {
          searchEndLocation(query);
        } else {
          setShowEndResults(false);
          setEndLocationResults([]);
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

    const renderFooter = () => {
      // 더 이상 로드할 페이지가 없으면 로딩 스피너를 표시하지 않음
      console.log('renderFooter - loadingNextPage:', loadingNextPage, 'pagination:', pagination);
      
      // 강력한 조건: 로딩 중이 아니거나, 페이지네이션 정보가 없거나, 마지막 페이지이거나, 현재 페이지가 총 페이지보다 크면 스피너 숨김
      // 추가: 백엔드 문제 대응 - 현재 페이지가 비정상적으로 클 때도 스피너 숨김
      if (!loadingNextPage || 
          !pagination || 
          pagination.isLast || 
          pagination.currentPage >= pagination.totalPages ||
          searchResults.length === 0 ||
          pagination.currentPage > 10) { // 백엔드 문제 대응: 페이지가 10을 넘으면 스피너 숨김
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
            onEndReached={pagination && !pagination.isLast && pagination.currentPage < pagination.totalPages ? onNextPage : undefined}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        );
      }
      return <Text style={styles.noResultText}>검색어를 입력하고 검색 버튼을 눌러주세요.</Text>;
    };
  
    return (
      <Animated.View style={[styles.sideMenuContainer, style]}>
        <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
          <Ionicons name={isOpen ? "chevron-back" : "chevron-forward"} size={24} color="#495057" />
        </TouchableOpacity>
        
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
          <>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={onSearch}
            />
            <TouchableOpacity onPress={onSearchNearMe} style={styles.searchNearMeButton}>
              <Ionicons name="locate-outline" size={20} color="#fff" />
              <Text style={styles.searchNearMeButtonText}>내 주변 검색</Text>
            </TouchableOpacity>
            <SearchOptionsComponent searchOptions={searchOptions} setSearchOptions={setSearchOptions} />
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
          </>
        ) : (
          <TouchableWithoutFeedback onPress={() => {
            setShowStartResults(false);
            setShowEndResults(false);
          }}>
            <View style={styles.routeTabContent}>
            
            {/* 교통수단 선택 아이콘들 */}
            <View style={styles.transportModeWrapper}>
              <View style={styles.transportModeContainer}>
                <TouchableOpacity 
                  style={[
                    styles.transportModeButton,
                    selectedTransportMode === 'car' && styles.transportModeButtonSelected
                  ]}
                  onPress={() => setSelectedTransportMode('car')}
                >
                  <Ionicons 
                    name="car-outline" 
                    size={20} 
                    color={selectedTransportMode === 'car' ? '#007bff' : '#666'} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.transportModeButton,
                    selectedTransportMode === 'transit' && styles.transportModeButtonSelected
                  ]}
                  onPress={() => setSelectedTransportMode('transit')}
                >
                  <Ionicons 
                    name="bus-outline" 
                    size={20} 
                    color={selectedTransportMode === 'transit' ? '#007bff' : '#666'} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.transportModeButton,
                    selectedTransportMode === 'walking' && styles.transportModeButtonSelected
                  ]}
                  onPress={() => setSelectedTransportMode('walking')}
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
                    selectedTransportMode === 'bicycle' && styles.transportModeButtonSelected
                  ]}
                  onPress={() => setSelectedTransportMode('bicycle')}
                >
                  <Ionicons 
                    name="bicycle-outline" 
                    size={20} 
                    color={selectedTransportMode === 'bicycle' ? '#007bff' : '#666'} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 전체 입력 영역 (수평 배치) */}
            <View style={styles.inputsRowContainer}>
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
                      setStartLocation(text);
                      debouncedSearchStartLocation(text);
                    }}
                    onSubmitEditing={() => {
                      if (startLocation.trim() && startLocation !== "내 위치") {
                        searchStartLocation(startLocation);
                      }
                    }}
                    selectionColor="transparent"
                    underlineColorAndroid="transparent"
                  />
                  {isSearchingStart && (
                    <ActivityIndicator size="small" color="#007bff" style={styles.searchIndicator} />
                  )}
                </View>
                
                {/* 현재 위치 버튼 */}
                <TouchableOpacity 
                  style={styles.currentLocationButton}
                  onPress={() => {
                    setStartLocation('내 위치');
                    setLastSelectedStartLocation('내 위치');
                    setShowStartResults(false);
                  }}
                >
                  <Ionicons name="compass-outline" size={16} color="#007bff" />
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
                      setEndLocation(text);
                      debouncedSearchEndLocation(text);
                    }}
                    onSubmitEditing={() => {
                      if (endLocation.trim()) {
                        searchEndLocation(endLocation);
                      }
                    }}
                    selectionColor="transparent"
                    underlineColorAndroid="transparent"
                  />
                  {isSearchingEnd && (
                    <ActivityIndicator size="small" color="#007bff" style={styles.searchIndicator} />
                  )}
                </View>
                
                {/* 목적지 추가 버튼 */}
                <TouchableOpacity style={styles.addButton}>
                  <Ionicons name="add-outline" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 바꾸기 버튼과 X 버튼 - 컨테이너 오른쪽에 독립적으로 배치 */}
            <View style={styles.controlButtonsContainer}>
              {/* 바꾸기 버튼 */}
              <TouchableOpacity 
                style={styles.swapButtonSide}
                onPress={() => {
                  const tempStart = startLocation;
                  const tempEnd = endLocation;
                  
                  if (tempStart === '내 위치') {
                    // 출발지가 "내 위치"일 때: 목적지가 "내 위치"가 되고 출발지는 비워짐
                    setStartLocation('');
                    setEndLocation('내 위치');
                    setLastSelectedStartLocation('');
                  } else {
                    // 일반적인 경우: 출발지와 목적지 교체
                    setStartLocation(tempEnd || '내 위치');
                    setEndLocation(tempStart === '내 위치' ? '' : tempStart);
                    setLastSelectedStartLocation(tempEnd || '내 위치');
                  }
                }}
              >
                <Ionicons name="swap-vertical-outline" size={16} color="#666" />
              </TouchableOpacity>

              {/* X 버튼 (지우기/닫기) */}
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setStartLocation('');
                  setEndLocation('');
                  setLastSelectedStartLocation('');
                  setShowStartResults(false);
                  setShowEndResults(false);
                }}
              >
                <Ionicons name="close-outline" size={16} color="#666" />
              </TouchableOpacity>
            </View>
            </View>

            {/* 길찾기 시작 버튼 */}
            <TouchableOpacity 
              style={[
                styles.routeButton, 
                (!endLocation.trim()) && styles.routeButtonDisabled
              ]}
              disabled={!endLocation.trim()}
            >
              <Ionicons name="navigate-outline" size={20} color="#fff" />
              <Text style={styles.routeButtonText}>길찾기 시작</Text>
            </TouchableOpacity>

            {/* 출발지 검색 결과 리스트 */}
            {showStartResults && (
              <View style={styles.searchResultsList}>
                <Text style={styles.searchResultsTitle}>출발지 검색 결과</Text>
                {startLocationResults.length > 0 ? (
                  <ScrollView style={styles.searchResultsScrollContainer} showsVerticalScrollIndicator={false}>
                    {startLocationResults.map((result, index) => (
                  <TouchableOpacity
                    key={result.placeId}
                    style={styles.searchResultItem}
                    onPressIn={() => {
                      setStartLocation(result.placeName);
                      setLastSelectedStartLocation(result.placeName);
                      setShowStartResults(false);
                    }}
                  >
                    <View style={styles.searchResultContent}>
                      <Text style={styles.searchResultTitle}>{result.placeName}</Text>
                      <Text style={styles.searchResultAddress}>{result.roadAddress}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[
                        Platform.OS === 'web' ? styles.departButtonWeb : styles.departButton,
                        pressedStartButtons.has(result.placeId) && styles.departButtonPressed,
                        Platform.OS === 'web' && hoveredStartButtons.has(result.placeId) && styles.departButtonPressed
                      ]}
                      onPressIn={() => {
                        setPressedStartButtons(prev => new Set(prev).add(result.placeId));
                        setStartLocation(result.placeName);
                        setLastSelectedStartLocation(result.placeName);
                        setShowStartResults(false);
                      }}
                      onPressOut={() => {
                        setPressedStartButtons(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(result.placeId);
                          return newSet;
                        });
                      }}
                      {...(Platform.OS === 'web' && {
                        onMouseEnter: () => {
                          setHoveredStartButtons(prev => new Set(prev).add(result.placeId));
                        },
                        onMouseLeave: () => {
                          setHoveredStartButtons(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(result.placeId);
                            return newSet;
                          });
                        }
                      })}
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
                  <ScrollView style={styles.searchResultsScrollContainer} showsVerticalScrollIndicator={false}>
                    {endLocationResults.map((result, index) => (
                  <TouchableOpacity
                    key={result.placeId}
                    style={styles.searchResultItem}
                    onPressIn={() => {
                      setEndLocation(result.placeName);
                      setShowEndResults(false);
                    }}
                  >
                    <View style={styles.searchResultContent}>
                      <Text style={styles.searchResultTitle}>{result.placeName}</Text>
                      <Text style={styles.searchResultAddress}>{result.roadAddress}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[
                        Platform.OS === 'web' ? styles.departButtonWeb : styles.departButton,
                        pressedEndButtons.has(result.placeId) && styles.departButtonPressed,
                        Platform.OS === 'web' && hoveredEndButtons.has(result.placeId) && styles.departButtonPressed
                      ]}
                      onPressIn={() => {
                        setPressedEndButtons(prev => new Set(prev).add(result.placeId));
                        setEndLocation(result.placeName);
                        setShowEndResults(false);
                      }}
                      onPressOut={() => {
                        setPressedEndButtons(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(result.placeId);
                          return newSet;
                        });
                      }}
                      {...(Platform.OS === 'web' && {
                        onMouseEnter: () => {
                          setHoveredEndButtons(prev => new Set(prev).add(result.placeId));
                        },
                        onMouseLeave: () => {
                          setHoveredEndButtons(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(result.placeId);
                            return newSet;
                          });
                        }
                      })}
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

            </View>
          </TouchableWithoutFeedback>
        )}
      </Animated.View>
    );
  };
  
  const styles = StyleSheet.create({
    sideMenuContainer: {
      width: 350,
      backgroundColor: '#f8f9fa',
      padding: 16,
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 10,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 5, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
        },
        android: {
          elevation: 15,
        },
        web: {
          boxShadow: '5px 0px 6px rgba(0,0,0,0.25)',
        }
      })
    },
    toggleButton: {
      position: 'absolute',
      top: '50%',
      right: -30,
      width: 30,
      height: 60,
      backgroundColor: '#f8f9fa',
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderLeftWidth: 0,
      borderColor: '#dee2e6',
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 3, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 10,
        },
        web: {
          boxShadow: '3px 2px 4px rgba(0,0,0,0.2)',
        }
      })
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
    errorText: {
      color: 'red',
      textAlign: 'center',
      marginTop: 20,
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
    // 탭 관련 스타일
    tabHeader: {
      flexDirection: 'row',
      marginBottom: 16,
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
    // 길찾기 탭 스타일
    routeTabContent: {
      flex: 1,
      paddingVertical: 20,
      paddingBottom: 100, // 드롭다운을 위한 여백 추가
      position: 'relative',
      zIndex: 1,
    },
    routeTabTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 20,
      textAlign: 'center',
    },
    // 입력 필드 스타일
    inputContainer: {
      marginBottom: 16,
      position: 'relative',
      zIndex: 10,
    },
    // 전체 입력 영역 (수평 배치)
    inputsRowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 14, 
    },
    // 출발지/목적지 입력 영역 컨테이너
    routeInputsContainer: {
      flex: 1,
      marginRight: 0,
    },
    // 컨트롤 버튼들 컨테이너
    controlButtonsContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20, // 버튼들 사이의 간격을 더 넓게 조정
      width: 32, // 너비를 24px에서 32px로 확대
      marginLeft: 8, // 적절한 간격 유지
      height: 104, // 출발지(48px) + 마진(8px) + 목적지(48px) = 104px
    },
    // 바꾸기 버튼 (출발지 컨테이너 Y 좌표 가운데)
    swapButtonSide: {
      padding: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // X 버튼 (목적지 컨테이너 Y 좌표 가운데)
    clearButton: {
      padding: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // 새로운 길찾기 입력 스타일
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
      position: 'relative',
      zIndex: 10,
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
    addButton: {
      padding: 4,
    },
    // 검색 결과 리스트 스타일
    searchResultsList: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#dee2e6',
      borderRadius: 8,
      marginBottom: 16,
      paddingVertical: 8,
      maxHeight: 300,
      position: 'relative',
      zIndex: 10,
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
      maxHeight: 260,
    },
    noResultsContainer: {
      paddingVertical: 20,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    noResultsText: {
      fontSize: 14,
      color: '#999',
      fontStyle: 'italic',
    },
    // 드롭다운 스타일
    searchResultsDropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#dee2e6',
      borderRadius: 8,
      marginTop: 4,
      zIndex: 9999,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    searchResultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f3f4',
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
      backgroundColor: '#adb5bd',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      marginLeft: 8,
    },
    departButtonWeb: {
      backgroundColor: '#adb5bd',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      marginLeft: 8,
    },
    departButtonPressed: {
      backgroundColor: '#007bff',
    },
    departButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '500',
    },
    moreResultsIndicator: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#f8f9fa',
      alignItems: 'center',
    },
    moreResultsText: {
      fontSize: 12,
      color: '#666',
      fontStyle: 'italic',
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#dee2e6',
      borderRadius: 8,
      backgroundColor: '#fff',
      paddingHorizontal: 12,
      paddingVertical: 8,
      position: 'relative',
      zIndex: 1000,
    },
    inputIcon: {
      marginRight: 8,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: '#333',
      paddingVertical: 4,
    },
    currentLocationButton: {
      padding: 4,
      marginLeft: 8,
    },
    locationDisplay: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    locationText: {
      fontSize: 16,
      color: '#333',
      flex: 1,
    },
    // 검색 결과 관련 스타일
    inputWithResults: {
      flex: 1,
      position: 'relative',
    },
    searchIndicator: {
      position: 'absolute',
      right: 8,
      top: 8,
      zIndex: 1001,
    },
    searchResults: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#dee2e6',
      borderTopWidth: 0,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      maxHeight: 300, // 드롭다운 길이 증가
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 10,
      zIndex: 9999, // 최고 z-index로 설정
    },
    startLocationDropdownAbsolute: {
      position: 'absolute',
      top: 60, // 출발지 입력 필드 아래 위치로 조정
      left: 0,
      right: 0,
      zIndex: 99999, // 최고 z-index
    },
    searchResultName: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      marginBottom: 2,
    },
    routeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#007bff',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginTop: 0,
      marginBottom: 36,
      marginHorizontal: 12, // 교통수단 아이콘과 같은 패딩
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
    // 교통수단 선택 스타일
    transportModeWrapper: {
      alignItems: 'center',
      marginTop: -10,
      marginBottom: 16,
    },
    transportModeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      width: 330, // 더 넓게 조정
    },
    transportModeButton: {
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 6,
      backgroundColor: '#f8f9fa',
      borderWidth: 1,
      borderColor: '#dee2e6',
      minWidth: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    transportModeButtonSelected: {
      backgroundColor: '#e3f2fd',
      borderColor: '#007bff',
      borderWidth: 2,
    },
  });
  
  export default React.memo(SideMenu);
