import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedSearch } from '../../hooks/useSharedSearch';
import SharedSearch from './SharedSearch';
import { SearchResult, SearchOptions } from '../../types/search';
import { PageResponse } from '../../types/api';
import { RouteResult } from '../../types/route';
import { commonStyles } from './styles/CustomBottomSheet.common.styles';
import { webStyles } from './styles/CustomBottomSheet.web.styles';
import { mobileStyles } from './styles/CustomBottomSheet.mobile.styles';


interface CustomBottomSheetProps {
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  searchResults: SearchResult[];
  allMarkers: SearchResult[];
  isLoading: boolean;
  errorMsg?: string | null;
  onSelectResult: (item: SearchResult) => void;
  searchOptions: SearchOptions;
  setSearchOptions: (options: Partial<SearchOptions>) => void;
  loadingNextPage: boolean;
  loadingAllMarkers: boolean;
  markerCountReachedLimit: boolean;
  onNextPage: () => void;
  pagination: Omit<PageResponse<any>, 'content'> | null;
  onSetRouteLocation?: (type: 'departure' | 'arrival', placeInfo: SearchResult) => void;
  routeResult?: RouteResult | null;
  isRouteLoading?: boolean;
  routeError?: string | null;
  startRoute?: any;
  clearRoute?: () => void;
}

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = (props) => {
  const { isOpen, onToggle } = props;
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const USABLE_SCREEN_HEIGHT = SCREEN_HEIGHT - insets.bottom;
  const BOTTOM_SHEET_HEIGHT = USABLE_SCREEN_HEIGHT * 0.5;
  const EXPANDED_BOTTOM_SHEET_HEIGHT = USABLE_SCREEN_HEIGHT * 0.75;
  const CLOSED_HEIGHT = 70;

  const bottomSheetAnimation = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT - CLOSED_HEIGHT)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const sharedSearchProps = useSharedSearch(
    props.routeResult,
    props.isRouteLoading,
    props.routeError,
    props.startRoute,
    props.clearRoute,
    props.onToggle
  );

  useEffect(() => {
    Animated.timing(bottomSheetAnimation, {
      toValue: isOpen ? 0 : BOTTOM_SHEET_HEIGHT - CLOSED_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        const keyboardHeight = event.endCoordinates.height;
        setKeyboardHeight(keyboardHeight);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const hasSearchResults = sharedSearchProps.showStartResults || sharedSearchProps.showEndResults;
  const baseHeight = hasSearchResults ? EXPANDED_BOTTOM_SHEET_HEIGHT : BOTTOM_SHEET_HEIGHT;
  const dynamicHeight = baseHeight + keyboardHeight;

  useEffect(() => {
    if (isOpen && hasSearchResults) {
      Animated.timing(bottomSheetAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (isOpen && !hasSearchResults) {
      Animated.timing(bottomSheetAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [hasSearchResults, isOpen]);

  return (
    <Animated.View
      style={[
        Platform.OS === 'web' ? webStyles.bottomSheetContainer : mobileStyles.bottomSheetContainer,
        {
          height: dynamicHeight,
          bottom: insets.bottom,
          transform: [{ translateY: bottomSheetAnimation }],
        },
      ]}
      pointerEvents="auto"
    >
      <TouchableOpacity onPress={onToggle} style={commonStyles.toggleButton}>
        <Ionicons name={isOpen ? "chevron-down" : "chevron-up"} size={24} color="#495057" />
      </TouchableOpacity>
      {isOpen && (
        <SharedSearch
          isWebView={false}
          {...props}
          {...sharedSearchProps}
        />
      )}
    </Animated.View>
  );
};


export default React.memo(CustomBottomSheet);
