import React, { useState, useRef } from 'react';
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
  onSearch: () => void;
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
}

const SharedSearch: React.FC<SharedSearchProps> = ({
  isWebView,
  searchQuery,
  setSearchQuery,
  onSearch,
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
}) => {
  const routeScrollViewRef = useRef<ScrollView>(null);

  const handleLocalSearch = () => {
    onSearch();
    setShowAutocomplete(false);
  };

  const renderFooter = () => {
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

  const contentContainerStyles = Platform.OS === 'web' ? webStyles.contentContainer : mobileStyles.contentContainer;
  const suggestionsContainerStyles = Platform.OS === 'web' ? webStyles.suggestionsContainer : {};

  return (
    <View style={[contentContainerStyles, isWebView && contentContainerStyles]}>
      <View style={commonStyles.tabHeader}>
        <TouchableOpacity
          style={[commonStyles.tabButton, activeTab === 'search' && commonStyles.activeTabButton]}
          onPress={() => setActiveTab('search')}
        >
          <Ionicons name="search-outline" size={20} color={activeTab === 'search' ? '#007bff' : '#6c757d'} />
          <Text style={[commonStyles.tabButtonText, activeTab === 'search' && commonStyles.activeTabButtonText]}>검색</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[commonStyles.tabButton, activeTab === 'route' && commonStyles.activeTabButton]}
          onPress={() => setActiveTab('route')}
        >
          <Ionicons name="navigate-outline" size={20} color={activeTab === 'route' ? '#007bff' : '#6c757d'} />
          <Text style={[commonStyles.tabButtonText, activeTab === 'route' && commonStyles.activeTabButtonText]}>길찾기</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'search' ? (
        <View style={commonStyles.searchTabContent}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={(text) => {
              setSearchQuery(text);
              debouncedAutocomplete(text);
            }}
            onSearch={handleLocalSearch}
          />
          {showAutocomplete && autocompleteSuggestions.length > 0 && (
            <View style={[commonStyles.suggestionsContainer, suggestionsContainerStyles]}>
              <TouchableOpacity
                style={commonStyles.closeButton}
                onPress={() => setShowAutocomplete(false)}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
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
            </View>
          )}
          <SearchOptionsComponent searchOptions={searchOptions} setSearchOptions={setSearchOptions} />
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
                  commonStyles.transportModeButton,
                  selectedTransportMode === 'driving' && commonStyles.transportModeButtonSelected
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
                  commonStyles.transportModeButton,
                  commonStyles.transportModeButtonDisabled, // 대중교통 미구현
                  selectedTransportMode === 'transit' && commonStyles.transportModeButtonSelected
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
                  commonStyles.transportModeButton,
                  selectedTransportMode === 'walking' && commonStyles.transportModeButtonSelected
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
                  commonStyles.transportModeButton,
                  selectedTransportMode === 'cycling' && commonStyles.transportModeButtonSelected
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

          <View style={commonStyles.routeInputsContainer}>
            <View style={commonStyles.routeInputContainer}>
              <View style={commonStyles.routeInputWrapper}>
                <TextInput
                  style={commonStyles.routeTextInput}
                  placeholder="출발지를 입력하세요"
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
                {isSearchingStart && (
                  <ActivityIndicator size="small" color="#007bff" style={commonStyles.searchIndicator} />
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

            <View style={commonStyles.routeInputContainer}>
              <View style={commonStyles.routeInputWrapper}>
                <TextInput
                  style={commonStyles.routeTextInput}
                  placeholder="도착지를 입력하세요"
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
                {isSearchingEnd && (
                  <ActivityIndicator size="small" color="#007bff" style={commonStyles.searchIndicator} />
                )}
              </View>

              <TouchableOpacity
                style={commonStyles.swapButton}
                onPress={() => {
                  const tempStart = startLocation;
                  const tempEnd = endLocation;
                  if (tempStart === '내 위치') {
                    setStartLocation(tempEnd);
                    setEndLocation('내 위치');
                  } else {
                    setStartLocation(tempEnd);
                    setEndLocation(tempStart);
                  }
                  handleTextEdit();
                }}
              >
                <Ionicons name="swap-vertical-outline" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              commonStyles.routeButton,
              (!endLocation.trim() || isRouteLoading || !!routeResult) && commonStyles.routeButtonDisabled
            ]}
            disabled={!endLocation.trim() || isRouteLoading || !!routeResult}
            onPress={async () => {
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
                }

                await startRoute({
                  startLocation: startLocationData,
                  endLocation: endLocationData!,
                  transportMode: selectedTransportMode,
                  userLocation: location || undefined,
                });

              } catch (error: any) {
                alert(error.message || '길찾기 중 오류가 발생했습니다.');
              }
            }}
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


export default SharedSearch;
