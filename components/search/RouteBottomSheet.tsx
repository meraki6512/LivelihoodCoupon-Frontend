import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  Linking,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchResult } from '../../types/search';
import { RouteResult } from '../../types/route';
import { ParkingLot, ParkingLotDetail } from '../../types/parking';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { useParking } from '../../hooks/useParking';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { useBottomSheetHeight } from '../../utils/bottomSheetUtils';
import { MarkerDataConverter } from '../../utils/markerUtils';
import RouteResultComponent from '../route/RouteResult';

interface RouteBottomSheetProps {
  isOpen: boolean;
  onToggle: () => void;
  onHeightChange?: (height: number) => void;
  style?: any;
  allMarkers: SearchResult[];
  onSelectResult: (item: SearchResult) => void;
  onSetRouteLocation?: (type: 'departure' | 'arrival', placeInfo: SearchResult) => void;
  routeResult?: RouteResult | null;
  isRouteLoading?: boolean;
  routeError?: string | null;
  startRoute?: any;
  clearRoute?: () => void;
  hasSearched?: boolean;
  searchResults?: SearchResult[];
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onSearch?: () => void;
  isLoading?: boolean;
  onCloseSearch?: () => void;
  selectedSearchResult?: SearchResult | null;
  bottomSheetHeight?: number;
  showPlaceDetail?: boolean;
  setShowPlaceDetail?: (show: boolean) => void;
  selectedPlaceId?: string | null;
  onRoutePress?: () => void;
  onSetStartLocation?: (location: string | SearchResult) => void;
  onSetEndLocation?: (location: string | SearchResult) => void;
  isRouteDetailMode?: boolean;
  // 주차장 관련 props
  activeTab?: 'search' | 'parking';
  onUpdateMarkers?: (markers: any[]) => void;
  onSelectParkingLot?: (parkingLot: ParkingLot) => void;
  onActiveTabChange?: (tab: 'search' | 'parking') => void;
  externalParkingLots?: ParkingLot[]; // 외부에서 주차장 데이터를 전달받을 수 있는 prop
  onParkingLotSelect?: (parkingLot: ParkingLot) => void; // 주차장 마커 클릭 시 호출되는 콜백
  onMapCenterChange?: (center: { latitude: number; longitude: number }) => void; // 지도 중심 변경
}

