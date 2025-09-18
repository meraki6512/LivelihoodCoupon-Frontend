import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, onSearch }) => {
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
});

export default SearchBar;
