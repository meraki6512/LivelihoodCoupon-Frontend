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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../search/SearchBar';
import { SearchResult, SearchOptions } from '../../types/search';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchOptionsComponent from './SearchOptionsComponent';
import { PageResponse } from '../../types/api';
import SearchResultItem from './SearchResultItem';

interface CustomBottomSheetProps {
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
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
}

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  isOpen,
  onToggle,
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
}) => {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const USABLE_SCREEN_HEIGHT = SCREEN_HEIGHT - insets.bottom;
  const BOTTOM_SHEET_HEIGHT = USABLE_SCREEN_HEIGHT * 0.5;
  const CLOSED_HEIGHT = 70;

  const bottomSheetAnimation = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT - CLOSED_HEIGHT)).current;
  const [showSearchOptions, setShowSearchOptions] = useState(false); // New state for toggle

  useEffect(() => {
    Animated.timing(bottomSheetAnimation, {
      toValue: isOpen ? 0 : BOTTOM_SHEET_HEIGHT - CLOSED_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  // Local search handler to auto-collapse options
  const handleLocalSearch = () => {
    onSearch(); // Call original onSearch prop
    setShowSearchOptions(false); // Auto-collapse options
  };

  const renderFooter = () => {
    if (!loadingNextPage) return null;
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

  return (
    <Animated.View
      style={[
        styles.bottomSheetContainer,
        {
          height: BOTTOM_SHEET_HEIGHT,
          bottom: insets.bottom,
          transform: [{ translateY: bottomSheetAnimation }],
        },
      ]}
    >
      <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
        <Ionicons name={isOpen ? "chevron-down" : "chevron-up"} size={24} color="#495057" />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.contentContainer}>
          <SearchBar style={{ flex: 1 }} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleLocalSearch} showSearchOptions={showSearchOptions} onToggleSearchOptions={() => setShowSearchOptions(!showSearchOptions)} />
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
      )}
    </Animated.View>
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
  },
  toggleButton: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    padding: 5,
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
});

export default React.memo(CustomBottomSheet);
