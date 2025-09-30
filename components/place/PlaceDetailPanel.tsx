import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Platform, Linking, TouchableWithoutFeedback } from 'react-native'; // Linking 추가
import { usePlaceDetail } from '../../hooks/usePlaceDetail';
import { usePlaceStore } from '../../store/placeStore';
import PlaceInfoRow from './PlaceInfoRow';

/**
 * PlaceDetailPanel 컴포넌트의 Props 타입
 */
type Props = {
  placeId: string; // 장소 ID
  markerLat?: number; // 마커의 위도
  markerLng?: number; // 마커의 경도
};

/**
 * PlaceDetailPanel 컴포넌트
 * 선택된 장소의 상세 정보를 표시하는 패널 컴포넌트
 * 로딩, 에러, 성공 상태에 따라 다른 UI를 렌더링합니다.
 */
export default function PlaceDetailPanel({ placeId, markerLat, markerLng }: Props) {
  const { data, isLoading, isError } = usePlaceDetail(placeId);
  const setSelectedPlaceId = usePlaceStore((s) => s.setSelectedPlaceId);
  const setShowInfoWindow = usePlaceStore((s) => s.setShowInfoWindow);
  const mapCenter = usePlaceStore((s) => s.mapCenter); // 지도 중심점
  
  /**
   * InfoWindow를 닫는 함수
   */
  const closeInfoWindow = () => {
    setShowInfoWindow(false);
  };


  // InfoWindow 스타일 적용
  const infoWindowStyle = styles.container;

  if (isLoading) {
    return (
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={closeInfoWindow}>
          <View style={styles.overlayBackground} />
        </TouchableWithoutFeedback>
        
        <View style={infoWindowStyle}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>불러오는 중...</Text>
          <View style={styles.arrow} />
        </View>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={closeInfoWindow}>
          <View style={styles.overlayBackground} />
        </TouchableWithoutFeedback>
        
        <View style={infoWindowStyle}>
          <Text style={styles.errorText}>정보 준비 중입니다.</Text>
          <View style={styles.arrow} />
        </View>
      </View>
    );
  }

  /**
   * 외부 링크를 열기 위한 함수
   * @param url - 열고자 하는 URL
   */
  const openLink = async (url: string) => {
    if (await Linking.canOpenURL(url)) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={closeInfoWindow}>
        <View style={styles.overlayBackground} />
      </TouchableWithoutFeedback>
      
      <View style={infoWindowStyle}>
        <View style={styles.header}>
          <Text style={styles.title}>{data.placeName}</Text>
        </View>

        {/* 정보 영역 */}
        <View style={styles.infoContainer}>
          {/* 주소 */}
          <View style={styles.infoRowInline}>
            <Text style={styles.infoLabelInline}>주소</Text>
            <Text style={styles.infoValueInline}>{data.roadAddress || data.lotAddress || '-'}</Text>
          </View>

          {/* 전화 */}
          <View style={styles.infoRowInline}>
            <Text style={styles.infoLabelInline}>전화</Text>
            <Text style={styles.phoneText}>{data.phone || '-'}</Text>
          </View>

          {/* 카테고리 */}
          <View style={styles.infoRowInline}>
            <Text style={styles.infoLabelInline}>카테고리</Text>
            <Text style={styles.infoValueInline}>{data.category || '-'}</Text>
          </View>

          {/* 상세보기 - 클릭하면 카카오맵에서 보기 */}
          {data.placeUrl && (
            <View style={styles.infoRowInline}>
              <Text style={styles.infoLabelInline}>상세보기</Text>
              <TouchableOpacity onPress={() => openLink(data.placeUrl)}>
                <Text style={styles.linkText}>카카오맵에서 보기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 오른쪽 하단 길찾기 버튼 */}
        <View style={styles.routeButtonContainer}>
          <TouchableOpacity 
            style={styles.routeButton} 
            onPress={() => console.log('길찾기 시작')}
          >
            <Text style={styles.routeButtonText}>길찾기</Text>
          </TouchableOpacity>
        </View>

        {/* InfoWindow 화살표 */}
        <View style={styles.arrow} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    pointerEvents: 'box-none', // 자식 요소만 터치 이벤트 받음
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  container: {
    position: 'absolute',
    width: 340, // 360 -> 340으로 축소
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    zIndex: 1000,
    elevation: 10, // Android용 그림자
    shadowColor: '#000', // iOS용 그림자
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  arrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -8 }],
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
  routeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    height: 32,
  },
  routeButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  infoContainer: {
    marginBottom: 0, // 길찾기 버튼을 위한 여백
  },
  routeButtonContainer: {
    position: 'absolute',
    bottom: 12, 
    right: 12,  
  },
  // 인라인 정보 스타일들
  infoRowInline: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  infoLabelInline: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
    minWidth: 50, // 라벨 너비를 60에서 50으로 축소
  },
  infoValueInline: {
    fontSize: 14,
    color: '#111',
    flex: 1,
  },
  phoneText: {
    fontSize: 14,
    color: '#28a745', // 전화 걸기를 암시하는 초록색
    flex: 1,
  },
  linkText: {
    fontSize: 14,
    color: '#007bff', // 카카오맵과 같은 파란색
    textDecorationLine: 'underline',
  },
});


