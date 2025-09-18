import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { usePlaceDetail } from '../../hooks/usePlaceDetail';
import { usePlaceStore } from '../../store/placeStore';
import PlaceInfoRow from './PlaceInfoRow';

type Props = {
  placeId: string;
};

export default function PlaceDetailPanel({ placeId }: Props) {
  const { data, isLoading, isError } = usePlaceDetail(placeId);
  const setSelectedPlaceId = usePlaceStore((s) => s.setSelectedPlaceId);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>상세 정보를 불러오지 못했습니다.</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPlaceId(null)}>
          <Text style={styles.closeButtonText}>닫기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const openLink = async (url: string) => {
    if (await Linking.canOpenURL(url)) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.placeName}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPlaceId(null)}>
          <Text style={styles.closeButtonText}>닫기</Text>
        </TouchableOpacity>
      </View>

      <PlaceInfoRow label="주소" value={data.roadAddress || data.lotAddress} />
      <PlaceInfoRow label="전화" value={data.phone || '-'} />
      <PlaceInfoRow label="카테고리" value={data.category || '-'} />

      <TouchableOpacity onPress={() => openLink(data.placeUrl)}>
        <Text style={styles.link}>상세 보기</Text>
      </TouchableOpacity>
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
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
});


