import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity, // Add this import
    Dimensions,
    Platform,
    BackHandler,
    Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'; // Change this import
import { Ionicons } from '@expo/vector-icons'; // Add this import
import { API_BASE_URL } from '@env';
import KakaoMap from "../components/KakaoMap";
import RouteBottomSheet from "../components/search/RouteBottomSheet";
import RouteSearchPanel from "../components/search/RouteSearchPanel";
import FloatingSearchBar from "../components/search/FloatingSearchBar";
// CurrentLocationButton import 제거
import RouteResultComponent from "../components/route/RouteResult";
import { SearchResult, SearchOptions } from "../types/search";
import { PageResponse } from "../types/api";
import { RouteResult } from "../types/route";
import { ParkingLot } from "../types/parking";
import { mobileStyles } from "./HomeMobileLayout.styles";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORIES } from "../constants/categories";
import { useBottomSheetHeight } from "../utils/bottomSheetUtils";
import { MarkerDataConverter } from "../utils/markerUtils";

interface HomeMobileLayoutProps {
    // Props for HomeMobileLayout
    selectedPlaceId: string | null;
    setSelectedPlaceId: (id: string | null) => void;
    showInfoWindow: boolean;
    setShowInfoWindow: (show: boolean) => void;
    selectedMarkerPosition: { lat: number; lng: number } | null;
    setSelectedMarkerPosition: (position: { lat: number; lng: number } | null) => void;
    location: { latitude: number; longitude: number } | null;
    mapCenter: { latitude: number; longitude: number } | null;
    setMapCenter: (center: { latitude: number; longitude: number } | null) => void;
    onMapIdle: (lat: number, lng: number) => void;
    markers: any[]; // Adjust type as needed
    bottomSheetOpen: boolean;
    setBottomSheetOpen: (isOpen: boolean) => void;
    bottomSheetHeight: number;
    setBottomSheetHeight: (height: number) => void;
    showPlaceDetail: boolean;
    setShowPlaceDetail: (show: boolean) => void;
    searchQuery: string;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    setSearchQuery: (query: string) => void;
    searchResults: SearchResult[];
    allMarkers: SearchResult[];
    isLoading: boolean;
    errorMsg: string | null;
    onSearch: () => Promise<void>;
    onSelectResult: (item: SearchResult) => void;
    onMarkerPress: (placeId: string, lat?: number, lng?: number) => void;
    searchOptions: SearchOptions;
    setSearchOptions: (options: Partial<SearchOptions>) => void;
    loadingNextPage: boolean;
    loadingAllMarkers: boolean;
    markerCountReachedLimit: boolean;
    onNextPage: () => Promise<void>;
    pagination: Omit<PageResponse<any>, 'content'> | null;
    onSetRouteLocation?: (type: 'departure' | 'arrival', placeInfo: SearchResult) => void;
    onOpenSidebar?: () => void;
    routeResult?: RouteResult | null;
    isRouteLoading?: boolean;
    routeError?: string | null;
    startRoute?: any;
    clearRoute?: () => void;
    showSearchInAreaButton: boolean;
    handleSearchInArea: (currentMapCenter?: { latitude: number; longitude: number }, selectedCategory?: string) => void;
    handleCategorySearch: (categoryName: string) => Promise<void>;
    searchCenter?: { latitude: number; longitude: number } | null;
    setSearchCenter: (center: { latitude: number; longitude: number } | null) => void;
    clearSearchResults: () => void;
    locationError?: string | null;
}

