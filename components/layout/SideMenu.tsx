import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SearchResult } from '../../types/search';
import SearchBar from '../search/SearchBar';
import { Ionicons } from '@expo/vector-icons';
import SearchOptions from '../search/SearchOptions';
import { SearchOptions as SearchOptionsType } from '../../hooks/useSearch';
import { PageResponse } from '../../types/api';
import SearchResultItem from '../search/SearchResultItem';

interface SideMenuProps {
  isOpen: boolean;
  searchResults: SearchResult[];
  allMarkers: SearchResult[];
  onSelectResult: (item: SearchResult) => void;
  isLoading: boolean;
  errorMsg: string | null;
  onToggle: () => void;
  style: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  searchOptions: SearchOptionsType;
  setSearchOptions: (options: Partial<SearchOptionsType>) => void;
  loadingNextPage: boolean;
  loadingAllMarkers: boolean;
  markerCountReachedLimit: boolean;
  onNextPage: () => void;
  pagination: Omit<PageResponse<any>, 'content'> | null;
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
  searchOptions,
  setSearchOptions,
  loadingNextPage,
  loadingAllMarkers,
  markerCountReachedLimit,
  onNextPage,
  pagination,
}) => {

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
    return <Text style={styles.noResultText}>검색어를 입력하고 검색 버튼을 눌러주세요.</Text>;
  };

  return (
    <Animated.View style={[styles.sideMenuContainer, style]}>
      <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
        <Ionicons name={isOpen ? "chevron-back" : "chevron-forward"} size={24} color="#495057" />
      </TouchableOpacity>
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={onSearch}
      />
      <SearchOptions searchOptions={searchOptions} setSearchOptions={setSearchOptions} />
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

export default SideMenu;
