const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  let timeout: NodeJS.Timeout;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { View, StyleSheet, Platform, ViewStyle, Text, Modal, TouchableOpacity, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { KAKAO_MAP_JS_KEY } from "@env";
import { useKakaoMapScript } from "../hooks/useKakaoMapScript";
import { useRecentlyViewedPlaces } from "../hooks/useRecentlyViewedPlaces";

import { MarkerData, KakaoMapProps } from "../types/kakaoMap";
import { SearchResult } from "../types/search";
import { commonStyles } from "./KakaoMap.common.styles";
import { webStyles } from "./KakaoMap.web.styles";
import { mobileStyles } from "./KakaoMap.mobile.styles";
import { MARKER_IMAGES } from "../constants/mapConstants";

export interface MapHandles {
  panBy: (dx: number, dy: number) => void;
  panTo: (lat: number, lng: number, offsetX: number, offsetY: number) => void;
  getCoordsFromOffset: (lat: number, lng: number, offsetX: number, offsetY: number) => Promise<{ lat: number; lng: number }>;
}

const WebKakaoMap = forwardRef<MapHandles, KakaoMapProps>(({
  latitude,
  longitude,
  markers,
  routeResult,
  onMapIdle,
  onMarkerPress,
  showInfoWindow,
  selectedPlaceId,
  selectedMarkerLat,
  selectedMarkerLng,
  onCloseInfoWindow,
  onSetRouteLocation,
  isMenuOpen,
  onMapReady,
}, ref) => {
  console.log('WebKakaoMap 렌더링:', { routeResult: !!routeResult, routeResultCoordinates: routeResult?.coordinates?.length });
  
  const { isLoaded, error: scriptError } = useKakaoMapScript();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const clustererInstance = useRef<any>(null);
  const infowindowInstance = useRef<any>(null); // 단일 정보창 인스턴스
  const userLocationMarkerInstance = useRef<any>(null);
  const infoWindowOverlayInstance = useRef<any>(null); // InfoWindow CustomOverlay instance
  const currentHoverOverlayRef = useRef<any>(null); // Ref to store the currently active hover overlay
  const routePolylineInstance = useRef<any>(null); // 경로 라인 인스턴스
  const routeStartMarkerInstance = useRef<any>(null); // 출발지 마커 인스턴스
  const routeEndMarkerInstance = useRef<any>(null); // 도착지 마커 인스턴스
  const [isMapReady, setIsMapReady] = useState(false);
  const { addPlace } = useRecentlyViewedPlaces();

  const onMapIdleRef = useRef(onMapIdle);

  useImperativeHandle(ref, () => ({
    panBy: (dx, dy) => {
      if (mapInstance.current) {
        mapInstance.current.panBy(dx, dy);
      }
    },
    panTo: (lat, lng, offsetX, offsetY) => {
      if (mapInstance.current) {
        const map = mapInstance.current;
        const projection = map.getProjection();
        const point = projection.pointFromCoords(new window.kakao.maps.LatLng(lat, lng));
        point.x -= offsetX; // Use subtraction to match panBy's behavior (-x moves map left, so content appears right)
        point.y -= offsetY;
        const newCoords = projection.coordsFromPoint(point);
        map.setCenter(newCoords);
      }
    },
    getCoordsFromOffset: (lat, lng, offsetX, offsetY) => {
      return new Promise((resolve) => {
        if (mapInstance.current) {
          const map = mapInstance.current;
          const projection = map.getProjection();
          const point = projection.pointFromCoords(new window.kakao.maps.LatLng(lat, lng));
          point.x += offsetX;
          point.y += offsetY;
          const newCoords = projection.coordsFromPoint(point);
          resolve({ lat: newCoords.getLat(), lng: newCoords.getLng() });
        } else {
          resolve({ lat, lng }); // Fallback
        }
      });
    },
  }));

  // Effect to keep onMapIdleRef updated
  useEffect(() => {
    onMapIdleRef.current = onMapIdle;
  }, [onMapIdle]);

  // Effect for initial map creation and idle listener
  useEffect(() => {
    if (mapRef.current && isLoaded && !mapInstance.current) {
      const mapContainer = mapRef.current;
      const mapOption = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: 3,
        maxLevel: 14,
      };
      const map = new window.kakao.maps.Map(mapContainer, mapOption);
      mapInstance.current = map;

      clustererInstance.current = new window.kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 7,
      });

      infowindowInstance.current = new window.kakao.maps.InfoWindow({ disableAutoPan: true });
      setIsMapReady(true); // Map is ready
      if (onMapReady) {
        onMapReady();
      }
    }
  }, [isLoaded, latitude, longitude, onMapReady]);

  // Effect for idle listener (now using onMapIdleRef)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const idleHandler = () => {
      const latlng = map.getCenter();
      if (onMapIdleRef.current) {
        onMapIdleRef.current(latlng.getLat(), latlng.getLng());
      }
    };

    window.kakao.maps.event.addListener(map, 'idle', idleHandler);

    return () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.event) {
        window.kakao.maps.event.removeListener(map, 'idle', idleHandler);
      }
    };
  }, [mapInstance.current]);

  // Effect for handling mousedown/mouseup on the map to dismiss hover overlay
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    let isDragging = false;

    const handleMouseDown = () => {
      isDragging = false; // Reset drag state
    };

    const handleMouseMove = () => {
      isDragging = true; // Set drag state if mouse moves while down
    };

    const handleMouseUp = () => {
      if (isDragging && currentHoverOverlayRef.current) {
        currentHoverOverlayRef.current.setMap(null);
        currentHoverOverlayRef.current = null;
      }
      isDragging = false; // Reset drag state
    };

    window.kakao.maps.event.addListener(map, 'mousedown', handleMouseDown);
    window.kakao.maps.event.addListener(map, 'mousemove', handleMouseMove);
    window.kakao.maps.event.addListener(map, 'mouseup', handleMouseUp);

    return () => {
      window.kakao.maps.event.removeListener(map, 'mousedown', handleMouseDown);
      window.kakao.maps.event.removeListener(map, 'mousemove', handleMouseMove);
      window.kakao.maps.event.removeListener(map, 'mouseup', handleMouseUp);
    };
  }, [mapInstance.current]);

  // Effect for updating map center
  useEffect(() => {
    if (mapInstance.current && latitude !== undefined && longitude !== undefined) {
      const map = mapInstance.current;
      const currentCenter = map.getCenter();
      const newCenter = new window.kakao.maps.LatLng(latitude, longitude);

      // Only move the map if the center has actually changed
      if (currentCenter.getLat().toFixed(6) !== newCenter.getLat().toFixed(6) || 
          currentCenter.getLng().toFixed(6) !== newCenter.getLng().toFixed(6)) {
        map.setCenter(newCenter);
      }
    }
  }, [latitude, longitude]);

  // Effect for updating markers
  useEffect(() => {
    if (isMapReady && mapInstance.current && clustererInstance.current) {
      // Clear clustered markers
      clustererInstance.current.clear();
      infowindowInstance.current?.setMap(null);

      // Clear previous user location marker if it exists
      if (userLocationMarkerInstance.current) {
        userLocationMarkerInstance.current.setMap(null);
      }

      // 사용자 위치 마커에만 사용되는 마커 이미지 헬퍼 함수
      const getUserLocationMarkerImage = () => {
        const imageSrc = MARKER_IMAGES.USER_LOCATION;
        const imageSize = new window.kakao.maps.Size(36, 36);
        const imageOption = { offset: new window.kakao.maps.Point(18, 36) };
        return new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
      };

      // 점 마커 이미지용 작은 SVG를 데이터 URI로 생성
      const createDotMarkerImage = (isSelected: boolean) => {
        const size = isSelected ? 24 : 16; // Selected 24px, Default 16px
        const borderWidth = isSelected ? 2 : 1;
        const fillColor = isSelected ? '#FF385C' : '#007bff'; // Red for selected, Blue for default
        const borderColor = '#fff'; // White border for both
        const svg = `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${size / 2}" cy="${size / 2}" r="${(size - borderWidth * 2) / 2}" fill="${fillColor}" stroke="${borderColor}" stroke-width="${borderWidth}"/>
          </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
      };

      const userLocationMarkerData = markers?.find(m => m.markerType === 'userLocation');
      const placeMarkersData = markers?.filter(m => m.markerType !== 'userLocation');

      // Handle user location marker
      if (userLocationMarkerData) {
        const markerPosition = new window.kakao.maps.LatLng(
          userLocationMarkerData.lat,
          userLocationMarkerData.lng
        );
        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          image: getUserLocationMarkerImage(),
          zIndex: 101 // 최상단에 표시되도록 보장
        });
        marker.setMap(mapInstance.current);
        userLocationMarkerInstance.current = marker; // 인스턴스 저장
      }

      // Handle place markers with clusterer
      if (placeMarkersData && placeMarkersData.length > 0) {
        clustererInstance.current.clear(); // 클러스터러에서 기존 마커 제거

        const kakaoMarkers = placeMarkersData.map((markerData) => {
          const markerPosition = new window.kakao.maps.LatLng(
            markerData.lat,
            markerData.lng
          );

          const markerImageSrc = createDotMarkerImage(markerData.markerType === "selected");
          const imageSize = new window.kakao.maps.Size(markerData.markerType === "selected" ? 16 : 12, markerData.markerType === "selected" ? 16 : 12);
          const imageOption = { offset: new window.kakao.maps.Point(imageSize.width / 2, imageSize.height / 2) }; // 점의 중앙에 오도록 오프셋 설정

          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            image: new window.kakao.maps.MarkerImage(markerImageSrc, imageSize, imageOption),
            zIndex: markerData.markerType === "selected" ? 100 : 1,
          });

          const customOverlayContent = `
            <div style="
              position: relative;
              bottom: 15px; /* 마커 위로 위치 조절 */
              background-color: white;
              border-radius: 6px;
              padding: 8px 12px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
              font-size: 13px;
              color: #333;
              white-space: nowrap;
              text-align: center;
              border: 1px solid #ddd; /* 메인 테두리와 일치 */
            ">
              <span style="font-weight: bold; display: block;">${markerData.placeName}</span>
              <span style="font-size: 11px; color: #666;">${markerData.categoryGroupName}</span>
              <div style="
                position: absolute;
                bottom: -6px; /* 화살표를 하단 중앙에 위치 */
                left: 50%;
                transform: translateX(-50%) rotate(45deg);
                width: 12px;
                height: 12px;
                background-color: white;
                border-right: 1px solid #ddd; /* 메인 테두리와 일치 */
                border-bottom: 1px solid #ddd; /* 메인 테두리와 일치 */
                box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.05);
                z-index: -1; /* 메인 콘텐츠 뒤에 화살표가 오도록 보장 */
              "></div>
            </div>
          `;

          const customOverlay = new window.kakao.maps.CustomOverlay({
            position: markerPosition,
            content: customOverlayContent,
            yAnchor: 1, // 오버레이의 하단을 마커 위치에 고정
            zIndex: 102, // 모든 마커 위에 표시되도록 보장
          });

          // 마우스 오버 시 커스텀 오버레이 표시
          window.kakao.maps.event.addListener(marker, "mouseover", function () {
            if (currentHoverOverlayRef.current) {
              currentHoverOverlayRef.current.setMap(null); // Close previous hover overlay
            }
            customOverlay.setMap(mapInstance.current);
            currentHoverOverlayRef.current = customOverlay; // Store the new hover overlay
          });

          // 마우스 아웃 시 커스텀 오버레이 닫기
          window.kakao.maps.event.addListener(marker, "mouseout", function () {
            if (currentHoverOverlayRef.current === customOverlay) {
              customOverlay.setMap(null);
              currentHoverOverlayRef.current = null; // Clear the reference
            }
          });

          // 클릭 이벤트 처리
          window.kakao.maps.event.addListener(marker, "click", function () {
            // 현재 열려 있는 커스텀 오버레이가 현재 마커의 것이 아니라면 닫기
            if (infowindowInstance.current && infowindowInstance.current !== customOverlay) {
              infowindowInstance.current.setMap(null);
            }
            // 이미 열려 있지 않다면 (예: 호버로 인해) 이 커스텀 오버레이 열기
            if (!customOverlay.getMap()) {
              customOverlay.setMap(mapInstance.current);
            }
            infowindowInstance.current = customOverlay; // 마지막으로 열린 커스텀 오버레이 추적

            if (markerData.markerType !== "userLocation" && onMarkerPress) {
              onMarkerPress(markerData.placeId, markerData.lat, markerData.lng);
            }
          });

          return marker;
        });

        clustererInstance.current.addMarkers(kakaoMarkers);
      }
    }
  }, [isMapReady, markers]);

  // InfoWindow CustomOverlay 관리
  useEffect(() => {
    console.log('InfoWindow useEffect triggered:', {
      mapInstance: !!mapInstance.current,
      showInfoWindow,
      selectedPlaceId,
      selectedMarkerLat,
      selectedMarkerLng,
      markersCount: markers?.length
    });

    if (mapInstance.current && showInfoWindow && selectedPlaceId && selectedMarkerLat && selectedMarkerLng) {
      // 기존 InfoWindow 제거
      if (infoWindowOverlayInstance.current) {
        infoWindowOverlayInstance.current.setMap(null);
      }
      // Close any active hover overlay when main infowindow opens
      if (currentHoverOverlayRef.current) {
        currentHoverOverlayRef.current.setMap(null);
        currentHoverOverlayRef.current = null;
      }

      // 선택된 마커 데이터 찾기
      const selectedMarker = markers?.find(marker => marker.placeId === selectedPlaceId);
      console.log('Selected marker found:', selectedMarker);
      
      if (!selectedMarker) {
        console.log('No selected marker found for placeId:', selectedPlaceId);
        return;
      }

      // Add the selected place to recently viewed list
      console.log("Calling addPlace with selectedMarker:", selectedMarker.placeName, "(" + selectedMarker.placeId + ")");
      addPlace(selectedMarker);

      // InfoWindow HTML 콘텐츠 생성
      const infoWindowContent = `
        <div style="
          position: relative;
          background-color: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          font-size: 14px;
          color: #333;
          width: 340px;
          border: 1px solid #ddd;
          z-index: 1000;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          ">
            <h3 style="
              margin: 0;
              font-size: 18px;
              font-weight: bold;
              flex: 1;
            ">${selectedMarker.placeName}</h3>
            <button onclick="window.closeInfoWindow()" style="
              background: none;
              border: none;
              font-size: 25px;
              color: #666;
              cursor: pointer;
              padding: 0;
              margin-left: 8px;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">×</button>
          </div>
          
          <div style="margin-bottom: 8px;">
            <div style="margin-bottom: 6px; display: flex; align-items: center;">
              <span style="min-width: 50px; font-weight: 500;">주소</span>
              <span style="margin-left: 14px;">${selectedMarker.roadAddress || selectedMarker.lotAddress || '-'}</span>
            </div>
            <div style="margin-bottom: 6px; display: flex; align-items: center;">
              <span style="min-width: 50px; font-weight: 500;">전화</span>
              <span style="color: #28a745; margin-left: 14px;">${selectedMarker.phone || '-'}</span>
            </div>
            <div style="margin-bottom: 6px; display: flex; align-items: center;">
              <span style="min-width: 50px; font-weight: 500;">카테고리</span>
              <span style="margin-left: 14px;">${selectedMarker.categoryGroupName || '-'}</span>
            </div>
            ${selectedMarker.placeUrl ? `
              <div style="margin-bottom: 6px; display: flex; align-items: center;">
                <span style="min-width: 50px; font-weight: 500;">상세보기</span>
                <a href="${selectedMarker.placeUrl}" target="_blank" style="color: #007bff; margin-left: 14px;">카카오맵에서 보기</a>
              </div>
            ` : ''}
          </div>
          
          <div style="
            position: absolute;
            bottom: 15px;
            right: 20px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          ">
            <div id="routeDropdown" style="
              position: absolute;
              bottom: 35px;
              right: 0;
              background: white;
              border: 1px solid #ddd;
              border-radius: 6px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              display: none;
              min-width: 100px;
              z-index: 1001;
            ">
              <button onclick="window.selectRouteOption('departure')" style="
                display: block;
                width: 100%;
                padding: 8px 12px;
                border: none;
                background: none;
                text-align: center;
                cursor: pointer;
                font-size: 13px;
                color: #333;
                border-bottom: 1px solid #eee;
              ">출발</button>
              <button onclick="window.selectRouteOption('arrival')" style="
                display: block;
                width: 100%;
                padding: 8px 12px;
                border: none;
                background: none;
                text-align: center;
                cursor: pointer;
                font-size: 13px;
                color: #333;
              ">도착</button>
            </div>
            <button onclick="window.toggleRouteDropdown()" style="
              background-color: #007bff;
              color: white;
              border: none;
              border-radius: 5px;
              padding: 6px 12px;
              font-size: 12px;
              cursor: pointer;
            ">
              길찾기
            </button>
          </div>
          
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            width: 12px;
            height: 12px;
            background-color: white;
            border-right: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
            box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.05);
            z-index: -1;
          "></div>
        </div>
      `;

      // InfoWindow 닫기 함수를 전역에 등록
      (window as any).closeInfoWindow = () => {
        if (onCloseInfoWindow) {
          onCloseInfoWindow();
        }
      };

      // 드롭다운 토글 함수
      (window as any).toggleRouteDropdown = () => {
        const dropdown = document.getElementById('routeDropdown');
        if (dropdown) {
          dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
      };

      // 드롭다운 옵션 선택 함수
      (window as any).selectRouteOption = (option: 'departure' | 'arrival') => {
        console.log('Route option selected:', option, 'for place:', selectedPlaceId);
        console.log('Selected marker:', selectedMarker);
        
        // 선택된 장소 정보를 SearchResult 형태로 변환
        if (selectedMarker) {
          const placeInfo = {
            placeId: selectedMarker.placeId,
            placeName: selectedMarker.placeName,
            roadAddress: selectedMarker.roadAddress || '',
            roadAddressDong: selectedMarker.roadAddressDong || '',
            lotAddress: selectedMarker.lotAddress || '',
            lat: selectedMarker.lat,
            lng: selectedMarker.lng,
            phone: selectedMarker.phone || '',
            categoryGroupName: selectedMarker.categoryGroupName || '',
            placeUrl: selectedMarker.placeUrl || '',
            distance: 0, // InfoWindow에서는 거리 정보가 없으므로 0으로 설정
          };
          
          console.log('Place info created:', placeInfo);
          
          // 전역 함수 호출 (SideMenu에서 등록한 함수) - InfoWindow 닫기 전에 호출
          if ((window as any).setRouteLocationFromInfoWindow) {
            console.log('전역 함수 호출 중...');
            (window as any).setRouteLocationFromInfoWindow(option, placeInfo);
          } else {
            console.log('전역 함수가 등록되지 않음!');
          }
          
          // 드롭다운 닫기
          const dropdown = document.getElementById('routeDropdown');
          if (dropdown) {
            dropdown.style.display = 'none';
          }
          
          // InfoWindow 닫기 (전역 함수 호출 후에 닫기)
          setTimeout(() => {
            if (onCloseInfoWindow) {
              onCloseInfoWindow();
            }
          }, 100); // 100ms 지연으로 전역 함수 실행 완료 후 닫기
        } else {
          console.log('Selected marker가 없음!');
          
          // 드롭다운 닫기
          const dropdown = document.getElementById('routeDropdown');
          if (dropdown) {
            dropdown.style.display = 'none';
          }
          
          // InfoWindow 닫기
          if (onCloseInfoWindow) {
            onCloseInfoWindow();
          }
        }
      };

      // 드롭다운 외부 클릭 시 닫기
      document.addEventListener('click', (event) => {
        const dropdown = document.getElementById('routeDropdown');
        const routeButton = document.querySelector('button[onclick="window.toggleRouteDropdown()"]');
        
        if (dropdown && routeButton && 
            !dropdown.contains(event.target as Node) && 
            !routeButton.contains(event.target as Node)) {
          dropdown.style.display = 'none';
        }
      });

      // CustomOverlay 생성
      const infoWindowOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(selectedMarkerLat, selectedMarkerLng),
        content: infoWindowContent,
        yAnchor: 1.1, // 마커 위쪽에 배치
        zIndex: 1000,
      });

      // InfoWindow 표시
      infoWindowOverlay.setMap(mapInstance.current);
      infoWindowOverlayInstance.current = infoWindowOverlay;

    } else if (infoWindowOverlayInstance.current) {
      // InfoWindow 숨기기
      infoWindowOverlayInstance.current.setMap(null);
      infoWindowOverlayInstance.current = null;
    }
  }, [showInfoWindow, selectedPlaceId, selectedMarkerLat, selectedMarkerLng, markers, onCloseInfoWindow]);

  // 경로 표시 Effect
  useEffect(() => {
    console.log('웹 경로 표시 useEffect 실행:', {
      isMapReady,
      hasMapInstance: !!mapInstance.current,
      hasRouteResult: !!routeResult,
      routeResultCoordinates: routeResult?.coordinates?.length || 0
    });
    
    if (isMapReady && mapInstance.current) {
      // 기존 경로 요소들 제거
      if (routePolylineInstance.current) {
        routePolylineInstance.current.setMap(null);
        routePolylineInstance.current = null;
      }
      if (routeStartMarkerInstance.current) {
        routeStartMarkerInstance.current.setMap(null);
        routeStartMarkerInstance.current = null;
      }
      if (routeEndMarkerInstance.current) {
        routeEndMarkerInstance.current.setMap(null);
        routeEndMarkerInstance.current = null;
      }

      // 새로운 경로 표시
      if (routeResult && routeResult.coordinates && routeResult.coordinates.length > 0) {
        console.log('웹 경로 표시 시작:', routeResult);
        console.log('window.kakao 객체 존재:', !!window.kakao);
        console.log('mapInstance.current 존재:', !!mapInstance.current);
        
        try {
          const path = routeResult.coordinates.map(coord => 
            new window.kakao.maps.LatLng(coord.lat, coord.lon)
          );
          
          console.log('경로 좌표 개수:', path.length);
          
          const polyline = new window.kakao.maps.Polyline({
            map: mapInstance.current,
            path: path,
            strokeWeight: 5,
            strokeColor: '#FF385C',
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            zIndex: 50
          });
          routePolylineInstance.current = polyline;
          console.log('웹 경로 라인 생성 완료');
        } catch (error) {
          console.error('웹 경로 라인 생성 오류:', error);
        }

        // 2. 출발지 마커 표시
        try {
          if (routeResult.steps && routeResult.steps.length > 0) {
            const startStep = routeResult.steps[0];
            const startPosition = new window.kakao.maps.LatLng(
              startStep.startLocation.lat, 
              startStep.startLocation.lon
            );
            
            const startMarker = new window.kakao.maps.Marker({
              position: startPosition,
              image: createRouteMarkerImage('start'),
              zIndex: 200
            });
            startMarker.setMap(mapInstance.current);
            routeStartMarkerInstance.current = startMarker;
            console.log('웹 출발지 마커 생성 완료');
          }

          // 3. 도착지 마커 표시
          if (routeResult.steps && routeResult.steps.length > 0) {
            const endStep = routeResult.steps[routeResult.steps.length - 1];
            const endPosition = new window.kakao.maps.LatLng(
              endStep.endLocation.lat, 
              endStep.endLocation.lon
            );
            
            const endMarker = new window.kakao.maps.Marker({
              position: endPosition,
              image: createRouteMarkerImage('end'),
              zIndex: 200
            });
            endMarker.setMap(mapInstance.current);
            routeEndMarkerInstance.current = endMarker;
            console.log('웹 도착지 마커 생성 완료');
          }

          // 4. 경로 전체가 보이도록 지도 범위 조정
          const path = routeResult.coordinates.map(coord => 
            new window.kakao.maps.LatLng(coord.lat, coord.lon)
          );
          const bounds = new window.kakao.maps.LatLngBounds();
          path.forEach(point => bounds.extend(point));
          
          const SIDE_MENU_WIDTH = 330;
          if (isMenuOpen) {
            mapInstance.current.setBounds(bounds, 0, 0, 0, SIDE_MENU_WIDTH);
          } else {
            mapInstance.current.setBounds(bounds);
          }
          console.log('웹 지도 범위 조정 완료');
          
          console.log('웹 경로 표시 완료');
        } catch (error) {
          console.error('웹 마커 생성 오류:', error);
        }
      }
    }
  }, [isMapReady, routeResult]);

  // 경로 마커 이미지 생성 함수
  const createRouteMarkerImage = (type: 'start' | 'end') => {
    const size = new window.kakao.maps.Size(32, 32);
    const offset = new window.kakao.maps.Point(16, 32);
    
    let imageSrc;
    if (type === 'start') {
      // 출발지 마커 (녹색 원)
      const svg = `
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="#28a745" stroke="#fff" stroke-width="2"/>
          <text x="16" y="20" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">S</text>
        </svg>
      `;
      imageSrc = `data:image/svg+xml;base64,${btoa(svg)}`;
    } else {
      // 도착지 마커 (빨간색 원)
      const svg = `
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="#dc3545" stroke="#fff" stroke-width="2"/>
          <text x="16" y="20" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">E</text>
        </svg>
      `;
      imageSrc = `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    
    return new window.kakao.maps.MarkerImage(imageSrc, size, { offset });
  };

if (scriptError) {
  return (
    <View style={webStyles.webMapContainer}>
      <Text>Error loading Kakao Map: {scriptError.toString()}</Text>
    </View>
  );
}

if (!isLoaded) {
  return (
    <View style={webStyles.webMapContainer}>
      <Text>Loading Kakao Map...</Text>
    </View>
  );
}

return <div ref={mapRef} style={webStyles.webMapContainer} />;
});

