import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  onSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery, onSearch }) => {
  const currentStyles = Platform.OS === 'web' ? webStyles : mobileStyles;

  return (
    <SafeAreaView style={currentStyles.safeArea}>
      <View style={currentStyles.headerContainer}>
        <Text style={currentStyles.title}>민생회복 소비쿠폰 사용처</Text>
        <View style={currentStyles.searchContainer}>
          <TextInput
            style={currentStyles.searchInput}
            placeholder="장소를 검색하세요..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={onSearch}
          />
          <TouchableOpacity style={currentStyles.searchButton} onPress={onSearch}>
            <Text style={currentStyles.searchButtonText}>검색</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const commonStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

const webStyles = StyleSheet.create({
  ...commonStyles,
  safeArea: {
    ...commonStyles.safeArea,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerContainer: {
    ...commonStyles.headerContainer,
    paddingVertical: 10,
  },
});

const mobileStyles = StyleSheet.create({
  ...commonStyles,
  safeArea: {
    ...commonStyles.safeArea,
    // SafeAreaView handles padding top, but we can add extra if needed
  },
  headerContainer: {
    ...commonStyles.headerContainer,
    paddingVertical: 10, // Existing vertical padding
    paddingTop: Platform.OS === 'android' ? 40 : 20, // Increased explicit top padding for Android and iOS
  },
});

export default Header;