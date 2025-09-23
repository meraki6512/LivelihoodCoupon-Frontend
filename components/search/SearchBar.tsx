import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * SearchBar 컴포넌트의 Props 인터페이스
 */
interface SearchBarProps {
  searchQuery: string; // 현재 검색 쿼리
  setSearchQuery: (query: string) => void; // 검색 쿼리 설정 핸들러
  onSearch: () => void; // 검색 실행 핸들러
  showSearchOptions?: boolean; // 검색 옵션 표시 여부
  onToggleSearchOptions?: () => void; // 검색 옵션 토글 핸들러
}

/**
 * SearchBar 컴포넌트
 * 검색 입력 필드와 검색 버튼을 제공하는 재사용 가능한 컴포넌트
 */
const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, onSearch, showSearchOptions, onToggleSearchOptions }) => {
  return (
    <View style={styles.searchContainer}>
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
      {onToggleSearchOptions && (
        <TouchableOpacity onPress={onToggleSearchOptions} style={styles.optionsToggleButton}>
          <Ionicons name={showSearchOptions ? "options" : "options-outline"} size={24} color="#495057" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  optionsToggleButton: {
    marginLeft: 8,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar;
