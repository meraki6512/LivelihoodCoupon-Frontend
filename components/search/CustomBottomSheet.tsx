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
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../search/SearchBar';
import { SearchResult } from '../../types/search';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
}) => {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const USABLE_SCREEN_HEIGHT = SCREEN_HEIGHT - insets.bottom;
  const BOTTOM_SHEET_HEIGHT = USABLE_SCREEN_HEIGHT * 0.5; // 50% of usable screen height
  const CLOSED_HEIGHT = 50; // Height of the visible handle when closed

  const bottomSheetAnimation = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT - CLOSED_HEIGHT)).current;

  useEffect(() => {
    Animated.timing(bottomSheetAnimation, {
      toValue: isOpen ? 0 : BOTTOM_SHEET_HEIGHT - CLOSED_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

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
    <Animated.View
      style={[
        styles.bottomSheetContainer,
        {
          height: BOTTOM_SHEET_HEIGHT, // Apply height dynamically
          bottom: insets.bottom, // Adjust bottom position based on safe area
          transform: [{ translateY: bottomSheetAnimation }],
        },
      ]}
    >
      <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
        <Ionicons name={isOpen ? "chevron-down" : "chevron-up"} size={24} color="#495057" />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.contentContainer}> {/* New content container */}
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={onSearch} />
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
    paddingTop: 40, // Space for the toggle button within the content
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
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  resultItemText: {
    fontSize: 16,
  },
});

export default CustomBottomSheet;