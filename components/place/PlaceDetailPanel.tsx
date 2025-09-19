import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { usePlaceDetail } from '../../hooks/usePlaceDetail';
import { usePlaceStore } from '../../store/placeStore';
import PlaceInfoRow from './PlaceInfoRow';

/**
 * PlaceDetailPanel 컴포넌트의 Props 타입
 */
type Props = {
  placeId: string; // 장소 ID
};

/**
 * PlaceDetailPanel 컴포넌트
 * 선택된 장소의 상세 정보를 표시하는 패널 컴포넌트
 * 로딩, 에러, 성공 상태에 따라 다른 UI를 렌더링합니다.
 */
export default function PlaceDetailPanel({ placeId }: Props) {
  const { data, isLoading, isError } = usePlaceDetail(placeId);
  const setSelectedPlaceId = usePlaceStore((s) => s.setSelectedPlaceId);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>불러오는 중...</Text>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.closeButtonPrimary} onPress={() => setSelectedPlaceId(null)}>
            <Text style={styles.closeButtonPrimaryText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>정보 준비 중입니다.</Text>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.closeButtonPrimary} onPress={() => setSelectedPlaceId(null)}>
            <Text style={styles.closeButtonPrimaryText}>닫기</Text>
          </TouchableOpacity>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.placeName}</Text>
      </View>

      <PlaceInfoRow label="주소" value={data.roadAddress || data.lotAddress} />
      <PlaceInfoRow label="전화" value={data.phone || '-'} />
      <PlaceInfoRow label="카테고리" value={data.category || '-'} />

      <TouchableOpacity onPress={() => openLink(data.placeUrl)}>
        <Text style={styles.link}>상세 보기</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.closeButtonPrimary} onPress={() => setSelectedPlaceId(null)}>
          <Text style={styles.closeButtonPrimaryText}>닫기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: Platform.OS === 'android' ? 100 : 80,
    bottom: 0,
    width: Platform.OS === 'web' ? 360 : '100%',
    backgroundColor: '#fff',
    borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: '#eee',
    padding: 16,
    paddingBottom: 76,
    zIndex: 20,
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
  },
  link: {
    marginTop: 12,
    color: '#0a7',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  closeButtonText: {
    fontSize: 12,
    color: '#333',
  },
  closeButtonPrimary: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPrimaryText: {
    fontSize: 16,
    color: '#111',
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
});


