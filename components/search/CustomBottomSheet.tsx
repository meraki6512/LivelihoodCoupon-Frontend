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

/**
 * CustomBottomSheet 컴포넌트의 Props 인터페이스
 */
interface CustomBottomSheetProps {
  isOpen: boolean; // 하단 시트 열림/닫힘 상태
  onToggle: () => void; // 하단 시트 토글 핸들러
  searchQuery: string; // 검색 쿼리
  setSearchQuery: (query: string) => void; // 검색 쿼리 설정 핸들러
  onSearch: () => void; // 검색 실행 핸들러
  searchResults: SearchResult[]; // 검색 결과 목록
  isLoading: boolean; // 로딩 상태
  errorMsg: string | null; // 에러 메시지
  onSelectResult: (item: SearchResult) => void; // 검색 결과 선택 핸들러
}

/**
 * CustomBottomSheet 컴포넌트
 * 모바일 레이아웃에서 사용되는 하단 시트로, 검색바와 검색 결과를 표시합니다.
 * 애니메이션을 통해 열림/닫힘 상태를 처리합니다.
 */
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
  // 화면 크기 및 안전 영역 계산
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const USABLE_SCREEN_HEIGHT = SCREEN_HEIGHT - insets.bottom;
  const BOTTOM_SHEET_HEIGHT = USABLE_SCREEN_HEIGHT * 0.5; // 사용 가능한 화면 높이의 50%
  const CLOSED_HEIGHT = 70; // 닫힌 상태에서 보이는 핸들 높이

  // 하단 시트 애니메이션 값
  const bottomSheetAnimation = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT - CLOSED_HEIGHT)).current;

  // 하단 시트 열림/닫힘 애니메이션 처리
  useEffect(() => {
    Animated.timing(bottomSheetAnimation, {
      toValue: isOpen ? 0 : BOTTOM_SHEET_HEIGHT - CLOSED_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  /**
   * 하단 시트 내용을 렌더링하는 함수
   * 로딩, 에러, 검색 결과 상태에 따라 다른 UI를 표시합니다.
   */
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
        <View style={styles.contentContainer}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={onSearch} />
          {isLoading ? (
            <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
          ) : errorMsg ? (
            <Text style={styles.errorText}>{String(errorMsg)}</Text>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable onPress={() => onSelectResult(item)} style={styles.resultItem}>
                  <Text style={styles.resultItemText}>{item.place_name}</Text>
                </Pressable>
              )}
            />
          ) : (
            <Text style={styles.noResultText}>검색 결과가 없거나, 검색을 시작하세요.</Text>
          )}
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