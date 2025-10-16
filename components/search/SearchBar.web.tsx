import React, { forwardRef } from 'react';
import { TextInput, TouchableOpacity, Text, View, Platform, NativeSyntheticEvent, TextInputFocusEventData, TextInputProps } from 'react-native';
import { mobileStyles } from './styles/SearchBar.mobile.styles';
import { webStyles } from './styles/SearchBar.web.styles';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onClearSearch: () => void; // New prop for clearing search
  onFocus?: TextInputProps['onFocus']; // New prop for focus event
  onBlur?: TextInputProps['onBlur']; // New prop for blur event
}

const WebSearchBar = forwardRef<TextInput, SearchBarProps>((props, ref) => {
  const styles = webStyles;

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
        onFocus={props.onFocus} // Pass onFocus prop
        onBlur={props.onBlur} // Pass onBlur prop
      />
      {props.searchQuery.length > 0 && ( // Conditionally render clear button
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

export default WebSearchBar;
