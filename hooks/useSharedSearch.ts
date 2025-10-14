import { useState, useRef, useEffect } from 'react';
import { SearchResult } from '../types/search';
import { getAutocompleteSuggestions, searchPlaces } from '../services/searchApi';
import { useCurrentLocation } from './useCurrentLocation';
import { useRoute } from './useRoute';
import { AutocompleteResponse } from '../types/search';

export const useSharedSearch = (externalRouteResult: any, externalIsRouteLoading: any, externalRouteError: any, externalStartRoute: any, externalClearRoute: any, onToggleSidebar: () => void) => {
  const [activeTab, setActiveTab] = useState<'search' | 'route'>('search');
  const [startLocation, setStartLocation] = useState('내 위치');
  const [endLocation, setEndLocation] = useState('');
  const [startLocationResults, setStartLocationResults] = useState<SearchResult[]>([]);
  const [endLocationResults, setEndLocationResults] = useState<SearchResult[]>([]);
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  const [isSearchingEnd, setIsSearchingEnd] = useState(false);
  const [showStartResults, setShowStartResults] = useState(false);
  const [showEndResults, setShowEndResults] = useState(false);
  const [selectedTransportMode, setSelectedTransportMode] = useState<'driving' | 'transit' | 'walking' | 'cycling'>('driving');
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<AutocompleteResponse[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [startLocationObject, setStartLocationObject] = useState<SearchResult | null>(null);
  const [endLocationObject, setEndLocationObject] = useState<SearchResult | null>(null);

  const startSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { location } = useCurrentLocation();
  const defaultLocation = { latitude: 37.5665, longitude: 126.9780 };
  const searchLocation = location || defaultLocation;

  const internalRoute = useRoute();
  const startRoute = externalStartRoute || internalRoute.startRoute;
  const isRouteLoading = externalIsRouteLoading !== undefined ? externalIsRouteLoading : internalRoute.isLoading;
  const routeResult = externalRouteResult !== undefined ? externalRouteResult : internalRoute.routeResult;
  const routeError = externalRouteError !== undefined ? externalRouteError : internalRoute.error;
  const clearRoute = externalClearRoute || internalRoute.clearRoute;

  const handleTextEdit = () => {
    if (routeResult) {
      clearRoute();
    }
  };

  const debouncedAutocomplete = (query: string) => {
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }
    autocompleteTimeoutRef.current = setTimeout(async () => {
      if (query.trim().length > 0) {
        try {
          const suggestions = await getAutocompleteSuggestions(query);
          setAutocompleteSuggestions(suggestions);
          setShowAutocomplete(true);
        } catch (error) {
          console.error('Autocomplete error:', error);
          setAutocompleteSuggestions([]);
        }
      } else {
        setAutocompleteSuggestions([]);
        setShowAutocomplete(false);
      }
    }, 300);
  };

  const debouncedSearchStartLocation = async (query: string) => {
    if (!query.trim()) {
      setStartLocationResults([]);
      setShowStartResults(false);
      return;
    }

    if (startSearchTimeoutRef.current) {
      clearTimeout(startSearchTimeoutRef.current);
    }

    startSearchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingStart(true);
      try {
        const results = await searchPlaces(
          query,
          searchLocation.latitude,
          searchLocation.longitude,
          3000,
          'distance',
          1,
          searchLocation.latitude,
          searchLocation.longitude
        );
        setStartLocationResults(results.content.slice(0, 10));
        setShowStartResults(true);
      } catch (error) {
        console.error('출발지 검색 오류:', error);
        setStartLocationResults([]);
        setShowStartResults(false);
      } finally {
        setIsSearchingStart(false);
      }
    }, 500);
  };

  const debouncedSearchEndLocation = async (query: string) => {
    if (!query.trim()) {
      setEndLocationResults([]);
      setShowEndResults(false);
      return;
    }

    if (endSearchTimeoutRef.current) {
      clearTimeout(endSearchTimeoutRef.current);
    }

    endSearchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingEnd(true);
      try {
        const results = await searchPlaces(
          query,
          searchLocation.latitude,
          searchLocation.longitude,
          3000,
          'distance',
          1,
          searchLocation.latitude,
          searchLocation.longitude
        );
        setEndLocationResults(results.content.slice(0, 10));
        setShowEndResults(true);
      } catch (error) {
        console.error('목적지 검색 오류:', error);
        setEndLocationResults([]);
        setShowEndResults(false);
      } finally {
        setIsSearchingEnd(false);
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (startSearchTimeoutRef.current) {
        clearTimeout(startSearchTimeoutRef.current);
      }
      if (endSearchTimeoutRef.current) {
        clearTimeout(endSearchTimeoutRef.current);
      }
      if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleSetRouteLocation = (type: 'departure' | 'arrival', placeInfo: SearchResult) => {
      onToggleSidebar();
      setActiveTab('route');
      if (type === 'departure') {
        setStartLocation(placeInfo.placeName);
        setStartLocationObject(placeInfo);
      } else {
        setEndLocation(placeInfo.placeName);
        setEndLocationObject(placeInfo);
        if (!startLocation || startLocation.trim() === '') {
          setStartLocation('내 위치');
          setStartLocationObject(null);
        }
      }
      setShowStartResults(false);
      setShowEndResults(false);
    };

    (window as any).setRouteLocationFromInfoWindow = handleSetRouteLocation;

    return () => {
      delete (window as any).setRouteLocationFromInfoWindow;
    };
  }, [onToggleSidebar, setActiveTab, setStartLocation, setEndLocation, startLocation]);

  return {
    activeTab,
    setActiveTab,
    startLocation,
    setStartLocation,
    endLocation,
    setEndLocation,
    startLocationResults,
    endLocationResults,
    isSearchingStart,
    isSearchingEnd,
    showStartResults,
    setShowStartResults,
    showEndResults,
    setShowEndResults,
    selectedTransportMode,
    setSelectedTransportMode,
    autocompleteSuggestions,
    setAutocompleteSuggestions,
    showAutocomplete,
    setShowAutocomplete,
    debouncedAutocomplete,
    debouncedSearchStartLocation,
    debouncedSearchEndLocation,
    handleTextEdit,
    startRoute,
    isRouteLoading,
    routeResult,
    routeError,
    clearRoute,
    searchLocation: {
      lat: searchLocation.latitude,
      lng: searchLocation.longitude,
    },
    location,
    startLocationObject,
    setStartLocationObject,
    endLocationObject,
    setEndLocationObject,
  };
};