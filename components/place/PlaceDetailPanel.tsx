import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native'; // Linking 추가
import { usePlaceDetail } from '../../hooks/usePlaceDetail';
import { usePlaceStore } from '../../store/placeStore';
import PlaceInfoRow from './PlaceInfoRow';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';

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

      {data.placeUrl && (
        <View style={styles.previewContainer}>
          {/* 웹 플랫폼: 원시 iframe 사용 */}
          {Platform.OS === 'web' ? (
            <View style={styles.iframeWrapper}>
              <iframe
                src={data.placeUrl}
                style={{
                  width: '100%',
                  height: 450,
                  marginTop: -50,
                  borderWidth: 0,
                  pointerEvents: 'none', // 클릭/터치 비활성화
                  overflow: 'hidden', // 내부 스크롤바 없음 보장
                }}
                scrolling="no"
                allowFullScreen={false}
                frameBorder="0"
              />
              {/* 웹용 그라디언트 오버레이 */}
                            <LinearGradient
                              // 검은색 그라디언트로 변경
                              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
                              start={[0, 0]} // 왼쪽 상단
                              end={[0, 1]}   // 왼쪽 하단 (수직 그라디언트)
                              style={styles.gradientOverlayWeb}
                            />            </View>
          ) : ( /* 모바일 플랫폼: react-native-webview 사용 */
            <View style={styles.webviewWrapper} pointerEvents="none">
              <WebView
                source={{ uri: data.placeUrl }}
                style={styles.webview}
                scrollEnabled={false}
                injectedJavaScript={`
                  document.body.style.overflow = 'hidden';
                  document.body.style.pointerEvents = 'none';
                  true;
                `}
              />
              {/* 모바일용 그라디언트 오버레이 */}
              <LinearGradient
                // 검은색 그라디언트로 변경
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
                start={[0, 0]} // 왼쪽 상단
                end={[0, 1]}   // 왼쪽 하단 (수직 그라디언트)
                style={styles.gradientOverlayMobile}
              />
            </View>
          )}
          <TouchableOpacity style={styles.viewDetailsButton} onPress={() => openLink(data.placeUrl)}>
            <Text style={styles.viewDetailsButtonText}>상세 정보 보기</Text>
          </TouchableOpacity>
        </View>
      )}
      {!data.placeUrl && (
        <Text style={styles.noIframeText}>상세 정보 URL이 없습니다.</Text>
      )}


      <View style={styles.footer}>
        <TouchableOpacity style={styles.closeButtonPrimary} onPress={() => setSelectedPlaceId(null)}>
          <Text style={styles.closeButtonPrimaryText}>닫기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.routeButton} onPress={() => console.log('길찾기 시작')}>
          <Text style={styles.routeButtonText}>길찾기</Text>
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
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'android' ? 45 : 0,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: 12,
  },
  routeButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  closeButtonPrimary: {
    flex: 1,
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
  // iframe/webview, 그라디언트 및 버튼을 포함하는 컨테이너의 새 스타일
  previewContainer: {
    position: 'relative', // 자식 요소의 절대 위치 지정을 위해 필요
    height: 400,
    marginTop: 12,
  },
  iframeWrapper: {
    height: '100%',
    overflow: 'hidden',
  },
  webviewWrapper: {
    height: '100%',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    height: 450,
    marginTop: -50,
  },
  noIframeText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
  gradientOverlayWeb: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  gradientOverlayMobile: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  viewDetailsButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -25 }], // 버튼 중앙 정렬 (너비/높이의 절반)
    backgroundColor: '#ff385c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    zIndex: 2, // 그라디언트 위에 있도록 보장
    width: 150, // 중앙 정렬을 위한 고정 너비
    height: 50, // 중앙 정렬을 위한 고정 높이
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
      },
      android: {
        elevation: 15,
      },
      web: {
        boxShadow: '0px 8px 10px rgba(0, 0, 0, 0.6)',
      }
    }),
  },
  viewDetailsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});