const MobileHomeMobileLayout: React.FC<HomeMobileLayoutProps> = ({
                                                               selectedPlaceId,
                                                               setSelectedPlaceId,
                                                               showInfoWindow,
                                                               setShowInfoWindow,
                                                               selectedMarkerPosition,
                                                               setSelectedMarkerPosition,
                                                               location,
                                                               mapCenter,
                                                               setMapCenter,
                                                               onMapIdle,
                                                               markers,
                                                               bottomSheetOpen,
                                                               setBottomSheetOpen,
                                                               bottomSheetHeight,
                                                               setBottomSheetHeight,
                                                               activeTab,
                                                               setActiveTab,
                                                               showPlaceDetail,
                                                               setShowPlaceDetail,
                                                               searchQuery,
                                                               setSearchQuery,
                                                               searchResults,
                                                               allMarkers,
                                                               isLoading,
                                                               errorMsg,
                                                               onSearch,
                                                               onSelectResult,
                                                               searchOptions,
                                                               setSearchOptions,
                                                               loadingNextPage,
                                                               loadingAllMarkers,
                                                               markerCountReachedLimit,
                                                               onNextPage,
                                                               pagination,
                                                               onSetRouteLocation,
                                                               onOpenSidebar,
                                                               routeResult,
                                                               isRouteLoading,
                                                               routeError,
                                                               startRoute,
                                                               clearRoute,
                                                               showSearchInAreaButton,
                                                               handleSearchInArea,
                                                               handleCategorySearch,
                                                               searchCenter,
                                                               setSearchCenter,
                                                               clearSearchResults,
                                                           }) => {
    const insets = useSafeAreaInsets();
    const { height: SCREEN_HEIGHT } = Dimensions.get('window');
    const { calculateHeight, calculateCurrentLocationOffset } = useBottomSheetHeight();

    // 작은 핸들 높이 상수 (메모이제이션)
    const SMALL_HANDLE_HEIGHT = useMemo(() => 60, []);
    
    // 마커 상태 관리
    const [currentMarkers, setCurrentMarkers] = useState<any[]>([]);
    
    
    // 현재 활성 탭 상태 관리
    // activeTab과 setActiveTab은 props로 받음
    
    // 외부에서 주차장 데이터를 관리할 상태
    const [externalParkingLots, setExternalParkingLots] = useState<ParkingLot[]>([]);
    
    // 마커 업데이트 함수
    const handleUpdateMarkers = useCallback((newMarkers: any[]) => {
        setCurrentMarkers(newMarkers);
    }, []);
    
    // 탭 변경 핸들러
    const handleActiveTabChange = useCallback((tab: 'search' | 'parking') => {
        setActiveTab(tab);
    }, []);

    // 주차장 마커 클릭 핸들러
    const handleParkingLotSelect = useCallback((parkingLot: ParkingLot) => {
    }, []);
    
    // 주차장 검색 함수 (현재 지도 중심 기준)
    const handleParkingSearchInArea = useCallback(async (mapCenter: { latitude: number; longitude: number }) => {
        
        // 주차장 검색 API 호출 (기존 parkingApi 사용)
        try {
            const { parkingApi } = await import('../services/parkingApi');
            
            const response = await parkingApi.searchNearbyParkingLots({
                lat: mapCenter.latitude,
                lng: mapCenter.longitude,
                radius: 5.0, // 1km -> 5km로 증가
                page: 1,
                size: 20
            });
            
            
            if (response.success) {
                const parkingLots = response.data.content;
                
                // 주차장 데이터를 상태에 저장 (바텀시트에서 사용)
                setExternalParkingLots(parkingLots);
                
                // 주차장 마커 생성 및 업데이트
                const parkingMarkers = MarkerDataConverter.convertParkingLotsToMarkers(
                    parkingLots,
                    null,
                    location || undefined
                );
                handleUpdateMarkers(parkingMarkers);
            } else {
                // 빈 주차장 데이터로 업데이트
                setExternalParkingLots([]);
                // 빈 마커로 업데이트
                const emptyMarkers = MarkerDataConverter.convertParkingLotsToMarkers(
                    [],
                    null,
                    location || undefined
                );
                handleUpdateMarkers(emptyMarkers);
            }
        } catch (error) {
            console.error('🚨 주차장 검색 오류:', error);
            // 에러 시 빈 주차장 데이터로 업데이트
            setExternalParkingLots([]);
            // 에러 시 빈 마커로 업데이트
            const emptyMarkers = MarkerDataConverter.convertParkingLotsToMarkers(
                [],
                null,
                location || undefined
            );
            handleUpdateMarkers(emptyMarkers);
        }
    }, [location, handleUpdateMarkers]);
    
    // 일반 검색 결과 마커 클릭 핸들러
    const onMarkerPress = useCallback((placeId: string, lat?: number, lng?: number) => {
        
        // 검색 결과에서 해당 장소 찾기
        const selectedResult = allMarkers.find(marker => marker.placeId === placeId);
        if (selectedResult) {
            
            // 선택된 장소 상태 업데이트
            setSelectedPlaceId(placeId);
            setSelectedMarkerPosition({ lat: selectedResult.lat, lng: selectedResult.lng });
            
            // 선택된 마커 업데이트 (빨간색 표시)
            const selectedMarkers = MarkerDataConverter.convertSearchResultsToMarkers(
                allMarkers,
                placeId,
                location || undefined
            );
            setCurrentMarkers(selectedMarkers);
            
            // 장소 상세 정보 표시
            setShowPlaceDetail(true);
        } else {
        }
    }, [allMarkers, location]);

    // 길찾기 모드 상태
    const [isRouteMode, setIsRouteMode] = useState(false);
    const [selectedTransportMode, setSelectedTransportMode] = useState('driving');
    const [showRouteDetail, setShowRouteDetail] = useState(false);
    const [startLocation, setStartLocation] = useState('내 위치');
    const [endLocation, setEndLocation] = useState('');
    const [startLocationResults, setStartLocationResults] = useState<SearchResult[]>([]);
    const [endLocationResults, setEndLocationResults] = useState<SearchResult[]>([]);
    const [selectedEndLocation, setSelectedEndLocation] = useState<SearchResult | null>(null);
    const [selectedStartLocation, setSelectedStartLocation] = useState<SearchResult | null>(null);
    const [startLocationSearching, setStartLocationSearching] = useState(false);
    const [endLocationSearching, setEndLocationSearching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [selectedSearchResult, setSelectedSearchResult] = useState<SearchResult | null>(null);

    // 초기 마커 설정 (검색 결과가 있을 때만, 탭이 검색 결과일 때만, 길찾기 모드가 아닐 때만)
    useEffect(() => {
        
        // 주차장 탭일 때는 currentMarkers를 건드리지 않음
        if (activeTab === 'parking') {
            return;
        }
        
        // 길찾기 모드일 때는 검색 결과 마커를 표시하지 않음
        if (isRouteMode || showRouteDetail) {
            setCurrentMarkers([]);
            return;
        }
        
        if (allMarkers.length > 0 && activeTab === 'search') {
            const initialMarkers = MarkerDataConverter.convertSearchResultsToMarkers(
                allMarkers,
                selectedPlaceId,
                location || undefined
            );
            setCurrentMarkers(initialMarkers);
        } else if (allMarkers.length === 0 && currentMarkers.length > 0 && activeTab === 'search') {
            // 검색 결과가 없을 때는 현재 위치 마커만 표시 (검색 결과 탭일 때만)
            const emptyMarkers = MarkerDataConverter.convertSearchResultsToMarkers(
                [],
                null,
                location || undefined
            );
            setCurrentMarkers(emptyMarkers);
        } else {
        }
    }, [allMarkers, selectedPlaceId, location, activeTab, isRouteMode, showRouteDetail]);

    // 홈화면으로 돌아갈 때 모든 마커 초기화
    useEffect(() => {
        if (!hasSearched && !isRouteMode) {
            // 홈화면 상태: 모든 마커 초기화
            setExternalParkingLots([]);
            setCurrentMarkers([]);
            setSelectedPlaceId(null);
            setSelectedMarkerPosition(null);
        }
    }, [hasSearched, isRouteMode]);

    // 바텀시트가 닫힐 때 주차장 마커 초기화
    useEffect(() => {
        if (!bottomSheetOpen && activeTab === 'search') {
            // 바텀시트가 닫히고 검색 결과 탭일 때 주차장 마커 제거
            setExternalParkingLots([]);
            // 검색 결과가 있으면 검색 결과 마커, 없으면 현재 위치 마커만 표시
            if (allMarkers.length > 0) {
                const searchMarkers = MarkerDataConverter.convertSearchResultsToMarkers(
                    allMarkers,
                    selectedPlaceId,
                    location || undefined
                );
                setCurrentMarkers(searchMarkers);
            } else {
                const userLocationMarker = MarkerDataConverter.convertSearchResultsToMarkers(
                    [],
                    null,
                    location || undefined
                );
                setCurrentMarkers(userLocationMarker);
            }
        }
    }, [bottomSheetOpen, activeTab, allMarkers, selectedPlaceId, location]);

    // 길찾기 모드 진입 시 검색 결과 초기화
    useEffect(() => {
        if (isRouteMode) {
            // 길찾기 모드 진입 시 검색 결과 정리
            setCurrentMarkers([]);
            setExternalParkingLots([]);
            setSelectedPlaceId(null);
            setSelectedMarkerPosition(null);
            setHasSearched(false);
        }
    }, [isRouteMode]);

    // 홈화면으로 돌아갔을 때 주차장 마커 초기화
    useEffect(() => {
        // 검색을 하지 않은 상태이고 주차장 탭이 아닐 때
        if (!hasSearched && activeTab === 'search') {
            // 주차장 데이터 초기화
            setExternalParkingLots([]);
            // 현재 위치 마커만 표시
            const userLocationMarker = MarkerDataConverter.convertSearchResultsToMarkers(
                [],
                null,
                location || undefined
            );
            setCurrentMarkers(userLocationMarker);
        }
    }, [hasSearched, activeTab, location]);

    // 디바운싱을 위한 타이머 ref들
    const startLocationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const endLocationTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            if (startLocationTimerRef.current) {
                clearTimeout(startLocationTimerRef.current);
            }
            if (endLocationTimerRef.current) {
                clearTimeout(endLocationTimerRef.current);
            }
        };
    }, []);

    // 검색 포커스 핸들러
    const handleSearchFocus = () => {
        setIsSearchFocused(true);
    };

    // 검색 블러 핸들러
    const handleSearchBlur = () => {
        setIsSearchFocused(false);
        setShowAutocomplete(false);
    };

    // 자동완성 제안 가져오기
    const fetchAutocompleteSuggestions = useCallback(async (query: string) => {
        if (query.length < 2) {
            setAutocompleteSuggestions([]);
            setShowAutocomplete(false);
            return;
        }

        try {
            const { getAutocompleteSuggestions } = await import('../services/searchApi');
            const suggestions = await getAutocompleteSuggestions(query);
            const suggestionTexts = suggestions.map(s => s.word);
            setAutocompleteSuggestions(suggestionTexts);
            setShowAutocomplete(true);
        } catch (error) {
            setAutocompleteSuggestions([]);
            setShowAutocomplete(false);
        }
    }, []);

    // 자동완성 제안 선택 핸들러 (useCallback 최적화)
    const handleSuggestionSelect = useCallback((suggestion: string) => {
        setSearchQuery(suggestion);
        setShowAutocomplete(false);
        setHasSearched(true);
        setIsSearchFocused(false);
        onSearch();
    }, [onSearch]);

    // 검색어 변경 시 자동완성 제안 가져오기
    useEffect(() => {
        if (searchQuery && isSearchFocused && !hasSearched) {
            const timeoutId = setTimeout(() => {
                fetchAutocompleteSuggestions(searchQuery);
            }, 300); // 300ms 디바운스

            return () => clearTimeout(timeoutId);
        } else {
            setShowAutocomplete(false);
        }
    }, [searchQuery, isSearchFocused, hasSearched, fetchAutocompleteSuggestions]);


    // 자동 축소 기능 제거 - 현재 위치가 지도 중심이 되도록 유지

    // 바텀시트 높이 설정 (종류별로 다르게)
    useEffect(() => {
        if (bottomSheetOpen) {
            if (showRouteDetail) {
                // 경로 상세 안내 바텀시트
                setBottomSheetHeight(calculateHeight('routeDetail', true));
            } else if (showPlaceDetail) {
                // 상세장소정보 바텀시트
                setBottomSheetHeight(calculateHeight('placeDetail', true));
            } else {
                // 일반 검색 결과 바텀시트
                setBottomSheetHeight(calculateHeight('normal', true));
            }
        } else {
            // 바텀시트가 닫혀있을 때는 작은 핸들 높이로 설정 (0이 아님)
            setBottomSheetHeight(calculateHeight('closed', false));
        }
    }, [bottomSheetOpen, showRouteDetail, showPlaceDetail]);

    // 상세안내 모드 진입 시 바텀시트 자동 열기
    useEffect(() => {
        if (showRouteDetail || showPlaceDetail) {
            setBottomSheetOpen(true);
        }
    }, [showRouteDetail, showPlaceDetail]);







    // 지도 레벨 초기화 상태
    const [resetMapLevel, setResetMapLevel] = useState(false);

    useEffect(() => {
        if (resetMapLevel) {
            setResetMapLevel(false);
        }
    }, [resetMapLevel, isRouteMode, showRouteDetail]);


    const webViewRef = useRef<any>(null);

    const selectedCategoryRef = useRef(selectedCategory);
    selectedCategoryRef.current = selectedCategory;

    // 전역 함수 등록 (WebView에서 호출할 수 있도록)
    useEffect(() => {
        (global as any).handleSearchInAreaWithCurrentCenter = (currentMapCenter: { latitude: number; longitude: number }) => {
            // ref를 통해 최신 selectedCategory 값을 참조
            handleSearchInArea(currentMapCenter, selectedCategoryRef.current);
        };


        return () => {
            delete (global as any).handleSearchInAreaWithCurrentCenter;
        };
    }, [handleSearchInArea]);

    // 더블클릭 감지를 위한 상태
    const [lastPressTime, setLastPressTime] = useState(0);
    const [pressCount, setPressCount] = useState(0);

    // 검색어나 카테고리가 변경될 때 장소 상세 정보 닫기
    useEffect(() => {
        if (showPlaceDetail) {
            setShowPlaceDetail(false);
        }
    }, [searchQuery, selectedCategory]);

    // 길찾기 모드 관련 함수들 (useCallback 최적화)
    const handleRoutePress = useCallback(() => {
        // 바텀시트 닫기
        setBottomSheetOpen(false);
        setShowPlaceDetail(false);
        setIsRouteMode(true);

        // 길찾기 모드 진입 시 검색 결과 마커들 제거
        if (webViewRef.current) {
            const script = `
        if (typeof clearSearchMarkers === 'function') {
          clearSearchMarkers();
        }
        true;
      `;
            webViewRef.current.injectJavaScript(script);
        }
    }, [setShowPlaceDetail]);

    // 길찾기 관련 상태 초기화 함수
    const resetRouteStates = useCallback(() => {
        // 1. UI 상태 초기화
        setIsRouteMode(false);

        // 2. 입력 필드 상태 초기화
        setStartLocation('');
        setEndLocation('');

        // 3. 검색 결과 상태 초기화
        setStartLocationResults([]);
        setEndLocationResults([]);
        setSelectedEndLocation(null);
        setSelectedStartLocation(null);
    }, []);

    const handleCloseRouteMode = useCallback(() => {
        // 1. 상태 초기화
        resetRouteStates();

        // 2. 검색바 초기화
        setSearchQuery('');
        setShowAutocomplete(false);
        setIsSearchFocused(false);

        // 3. 카테고리 초기화
        setSelectedCategory('');

        // 4. 외부 리소스 정리 (지도에서 경로 제거)
        if (clearRoute) {
            clearRoute();
        }

        // 5. 길찾기 모드 상태 초기화
        setIsRouteMode(false);
        setShowRouteDetail(false);
        setBottomSheetOpen(false);
        setBottomSheetHeight(SMALL_HANDLE_HEIGHT);

        // 6. 마커 복원 (WebView 업데이트)
        if (webViewRef.current && allMarkers.length > 0) {
            const script = `
        if (typeof updateMarkers === 'function') {
          updateMarkers(${JSON.stringify(allMarkers)});
        }
        true;
      `;
            webViewRef.current.injectJavaScript(script);
        }
    }, [resetRouteStates, clearRoute, allMarkers]);

    const handleTransportModeChange = (mode: string) => {
        setSelectedTransportMode(mode);

        // 교통수단 변경 시 유효한 경로가 있으면 자동으로 길찾기 실행
        if (startLocation && endLocation && startLocation.trim() && endLocation.trim()) {
            // handleStartRoute 대신 직접 길찾기 실행
            if (startRoute) {
                const startLocationData = (!startLocation || startLocation === '내 위치') ? {
                    placeId: 'current_location',
                    placeName: '내 위치',
                    lat: location?.latitude || 0,
                    lng: location?.longitude || 0,
                    roadAddress: '현재 위치',
                    lotAddress: '',
                    phone: '',
                    categoryGroupName: '내 위치',
                    placeUrl: '',
                    distance: 0,
                    roadAddressDong: ''
                } : startLocationResults.find(r => r.placeName === startLocation) ||
                    (selectedStartLocation && selectedStartLocation.placeName === startLocation ? selectedStartLocation : null);

                const endLocationData = (!endLocation || endLocation === '내 위치') ? {
                    placeId: 'current_location',
                    placeName: '내 위치',
                    lat: location?.latitude || 0,
                    lng: location?.longitude || 0,
                    roadAddress: '현재 위치',
                    lotAddress: '',
                    phone: '',
                    categoryGroupName: '내 위치',
                    placeUrl: '',
                    distance: 0,
                    roadAddressDong: ''
                } : endLocationResults.find(r => r.placeName === endLocation) ||
                    (selectedEndLocation && selectedEndLocation.placeName === endLocation ? selectedEndLocation : null);

                if (startLocationData && endLocationData) {
                    startRoute({
                        startLocation: startLocationData,
                        endLocation: endLocationData,
                        transportMode: mode as any,
                        userLocation: location
                    });
                }
            }
        }
    };


    const handleStartLocationChange = (text: string) => {
        setStartLocation(text);

        // 기존 타이머 클리어
        if (startLocationTimerRef.current) {
            clearTimeout(startLocationTimerRef.current);
        }

        // 1글자 이상이고 "내 위치"가 아닌 경우 디바운싱 적용
        if (text.length >= 1 && text.trim() !== '내 위치') {
            startLocationTimerRef.current = setTimeout(async () => {
                try {
                    // 실제 검색 API 호출
                    const { searchPlaces } = await import('../services/searchApi');
                    if (location) {
                        const searchResults = await searchPlaces(
                            text,
                            location.latitude,
                            location.longitude,
                            3000, // radius
                            'distance', // sort
                            1, // page
                            location.latitude, // userLat
                            location.longitude // userLng
                        );
                        setStartLocationResults(searchResults.content);
                        setStartLocationSearching(true);
                    }
                } catch (error) {
                    setStartLocationResults([]);
                    setStartLocationSearching(false);
                }
            }, 500); // 500ms 디바운싱
        } else {
            setStartLocationResults([]);
            setStartLocationSearching(false);
        }
    };

    // 검색 쿼리 변경 시 카테고리 선택 초기화 및 자동 검색
    useEffect(() => {
        if (searchQuery && !selectedCategory) {
            // 검색 쿼리가 변경되고 카테고리가 선택되지 않은 경우
            // (사용자가 직접 검색한 경우)
            setSelectedCategory('');
        }

        // 카테고리 선택 시 자동 검색 실행 - 제거됨 (handleCategorySearch에서 처리)
        // if (searchQuery && selectedCategory && hasSearched) {
        //   onSearch();
        // }
    }, [searchQuery, selectedCategory, hasSearched]);

    // Android 뒤로가기 버튼 처리
    useEffect(() => {
        const backAction = () => {
            // 🔍 상태 로그 출력
            
            if (isSearchFocused) {
                // 검색 포커스가 있으면 포커스 해제하고 검색어도 지움
                setIsSearchFocused(false);
                setShowAutocomplete(false);
                setSearchQuery(''); // 검색어 지우기
                return true; // 이벤트 처리됨
            }
            if (showPlaceDetail) {
                // 장소 상세 정보에서 장소 결과 리스트로 돌아가기
                setShowPlaceDetail(false);
                return true; // 이벤트 처리됨
            }
            if (showRouteDetail) {
                if (bottomSheetOpen) {
                    // 바텀시트가 열려있으면 접기
                    setBottomSheetOpen(false);
                    setBottomSheetHeight(SMALL_HANDLE_HEIGHT);
                    return true; // 이벤트 처리됨
                } else {
                    // 바텀시트가 접혀있으면 길찾기 일반 모드로 복귀
                    setShowRouteDetail(false);
                    setIsRouteMode(true);
                    return true; // 이벤트 처리됨
                }
            }
            if (isRouteMode) {
                // 길찾기 일반 모드에서 홈화면으로 바로 이동
                handleCloseRouteMode();
                return true; // 이벤트 처리됨
            }
            if (hasSearched && !isRouteMode) {
                // 검색 결과가 있을 때 (길찾기 모드가 아닐 때만)
                if (bottomSheetOpen) {
                    // 바텀시트가 열려있으면 접기
                    setBottomSheetOpen(false);
                    setBottomSheetHeight(SMALL_HANDLE_HEIGHT);
                    return true; // 이벤트 처리됨
                } else {
                    // 바텀시트가 접혀있으면 홈화면으로 복귀
                    handleCloseSearch();
                    return true; // 이벤트 처리됨
                }
            }
            return false; // 기본 뒤로가기 동작
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [isSearchFocused, showPlaceDetail, hasSearched, isRouteMode, showRouteDetail, bottomSheetOpen]);

    // 검색 실행 함수 (UI 상태만 관리)
    const handleSearch = async () => {
        setHasSearched(true);

        // 키워드 검색 시 주차장 상태 초기화
        setExternalParkingLots([]);
        setActiveTab('search');

        // 길찾기 모드가 아닐 때만 바텀시트 열기
        if (!isRouteMode) {
            setBottomSheetOpen(true); // 검색 시 바텀시트 열기
        } else {
        }

        await onSearch();
        // 자동 축소 기능 제거 - 현재 위치 중심 유지
    };

    // 자동 축소 기능 제거됨

    // 검색 결과 닫기 함수
    const handleCloseSearch = () => {
        setHasSearched(false);
        setSearchQuery('');
        setSelectedCategory('');
        setShowAutocomplete(false);
        setSelectedSearchResult(null); // 선택된 결과 초기화
        setBottomSheetOpen(false); // 검색 닫을 때 바텀시트도 닫기
        
        // 주차장 관련 상태 초기화
        setExternalParkingLots([]);
        setCurrentMarkers([]);
        setSelectedPlaceId(null);
        setSelectedMarkerPosition(null);
    };

    const handleStartLocationSearch = async () => {
        if (startLocation.length >= 1 && startLocation.trim() !== '내 위치') {
            try {
                // 실제 검색 API 호출
                const { searchPlaces } = await import('../services/searchApi');
                if (location) {
                    const searchResults = await searchPlaces(
                        startLocation,
                        location.latitude,
                        location.longitude,
                        3000, // radius
                        'distance', // sort
                        1, // page
                        location.latitude, // userLat
                        location.longitude // userLng
                    );
                    setStartLocationResults(searchResults.content);
                    setStartLocationSearching(true);
                }
            } catch (error) {
                setStartLocationResults([]);
                setStartLocationSearching(false);
            }
        }

        // 출발지와 목적지가 모두 설정되어 있으면 자동 길찾기 실행
        if (startLocation && endLocation && startLocation.trim() && endLocation.trim()) {
            handleStartRoute();
        }
    };

    const handleEndLocationChange = (text: string) => {
        setEndLocation(text);

        // 기존 타이머 클리어
        if (endLocationTimerRef.current) {
            clearTimeout(endLocationTimerRef.current);
        }

        // 1글자 이상이고 "내 위치"가 아닌 경우 디바운싱 적용
        if (text.length >= 1 && text.trim() !== '내 위치') {
            endLocationTimerRef.current = setTimeout(async () => {
                try {
                    // 실제 검색 API 호출
                    const { searchPlaces } = await import('../services/searchApi');
                    if (location) {
                        const searchResults = await searchPlaces(
                            text,
                            location.latitude,
                            location.longitude,
                            3000, // radius
                            'distance', // sort
                            1, // page
                            location.latitude, // userLat
                            location.longitude // userLng
                        );
                        setEndLocationResults(searchResults.content);
                        setEndLocationSearching(true);
                    }
                } catch (error) {
                    setEndLocationResults([]);
                    setEndLocationSearching(false);
                }
            }, 500); // 500ms 디바운싱
        } else {
            setEndLocationResults([]);
            setEndLocationSearching(false);
        }
    };

    const handleEndLocationSearch = async () => {
        if (endLocation.length >= 1 && endLocation.trim() !== '내 위치') {
            try {
                // 실제 검색 API 호출
                const { searchPlaces } = await import('../services/searchApi');
                if (location) {
                    const searchResults = await searchPlaces(
                        endLocation,
                        location.latitude,
                        location.longitude,
                        3000, // radius
                        'distance', // sort
                        1, // page
                        location.latitude, // userLat
                        location.longitude // userLng
                    );
                    setEndLocationResults(searchResults.content);
                    setEndLocationSearching(true);
                }
            } catch (error) {
                setEndLocationResults([]);
                setEndLocationSearching(false);
            }
        }

        // 출발지와 목적지가 모두 설정되어 있으면 자동 길찾기 실행
        if (startLocation && endLocation && startLocation.trim() && endLocation.trim()) {
            handleStartRoute();
        }
    };

    const handleStartLocationSelect = (result: SearchResult) => {
        setStartLocation(result.placeName);
        setSelectedStartLocation(result); // 선택된 출발지 정보 저장
        setStartLocationResults([]);

        // 출발지 선택 시 목적지가 이미 설정되어 있으면 바로 길찾기 실행
        if (endLocation && endLocation !== '내 위치') {
            // 목적지 데이터 찾기 (endLocationResults 또는 selectedEndLocation에서)
            const endLocationData = endLocationResults.find(r => r.placeName === endLocation) ||
                (selectedEndLocation && selectedEndLocation.placeName === endLocation ? selectedEndLocation : null);

            if (endLocationData && startRoute) {
                // 동일한 좌표인지 체크
                const isSameLocation = result.lat === endLocationData.lat && result.lng === endLocationData.lng;
                
                if (isSameLocation) {
                    Alert.alert(
                        '길찾기 불가',
                        '출발지와 도착지가 동일합니다.\n다른 목적지를 선택해주세요.',
                        [{ text: '확인', style: 'default' }]
                    );
                    setEndLocation('');
                    setEndLocationResults([]);
                    setSelectedEndLocation(null);
                    return;
                }

                startRoute({
                    startLocation: result,
                    endLocation: endLocationData,
                    transportMode: selectedTransportMode as any,
                    userLocation: location
                });
            }
        }
    };

    const handleEndLocationSelect = (result: SearchResult) => {
        setEndLocation(result.placeName);
        setSelectedEndLocation(result); // 선택된 장소 정보 저장
        setEndLocationResults([]);

        // 목적지 선택 시 출발지가 이미 설정되어 있으면 바로 길찾기 실행
        if (startLocation && startLocation !== '내 위치') {
            // 출발지 데이터 찾기
            const startLocationData = startLocationResults.find(r => r.placeName === startLocation) ||
                (selectedStartLocation && selectedStartLocation.placeName === startLocation ? selectedStartLocation : null);
            
            if (startLocationData && startRoute) {
                // 동일한 좌표인지 체크
                const isSameLocation = startLocationData.lat === result.lat && startLocationData.lng === result.lng;
                
                if (isSameLocation) {
                    Alert.alert(
                        '길찾기 불가',
                        '출발지와 도착지가 동일합니다.\n다른 목적지를 선택해주세요.',
                        [{ text: '확인', style: 'default' }]
                    );
                    setEndLocation('');
                    setEndLocationResults([]);
                    setSelectedEndLocation(null);
                    return;
                }

                startRoute({
                    startLocation: startLocationData,
                    endLocation: result,
                    transportMode: selectedTransportMode as any,
                    userLocation: location
                });
            }
        } else if (startLocation === '내 위치') {
            if (startRoute) {
                // 동일한 좌표인지 체크 (내 위치와 목적지)
                const isSameLocation = location && 
                    Math.abs(location.latitude - result.lat) < 0.0001 && 
                    Math.abs(location.longitude - result.lng) < 0.0001;
                
                if (isSameLocation) {
                    Alert.alert(
                        '길찾기 불가',
                        '출발지와 도착지가 동일합니다.\n다른 목적지를 선택해주세요.',
                        [{ text: '확인', style: 'default' }]
                    );
                    setEndLocation('');
                    setEndLocationResults([]);
                    setSelectedEndLocation(null);
                    return;
                }

                startRoute({
                    startLocation: '내 위치',
                    endLocation: result,
                    transportMode: selectedTransportMode as any,
                    userLocation: location
                });
            }
        }
    };

    const handleSwapLocations = () => {
        const tempStart = startLocation;
        const tempEnd = endLocation;
        const tempSelectedStart = selectedStartLocation;
        const tempSelectedEnd = selectedEndLocation;

        // 출발지와 목적지 교체
        setStartLocation(tempEnd);
        setEndLocation(tempStart);

        // 선택된 장소 정보도 교체
        setSelectedStartLocation(tempSelectedEnd);
        setSelectedEndLocation(tempSelectedStart);

        // 검색 결과 리스트 비우기
        setStartLocationResults([]);
        setEndLocationResults([]);
    };

    // 출발지와 목적지가 모두 설정되면 자동으로 길찾기 실행 (중복 실행 방지)
    const prevRouteParams = useRef<{
        startLocation: string;
        endLocation: string;
        selectedTransportMode: string;
    } | null>(null);

    useEffect(() => {
        // 출발지와 목적지가 모두 설정되어 있고, 둘 다 유효한 데이터일 때만 실행
        if (startLocation && endLocation &&
            (selectedStartLocation || startLocation === '내 위치') &&
            (selectedEndLocation || endLocation === '내 위치')) {

            // 이전 파라미터와 비교하여 중복 실행 방지
            const currentParams = {
                startLocation,
                endLocation,
                selectedTransportMode
            };

            if (prevRouteParams.current &&
                prevRouteParams.current.startLocation === currentParams.startLocation &&
                prevRouteParams.current.endLocation === currentParams.endLocation &&
                prevRouteParams.current.selectedTransportMode === currentParams.selectedTransportMode) {
                return;
            }

            prevRouteParams.current = currentParams;

            // selectedStartLocation과 selectedEndLocation을 우선적으로 사용
            const finalStartData = selectedStartLocation;
            const finalEndData = selectedEndLocation;

            // startLocation이 "내 위치"인 경우 현재 위치 데이터 생성
            const finalStartDataWithCurrentLocation = (startLocation === '내 위치') ? {
                placeId: 'current_location',
                placeName: '내 위치',
                lat: location?.latitude || 0,
                lng: location?.longitude || 0,
                roadAddress: '현재 위치',
                lotAddress: '',
                phone: '',
                categoryGroupName: '내 위치',
                placeUrl: '',
                distance: 0,
                roadAddressDong: ''
            } : finalStartData;

            // endLocation이 "내 위치"인 경우 현재 위치 데이터 생성
            const finalEndDataWithCurrentLocation = (endLocation === '내 위치') ? {
                placeId: 'current_location',
                placeName: '내 위치',
                lat: location?.latitude || 0,
                lng: location?.longitude || 0,
                roadAddress: '현재 위치',
                lotAddress: '',
                phone: '',
                categoryGroupName: '내 위치',
                placeUrl: '',
                distance: 0,
                roadAddressDong: ''
            } : finalEndData;

            // 출발지와 목적지가 모두 유효한 경우에만 체크
            if (finalStartDataWithCurrentLocation && finalEndDataWithCurrentLocation) {
                // 동일한 좌표인지 먼저 체크
                const isSameLocation = finalStartDataWithCurrentLocation.lat === finalEndDataWithCurrentLocation.lat &&
                    finalStartDataWithCurrentLocation.lng === finalEndDataWithCurrentLocation.lng;

                if (isSameLocation) {
                    // 동일한 좌표인 경우 Alert 표시하고 목적지 비우기
                    Alert.alert(
                        '길찾기 불가',
                        '출발지와 도착지가 동일합니다.\n다른 목적지를 선택해주세요.',
                        [{ text: '확인', style: 'default' }]
                    );
                    // 목적지 비우기
                    setEndLocation('');
                    setEndLocationResults([]);
                    setSelectedEndLocation(null);
                    return;
                }

                // 정상적인 경우에만 길찾기 실행
                handleStartRoute();
            }
        }
    }, [selectedStartLocation, selectedEndLocation, selectedTransportMode, startLocation, endLocation, location]);

    const handleStartRoute = useCallback(() => {
        if (!endLocation) {
            return;
        }

        // 출발지가 비어있으면 "내 위치"로 처리
        const startLocationData = (!startLocation || startLocation === '내 위치') ? {
            placeId: 'current_location',
            placeName: '내 위치',
            lat: location?.latitude || 0,
            lng: location?.longitude || 0,
            roadAddress: '현재 위치',
            lotAddress: '',
            phone: '',
            categoryGroupName: '내 위치',
            placeUrl: '',
            distance: 0,
            roadAddressDong: ''
        } : startLocationResults.find(r => r.placeName === startLocation) ||
            (selectedStartLocation && selectedStartLocation.placeName === startLocation ? selectedStartLocation : null);

        // endLocationResults에서 찾거나, 저장된 selectedEndLocation 사용
        const endLocationData = (!endLocation || endLocation === '내 위치') ? {
            placeId: 'current_location',
            placeName: '내 위치',
            lat: location?.latitude || 0,
            lng: location?.longitude || 0,
            roadAddress: '현재 위치',
            lotAddress: '',
            phone: '',
            categoryGroupName: '내 위치',
            placeUrl: '',
            distance: 0,
            roadAddressDong: ''
        } : endLocationResults.find(r => r.placeName === endLocation) ||
            (selectedEndLocation && selectedEndLocation.placeName === endLocation ? selectedEndLocation : null);

        if (startLocationData && endLocationData && startRoute) {
            // 거리 계산 (대략적인 직선 거리)
            const distance = Math.sqrt(
                Math.pow(endLocationData.lat - startLocationData.lat, 2) +
                Math.pow(endLocationData.lng - startLocationData.lng, 2)
            ) * 111000; // 대략적인 미터 단위 변환

            // 자동차로 가기에 너무 가까운 거리 (150m 이하)인 경우 도보로 자동 전환
            if (selectedTransportMode === 'driving' && distance < 150) {
                Alert.alert(
                    '교통수단 자동 변경',
                    '자동차로 가기에 너무 가까운 거리입니다.\n도보로 길찾기를 진행합니다.',
                    [{ text: '확인', style: 'default' }]
                );
                // 교통수단을 도보로 변경
                setSelectedTransportMode('walking');

                startRoute({
                    startLocation: startLocationData,
                    endLocation: endLocationData,
                    transportMode: 'walking' as any,
                    userLocation: location
                });
            } else {
                startRoute({
                    startLocation: startLocationData,
                    endLocation: endLocationData,
                    transportMode: selectedTransportMode as any,
                    userLocation: location
                });
            }
        }
    }, [startLocation, endLocation, location, startLocationResults, selectedStartLocation, endLocationResults, selectedEndLocation, selectedTransportMode, startRoute]);



    // 길찾기 결과가 있을 때 줌 레벨 조정
    useEffect(() => {
        if (routeResult && webViewRef.current && isRouteMode) {
            const adjustRouteZoom = () => {
                const script = `
          if (typeof adjustZoomForRouteResults === 'function') {
            try {
              adjustZoomForRouteResults();
            } catch (error) {
              // 줌 레벨 조정 오류 처리
            }
          }
          true;
        `;

                webViewRef.current.injectJavaScript(script);
            };

            // 길찾기 결과가 렌더링될 때까지 잠시 대기
            setTimeout(adjustRouteZoom, 500);
        }
    }, [routeResult, isRouteMode]);

    // 상세 안내 바텀시트가 열릴 때 지도 중심 조정 (처음 진입할 때만)
    useEffect(() => {
        if (showRouteDetail && webViewRef.current) {
            // 바텀시트가 완전히 렌더링될 때까지 대기
            const adjustMapCenter = () => {
                const finalRatio = 0.6;

                const script = `
          if (typeof adjustMapCenterForDetailSheet === 'function') {
            adjustMapCenterForDetailSheet(${finalRatio});
          }
          true;
        `;

                webViewRef.current.injectJavaScript(script);
            };

            // 길찾기 상세 안내 모드로 처음 진입할 때만 지도 중심 조정
            setTimeout(adjustMapCenter, 500);
        }
    }, [showRouteDetail]);

    return (
        <SafeAreaView style={mobileStyles.safeAreaContainer}>
            {/* 플로팅 검색 바 - 상세 경로 안내 모드일 때는 숨김 */}
            {!showRouteDetail && (
                <FloatingSearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onSearch={handleSearch}
                    onRoutePress={handleRoutePress}
                    selectedCategory={selectedCategory}
                    onCategorySelect={async (categoryId) => {
                        // 카테고리 선택 처리
                        const category = CATEGORIES.find(cat => cat.id === categoryId);
                        if (category) {
                            setSelectedCategory(categoryId);
                            setHasSearched(true);

                            // 카테고리 검색 시 주차장 상태 초기화
                            setExternalParkingLots([]);
                            setActiveTab('search');
                            
                            // 카테고리 검색 실행
                            await handleCategorySearch(category.name);
                        }
                    }}
                    isLoading={isLoading}
                    isSearchFocused={isSearchFocused}
                    onSearchFocus={handleSearchFocus}
                    onSearchBlur={handleSearchBlur}
                    autocompleteSuggestions={autocompleteSuggestions}
                    onSuggestionSelect={handleSuggestionSelect}
                    showAutocomplete={showAutocomplete}
                />
            )}

            {/* 길찾기 패널 - 상세 경로 안내 모드일 때는 숨김 */}
            {!showRouteDetail && (
                <RouteSearchPanel
                    isVisible={isRouteMode}
                    onClose={handleCloseRouteMode}
                    onTransportModeChange={handleTransportModeChange}
                    selectedTransportMode={selectedTransportMode}
                    startLocation={startLocation}
                    setStartLocation={handleStartLocationChange}
                    endLocation={endLocation}
                    setEndLocation={handleEndLocationChange}
                    startLocationResults={startLocationResults}
                    endLocationResults={endLocationResults}
                    onStartLocationSelect={handleStartLocationSelect}
                    onEndLocationSelect={handleEndLocationSelect}
                    setStartLocationResults={setStartLocationResults}
                    setEndLocationResults={setEndLocationResults}
                    startLocationSearching={startLocationSearching}
                    endLocationSearching={endLocationSearching}
                    onStartLocationSearch={handleStartLocationSearch}
                    onEndLocationSearch={handleEndLocationSearch}
                    onSwapLocations={handleSwapLocations}
                />
            )}

            {/* 길찾기 결과 요약 카드 */}
            {isRouteMode && routeResult && !showRouteDetail && (
                <View style={[mobileStyles.routeResultContainer, { zIndex: 1002 }]}>
                    <TouchableOpacity
                        style={[mobileStyles.routeSummaryCard, mobileStyles.routeSummaryContent]}
                        onPress={() => {
                            setShowRouteDetail(true);
                            setIsRouteMode(false); // 길찾기 모드창 닫기
                        }}
                    >
                        <View style={mobileStyles.routeSummaryStats}>
                            <View style={mobileStyles.routeSummaryStat}>
                                <Ionicons name="walk-outline" size={20} color="#28a745" />
                                <Text style={mobileStyles.routeSummaryValue}>
                                    {routeResult.totalDistance >= 1000
                                        ? `${(routeResult.totalDistance / 1000).toFixed(1)}km`
                                        : `${Math.round(routeResult.totalDistance)}m`}
                                </Text>
                                <Text style={mobileStyles.routeSummaryLabel}>거리</Text>
                            </View>

                            <View style={mobileStyles.routeSummaryStat}>
                                <Ionicons name="time-outline" size={20} color="#ffc107" />
                                <Text style={mobileStyles.routeSummaryValue}>
                                    {Math.round(routeResult.totalDuration / 60)}분
                                </Text>
                                <Text style={mobileStyles.routeSummaryLabel}>소요시간</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {errorMsg && (
                <View style={mobileStyles.errorContainer}>
                    <Text style={mobileStyles.errorText}>{errorMsg}</Text>
                    <TouchableOpacity
                        style={{ padding: 5 }}
                        onPress={() => {
                            // 오류 메시지 닫기 (임시 해결책)
                        }}
                    >
                        <Ionicons name="close" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            {/* 길찾기 상세 안내 바텀시트 */}
            {showRouteDetail && routeResult && (
                <RouteBottomSheet
                    isOpen={bottomSheetOpen}
                    isRouteDetailMode={true}
                    onToggle={() => {
                        // 길찾기 상세안내 모드에서는 바텀시트만 닫기 (모드 변경 없음)
                        if (bottomSheetOpen) {
                            // 바텀시트 닫기: 작은 핸들 높이로 설정
                            setBottomSheetOpen(false);
                            setBottomSheetHeight(SMALL_HANDLE_HEIGHT);
                        } else {
                            // 바텀시트 열기: 전체 높이로 설정
                            setBottomSheetOpen(true);
                            setBottomSheetHeight(calculateHeight('normal', true));
                        }
                    }}
                    allMarkers={allMarkers}
                    onSelectResult={(result) => {
                        setSelectedSearchResult(result);
                        onSelectResult(result);
                    }}
                    onSetRouteLocation={onSetRouteLocation}
                    routeResult={routeResult}
                    isRouteLoading={isRouteLoading}
                    routeError={routeError}
                    startRoute={startRoute}
                    onSetStartLocation={(placeDetail) => {
                        if (typeof placeDetail === 'string') {
                            setStartLocation(placeDetail);
                        } else {
                            setStartLocation(placeDetail.placeName);
                            // 선택된 장소 정보를 selectedStartLocation에 저장
                            setSelectedStartLocation(placeDetail);
                        }

                        setShowRouteDetail(false);
                        setIsRouteMode(true);
                    }}
                    onSetEndLocation={(placeDetail) => {
                        if (typeof placeDetail === 'string') {
                            setEndLocation(placeDetail);
                        } else {
                            setEndLocation(placeDetail.placeName);
                            setStartLocation(''); // 출발지를 빈 값으로 설정
                            // 선택된 장소 정보를 selectedEndLocation에 저장
                            setSelectedEndLocation(placeDetail);
                        }

                        setSelectedStartLocation(null); // 출발지 정보 초기화
                        setShowRouteDetail(false);
                        setIsRouteMode(true);
                    }}
                    clearRoute={clearRoute}
                    hasSearched={hasSearched}
                    searchResults={searchResults}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    selectedPlaceId={selectedPlaceId}
                    showPlaceDetail={false}
                    setShowPlaceDetail={() => {}}
                    onRoutePress={handleRoutePress}
                    // 주차장 관련 props 추가
                    onUpdateMarkers={handleUpdateMarkers}
                    onSelectParkingLot={(parkingLot) => {
                    }}
                    onActiveTabChange={handleActiveTabChange}
                    externalParkingLots={externalParkingLots}
                    onParkingLotSelect={handleParkingLotSelect}
                    onMapCenterChange={(center) => {
                        setMapCenter(center);
                    }}
                />
            )}

            {/* 길찾기 모드가 아닐 때만 바텀시트 표시 */}
            {!isRouteMode && !showRouteDetail && (
                <RouteBottomSheet
                    isOpen={bottomSheetOpen}
                    onToggle={() => {
                        if (bottomSheetOpen) {
                            // 바텀시트 닫기: 작은 핸들 높이로 설정
                            setBottomSheetOpen(false);
                            setBottomSheetHeight(SMALL_HANDLE_HEIGHT);
                        } else {
                            // 바텀시트 열기: 전체 높이로 설정
                            setBottomSheetOpen(true);
                            setBottomSheetHeight(calculateHeight('normal', true));
                        }
                    }}
                    style={{ zIndex: 9999 }}
                    allMarkers={allMarkers}
                    onSelectResult={(result) => {
                        setSelectedSearchResult(result);
                        onSelectResult(result);
                    }}
                    onSetRouteLocation={onSetRouteLocation}
                    routeResult={routeResult}
                    isRouteLoading={isRouteLoading}
                    routeError={routeError}
                    startRoute={startRoute}
                    clearRoute={clearRoute}
                    // 검색 관련 props 추가
                    hasSearched={hasSearched}
                    searchResults={searchResults}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    activeTab={activeTab as "search" | "parking" | undefined}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    onCloseSearch={handleCloseSearch}
                    selectedSearchResult={selectedSearchResult}
                    bottomSheetHeight={bottomSheetHeight}
                    showPlaceDetail={showPlaceDetail}
                    setShowPlaceDetail={setShowPlaceDetail}
                    selectedPlaceId={selectedPlaceId}
                    onRoutePress={handleRoutePress}
                    // 주차장 관련 props 추가
                    onUpdateMarkers={handleUpdateMarkers}
                    onSelectParkingLot={(parkingLot) => {
                        // 주차장 선택 시 처리 - RouteBottomSheet에서 처리됨
                    }}
                    onActiveTabChange={handleActiveTabChange}
                    externalParkingLots={externalParkingLots}
                    onParkingLotSelect={handleParkingLotSelect}
                    onMapCenterChange={(center) => {
                        setMapCenter(center);
                    }}
                    onSetStartLocation={(location) => {
                        if (typeof location === 'string') {
                            setStartLocation(location);
                        } else {
                            setStartLocation(location.placeName);
                            setSelectedStartLocation(location);
                        }
                    }}
                    onSetEndLocation={(location) => {
                        if (typeof location === 'string') {
                            setEndLocation(location);
                        } else {
                            setEndLocation(location.placeName);
                            setStartLocation(''); // 출발지를 빈 값으로 설정
                            setSelectedEndLocation(location);
                            setSelectedStartLocation(null); // 출발지 정보 초기화
                        }
                    }}
                />
            )}

            {/* 좌측하단 현재 위치 버튼 제거 */}

            {bottomSheetOpen && (
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: insets.bottom, backgroundColor: 'white', zIndex: 9 }} />
            )}

            <KakaoMap
                ref={webViewRef}
                latitude={mapCenter?.latitude ?? 37.5665}
                longitude={mapCenter?.longitude ?? 126.9780}
                style={[mobileStyles.mapFullScreen, { zIndex: 1001 }] as any}
                markers={(() => {
                    return currentMarkers;
                })()}
                routeResult={(() => {
                    return routeResult;
                })()}
                onMapIdle={onMapIdle}
                onMarkerPress={(id, lat, lng) => {
                    if (id) {
                        // 주차장 마커인지 확인
                        if (id.startsWith('parking_')) {
                            // 주차장 ID에서 실제 주차장 ID 추출
                            const parkingId = parseInt(id.replace('parking_', ''));
                            // 주차장 데이터 찾기 (externalParkingLots와 currentMarkers 모두 확인)
                            let parkingLot = externalParkingLots.find(p => p.id === parkingId);
                            
                            // externalParkingLots에서 찾지 못했다면 currentMarkers에서 찾기
                            if (!parkingLot) {
                                const parkingMarker = currentMarkers.find(m => m.placeId === id);
                                if (parkingMarker) {
                                    // 마커 데이터에서 주차장 정보 추출
                                    parkingLot = {
                                        id: parkingId,
                                        parkingLotNm: parkingMarker.placeName,
                                        lat: parkingMarker.lat,
                                        lng: parkingMarker.lng,
                                        roadAddress: parkingMarker.roadAddress || '',
                                        lotAddress: parkingMarker.lotAddress || '',
                                        parkingChargeInfo: parkingMarker.feeInfo || '',
                                        distance: parkingMarker.distance || 0
                                    };
                                } else {
                                    // 전역 함수를 통해 데이터 요청
                                    if ((global as any).handleParkingLotSelect) {
                                        const tempParkingLot = { id: parkingId } as any;
                                        (global as any).handleParkingLotSelect(tempParkingLot);
                                    }
                                    return;
                                }
                            }
                            if (parkingLot) {
                                // 선택된 주차장 상태 업데이트
                                setSelectedPlaceId(id);
                                setSelectedMarkerPosition({ lat: parkingLot.lat, lng: parkingLot.lng });
                                
                                // 지도 중심을 주차장 위치로 이동 (스크린 높이의 15% 정도 더 아래로)
                                const latitudeOffset = (SCREEN_HEIGHT * 0.15) / 111000; // 대략적인 위도 오프셋 계산
                                setMapCenter({ 
                                    latitude: parkingLot.lat - latitudeOffset, 
                                    longitude: parkingLot.lng 
                                });
                                
                                // 선택된 주차장 마커 업데이트 (빨간색 표시)
                                const selectedParkingId = `parking_${parkingLot.id}`;
                                // currentMarkers에서 주차장 데이터 추출
                                const parkingLotsFromMarkers = currentMarkers
                                    .filter(m => m.placeId.startsWith('parking_'))
                                    .map(m => ({
                                        id: parseInt(m.placeId.replace('parking_', '')),
                                        parkingLotNm: m.placeName,
                                        lat: m.lat,
                                        lng: m.lng,
                                        roadAddress: m.roadAddress || '',
                                        lotAddress: m.lotAddress || '',
                                        parkingChargeInfo: m.feeInfo || '',
                                        distance: m.distance || 0
                                    }));
                                
                                const parkingMarkers = MarkerDataConverter.convertParkingLotsToMarkers(
                                    parkingLotsFromMarkers,
                                    selectedParkingId,
                                    location || undefined
                                );
                                handleUpdateMarkers(parkingMarkers);
                                
                                // 주차장 상세 정보 표시를 위한 전역 함수 호출
                                if ((global as any).handleParkingLotSelect) {
                                    (global as any).handleParkingLotSelect(parkingLot);
                                } else {
                                    console.log('전역 함수 없음');
                                }
                            } else {
                                console.log('주차장 데이터 없음');
                            }
                        } else {
                            // 일반 검색 결과 마커
                            onMarkerPress(id, lat, lng);
                        }
                    }
                }}
                showInfoWindow={showInfoWindow}
                selectedPlaceId={selectedPlaceId || undefined}
                selectedMarkerLat={selectedMarkerPosition?.lat}
                selectedMarkerLng={selectedMarkerPosition?.lng}
                onCloseInfoWindow={() => setShowInfoWindow(false)}
                onSetRouteLocation={onSetRouteLocation}
                resetMapLevel={resetMapLevel}
                onResetMapLevelComplete={() => setResetMapLevel(false)}
                onGetCurrentMapCenter={() => {
                    if (!webViewRef.current) {
                        return;
                    }

                    // WebView에서 현재 지도 중심 가져오기
                    const script = `
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'get_current_map_center_for_search',
                  latitude: 37.5665,
                  longitude: 126.9780
                }));
                true;
              `;

                    webViewRef.current.injectJavaScript(script);
                }}
            />
            {showSearchInAreaButton && !showRouteDetail && !isRouteMode && hasSearched && (
                <>
                    <TouchableOpacity
                        style={[
                            mobileStyles.searchInAreaButton,
                            {
                                bottom: bottomSheetOpen ?
                                    (showRouteDetail ? bottomSheetHeight + 30 :
                                        showPlaceDetail ? bottomSheetHeight + 25 :
                                            bottomSheetHeight + 20) :
                                    (bottomSheetHeight > 0 ? bottomSheetHeight + 60 : 120)
                            }
                        ]}
                        onPress={() => {
                            // 현재 mapCenter state를 사용하여 검색 실행
                            if (mapCenter) {
                                if (activeTab === 'search') {
                                    // 검색 결과 탭: 기존 검색 로직 실행
                                    if ((global as any).handleSearchInAreaWithCurrentCenter) {
                                        (global as any).handleSearchInAreaWithCurrentCenter({
                                            latitude: mapCenter.latitude,
                                            longitude: mapCenter.longitude
                                        });
                                    }
                                } else if (activeTab === 'parking') {
                                    // 주차장 탭: 주차장 검색 실행
                                    handleParkingSearchInArea(mapCenter);
                                }
                            }
                        }}
                    >
                        <Text style={mobileStyles.searchInAreaButtonText}>
                            {activeTab === 'search' ? '현재 지도에서 검색' : '현재 지도에서 주차장 검색'}
                        </Text>
                    </TouchableOpacity>
                </>
            )}
            {location && (
                <TouchableOpacity
                    style={[
                        mobileStyles.currentLocationButton,
                        {
                            bottom: bottomSheetOpen ?
                                (showRouteDetail ? bottomSheetHeight + 30 :
                                    showPlaceDetail ? bottomSheetHeight + 25 :
                                        bottomSheetHeight + 20) :
                                (bottomSheetHeight > 0 ? bottomSheetHeight + 60 : 120)
                        }
                    ]}
                    onPress={() => {
                        if (location) {
                            const currentTime = Date.now();
                            const timeDiff = currentTime - lastPressTime;


                            if (timeDiff < 500 && pressCount === 1) {
                                // 더블클릭 감지 (500ms 이내)
                                setPressCount(0);
                                setLastPressTime(0);

                                // 더블클릭 시 줌레벨 초기화
                                setResetMapLevel(true);
                            } else {
                                // 단일 클릭 또는 첫 번째 클릭
                                setPressCount(1);
                                setLastPressTime(currentTime);

                                // 500ms 후 자동으로 리셋
                                setTimeout(() => {
                                    setPressCount(0);
                                    setLastPressTime(0);
                                }, 500);

                                if (bottomSheetOpen && bottomSheetHeight > 60) {
                                    // 바텀시트가 완전히 열려있을 때만: 상단 중앙으로 이동
                                    setResetMapLevel(true);

                                    const offset = calculateCurrentLocationOffset(bottomSheetHeight, SCREEN_HEIGHT);

                                    setMapCenter({
                                        latitude: location.latitude + offset.latitude,
                                        longitude: location.longitude + offset.longitude
                                    });
                                } else {
                                    // 바텀시트가 닫혀있거나 접혀있을 때: 정확한 현재 위치로 이동
                                    setMapCenter(location);
                                }
                            }
                        }
                    }}
                    onLongPress={() => {
                        if (location) {

                            if (bottomSheetOpen && bottomSheetHeight > 60) {
                                // 바텀시트가 완전히 열려있을 때만: 상단 중앙에 현재 위치가 보이도록 조정
                                const offset = calculateCurrentLocationOffset(bottomSheetHeight, SCREEN_HEIGHT);

                                setMapCenter({
                                    latitude: location.latitude + offset.latitude,
                                    longitude: location.longitude + offset.longitude
                                });
                            } else {
                                // 바텀시트가 닫혀있거나 접혀있을 때: 정확한 현재 위치로 이동
                                setMapCenter(location);
                            }

                            setResetMapLevel(true);
                        }
                    }}>
                    <Ionicons name="locate" size={20} color="#3690FF" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

export default MobileHomeMobileLayout;