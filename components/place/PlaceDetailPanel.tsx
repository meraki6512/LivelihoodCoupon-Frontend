import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Platform, Linking, TouchableWithoutFeedback } from 'react-native'; // Linking 추가
import { usePlaceDetail } from '../../hooks/usePlaceDetail';
import { usePlaceStore } from '../../store/placeStore';
import PlaceInfoRow from './PlaceInfoRow';
import { commonStyles } from './styles/PlaceDetailPanel.common.styles';
import { webStyles } from './styles/PlaceDetailPanel.web.styles';
import { mobileStyles } from './styles/PlaceDetailPanel.mobile.styles';


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
  const infoWindowStyle = commonStyles.container;

  if (isLoading) {
    return (
      <View style={commonStyles.overlay}>
        <TouchableWithoutFeedback onPress={closeInfoWindow}>
          <View style={commonStyles.overlayBackground} />
        </TouchableWithoutFeedback>
        
        <View style={infoWindowStyle}>
          <ActivityIndicator size="small" />
          <Text style={commonStyles.loadingText}>불러오는 중...</Text>
          <View style={commonStyles.arrow} />
        </View>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={commonStyles.overlay}>
        <TouchableWithoutFeedback onPress={closeInfoWindow}>
          <View style={commonStyles.overlayBackground} />
        </TouchableWithoutFeedback>
        
        <View style={infoWindowStyle}>
          <Text style={commonStyles.errorText}>정보 준비 중입니다.</Text>
          <View style={commonStyles.arrow} />
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
    <View style={commonStyles.overlay}>
      <TouchableWithoutFeedback onPress={closeInfoWindow}>
        <View style={commonStyles.overlayBackground} />
      </TouchableWithoutFeedback>
      
      <View style={infoWindowStyle}>
        <View style={commonStyles.header}>
          <Text style={commonStyles.title}>{data.placeName}</Text>
        </View>

        {/* 정보 영역 */}
        <View style={commonStyles.infoContainer}>
          {/* 주소 */}
          <View style={commonStyles.infoRowInline}>
            <Text style={commonStyles.infoLabelInline}>주소</Text>
            <Text style={commonStyles.infoValueInline}>{data.roadAddress || data.lotAddress || '-'}</Text>
          </View>

          {/* 전화 */}
          <View style={commonStyles.infoRowInline}>
            <Text style={commonStyles.infoLabelInline}>전화</Text>
            <Text style={commonStyles.phoneText}>{data.phone || '-'}</Text>
          </View>

          {/* 카테고리 */}
          <View style={commonStyles.infoRowInline}>
            <Text style={commonStyles.infoLabelInline}>카테고리</Text>
            <Text style={commonStyles.infoValueInline}>{data.category || '-'}</Text>
          </View>

          {/* 상세보기 - 클릭하면 카카오맵에서 보기 */}
          {data.placeUrl && (
            <View style={commonStyles.infoRowInline}>
              <Text style={commonStyles.infoLabelInline}>상세보기</Text>
              <TouchableOpacity onPress={() => openLink(data.placeUrl)}>
                <Text style={commonStyles.linkText}>카카오맵에서 보기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 오른쪽 하단 길찾기 버튼 */}
        <View style={commonStyles.routeButtonContainer}>
          <TouchableOpacity 
            style={commonStyles.routeButton} 
            onPress={() => console.log('길찾기 시작')}
          >
            <Text style={commonStyles.routeButtonText}>길찾기</Text>
          </TouchableOpacity>
        </View>

        {/* InfoWindow 화살표 */}
        <View style={commonStyles.arrow} />
      </View>
    </View>
  );
}


