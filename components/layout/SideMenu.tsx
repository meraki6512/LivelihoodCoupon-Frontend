import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SearchResult } from '../../types/search';
import SearchBar from '../search/SearchBar';
import { Ionicons } from '@expo/vector-icons';

/**
 * SideMenu 컴포넌트의 Props 인터페이스
 */
interface SideMenuProps {
  isOpen: boolean; // 사이드메뉴 열림/닫힘 상태
  searchResults: SearchResult[]; // 검색 결과 목록
  onSelectResult: (item: SearchResult) => void; // 검색 결과 선택 핸들러
  isLoading: boolean; // 로딩 상태
  errorMsg: string | null; // 에러 메시지
  onToggle: () => void; // 사이드메뉴 토글 핸들러
  style: any; // 애니메이션 스타일
  searchQuery: string; // 검색 쿼리
  setSearchQuery: (query: string) => void; // 검색 쿼리 설정 핸들러
  onSearch: () => void; // 검색 실행 핸들러
}

/**
 * SideMenu 컴포넌트
 * 웹 레이아웃에서 사용되는 사이드메뉴로, 검색바와 검색 결과를 표시합니다.
 */
const SideMenu: React.FC<SideMenuProps> = ({ 
  isOpen, 
  searchResults, 
  onSelectResult, 
  isLoading, 
  errorMsg, 
  onToggle, 
  style,
  searchQuery,
  setSearchQuery,
  onSearch
}) => {

  /**
   * 사이드메뉴 내용을 렌더링하는 함수
   * 로딩, 에러, 검색 결과 상태에 따라 다른 UI를 표시합니다.
   */
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable onPress={() => onSelectResult(item)} style={styles.resultItem}>
              <Text style={styles.resultItemText}>{item.place_name}</Text>
            </Pressable>
          )}
        />
      );
    }
    return <Text style={styles.noResultText}>검색 결과가 없거나, 검색을 시작하세요.</Text>;
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
  toggleButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
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
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  resultItemText: {
    fontSize: 16,
  },
});

export default SideMenu;