import { kakaoMapWebViewHtml } from "./kakaoMapWebViewSource";

// 모바일 전용 카카오 맵 렌더링 로직 (WebView 사용)
const MobileKakaoMap: React.FC<KakaoMapProps> = React.memo(({
latitude,
longitude,
markers,
routeResult,
onMapIdle,
onMarkerPress,
style,
}) => {
const webViewRef = useRef<WebView>(null);
const updateTimeout = useRef<NodeJS.Timeout | null>(null);
const [isMapApiReady, setIsMapApiReady] = useState(false);
const [isMapInitialized, setIsMapInitialized] = useState(false);
const [showRouteMenu, setShowRouteMenu] = useState(false);
const [selectedPlaceInfo, setSelectedPlaceInfo] = useState<SearchResult | null>(null);

const htmlContent = useMemo(() => {
  let content = kakaoMapWebViewHtml.replace(
    "KAKAO_MAP_JS_KEY_PLACEHOLDER",
    KAKAO_MAP_JS_KEY
  );
  content = content.replace("MARKER_IMAGE_USER_LOCATION_PLACEHOLDER", MARKER_IMAGES.USER_LOCATION);
  return content;
}, [KAKAO_MAP_JS_KEY]);

// Effect to update map center when latitude/longitude props change after initialization
useEffect(() => {
  if (
    webViewRef.current &&
    htmlContent &&
    isMapInitialized &&
    latitude !== undefined &&
    longitude !== undefined
  ) {
    const script = `updateMapCenter(${latitude}, ${longitude}); true;`;
    webViewRef.current.injectJavaScript(script);
  }
}, [isMapInitialized, latitude, longitude, htmlContent]);

// Effect for updating markers when markers prop changes (Debounced)
useEffect(() => {
  if (updateTimeout.current) {
    clearTimeout(updateTimeout.current);
  }

  updateTimeout.current = setTimeout(() => {
    if (webViewRef.current && htmlContent && isMapInitialized) {
      const script = `updateMarkers(${JSON.stringify(markers || [])}); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  }, 200); // 200ms debounce

  return () => {
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }
  };
}, [markers, htmlContent, isMapInitialized]);

// 경로 표시 Effect (모바일 WebView)
useEffect(() => {
  if (updateTimeout.current) {
    clearTimeout(updateTimeout.current);
  }

  updateTimeout.current = setTimeout(() => {
    if (webViewRef.current && htmlContent && isMapInitialized) {
      if (routeResult && routeResult.coordinates && routeResult.coordinates.length > 0) {
        console.log('모바일 경로 표시 시작:', routeResult);
        
        // 경로 표시 스크립트
        const script = `
          if (typeof drawRoute === 'function') {
            drawRoute(${JSON.stringify(routeResult)});
          } else {
            console.log('drawRoute 함수가 아직 로드되지 않음');
          }
          true;
        `;
        webViewRef.current.injectJavaScript(script);
      } else {
        // 경로 제거 스크립트
        const script = `
          if (typeof clearRoute === 'function') {
            clearRoute();
          }
          true;
        `;
        webViewRef.current.injectJavaScript(script);
      }
    }
  }, 200); // 200ms debounce

  return () => {
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }
  };
}, [routeResult, htmlContent, isMapInitialized]);

if (!htmlContent) {
  return (
    <View style={mobileStyles.webview}>
      <Text>Loading map content...</Text>
    </View>
  );
}

return (
  <View style={{ flex: 1 }}>
    <WebView
      ref={webViewRef} // WebView에 ref 할당
      originWhitelist={["*"]}
      source={{ html: htmlContent }}
      style={[mobileStyles.webview, style]}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      onLoadEnd={() => {
        if (webViewRef.current && latitude !== undefined && longitude !== undefined) {
          // 카카오 맵 SDK 로드 및 지도 초기화 스크립트 주입
          const script = `
            if (typeof kakao !== 'undefined' && kakao.maps) {
              kakao.maps.load(function() {
                initMap(${latitude}, ${longitude});
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_api_ready' }));
              }, function(err) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Kakao Maps SDK load failed: ' + err.message }));
              });
            } else {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Kakao Maps SDK not available' }));
            }
          `;
          webViewRef.current.injectJavaScript(script);
        }
      }}
      onError={(e) => console.error("WebView error: ", e.nativeEvent)} // WebView 오류 처리
      onMessage={(event) => { // WebView 메시지 처리
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === "map_idle" && onMapIdle) {
            onMapIdle(data.latitude, data.longitude);
          }
          if (data.type === "marker_press" && onMarkerPress) {
            console.log('🎯 마커 클릭 이벤트:', data.id);
            onMarkerPress(data.id);
          }
          if (data.type === 'map_api_ready') {
            setIsMapApiReady(true);
            setIsMapInitialized(true); // initMap 성공 후 초기화 완료로 설정
          }
          if (data.type === 'route_selected') {
            // 길찾기 버튼 클릭 시 처리
            console.log('Route selected:', data.placeId, data.placeName);
            
            // 전역 함수가 등록되어 있으면 호출
            if ((global as any).setRouteLocationFromInfoWindow) {
              const placeInfo: SearchResult = {
                placeId: data.placeId,
                placeName: data.placeName,
                roadAddress: data.roadAddress || '',
                roadAddressDong: data.roadAddressDong || '', // Add missing property
                lotAddress: data.lotAddress || '',
                lat: data.latitude || 0,
                lng: data.longitude || 0,
                phone: data.phone || '',
                categoryGroupName: data.category || '',
                placeUrl: data.placeUrl || '',
                distance: data.distance || 0
              };
              
              // 출발/도착 드롭다운 메뉴 표시
              setSelectedPlaceInfo(placeInfo);
              setShowRouteMenu(true);
            } else {
              console.warn('setRouteLocationFromInfoWindow 함수가 등록되지 않았습니다.');
            }
          }
          if (data.type === 'error') { // WebView 내부에서 발생한 에러 처리
            console.error('WebView internal error:', data.message);
          }
        } catch (e) {
          console.error("Failed to parse WebView message:", e);
        }
      }}
    />
    {/* 출발/도착 드롭다운 메뉴 */}
    <Modal
      visible={showRouteMenu}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowRouteMenu(false)}
    >
      <View style={commonStyles.modalOverlay}>
        <View style={commonStyles.routeMenuContainer}>
          <Text style={commonStyles.routeMenuTitle}>
            {selectedPlaceInfo?.placeName}
          </Text>
          <Text style={commonStyles.routeMenuSubtitle}>
            길찾기 옵션을 선택하세요
          </Text>
          
          <TouchableOpacity
            style={commonStyles.routeMenuButton}
            onPress={() => {
              if (selectedPlaceInfo && (global as any).setRouteLocationFromInfoWindow) {
                (global as any).setRouteLocationFromInfoWindow('departure', selectedPlaceInfo);
                setShowRouteMenu(false);
              }
            }}
          >
            <Text style={commonStyles.routeMenuButtonText}>출발지로 설정</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={commonStyles.routeMenuButton}
            onPress={() => {
              if (selectedPlaceInfo && (global as any).setRouteLocationFromInfoWindow) {
                (global as any).setRouteLocationFromInfoWindow('arrival', selectedPlaceInfo);
                setShowRouteMenu(false);
              }
            }}
          >
            <Text style={commonStyles.routeMenuButtonText}>도착지로 설정</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={commonStyles.routeMenuCancelButton}
            onPress={() => setShowRouteMenu(false)}
          >
            <Text style={commonStyles.routeMenuCancelButtonText}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </View>
);
});

const KakaoMap = forwardRef<MapHandles, KakaoMapProps>((props, ref) => {
  console.log('KakaoMap 컴포넌트 렌더링:', { 
    platform: Platform.OS, 
    hasRouteResult: !!props.routeResult,
    routeResultCoordinates: props.routeResult?.coordinates?.length 
  });
  
  if (Platform.OS === "web") {
    return <WebKakaoMap {...props} ref={ref} />;
  }
  return <MobileKakaoMap {...props} />;
});

export default KakaoMap;
