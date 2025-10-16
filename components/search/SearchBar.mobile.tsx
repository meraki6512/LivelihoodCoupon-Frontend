import React, { forwardRef } from 'react';
import { TextInput, TouchableOpacity, Text, View, StyleSheet, TextInputProps } from 'react-native';
import { mobileStyles } from './styles/SearchBar.mobile.styles';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  onFocus?: TextInputProps['onFocus'];
  onBlur?: TextInputProps['onBlur'];
}

const MobileSearchBar = forwardRef<TextInput, SearchBarProps>((props, ref) => {
  const styles = mobileStyles;

  return (
    <View style={styles.searchContainer}>
      <TextInput
        ref={ref}
        style={styles.searchInput}
        placeholder="장소를 입력하세요..."
        value={props.searchQuery}
        onChangeText={props.setSearchQuery}
        onSubmitEditing={props.onSearch}
        returnKeyType="search"
        onFocus={props.onFocus}
        onBlur={props.onBlur}
      />
      {props.searchQuery.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={props.onClearSearch}>
          <Ionicons name="close-circle" size={24} color="#B9B9B9" />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.searchButton} onPress={props.onSearch}>
        <Text style={styles.searchButtonText}>검색</Text>
      </TouchableOpacity>
    </View>
  );
});

export default MobileSearchBar;
