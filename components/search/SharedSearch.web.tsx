import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from './SearchBar';
import SearchOptionsComponent from './SearchOptionsComponent';
import SearchResultItem from './SearchResultItem';
import RouteResultComponent from '../route/RouteResult';
import { SearchResult, SearchOptions, AutocompleteResponse } from '../../types/search';
import { PageResponse } from '../../types/api';
import { commonStyles } from './styles/SharedSearch.common.styles';
import { webStyles } from './styles/SharedSearch.web.styles';
import { mobileStyles } from './styles/SharedSearch.mobile.styles';


interface SharedSearchProps {
  isWebView: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (query?: string, useCache?: boolean) => void;
  onClearSearch: () => void; // New prop
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
  activeSearchTab: 'searchResults' | 'nearbyParking';
  setActiveSearchTab: (tab: 'searchResults' | 'nearbyParking') => void;
  parkingLots: any[];
  parkingLotsLoading: boolean;
  parkingLotsError: string | null;
}

const WebSharedSearch: React.FC<SharedSearchProps> = ({
  isWebView,
  searchQuery,
  setSearchQuery,
  onSearch,
  onClearSearch,
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
  activeTab,
  setActiveTab,
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
  startRoute,
  isRouteLoading,
  routeResult,
  routeError,
  clearRoute,
  searchLocation,
  location,
  startLocationObject,
  setStartLocationObject,
  endLocationObject,
  setEndLocationObject,
  activeSearchTab,
  setActiveSearchTab,
  parkingLots,
  parkingLotsLoading,
  parkingLotsError,
  }) => {
  const [hasPerformedSearch, setHasPerformedSearch] = useState(false); // New state to track if a search has been performed
  const [recentSearches, setRecentSearches] = useState<string[]>([]); // New state for recent searches
  const [isSearchBarFocused, setIsSearchBarFocused] = useState(false); // New state for search bar focus
  const [searchSubmitted, setSearchSubmitted] = useState(false); // New state to track if a search has been submitted
  const routeScrollViewRef = useRef<ScrollView>(null);
  const searchBarRef = useRef<TextInput>(null); // Ref for the SearchBar's TextInput
  const suggestionsContainerRef = useRef<View>(null); // Ref for the suggestions container

  const prevSortOption = useRef(searchOptions.sort);

  useEffect(() => {
    if (searchSubmitted && prevSortOption.current !== searchOptions.sort) {
      onSearch();
    }
    prevSortOption.current = searchOptions.sort;
  }, [searchOptions.sort, searchSubmitted, onSearch]);

  // Functions to manage recent searches
  const loadRecentSearches = () => {
    if (Platform.OS === 'web') {
      const storedSearches = localStorage.getItem('recentSearches');
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    }
  };

  const addRecentSearch = (search: string) => {
    if (Platform.OS === 'web') {
      setRecentSearches((prevSearches) => {
        const newSearches = [search, ...prevSearches.filter((s) => s !== search)].slice(0, 5); // Keep last 5 unique searches
        localStorage.setItem('recentSearches', JSON.stringify(newSearches));
        return newSearches;
      });
    }
  };

  const removeRecentSearch = (searchToRemove: string) => {
    if (Platform.OS === 'web') {
      setRecentSearches((prevSearches) => {
        const newSearches = prevSearches.filter((search) => search !== searchToRemove);
        localStorage.setItem('recentSearches', JSON.stringify(newSearches));
        return newSearches;
      });
    }
  };

  useEffect(() => {
    loadRecentSearches();
  }, []); // Load on mount

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleClickOutside = (event: MouseEvent) => {
        const suggestionsNode = suggestionsContainerRef.current as any;
        const searchBarNode = searchBarRef.current as any;

        if (
          suggestionsNode && !suggestionsNode.contains(event.target as Node) &&
          searchBarNode && !searchBarNode.contains(event.target as Node)
        ) {
          setShowAutocomplete(false);
          if (searchBarNode.blur) {
            searchBarNode.blur();
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showAutocomplete, setShowAutocomplete]);

  const renderFooter = () => {
    if (!loadingNextPage || !pagination || pagination.isLast || pagination.currentPage >= pagination.totalPages) {
      return null;
    }
    return <ActivityIndicator style={{ paddingVertical: 20 }} size="large" color="#3690FF" />;
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#3690FF" style={{ marginTop: 20 }} />;
    }
    if (errorMsg) {
      return <Text style={commonStyles.errorText}>{String(errorMsg)}</Text>;
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
    return <Text style={commonStyles.noResultText}>검색 결과가 없거나, 검색을 시작하세요.</Text>;
  };

  const contentContainerStyles = webStyles.contentContainer;
  const suggestionsContainerStyles = webStyles.suggestionsContainer;

  const triggerRouteSearch = React.useCallback(async (modeOverride?: 'driving' | 'transit' | 'walking' | 'cycling') => {
    const transportMode = modeOverride || selectedTransportMode;
    try {
      if (!endLocation.trim()) {
        alert('도착지를 입력해주세요.');
        return;
      }

      let startLocationData: SearchResult | string;
      if (startLocationObject) {
        startLocationData = startLocationObject;
      } else if (typeof startLocation === 'string' && startLocation.trim() === '내 위치') {
        startLocationData = '내 위치';
      } else if (typeof startLocation === 'string') {
        let foundStartLocation = startLocationResults.find(item => item.placeName === startLocation);
        if (!foundStartLocation) {
          foundStartLocation = endLocationResults.find(item => item.placeName === startLocation);
        }
        if (!foundStartLocation) {
          alert('출발지 정보를 찾을 수 없습니다. 다시 검색해주세요.');
          return;
        }
        startLocationData = foundStartLocation;
        setStartLocationObject(foundStartLocation); // Save the object
      } else {
        throw new Error('Invalid start location');
      }

      let endLocationData: SearchResult | null = null;
      if (endLocationObject) {
        endLocationData = endLocationObject;
      } else if (endLocation.trim() === '내 위치') {
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
          roadAddressDong: '',
          lotAddress: '',
          phone: '',
          categoryGroupName: '',
          placeUrl: '',
          distance: 0
        };
      } else {
        let foundEndLocation = endLocationResults.find(item => item.placeName === endLocation);
        if (!foundEndLocation) {
          foundEndLocation = startLocationResults.find(item => item.placeName === endLocation);
        }
        if (!foundEndLocation) {
          alert('도착지 정보를 찾을 수 없습니다. 다시 검색해주세요.');
          return;
        }
        endLocationData = foundEndLocation;
        setEndLocationObject(foundEndLocation); // Save the object
      }

      await startRoute({
        startLocation: startLocationData,
        endLocation: endLocationData!,
        transportMode: transportMode,
        userLocation: location || undefined,
      });

    } catch (error: any) {
      alert(error.message || '길찾기 중 오류가 발생했습니다.');
    }
  }, [
    startLocation, endLocation, startLocationObject, endLocationObject,
    location, startLocationResults, endLocationResults, selectedTransportMode,
    startRoute, setStartLocationObject, setEndLocationObject
  ]);

  return (
    <View style={[contentContainerStyles, isWebView && contentContainerStyles]}>
      <View style={commonStyles.tabHeader}>
        <TouchableOpacity
          style={[commonStyles.tabButton, activeTab === 'search' && commonStyles.activeTabButton]}
          onPress={() => setActiveTab('search')}
        >
          <Ionicons name="search-outline" size={20} color={activeTab === 'search' ? '#3690FF' : '#F0F0F0'} />
          <Text style={[
            commonStyles.tabButtonText,
            activeTab === 'search' && commonStyles.activeTabButtonText,
            activeTab !== 'search' && { color: '#F0F0F0' }
          ]}>검색</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[commonStyles.tabButton, activeTab === 'route' && commonStyles.activeTabButton]}
          onPress={() => setActiveTab('route')}
        >
          <Ionicons name="navigate-outline" size={20} color={activeTab === 'route' ? '#3690FF' : '#F0F0F0'} />
          <Text style={[
            commonStyles.tabButtonText,
            activeTab === 'route' && commonStyles.activeTabButtonText,
            activeTab !== 'route' && { color: '#F0F0F0' }
          ]}>길찾기</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'search' ? (
        <View style={commonStyles.searchTabContent}>
          <SearchBar
            ref={searchBarRef}
            searchQuery={searchQuery}
            setSearchQuery={(text) => {
              setSearchQuery(text);
              if (text.length > 0) {
                setShowAutocomplete(true); // Show autocomplete as user types
                setHasPerformedSearch(false); // Reset search performed flag
              } else {
                setShowAutocomplete(false); // Hide autocomplete if query is empty
              }
              debouncedAutocomplete(text);
              setSearchSubmitted(false);
            }}
            onSearch={() => {
              onSearch(searchQuery, false);
              setShowAutocomplete(false);
              setSearchSubmitted(true);
              if (searchQuery.trim().length > 0) {
                addRecentSearch(searchQuery); // Add current search query to recent searches
              }
            }}
            onClearSearch={() => {
              onClearSearch();
              setIsSearchBarFocused(false);
            }}
            onFocus={() => setIsSearchBarFocused(true)}
            onBlur={(e: any) => {
              if (Platform.OS === 'web') {
                // Check if the focus is moving to an element within the suggestions container
                const suggestionsNode = suggestionsContainerRef.current as any;
                if (e.relatedTarget && suggestionsNode && suggestionsNode.contains(e.relatedTarget as Node)) {
                  return; // Do not blur if focus moves to a suggestion item
                }
              }
              setIsSearchBarFocused(false); // Set focus state immediately
            }}
          />
          {(showAutocomplete && !hasPerformedSearch && autocompleteSuggestions.length > 0 && !searchSubmitted) || (searchQuery.length === 0 && isSearchBarFocused && recentSearches.length > 0) ? (
            <View ref={suggestionsContainerRef} style={[commonStyles.suggestionsContainer, suggestionsContainerStyles]}>
              {searchQuery.length === 0 && isSearchBarFocused ? (
                // Display Recent Searches
                <View>
                  <Text style={commonStyles.suggestionsTitle}>최근 검색</Text>
                  <FlatList
                    data={recentSearches}
                    keyExtractor={(item, index) => `recent-${item}-${index}`}
                    renderItem={({ item }) => (

                        <TouchableOpacity
                            style={commonStyles.suggestionItem}
                            onPress={() => {
                                setSearchQuery(item);
                                onSearch(item, false);
                                addRecentSearch(item);
                                setHasPerformedSearch(true);
                                setShowAutocomplete(false);
                                setSearchSubmitted(true);
                            }}
                        >
                        <Text>{item}</Text>
                        <TouchableOpacity
                            onPress={() => removeRecentSearch(item)}
                            style={commonStyles.removeRecentSearchButton}
                        >
                          <Ionicons name="close-circle-outline" size={18} color="#B9B9B9" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    )}
                    style={commonStyles.suggestionsList}
                  />
                </View>
              ) : (
                // Display Autocomplete Suggestions
                <FlatList
                  data={autocompleteSuggestions}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={commonStyles.suggestionItem}
                      onPress={() => {
                        setSearchQuery(item.word);
                        setShowAutocomplete(false);
                      }}
                    >
                      <Text>{item.word}</Text>
                    </TouchableOpacity>
                  )}
                  style={commonStyles.suggestionsList}
                />
              )}
            </View>
          ) : null}
          <SearchOptionsComponent searchOptions={searchOptions} setSearchOptions={setSearchOptions} />
          <View style={commonStyles.subTabContainer}>
            <TouchableOpacity
              style={[
                commonStyles.subTabButton,
                activeSearchTab === 'searchResults' && commonStyles.activeSubTabButton,
              ]}
              onPress={() => setActiveSearchTab('searchResults')}
            >
              <Text
                style={[
                  commonStyles.subTabButtonText,
                  activeSearchTab === 'searchResults' && commonStyles.activeSubTabButtonText,
                ]}
              >
                검색 결과
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                commonStyles.subTabButton,
                activeSearchTab === 'nearbyParking' && commonStyles.activeSubTabButton,
              ]}
              onPress={() => setActiveSearchTab('nearbyParking')}
            >
              <Text
                style={[
                  commonStyles.subTabButtonText,
                  activeSearchTab === 'nearbyParking' && commonStyles.activeSubTabButtonText,
                ]}
              >
                주변 주차장
              </Text>
            </TouchableOpacity>
          </View>
          <View style={commonStyles.tabContent}>
            {activeSearchTab === 'searchResults' ? (
              <>
                {pagination && searchResults.length > 0 && (
                  <View style={commonStyles.resultCountContainer}>
                    <Text style={commonStyles.resultCountText}>총 {pagination.totalElements}개 결과</Text>
                    {loadingAllMarkers && (
                      <Text style={commonStyles.markerStatusText}>
                        (전체 마커 로딩중...)
                      </Text>
                    )}
                    {markerCountReachedLimit && (
                      <Text style={commonStyles.markerStatusText}>
                        (지도에 {allMarkers.length}개만 표시)
                      </Text>
                    )}
                  </View>
                )}
                {renderContent()}
              </>
            ) : (
              <View style={commonStyles.parkingLotContent}>
                {parkingLotsLoading ? (
                  <ActivityIndicator size="large" color="#3690FF" style={{ marginTop: 20 }} />
                ) : parkingLotsError ? (
                  <Text style={commonStyles.errorText}>{parkingLotsError}</Text>
                ) : parkingLots && parkingLots.length > 0 ? (
                  <FlatList
                    data={parkingLots.map(p => ({
                      placeId: String(p.id),
                      placeName: p.parkingLotNm,
                      roadAddress: p.roadAddress,
                      lotAddress: p.lotAddress,
                      lat: p.lat,
                      lng: p.lng,
                      distance: p.distance,
                      phone: '', // ParkingLot type doesn't have phone, add if needed
                      categoryGroupName: '주차장', // Set a default category name
                        parkingChargeInfo: p.parkingChargeInfo, // Pass the parkingChargeInfo correctly
                      placeUrl: '',
                      roadAddressDong: '',
                    }))}
                    keyExtractor={(item) => item.placeId}
                    renderItem={({ item }) => <SearchResultItem item={item} onPress={onSelectResult} />}
                  />
                ) : (
                  <Text style={commonStyles.noResultText}>주변에 주차장 정보가 없습니다.</Text>
                )}
              </View>
            )}
          </View>
        </View>
      ) : (
        <ScrollView
          ref={routeScrollViewRef}
          style={commonStyles.routeTabContent}
          contentContainerStyle={commonStyles.routeTabScrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <View style={commonStyles.transportModeWrapper}>
            <View style={commonStyles.transportModeContainer}>
              <TouchableOpacity
                style={[
                  webStyles.transportModeButton,
                  selectedTransportMode === 'driving' && webStyles.transportModeButtonSelected
                ]}
                onPress={() => {
                  const newMode = 'driving';
                  setSelectedTransportMode(newMode);
                  if (routeResult) {
                    triggerRouteSearch(newMode);
                  }
                }}
              >
                <Ionicons
                  name="car-outline"
                  size={20}
                  color={
                    selectedTransportMode === 'driving'
                      ? '#3690FF'
                      : '#666'
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  webStyles.transportModeButton,
                  commonStyles.transportModeButtonDisabled, // 대중교통 미구현
                  selectedTransportMode === 'transit' && webStyles.transportModeButtonSelected
                ]}
                onPress={() => {
                  console.log('대중교통 모드는 아직 구현되지 않았습니다.');
                }}
                disabled={true}
              >
                <Ionicons
                  name="bus-outline"
                  size={20}
                  color="#ccc"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  webStyles.transportModeButton,
                  selectedTransportMode === 'walking' && webStyles.transportModeButtonSelected
                ]}
                onPress={() => {
                  const newMode = 'walking';
                  setSelectedTransportMode(newMode);
                  if (routeResult) {
                    triggerRouteSearch(newMode);
                  }
                }}
              >
                <Ionicons
                  name="walk-outline"
                  size={20}
                  color={
                    selectedTransportMode === 'walking'
                      ? '#3690FF'
                      : '#666'
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  webStyles.transportModeButton,
                  selectedTransportMode === 'cycling' && webStyles.transportModeButtonSelected
                ]}
                onPress={() => {
                  const newMode = 'cycling';
                  setSelectedTransportMode(newMode);
                  if (routeResult) {
                    triggerRouteSearch(newMode);
                  }
                }}
              >
                <Ionicons
                  name="bicycle-outline"
                  size={20}
                  color={
                    selectedTransportMode === 'cycling'
                      ? '#3690FF'
                      : '#666'
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={commonStyles.routeInputsContainer}>
            <View style={commonStyles.routeInputContainer}>
              <View style={commonStyles.routeInputWrapper}>
                <TextInput
                  style={commonStyles.routeTextInput}
                  placeholder="출발지를 입력하세요"
                  placeholderTextColor="#B9B9B9"
                  value={startLocation}
                  onChangeText={(text) => {
                    handleTextEdit();
                    setStartLocation(text);
                    setStartLocationObject(null); // Clear object when typing
                    debouncedSearchStartLocation(text);
                  }}
                  onFocus={handleTextEdit}
                  selectionColor="transparent"
                  underlineColorAndroid="transparent"
                />
                {isSearchingStart ? (
                  <ActivityIndicator size="small" color="#3690FF" style={commonStyles.searchIndicator} />
                ) : (
                  startLocation.length > 0 && (
                    <TouchableOpacity
                      style={commonStyles.routeInputClearButton}
                      onPress={() => {
                        handleTextEdit();
                        setStartLocation('');
                        setStartLocationObject(null);
                      }}
                    >
                      <Ionicons name="close-circle" size={18} color="#B9B9B9" />
                    </TouchableOpacity>
                  )
                )}
              </View>

              <TouchableOpacity
                style={[
                  commonStyles.currentLocationButton,
                  !location && commonStyles.currentLocationButtonDisabled
                ]}
                onPress={() => {
                  if (location) {
                    handleTextEdit();
                    setStartLocation('내 위치');
                    setStartLocationObject(null);
                    setShowStartResults(false);
                  }
                }}
                disabled={!location}
              >
                <Ionicons
                  name="compass-outline"
                  size={20}
                  color={location ? "#3690FF" : "#B9B9B9"}
                />
              </TouchableOpacity>
            </View>

            <View style={commonStyles.routeInputContainer}>
              <View style={commonStyles.routeInputWrapper}>
                <TextInput
                  style={commonStyles.routeTextInput}
                  placeholder="도착지를 입력하세요"
                  placeholderTextColor="#B9B9B9"
                  value={endLocation}
                  onChangeText={(text) => {
                    handleTextEdit();
                    setEndLocation(text);
                    setEndLocationObject(null); // Clear object when typing
                    debouncedSearchEndLocation(text);
                  }}
                  onFocus={handleTextEdit}
                  selectionColor="transparent"
                  underlineColorAndroid="transparent"
                />
                {isSearchingEnd ? (
                  <ActivityIndicator size="small" color="#3690FF" style={commonStyles.searchIndicator} />
                ) : (
                  endLocation.length > 0 && (
                    <TouchableOpacity
                      style={commonStyles.routeInputClearButton}
                      onPress={() => {
                        handleTextEdit();
                        setEndLocation('');
                        setEndLocationObject(null);
                      }}
                    >
                      <Ionicons name="close-circle" size={18} color="#B9B9B9" />
                    </TouchableOpacity>
                  )
                )}
              </View>

              <TouchableOpacity
                style={commonStyles.swapButton}
                              onPress={() => {
                                  // 텍스트 값 교환
                                  const tempStartText = startLocation;
                                  setStartLocation(endLocation);
                                  setEndLocation(tempStartText);
                
                                  // 데이터 객체 교환
                                  const tempStartObject = startLocationObject;
                                  setStartLocationObject(endLocationObject);
                                  setEndLocationObject(tempStartObject);
                
                                  handleTextEdit();
                              }}              >
                <Ionicons name="swap-vertical-outline" size={20} color="#3690FF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              commonStyles.routeButton,
              (!endLocation.trim() || isRouteLoading || !!routeResult) && commonStyles.routeButtonDisabled
            ]}
            disabled={!endLocation.trim() || isRouteLoading || !!routeResult}
            onPress={() => triggerRouteSearch()}
          >
            <Ionicons name="navigate-outline" size={20} color="#fff" />
            <Text style={commonStyles.routeButtonText}>
              {isRouteLoading ? '길찾기 중...' : routeResult ? '길찾기 완료' : '길찾기 시작'}
            </Text>
          </TouchableOpacity>

          {showStartResults && (
            <View style={commonStyles.searchResultsList}>
              <Text style={commonStyles.searchResultsTitle}>출발지 검색 결과</Text>
              {startLocationResults.length > 0 ? (
                <ScrollView
                  style={commonStyles.searchResultsScrollContainer}
                  showsVerticalScrollIndicator={false}
                >
                  {startLocationResults.map((item) => (
                    <TouchableOpacity
                      key={item.placeId}
                      style={commonStyles.searchResultItem}
                      onPress={() => {
                        handleTextEdit();
                        setStartLocation(item.placeName);
                        setShowStartResults(false);
                      }}
                    >
                      <View style={commonStyles.searchResultContent}>
                        <Text style={commonStyles.searchResultTitle}>{item.placeName}</Text>
                        <Text style={commonStyles.searchResultAddress}>{item.roadAddress}</Text>
                      </View>
                      <TouchableOpacity
                        style={commonStyles.departButton}
                        onPress={() => {
                          handleTextEdit();
                          setStartLocation(item.placeName);
                          setShowStartResults(false);
                        }}
                      >
                        <Text style={commonStyles.departButtonText}>출발</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={commonStyles.noResultsContainer}>
                  <Text style={commonStyles.noResultsText}>검색 결과가 없습니다</Text>
                </View>
              )}
            </View>
          )}

          {showEndResults && (
            <View style={commonStyles.searchResultsList}>
              <Text style={commonStyles.searchResultsTitle}>목적지 검색 결과</Text>
              {endLocationResults.length > 0 ? (
                <ScrollView
                  style={commonStyles.searchResultsScrollContainer}
                  showsVerticalScrollIndicator={false}
                >
                  {endLocationResults.map((item) => (
                    <TouchableOpacity
                      key={item.placeId}
                      style={commonStyles.searchResultItem}
                      onPress={() => {
                        handleTextEdit();
                        setEndLocation(item.placeName);
                        setShowEndResults(false);
                      }}
                    >
                      <View style={commonStyles.searchResultContent}>
                        <Text style={commonStyles.searchResultTitle}>{item.placeName}</Text>
                        <Text style={commonStyles.searchResultAddress}>{item.roadAddress}</Text>
                      </View>
                      <TouchableOpacity
                        style={commonStyles.departButton}
                        onPress={() => {
                          handleTextEdit();
                          setEndLocation(item.placeName);
                          setShowEndResults(false);
                        }}
                      >
                        <Text style={commonStyles.departButtonText}>도착</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={commonStyles.noResultsContainer}>
                  <Text style={commonStyles.noResultsText}>검색 결과가 없습니다</Text>
                </View>
              )}
            </View>
          )}

          {routeError && (
            <View style={commonStyles.errorContainer}>
              <Text style={commonStyles.errorText}>{routeError}</Text>
              <TouchableOpacity onPress={clearRoute} style={commonStyles.errorCloseButton}>
                <Ionicons name="close-outline" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          )}

          {routeResult && (
            <RouteResultComponent
              routeResult={routeResult}
              onClose={clearRoute}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
};


export default WebSharedSearch;
