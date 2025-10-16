import React from 'react';
import {
  View,
  Animated,
  TouchableOpacity,
  Platform,
  Image, // Add Image import
  Text, // Add Text import
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SharedSearch from '../search/SharedSearch';
import { SearchResult, SearchOptions } from '../../types/search';
import { PageResponse } from '../../types/api';
import { commonStyles } from './styles/SideMenu.common.styles';
import { webStyles } from './styles/SideMenu.web.styles';
import { mobileStyles } from './styles/SideMenu.mobile.styles';

const appIcon = require('../../assets/app-icon.png'); // Import the app icon


interface SideMenuProps {
  isOpen: boolean;
  searchResults: SearchResult[];
  allMarkers: SearchResult[];
  onSelectResult: (item: SearchResult) => void;
  isLoading: boolean;
  errorMsg?: string | null;
  onToggle: () => void;
  style: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onClearSearch: () => void; // New prop
  searchOptions: SearchOptions;
  setSearchOptions: (options: Partial<SearchOptions>) => void;
  loadingNextPage: boolean;
  loadingAllMarkers: boolean;
  markerCountReachedLimit: boolean;
  onNextPage: () => void;
  pagination: Omit<PageResponse<any>, 'content'> | null;
  onSetRouteLocation?: (type: 'departure' | 'arrival', placeInfo: SearchResult) => void;
  onOpenSidebar?: () => void;
  routeResult: any;
  isRouteLoading: boolean;
  routeError: string | null;
  startRoute: any;
  clearRoute: () => void;
  activeTab: 'search' | 'route';
  setActiveTab: (tab: 'search' | 'route') => void; // Add setActiveTab here
  activeSearchTab: 'searchResults' | 'nearbyParking';
  setActiveSearchTab: (tab: 'searchResults' | 'nearbyParking') => void;
  parkingLots: any[];
  parkingLotsLoading: boolean;
  parkingLotsError: string | null;
  // Props from useSharedSearch that are now passed directly
  startLocation: string;
  setStartLocation: (location: string) => void;
  endLocation: string;
  setEndLocation: (location: string) => void;
  startLocationResults: SearchResult[];
  endLocationResults: SearchResult[];
  isSearchingStart: boolean;
  isSearchingEnd: boolean;
  showStartResults: boolean;
  setShowStartResults: (show: boolean) => void;
  showEndResults: boolean;
  setShowEndResults: (show: boolean) => void;
  selectedTransportMode: 'driving' | 'transit' | 'walking' | 'cycling';
  setSelectedTransportMode: (mode: 'driving' | 'transit' | 'walking' | 'cycling') => void;
  autocompleteSuggestions: any[]; // Adjust type as needed
  showAutocomplete: boolean;
  setShowAutocomplete: (show: boolean) => void;
  debouncedAutocomplete: (query: string) => void;
  debouncedSearchStartLocation: (query: string) => void;
  debouncedSearchEndLocation: (query: string) => void;
  handleTextEdit: () => void;
  searchLocation: { lat: number; lng: number };
  location: { latitude: number; longitude: number } | null;
  startLocationObject: SearchResult | null;
  setStartLocationObject: (loc: SearchResult | null) => void;
  endLocationObject: SearchResult | null;
  setEndLocationObject: (loc: SearchResult | null) => void;
}

const SideMenu: React.FC<SideMenuProps> = (props) => {
  const { isOpen, onToggle, style, activeTab, setActiveTab } = props;

  if (Platform.OS === 'web') {
    const styles = webStyles;
    const containerStyle = styles.sideMenuWrapper;
    return (
      <Animated.View style={[containerStyle, style]}>
        <View style={styles.backgroundBox} />
        <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
          <Ionicons name={isOpen ? "chevron-back" : "chevron-forward"} size={24} color="#495057" />
        </TouchableOpacity>
        <View style={styles.sideMenuContent}>
          <View style={commonStyles.logoContainer}>
            <Image source={appIcon} style={commonStyles.logo} />
            <Text style={commonStyles.title}>소비쿠폰 사용처 찾기</Text>
          </View>
          <SharedSearch
            isWebView={true}
            {...props}
          />
        </View>
      </Animated.View>
    );
  }

  const styles = mobileStyles;
  const containerStyle = styles.sideMenuContainer;
  return (
    <Animated.View style={[containerStyle, style]}>
      <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
        <Ionicons name={isOpen ? "chevron-back" : "chevron-forward"} size={24} color="#495057" />
      </TouchableOpacity>
      <View style={commonStyles.logoContainer}>
        <Image source={appIcon} style={commonStyles.logo} />
        <Text style={commonStyles.title}>소비쿠폰</Text>
      </View>
      <SharedSearch
        isWebView={true}
        {...props}
      />
    </Animated.View>
  );
};


export default React.memo(SideMenu);
