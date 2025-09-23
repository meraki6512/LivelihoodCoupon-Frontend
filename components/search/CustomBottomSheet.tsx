import React, { useRef, useEffect } from 'react';
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
import { SearchResult } from '../../types/search';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchOptions from './SearchOptions';
import { SearchOptions as SearchOptionsType } from '../../hooks/useSearch';
import { PageResponse } from '../../types/api';
import SearchResultItem from './SearchResultItem';

interface CustomBottomSheetProps {
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  searchResults: SearchResult[];
  isLoading: boolean;
  errorMsg: string | null;
  onSelectResult: (item: SearchResult) => void;
  searchOptions: SearchOptionsType;
  setSearchOptions: (options: Partial<SearchOptionsType>) => void;
  loadingNextPage: boolean;
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
  isLoading,
  errorMsg,
  onSelectResult,
  searchOptions,
  setSearchOptions,
  loadingNextPage,
  onNextPage,
  pagination,
}) => {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const USABLE_SCREEN_HEIGHT = SCREEN_HEIGHT - insets.bottom;
  const BOTTOM_SHEET_HEIGHT = USABLE_SCREEN_HEIGHT * 0.5;
  const CLOSED_HEIGHT = 70;

  const bottomSheetAnimation = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT - CLOSED_HEIGHT)).current;

  useEffect(() => {
    Animated.timing(bottomSheetAnimation, {
      toValue: isOpen ? 0 : BOTTOM_SHEET_HEIGHT - CLOSED_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

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
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={onSearch} />
          <SearchOptions searchOptions={searchOptions} setSearchOptions={setSearchOptions} />
          {pagination && searchResults.length > 0 && (
            <Text style={styles.resultCountText}>총 {pagination.totalElements}개 결과</Text>
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
  resultCountText: {
    textAlign: 'right',
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
    marginRight: 5,
  },
});

export default CustomBottomSheet;
