import { MARKER_CONFIG, getMarkerConfig } from '../constants/mapConstants';

/**
 * 마커 관리 유틸리티
 */
export class MarkerManager {
  private static markers: Map<string, any> = new Map();
  private static clusterer: any = null;
  private static map: any = null;

  /**
   * 마커 매니저 초기화
   */
  static initialize(map: any, clusterer: any) {
    this.map = map;
    this.clusterer = clusterer;
    this.markers.clear();
  }

  /**
   * 모든 마커 제거
   */
  static clearAllMarkers(): void {
    this.markers.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    this.markers.clear();
    
    if (this.clusterer) {
      this.clusterer.clear();
    }
  }

  /**
   * 특정 타입의 마커들 제거
   */
  static clearMarkersByType(type: string): void {
    this.markers.forEach((marker, key) => {
      if (key.startsWith(type)) {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
        this.markers.delete(key);
      }
    });
  }

  /**
   * 마커 생성 및 추가
   */
  static createAndAddMarker(
    id: string,
    lat: number,
    lng: number,
    markerType: string,
    onClick?: (placeId: string, lat: number, lng: number) => void
  ): any {
    if (!this.map) {
      console.error('Map not initialized');
      return null;
    }

    // 기존 마커 제거
    this.removeMarker(id);

    const config = getMarkerConfig(markerType as any);
    const position = new window.kakao.maps.LatLng(lat, lng);
    
    const marker = new window.kakao.maps.Marker({
      position: position,
      image: this.createMarkerImage(markerType),
      zIndex: config.zIndex,
    });

    // 클릭 이벤트 추가
    if (onClick && config.clickable) {
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onClick(id, lat, lng);
      });
    }

    // 마커를 지도에 추가
    if (this.clusterer && markerType !== 'userLocation') {
      this.clusterer.addMarker(marker);
    } else {
      marker.setMap(this.map);
    }

    // 마커 저장
    this.markers.set(id, marker);
    return marker;
  }

  /**
   * 마커 제거
   */
  static removeMarker(id: string): void {
    const marker = this.markers.get(id);
    if (marker) {
      if (marker.setMap) {
        marker.setMap(null);
      }
      this.markers.delete(id);
    }
  }

  /**
   * 마커 이미지 생성
   */
  private static createMarkerImage(markerType: string): any {
    const config = getMarkerConfig(markerType as any);
    return new window.kakao.maps.MarkerImage(
      config.image,
      new window.kakao.maps.Size(config.size.width, config.size.height),
      { offset: new window.kakao.maps.Point(config.offset.x, config.offset.y) }
    );
  }

  /**
   * 마커 업데이트 (기존 마커가 있으면 제거 후 새로 생성)
   */
  static updateMarker(
    id: string,
    lat: number,
    lng: number,
    markerType: string,
    onClick?: (placeId: string, lat: number, lng: number) => void
  ): any {
    return this.createAndAddMarker(id, lat, lng, markerType, onClick);
  }

  /**
   * 마커 존재 여부 확인
   */
  static hasMarker(id: string): boolean {
    return this.markers.has(id);
  }

  /**
   * 모든 마커 ID 목록 반환
   */
  static getAllMarkerIds(): string[] {
    return Array.from(this.markers.keys());
  }

  /**
   * 특정 타입의 마커 ID 목록 반환
   */
  static getMarkerIdsByType(type: string): string[] {
    return Array.from(this.markers.keys()).filter(key => key.startsWith(type));
  }
}

/**
 * 마커 데이터 변환 유틸리티
 */
export class MarkerDataConverter {
  private static markerCache: { key: string; data: any[] } | null = null;
  /**
   * 검색 결과를 마커 데이터로 변환 (메모이제이션 적용)
   */
  static convertSearchResultsToMarkers(
    searchResults: any[],
    selectedPlaceId: string | null,
    userLocation?: { latitude: number; longitude: number }
  ): any[] {
    // 메모이제이션을 위한 캐시 키 생성
    const cacheKey = `${searchResults.length}-${selectedPlaceId}-${userLocation?.latitude}-${userLocation?.longitude}`;
    
    // 캐시된 결과가 있으면 반환
    if (MarkerDataConverter.markerCache && MarkerDataConverter.markerCache.key === cacheKey) {
      return MarkerDataConverter.markerCache.data;
    }

    const markers: any[] = [];

    // 현재 위치 마커 추가
    if (userLocation) {
      markers.push({
        placeId: 'user_location',
        placeName: '내 위치',
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        categoryGroupName: '내 위치',
        roadAddress: '현재 위치',
        lotAddress: '',
        phone: '',
        placeUrl: '',
        markerType: 'userLocation'
      });
    }

    // 검색 결과 마커들 추가
    searchResults.forEach(result => {
      markers.push({
        placeId: result.placeId,
        placeName: result.placeName,
        lat: result.lat,
        lng: result.lng,
        categoryGroupName: result.categoryGroupName,
        roadAddress: result.roadAddress,
        roadAddressDong: result.roadAddressDong,
        lotAddress: result.lotAddress,
        phone: result.phone,
        placeUrl: result.placeUrl,
        markerType: result.placeId === selectedPlaceId ? 'selected' : 'default'
      });
    });

    // 결과 캐시
    MarkerDataConverter.markerCache = { key: cacheKey, data: markers };
    return markers;
  }

  /**
   * 마커 데이터를 WebView용으로 변환
   */
  static convertToWebViewFormat(markers: any[]): any[] {
    return markers.map(marker => ({
      placeId: marker.placeId,
      lat: marker.lat,
      lng: marker.lng,
      markerType: marker.markerType,
      // WebView에서 필요한 추가 데이터
      placeName: marker.placeName,
      categoryGroupName: marker.categoryGroupName,
      roadAddress: marker.roadAddress,
      lotAddress: marker.lotAddress,
      phone: marker.phone,
      placeUrl: marker.placeUrl
    }));
  }
}

/**
 * 마커 관리 훅
 */
export const useMarkerManager = () => {
  return {
    clearAllMarkers: MarkerManager.clearAllMarkers,
    clearMarkersByType: MarkerManager.clearMarkersByType,
    createAndAddMarker: MarkerManager.createAndAddMarker,
    removeMarker: MarkerManager.removeMarker,
    updateMarker: MarkerManager.updateMarker,
    hasMarker: MarkerManager.hasMarker,
    getAllMarkerIds: MarkerManager.getAllMarkerIds,
    getMarkerIdsByType: MarkerManager.getMarkerIdsByType,
    convertSearchResultsToMarkers: MarkerDataConverter.convertSearchResultsToMarkers,
    convertToWebViewFormat: MarkerDataConverter.convertToWebViewFormat,
  };
};