const RouteBottomSheet: React.FC<RouteBottomSheetProps> = ({
  isOpen,
  onToggle,
  onHeightChange,
  style,
  allMarkers,
  onSelectResult,
  onSetRouteLocation,
  routeResult,
  isRouteLoading,
  routeError,
  startRoute,
  clearRoute,
  hasSearched = false,
  searchResults = [],
  searchQuery = '',
  onSearchQueryChange,
  onSearch,
  isLoading = false,
  onCloseSearch,
  selectedSearchResult,
  bottomSheetHeight,
  showPlaceDetail: propShowPlaceDetail,
  setShowPlaceDetail: propSetShowPlaceDetail,
  selectedPlaceId,
  onRoutePress,
  onSetStartLocation,
  onSetEndLocation,
  isRouteDetailMode = false,
  activeTab: propActiveTab,
  onUpdateMarkers,
  onSelectParkingLot,
  onActiveTabChange,
  externalParkingLots,
  onParkingLotSelect,
  onMapCenterChange,
}) => {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const { calculateHeight } = useBottomSheetHeight();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const routeScrollViewRef = useRef<ScrollView>(null);
  
  const { location } = useCurrentLocation();
  // 주차장 검색 완료 후 마커 업데이트 콜백
  const handleParkingSearchComplete = useCallback((parkingLots: ParkingLot[]) => {
    if (onUpdateMarkers) {
      if (parkingLots.length > 0) {
        const parkingMarkers = MarkerDataConverter.convertParkingLotsToMarkers(
          parkingLots,
          null,
          location || undefined
        );
        onUpdateMarkers(parkingMarkers);
      } else {
        // 주차장 결과가 없을 때는 현재 위치 마커만 표시
        const emptyParkingMarkers = MarkerDataConverter.convertParkingLotsToMarkers(
          [],
          null,
          location || undefined
        );
        onUpdateMarkers(emptyParkingMarkers);
      }
    }
  }, [onUpdateMarkers, location]);

  // 외부에서 전달받은 주차장 데이터가 변경될 때 상태 업데이트
  useEffect(() => {
    if (externalParkingLots && externalParkingLots.length > 0) {
      setParkingLots(externalParkingLots);
      // 주차장 탭으로 자동 전환
      setActiveSearchTab('parking');
    }
  }, [externalParkingLots]);

  // 바텀시트가 완전히 닫힐 때 주차장 상태 초기화는 상위 컴포넌트에서 처리
  // (hasSearched가 false가 될 때만 마커 초기화)


  const { 
    parkingLots, 
    selectedParkingLot, 
    isLoading: parkingLoading, 
    error: parkingError,
    searchNearbyParkingLots,
    getParkingLotDetail,
    clearParkingLots,
    setParkingLots
  } = useParking(handleParkingSearchComplete);
  
  
  // 길찾기 관련 상태
  const [startLocation, setStartLocation] = useState('내 위치');
  const [endLocation, setEndLocation] = useState('');
  const [startLocationResults, setStartLocationResults] = useState<SearchResult[]>([]);
  const [endLocationResults, setEndLocationResults] = useState<SearchResult[]>([]);
  const [showStartResults, setShowStartResults] = useState(false);
  const [showEndResults, setShowEndResults] = useState(false);
  
  // 탭 상태 관리
  const [activeSearchTab, setActiveSearchTab] = useState<'search' | 'parking'>('search');
  
  // propActiveTab과 동기화
  useEffect(() => {
    if (propActiveTab && propActiveTab !== activeSearchTab) {
      setActiveSearchTab(propActiveTab);
    }
  }, [propActiveTab, activeSearchTab]);
  
  // 주차장 상세 정보 상태
  const [showParkingDetail, setShowParkingDetail] = useState(false);
  
  // 하드웨어 뒤로 가기 버튼 처리
  useEffect(() => {
    const backAction = () => {
      if (showParkingDetail) {
        // 주차장 상세 정보가 표시 중이면 주차장 목록으로 돌아가기
        setShowParkingDetail(false);
        return true; // 이벤트 처리 완료
      }
      return false; // 기본 동작 수행 (상위 컴포넌트에서 처리)
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [showParkingDetail]);

  // 주차장 마커 클릭 핸들러를 useCallback으로 메모이제이션
  const handleParkingLotSelect = useCallback((parkingLot: ParkingLot) => {
    
    // parkingLots에서 실제 주차장 데이터 찾기 (최신 상태 사용)
    let actualParkingLot = parkingLots.find(p => p.id === parkingLot.id);
    if (!actualParkingLot) {
      // parkingLots에서 찾지 못했지만 전달받은 parkingLot 데이터 사용
      actualParkingLot = parkingLot;
    }
    
    // 마커 업데이트는 HomeMobileLayout에서 이미 처리됨
    // 여기서는 상세 정보 표시만 처리
    
    // 주차장 상세 정보 조회
    getParkingLotDetail(actualParkingLot.id);
    // 주차장 탭으로 전환
    setActiveSearchTab('parking');
    // 상세 정보 표시
    setShowParkingDetail(true);
  }, [location, onUpdateMarkers, getParkingLotDetail, parkingLots]);

  // 전역 함수 등록 (한 번만 실행)
  const isRegistered = useRef(false);
  useEffect(() => {
    if (onParkingLotSelect && !isRegistered.current) {
      (global as any).handleParkingLotSelect = handleParkingLotSelect;
      isRegistered.current = true;
    }
  }, [onParkingLotSelect, handleParkingLotSelect]);
  
  const showPlaceDetail = propShowPlaceDetail || false;
  
  const getBottomSheetHeight = useMemo(() => {
    if (!isOpen) {
      return calculateHeight('closed', false);
    }
    
    if (isRouteDetailMode) {
      return calculateHeight('routeDetail', true);
    }
    if (showPlaceDetail) {
      return calculateHeight('placeDetail', true);
    }
    return calculateHeight('normal', true);
  }, [isOpen, isRouteDetailMode, showPlaceDetail, calculateHeight]);
  const [selectedPlaceDetail, setSelectedPlaceDetail] = useState<SearchResult | null>(null);

  // selectedPlaceId가 변경될 때 selectedPlaceDetail 설정
  useEffect(() => {
    if (selectedPlaceId && allMarkers.length > 0) {
      const place = allMarkers.find(marker => marker.placeId === selectedPlaceId);
      if (place) {
        setSelectedPlaceDetail(place);
      }
    } else {
      setSelectedPlaceDetail(null);
    }
  }, [selectedPlaceId, allMarkers]);

  // 카카오맵에서 보기 함수
  const openKakaoMap = async (url: string) => {
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      } else {
        Alert.alert('알림', '카카오맵을 열 수 없습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '카카오맵을 열 수 없습니다.');
    }
  };


  // 간단한 토글 핸들러 (useCallback 최적화)
  const handleToggle = useCallback(() => {
    onToggle();
  }, [onToggle]);

  // 길찾기 시작 함수 (useCallback 최적화)
  const handleStartRoute = useCallback(() => {
    if (!startLocation || !endLocation) {
      Alert.alert('알림', '출발지와 목적지를 모두 입력해주세요.');
      return;
    }

    // 출발지와 목적지 정보 생성
    const startLocationData = startLocation === '내 위치' ? {
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
    } : startLocationResults.find(r => r.placeName === startLocation);

    const endLocationData = endLocationResults.find(r => r.placeName === endLocation);

    if (startLocationData && endLocationData && startRoute) {
      startRoute(startLocationData, endLocationData);
    }
  }, [startLocation, endLocation, location, startLocationResults, endLocationResults, startRoute]);

  // 출발지/목적지 검색
  const searchLocation = (query: string, type: 'start' | 'end') => {
    if (query.length < 2) return;
    
    const results = allMarkers.filter(marker => 
      marker.placeName.toLowerCase().includes(query.toLowerCase()) ||
      marker.roadAddress?.toLowerCase().includes(query.toLowerCase())
    );
    
    if (type === 'start') {
      setStartLocationResults(results);
      setShowStartResults(true);
    } else {
      setEndLocationResults(results);
      setShowEndResults(true);
    }
  };

  // 주차장 검색
  const handleParkingSearch = useCallback(async () => {
    if (!location) {
      Alert.alert('알림', '현재 위치를 가져올 수 없습니다.');
      return;
    }

    await searchNearbyParkingLots({
      lat: location.latitude,
      lng: location.longitude,
      radius: 5.0, // 5km 반경으로 증가
      page: 1,
      size: 20,
    });
  }, [location, searchNearbyParkingLots]);

  // 주차장 상세 정보 조회
  const handleParkingDetail = useCallback(async (parkingLot: ParkingLot) => {
    await getParkingLotDetail(parkingLot.id);
    setShowParkingDetail(true);
  }, [getParkingLotDetail]);

  // 탭 전환 시 마커 업데이트
  const handleTabChange = useCallback((tab: 'search' | 'parking') => {
    setActiveSearchTab(tab);
    
    // 상위 컴포넌트에 탭 변경 알림
    if (onActiveTabChange) {
      onActiveTabChange(tab);
    }
    
    if (onUpdateMarkers) {
      if (tab === 'search') {
        // 검색 결과 마커로 전환 - 주차장 마커 제거
        const searchMarkers = MarkerDataConverter.convertSearchResultsToMarkers(
          allMarkers,
          selectedPlaceId || null,
          location || undefined
        );
        onUpdateMarkers(searchMarkers);
      } else if (tab === 'parking') {
        // 주차장 마커로 전환
        if (parkingLots.length > 0) {
          const parkingMarkers = MarkerDataConverter.convertParkingLotsToMarkers(
            parkingLots,
            null, // 선택된 주차장 ID (필요시 추가)
            location || undefined
          );
          onUpdateMarkers(parkingMarkers);
        } else {
          // 주차장 결과가 없을 때는 현재 위치 마커만 표시
          const emptyParkingMarkers = MarkerDataConverter.convertParkingLotsToMarkers(
            [],
            null,
            location || undefined
          );
          onUpdateMarkers(emptyParkingMarkers);
        }
      }
    }
  }, [onUpdateMarkers, allMarkers, selectedPlaceId, location, parkingLots]);

  // 주차장 선택 시 마커 업데이트
  const handleParkingSelect = useCallback((parkingLot: ParkingLot) => {

    if (onSelectParkingLot) {
      onSelectParkingLot(parkingLot);
    }
    
    // 선택된 주차장 마커 업데이트
    const selectedParkingId = `parking_${parkingLot.id}`;
    
    const parkingMarkers = MarkerDataConverter.convertParkingLotsToMarkers(
      parkingLots,
      selectedParkingId,
      location || undefined
    );
    
    if (onUpdateMarkers) {
      onUpdateMarkers(parkingMarkers);
    } else {
    }
    
    // 지도 중심을 주차장 위치로 이동 (스크린 높이의 15% 정도 더 아래로)
    const latitudeOffset = (SCREEN_HEIGHT * 0.15) / 111000; // 대략적인 위도 오프셋 계산
    if (onMapCenterChange) {
      onMapCenterChange({ 
        latitude: parkingLot.lat - latitudeOffset, 
        longitude: parkingLot.lng 
      });
    }
    
    handleParkingDetail(parkingLot);
  }, [onSelectParkingLot, handleParkingDetail, parkingLots, location, onUpdateMarkers, onMapCenterChange]);

  
  // 검색 모드가 아닐 때는 바텀시트를 완전히 숨김
  if (!hasSearched && !isRouteDetailMode) {
    return null;
  }

  return (
      <Animated.View 
        style={[
          styles.container, 
          { 
            bottom: isOpen ? 0 : insets.bottom, // 닫혀있을 때는 하드웨어 버튼 영역 피하기
            height: getBottomSheetHeight,
          },
          style
        ]}
      >
      {/* 토글 핸들 */}
      <TouchableOpacity
        style={styles.dragHandle}
        activeOpacity={0.7}
        onPress={() => {
          if (isRouteDetailMode) {
            // 길찾기 상세안내 모드일 때는 바텀시트만 닫기 (모드 변경 없음)
            onToggle();
          } else {
            // 일반 모드일 때는 기존 동작
            onToggle();
          }
        }}
      >
        <Ionicons 
          name={isOpen ? "chevron-down" : "chevron-up"} 
          size={24} 
          color="#666" 
        />
      </TouchableOpacity>
      
      {/* 바텀시트가 열려있을 때만 내용 표시 */}
      {isOpen && (
        <View style={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}>
          {/* 헤더 - 상세 안내 모드일 때는 헤더 제거 */}
          {!hasSearched && !isRouteDetailMode && (
            <View style={styles.header}>
              <Ionicons name="navigate-outline" size={20} color="#007bff" />
              <Text style={styles.headerText}>길찾기</Text>
            </View>
          )}

        {/* 상세 안내 모드일 때는 바로 경로 안내 표시 */}
        {isRouteDetailMode ? (
          // 상세 경로 안내만 표시
          <ScrollView 
            style={styles.routeDetailScrollView}
            showsVerticalScrollIndicator={false}
          >
            {routeResult && (
              <RouteResultComponent 
                routeResult={routeResult} 
                onClose={() => {
                  if (clearRoute) {
                    clearRoute();
                  }
                }}
              />
            )}
          </ScrollView>
        ) : hasSearched ? (
          showPlaceDetail ? (
            // 장소 상세 정보 표시
            <View style={styles.placeDetailContent}>
              {selectedPlaceDetail && (
                <View style={styles.placeDetailInfo}>
                  {/* 장소명 */}
                  <Text style={styles.placeDetailName}>{selectedPlaceDetail.placeName}</Text>
                  
                  {/* 길찾기 버튼들 */}
                  <View style={styles.routeButtons}>
                    <TouchableOpacity 
                      style={styles.routeButton}
                      onPress={() => {
                        if (selectedPlaceDetail && onSetStartLocation && onRoutePress) {
                          // 출발지 설정 - selectedPlaceDetail 객체 전체를 전달
                          onSetStartLocation(selectedPlaceDetail);
                          // 상세정보 닫기
                          if (propSetShowPlaceDetail) {
                            propSetShowPlaceDetail(false);
                          }
                          // 바텀시트 닫기
                          onToggle();
                          // 길찾기 모드 활성화
                          onRoutePress();
                        }
                      }}
                    >
                      <Text style={styles.routeButtonText}>출발</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.routeButton, styles.routeButtonActive]}
                      onPress={() => {
                        if (selectedPlaceDetail && onSetEndLocation && onRoutePress) {
                          // 목적지 설정 - selectedPlaceDetail 객체 전체를 전달
                          onSetEndLocation(selectedPlaceDetail);
                          // 상세정보 닫기
                          if (propSetShowPlaceDetail) {
                            propSetShowPlaceDetail(false);
                          }
                          // 바텀시트 닫기
                          onToggle();
                          // 길찾기 모드 활성화
                          onRoutePress();
                        }
                      }}
                    >
                      <Text style={[styles.routeButtonText, styles.routeButtonTextActive]}>도착</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareButton}>
                      <Ionicons name="share-outline" size={16} color="#333" />
                      <Text style={styles.shareButtonText}>공유</Text>
                    </TouchableOpacity>
                    {selectedPlaceDetail.phone && (
                      <TouchableOpacity style={styles.phoneButton}>
                        <Ionicons name="call-outline" size={16} color="#333" />
                        <Text style={styles.phoneButtonText}>전화</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* 상세 정보 */}
                  <View style={styles.placeDetailInfoList}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>주소</Text>
                      <Text style={styles.infoValue}>
                        {selectedPlaceDetail.roadAddress || selectedPlaceDetail.lotAddress}
                      </Text>
                    </View>
                    
                    {selectedPlaceDetail.phone && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>전화</Text>
                        <Text style={styles.infoValuePhone}>{selectedPlaceDetail.phone}</Text>
                      </View>
                    )}
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>카테고리</Text>
                      <Text style={styles.infoValue}>{selectedPlaceDetail.categoryGroupName}</Text>
                    </View>
                    
                    {selectedPlaceDetail.placeUrl && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>상세보기</Text>
                        <TouchableOpacity onPress={() => openKakaoMap(selectedPlaceDetail.placeUrl!)}>
                          <Text style={styles.kakaoMapLink}>카카오맵에서 보기</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          ) : showParkingDetail ? (
            // 주차장 상세 정보 표시
            <View style={styles.placeDetailContent}>
              {selectedParkingLot && (
                <View style={styles.placeDetailInfo}>
                  
                  {/* 주차장명 */}
                  <Text style={styles.placeDetailName}>{selectedParkingLot.parkingLotNm}</Text>
                  
                  {/* 길찾기 버튼들 */}
                  <View style={styles.routeButtons}>
                    <TouchableOpacity 
                      style={styles.routeButton}
                      onPress={() => {
                        if (selectedParkingLot && onSetStartLocation && onRoutePress) {
                          // 출발지 설정
                          const parkingLocation = {
                            placeId: `parking_${selectedParkingLot.id}`,
                            placeName: selectedParkingLot.parkingLotNm,
                            lat: selectedParkingLot.lat,
                            lng: selectedParkingLot.lng,
                            roadAddress: selectedParkingLot.roadAddress,
                            lotAddress: selectedParkingLot.lotAddress,
                            phone: selectedParkingLot.phoneNumber,
                            categoryGroupName: '주차장',
                            placeUrl: '',
                            distance: 0,
                            roadAddressDong: ''
                          };
                          onSetStartLocation(parkingLocation);
                          setShowParkingDetail(false);
                          onToggle();
                          onRoutePress();
                        }
                      }}
                    >
                      <Text style={styles.routeButtonText}>출발</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.routeButton, styles.routeButtonActive]}
                      onPress={() => {
                        if (selectedParkingLot && onSetEndLocation && onRoutePress) {
                          // 목적지 설정
                          const parkingLocation = {
                            placeId: `parking_${selectedParkingLot.id}`,
                            placeName: selectedParkingLot.parkingLotNm,
                            lat: selectedParkingLot.lat,
                            lng: selectedParkingLot.lng,
                            roadAddress: selectedParkingLot.roadAddress,
                            lotAddress: selectedParkingLot.lotAddress,
                            phone: selectedParkingLot.phoneNumber,
                            categoryGroupName: '주차장',
                            placeUrl: '',
                            distance: 0,
                            roadAddressDong: ''
                          };
                          onSetEndLocation(parkingLocation);
                          setShowParkingDetail(false);
                          onToggle();
                          onRoutePress();
                        }
                      }}
                    >
                      <Text style={[styles.routeButtonText, styles.routeButtonTextActive]}>도착</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareButton}>
                      <Ionicons name="share-outline" size={16} color="#333" />
                      <Text style={styles.shareButtonText}>공유</Text>
                    </TouchableOpacity>
                    {selectedParkingLot.phoneNumber && (
                      <TouchableOpacity style={styles.phoneButton}>
                        <Ionicons name="call-outline" size={16} color="#333" />
                        <Text style={styles.phoneButtonText}>전화</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* 상세 정보 */}
                  <View style={styles.placeDetailInfoList}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>주소</Text>
                      <Text style={styles.infoValue}>
                        {selectedParkingLot.roadAddress || selectedParkingLot.lotAddress}
                      </Text>
                    </View>
                    
                    {selectedParkingLot.phoneNumber && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>전화</Text>
                        <Text style={styles.infoValuePhone}>{selectedParkingLot.phoneNumber}</Text>
                      </View>
                    )}
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>주차 요금</Text>
                      <Text style={styles.infoValue}>{selectedParkingLot.parkingChargeInfo}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>결제 방법</Text>
                      <Text style={styles.infoValue}>{selectedParkingLot.paymentMethod}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>운영일</Text>
                      <Text style={styles.infoValue}>{selectedParkingLot.operDay}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>주차 대수</Text>
                      <Text style={styles.infoValue}>{selectedParkingLot.parkingCapacity}대</Text>
                    </View>
                    
                    {selectedParkingLot.specialComment && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>특이사항</Text>
                        <Text style={styles.infoValue}>{selectedParkingLot.specialComment}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          ) : (
            // 검색 결과 표시
            <View style={styles.searchContent}>
            {/* 탭 메뉴 */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeSearchTab === 'search' && styles.activeTab]}
                onPress={() => handleTabChange('search')}
              >
                <Text style={[styles.tabText, activeSearchTab === 'search' && styles.activeTabText]}>검색 결과</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeSearchTab === 'parking' && styles.activeTab]}
                onPress={() => {
                  handleTabChange('parking');
                  if (parkingLots.length === 0) {
                    handleParkingSearch();
                  }
                }}
              >
                <Text style={[styles.tabText, activeSearchTab === 'parking' && styles.activeTabText]}>주변 주차장</Text>
              </TouchableOpacity>
            </View>
            
            {activeSearchTab === 'search' ? (
              // 검색 결과 탭
              isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>검색 중...</Text>
                </View>
              ) : searchResults && searchResults.length > 0 ? (
                <ScrollView 
                  style={styles.searchResultsList}
                  showsVerticalScrollIndicator={false}
                >
                  {searchResults.map((result, index) => (
                   <TouchableOpacity
                     key={result.placeId || index}
                     style={styles.searchResultItem}
                     onPress={() => {
                       // 장소 상세 정보 표시
                       setSelectedPlaceDetail(result);
                       propSetShowPlaceDetail?.(true);
                       // 기존 onSelectResult도 호출 (지도 이동 등)
                       onSelectResult && onSelectResult(result);
                     }}
                   >
                      <View style={styles.searchResultIcon}>
                        <Ionicons name="location" size={16} color={COLORS.primary} />
                      </View>
                      <View style={styles.searchResultContent}>
                        <Text style={styles.searchResultName} numberOfLines={1}>
                          {result.placeName}
                        </Text>
                        <Text style={styles.searchResultAddress} numberOfLines={1}>
                          {result.roadAddress || result.lotAddress}
                        </Text>
                      </View>
                      {result.distance && (
                        <Text style={styles.searchResultDistance}>
                          {result.distance < 1000 
                            ? `${Math.round(result.distance)}m`
                            : `${(result.distance / 1000).toFixed(1)}km`
                          }
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search" size={24} color="#ccc" />
                  <Text style={styles.noResultsText}>검색 결과가 없습니다</Text>
                </View>
              )
            ) : (
              // 주차장 탭
              parkingLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>주차장 검색 중...</Text>
                </View>
              ) : parkingError ? (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="alert-circle" size={24} color="#ff6b6b" />
                  <Text style={styles.noResultsText}>{parkingError}</Text>
                </View>
              ) : parkingLots && parkingLots.length > 0 ? (
                <ScrollView 
                  style={styles.searchResultsList}
                  showsVerticalScrollIndicator={false}
                >
                  {parkingLots.map((parkingLot, index) => (
                    <TouchableOpacity
                      key={parkingLot.id || index}
                      style={styles.searchResultItem}
                      onPress={() => handleParkingSelect(parkingLot)}
                    >
                      <View style={styles.searchResultIcon}>
                        <Ionicons name="car" size={16} color={COLORS.purple} />
                      </View>
                      <View style={styles.searchResultContent}>
                        <Text style={styles.searchResultName} numberOfLines={1}>
                          {parkingLot.parkingLotNm}
                        </Text>
                        <Text style={styles.searchResultAddress} numberOfLines={1}>
                          {parkingLot.roadAddress || parkingLot.lotAddress}
                        </Text>
                        <Text style={styles.parkingFeeInfo}>
                          {parkingLot.parkingChargeInfo}
                        </Text>
                      </View>
                      <Text style={styles.searchResultDistance}>
                        {parkingLot.distance < 1000 
                          ? `${Math.round(parkingLot.distance)}m`
                          : `${(parkingLot.distance / 1000).toFixed(1)}km`
                        }
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="car" size={24} color="#ccc" />
                  <Text style={styles.noResultsText}>주변 주차장이 없습니다</Text>
                </View>
              )
            )}
          </View>
          )
        ) : (
          // 길찾기 내용
          <ScrollView 
            ref={routeScrollViewRef}
            style={styles.routeContent}
            showsVerticalScrollIndicator={false}
          >
          {/* 기존 길찾기 UI */}
          <>
            {/* 출발지 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>출발지</Text>
            <TextInput
              style={styles.input}
              value={startLocation}
              onChangeText={(text) => {
                setStartLocation(text);
                searchLocation(text, 'start');
              }}
              placeholder="출발지를 입력하세요"
              onFocus={() => setShowStartResults(true)}
            />
            {showStartResults && startLocationResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {startLocationResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => {
                      setStartLocation(result.placeName);
                      setShowStartResults(false);
                    }}
                  >
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.resultText}>{result.placeName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 목적지 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>목적지</Text>
            <TextInput
              style={styles.input}
              value={endLocation}
              onChangeText={(text) => {
                setEndLocation(text);
                searchLocation(text, 'end');
              }}
              placeholder="목적지를 입력하세요"
              onFocus={() => setShowEndResults(true)}
            />
            {showEndResults && endLocationResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {endLocationResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => {
                      setEndLocation(result.placeName);
                      setShowEndResults(false);
                    }}
                  >
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.resultText}>{result.placeName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 길찾기 버튼 */}
          <TouchableOpacity
            style={[styles.routeButton, (!startLocation || !endLocation) && styles.routeButtonDisabled]}
            onPress={handleStartRoute}
            disabled={!startLocation || !endLocation || isRouteLoading}
          >
            <Ionicons name="navigate" size={20} color="white" />
            <Text style={styles.routeButtonText}>
              {isRouteLoading ? '길찾기 중...' : '길찾기 시작'}
            </Text>
          </TouchableOpacity>

          {/* 경로 결과 */}
          {routeResult && (
            <View style={styles.routeResult}>
              <RouteResultComponent 
                routeResult={routeResult} 
                onClose={() => {
                  if (clearRoute) {
                    clearRoute();
                  }
                }}
              />
            </View>
          )}

          {/* 에러 메시지 */}
          {routeError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{routeError}</Text>
            </View>
          )}
          </>
          </ScrollView>
        )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: COLORS.textLight,
    width: 50,
    height: 5,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.borderRadius.xxl,
    borderTopRightRadius: SIZES.borderRadius.xxl,
    zIndex: 1000, // z-index 추가
    borderTopWidth: 2,
    borderTopColor: COLORS.borderGray, // 상단 테두리 추가
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dragHandle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40, // 하드웨어 버튼 영역을 위한 하단 패딩 (동적으로 조정됨)
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // 회색 테두리로 통일
    marginBottom: 16,
    backgroundColor: 'white', // 흰색 배경으로 통일
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  routeContent: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  routeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  routeResult: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  routeResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  routeResultText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  clearRouteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearRouteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  routeDetailContainer: {
    padding: 16,
  },
  routeDetailScrollView: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  // 검색 결과 관련 스타일
  searchContent: {
    flex: 1,
  },
  searchResultsList: {
    maxHeight: 400, // 높이 증가
    paddingBottom: 20, // 하단 여백 추가
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultIcon: {
    marginRight: 12,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  searchResultDistance: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  // 장소 상세 정보 스타일
  placeDetailContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30, // 하단 여백 추가
  },
  placeDetailInfo: {
    flex: 1,
  },
  placeDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  routeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  routeButton: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007bff',
    minWidth: 60,
  },
  routeButtonActive: {
    backgroundColor: '#007bff',
  },
  routeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007bff',
    textAlign: 'center',
  },
  routeButtonTextActive: {
    color: '#fff',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 4,
    minWidth: 60,
  },
  shareButtonText: {
    fontSize: 12,
    color: '#333',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 4,
    minWidth: 60,
  },
  phoneButtonText: {
    fontSize: 12,
    color: '#333',
  },
  placeDetailInfoList: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    width: 60,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  infoValuePhone: {
    fontSize: 14,
    color: '#28a745',
    flex: 1,
  },
  kakaoMapLink: {
    fontSize: 14,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  noResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
  },
  // 탭 관련 스타일
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  // 주차장 관련 스타일
  parkingFeeInfo: {
    fontSize: 12,
    color: COLORS.purple,
    fontWeight: '500',
    marginTop: 2,
  },
  // 뒤로 가기 버튼 스타일
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default RouteBottomSheet;
