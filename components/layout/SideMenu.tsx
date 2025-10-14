import React from 'react';
import {
  View,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSharedSearch } from '../../hooks/useSharedSearch';
import SharedSearch from '../search/SharedSearch';
import { SearchResult, SearchOptions } from '../../types/search';
import { PageResponse } from '../../types/api';
import { commonStyles } from './styles/SideMenu.common.styles';
import { webStyles } from './styles/SideMenu.web.styles';
import { mobileStyles } from './styles/SideMenu.mobile.styles';


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
  searchOptions: SearchOptions;
  setSearchOptions: (options: Partial<SearchOptions>) => void;
  loadingNextPage: boolean;
  loadingAllMarkers: boolean;
  markerCountReachedLimit: boolean;
  onNextPage: () => void;
  pagination: Omit<PageResponse<any>, 'content'> | null;
  onSetRouteLocation?: (type: 'departure' | 'arrival', placeInfo: SearchResult) => void;
  onOpenSidebar?: () => void;
  routeResult?: any;
  isRouteLoading?: boolean;
  routeError?: string | null;
  startRoute?: any;
  clearRoute?: () => void;
}

const SideMenu: React.FC<SideMenuProps> = (props) => {
  const { isOpen, onToggle, style } = props;

  const sharedSearchProps = useSharedSearch(
    props.routeResult,
    props.isRouteLoading,
    props.routeError,
    props.startRoute,
    props.clearRoute,
    props.onOpenSidebar || props.onToggle
  );

  const styles = Platform.OS === 'web' ? webStyles : mobileStyles;

  return (
    <Animated.View style={[styles.sideMenuContainer, style]}>
      <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
        <Ionicons name={isOpen ? "chevron-back" : "chevron-forward"} size={24} color="#495057" />
      </TouchableOpacity>
      <SharedSearch
        isWebView={true}
        {...props}
        {...sharedSearchProps}
      />
    </Animated.View>
  );
};


export default React.memo(SideMenu);
