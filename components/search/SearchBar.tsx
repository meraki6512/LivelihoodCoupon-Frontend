import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { webStyles } from './styles/SearchBar.web.styles';
import { mobileStyles } from './styles/SearchBar.mobile.styles';

/**
 * SearchBar 컴포넌트의 Props 인터페이스
 */
interface SearchBarProps {
  searchQuery: string; // 현재 검색 쿼리
  setSearchQuery: (query: string) => void; // 검색 쿼리 설정 핸들러
  onSearch: () => void; // 검색 실행 핸들러
  style?: ViewStyle; // 추가적인 스타일
}

/**
 * SearchBar 컴포넌트
 * 검색 입력 필드와 검색 버튼을 제공하는 재사용 가능한 컴포넌트
 */
const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, onSearch, style }) => {
  const styles = Platform.OS === 'web' ? webStyles : mobileStyles;
  return (
    <View style={[styles.searchContainer, style]}>
      <TextInput
        style={styles.searchInput}
        placeholder="장소를 검색하세요..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={onSearch}
      />
      <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
        <Text style={styles.searchButtonText}>검색</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
