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

interface SideMenuProps {
  isOpen: boolean;
  searchResults: SearchResult[];
  onSelectResult: (item: SearchResult) => void;
  isLoading: boolean;
  errorMsg: string | null;
  onToggle: () => void;
  style: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
}

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

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />;
    }
    if (errorMsg) {
      return <Text style={styles.errorText}>{errorMsg}</Text>;
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