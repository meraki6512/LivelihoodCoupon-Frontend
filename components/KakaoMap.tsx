const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  let timeout: NodeJS.Timeout;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

import React, { useEffect, useMemo, useRef, useState, useCallback, forwardRef } from "react";
import { View, StyleSheet, Platform, ViewStyle, Text, Modal, TouchableOpacity, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { KAKAO_MAP_JS_KEY } from "@env";
import { useKakaoMapScript } from "../hooks/useKakaoMapScript";

import { MarkerData, KakaoMapProps } from "../types/kakaoMap";
import { SearchResult } from "../types/search";
import { commonStyles as commonStyles } from "./KakaoMap.common.styles";

const styles = StyleSheet.create({
  ...commonStyles,
  webMapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
import { MARKER_IMAGES, MARKER_CONFIG, getMarkerConfig, MAP_CONFIG } from "../constants/mapConstants";
import { MarkerManager } from "../utils/markerUtils";

  const WebKakaoMap = forwardRef<any, KakaoMapProps>(({
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
    resetMapLevel,
    onResetMapLevelComplete,
    onGetCurrentMapCenter,
  }: KakaoMapProps, ref) => {
    // WebKakaoMap 렌더링
    
    const { isLoaded, error: scriptError } = useKakaoMapScript();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const clustererInstance = useRef<any>(null);
    const infowindowInstance = useRef<any>(null); // 단일 정보창 인스턴스
    const userLocationMarkerInstance = useRef<any>(null);
    const infoWindowOverlayInstance = useRef<any>(null); // InfoWindow CustomOverlay instance
    const routePolylineInstance = useRef<any>(null); // 경로 라인 인스턴스
    const routeStartMarkerInstance = useRef<any>(null); // 출발지 마커 인스턴스
    const routeEndMarkerInstance = useRef<any>(null); // 도착지 마커 인스턴스
    const [isMapReady, setIsMapReady] = useState(false);

    // Effect for initial map creation
    useEffect(() => {
      if (mapRef.current && isLoaded && !mapInstance.current) {
        const mapContainer = mapRef.current;
        const mapOption = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: MAP_CONFIG.INITIAL_LEVEL,
          maxLevel: MAP_CONFIG.MAX_LEVEL,
        };
        const map = new window.kakao.maps.Map(mapContainer, mapOption);
        mapInstance.current = map;

        const debouncedOnMapCenterChange = debounce(() => {
          const latlng = map.getCenter();
        }, 300); // 300ms debounce

        window.kakao.maps.event.addListener(map, "center_changed", debouncedOnMapCenterChange);

        clustererInstance.current = new window.kakao.maps.MarkerClusterer({
          map: map,
          averageCenter: true,
          minLevel: 7,
        });

        infowindowInstance.current = new window.kakao.maps.InfoWindow({ disableAutoPan: true });
        setIsMapReady(true); // Map is ready
      }
    }, [isLoaded, latitude, longitude]);

    // Effect for updating map center
    useEffect(() => {
      if (mapInstance.current && latitude !== undefined && longitude !== undefined) {
        const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
        
        // 지도 중심 이동 시작
        
        // 확실한 지도 이동을 위해 setCenter와 panTo 조합 사용
        mapInstance.current.setCenter(newCenter);
        
        // 추가로 panTo도 호출하여 확실한 이동
        setTimeout(() => {
          mapInstance.current.panTo(newCenter);
        }, 50);
        
        // 이동 후 중심 확인
        setTimeout(() => {
          const actualCenter = mapInstance.current.getCenter();
          // 지도 중심 이동 완료
        }, 100);
      }
    }, [latitude, longitude]);

    // 지도 레벨 초기화 함수
    const resetMapLevelFunction = useCallback(() => {
      if (mapInstance.current) {
        // 부드러운 레벨 조정을 위해 단계적으로 변경
        const currentLevel = mapInstance.current.getLevel();
        const targetLevel = MAP_CONFIG.CURRENT_LOCATION_LEVEL;
        
        if (currentLevel !== targetLevel) {
          // 레벨 차이가 클 때는 단계적으로 조정
          const step = currentLevel > targetLevel ? -1 : 1;
          const adjustLevel = () => {
            const newLevel = mapInstance.current.getLevel() + step;
            mapInstance.current.setLevel(newLevel);
            
            if ((step > 0 && newLevel < targetLevel) || (step < 0 && newLevel > targetLevel)) {
              setTimeout(adjustLevel, 100);
            }
          };
          adjustLevel();
        }
        // 지도 레벨 초기화
      }
    }, []);

    // 전역 함수로 등록 (다른 컴포넌트에서 호출 가능)
    useEffect(() => {
      (window as any).resetMapLevel = resetMapLevelFunction;
      return () => {
        delete (window as any).resetMapLevel;
      };
    }, [resetMapLevelFunction]);

    // resetMapLevel prop 처리
    useEffect(() => {
      if (resetMapLevel && mapInstance.current) {
        mapInstance.current.setLevel(MAP_CONFIG.CURRENT_LOCATION_LEVEL);
        
        // 지도 레벨 초기화 후 마커 다시 렌더링
        setTimeout(() => {
          // 마커 업데이트를 강제로 트리거
          if (markers && markers.length > 0) {
            
            // 기존 마커들 제거
            if (clustererInstance.current) {
              clustererInstance.current.clear();
            }
            
            // 사용자 위치 마커 다시 생성
            const userLocationMarkerData = markers.find(m => m.markerType === 'userLocation');
            if (userLocationMarkerData) {
              const markerPosition = new window.kakao.maps.LatLng(
                userLocationMarkerData.lat,
                userLocationMarkerData.lng
              );
              const config = getMarkerConfig('userLocation');
              const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                image: createMarkerImage('userLocation'),
                zIndex: config.zIndex
              });
              marker.setMap(mapInstance.current);
              userLocationMarkerInstance.current = marker;
              // 사용자 위치 마커 다시 생성 완료
            }
            
            // 장소 마커들 다시 생성
            const placeMarkersData = markers.filter(m => m.markerType !== 'userLocation');
            if (placeMarkersData.length > 0) {
              placeMarkersData.forEach(markerData => {
                const markerPosition = new window.kakao.maps.LatLng(markerData.lat, markerData.lng);
                const markerType = markerData.markerType === "selected" ? "selected" : "default";
                const config = getMarkerConfig(markerType);
                
                const marker = new window.kakao.maps.Marker({
                  position: markerPosition,
                  image: createMarkerImage(markerType),
                  zIndex: config.zIndex,
                });
                
                clustererInstance.current.addMarker(marker);
                
                // 마커 클릭 이벤트 추가
                window.kakao.maps.event.addListener(marker, 'click', () => {
                  if (onMarkerPress) {
                    onMarkerPress(markerData.placeId, markerData.lat, markerData.lng);
                  }
                });
              });
              // 장소 마커들 다시 생성 완료
            }
          }
        }, 100);
        
        if (onResetMapLevelComplete) {
          onResetMapLevelComplete();
        }
      }
    }, [resetMapLevel, onResetMapLevelComplete, markers]);

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

        // 마커 타입에 따른 이미지 생성 헬퍼 함수
        const createMarkerImage = (markerType: string) => {
          const config = getMarkerConfig(markerType as any);
          const imageSize = new window.kakao.maps.Size(config.size.width, config.size.height);
          const imageOption = { offset: new window.kakao.maps.Point(config.offset.x, config.offset.y) };
          return new window.kakao.maps.MarkerImage(config.image, imageSize, imageOption);
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
          const config = getMarkerConfig('userLocation');
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            image: createMarkerImage('userLocation'),
            zIndex: config.zIndex
          });
          marker.setMap(mapInstance.current);
          userLocationMarkerInstance.current = marker; // 인스턴스 저장
          // 사용자 위치 마커 생성 완료
        }

        // Handle place markers with clusterer
        if (placeMarkersData && placeMarkersData.length > 0) {
          clustererInstance.current.clear(); // 클러스터러에서 기존 마커 제거

          const kakaoMarkers = placeMarkersData.map((markerData) => {
            const markerPosition = new window.kakao.maps.LatLng(
              markerData.lat,
              markerData.lng
            );

            const markerType = markerData.markerType === "selected" ? "selected" : "default";
            const config = getMarkerConfig(markerType);
            
            const marker = new window.kakao.maps.Marker({
              position: markerPosition,
              image: createMarkerImage(markerType),
              zIndex: config.zIndex,
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
              customOverlay.setMap(mapInstance.current);
            });

            // 마우스 아웃 시 커스텀 오버레이 닫기
            window.kakao.maps.event.addListener(marker, "mouseout", function () {
              customOverlay.setMap(null);
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

      if (mapInstance.current && showInfoWindow && selectedPlaceId && selectedMarkerLat && selectedMarkerLng) {
        // 기존 InfoWindow 제거
        if (infoWindowOverlayInstance.current) {
          infoWindowOverlayInstance.current.setMap(null);
        }

        // 선택된 마커 데이터 찾기
        const selectedMarker = markers?.find(marker => marker.placeId === selectedPlaceId);
        
        if (!selectedMarker) {
          return;
        }

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
          
          // 선택된 장소 정보를 SearchResult 형태로 변환
          if (selectedMarker) {
            const placeInfo = {
              placeId: selectedMarker.placeId,
              placeName: selectedMarker.placeName,
              roadAddress: selectedMarker.roadAddress || '',
              lotAddress: selectedMarker.lotAddress || '',
              lat: selectedMarker.lat,
              lng: selectedMarker.lng,
              phone: selectedMarker.phone || '',
              categoryGroupName: selectedMarker.categoryGroupName || '',
              placeUrl: selectedMarker.placeUrl || '',
              distance: 0, // InfoWindow에서는 거리 정보가 없으므로 0으로 설정
            };
            
            
            // 전역 함수 호출 (SideMenu에서 등록한 함수) - InfoWindow 닫기 전에 호출
            if ((window as any).setRouteLocationFromInfoWindow) {
              (window as any).setRouteLocationFromInfoWindow(option, placeInfo);
            } else {
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
      // 웹 경로 표시 useEffect 실행
      
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
          // 웹 경로 표시 시작
          
          try {
            const path = routeResult.coordinates.map(coord => 
              new window.kakao.maps.LatLng(coord.lat, coord.lon)
            );
            
            // 경로 좌표 처리
            
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
            // 웹 경로 라인 생성 완료
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
              // 웹 출발지 마커 생성 완료
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
              // 웹 도착지 마커 생성 완료
            }

            // 4. 경로 전체가 보이도록 지도 범위 조정
            const path = routeResult.coordinates.map(coord => 
              new window.kakao.maps.LatLng(coord.lat, coord.lon)
            );
            const bounds = new window.kakao.maps.LatLngBounds();
            path.forEach(point => bounds.extend(point));
            mapInstance.current.setBounds(bounds);
            // 웹 지도 범위 조정 완료
            
            // 웹 경로 표시 완료
          } catch (error) {
            console.error('웹 마커 생성 오류:', error);
          }
        }
      }
    }, [isMapReady, routeResult]);

    // 마커 타입에 따른 이미지 생성 헬퍼 함수
    const createMarkerImage = (markerType: string) => {
      const config = getMarkerConfig(markerType as any);
      const imageSize = new window.kakao.maps.Size(config.size.width, config.size.height);
      const imageOption = { offset: new window.kakao.maps.Point(config.offset.x, config.offset.y) };
      return new window.kakao.maps.MarkerImage(config.image, imageSize, imageOption);
    };

    // 경로 마커 이미지 생성 함수 (새로운 설정 사용)
    const createRouteMarkerImage = (type: 'start' | 'end') => {
      const markerType = type === 'start' ? 'routeStart' : 'routeEnd';
      return createMarkerImage(markerType);
    };

  if (scriptError) {
    return (
      <View style={styles.webMapContainer}>
        <Text>Error loading Kakao Map: {scriptError.toString()}</Text>
      </View>
    );
  }

  if (!isLoaded) {
    return (
      <View style={styles.webMapContainer}>
        <Text>Loading Kakao Map...</Text>
      </View>
    );
  }

  return <div ref={mapRef} style={styles.webMapContainer} />;
});

import { kakaoMapWebViewHtml } from "./kakaoMapWebViewSource";

// 모바일 전용 카카오 맵 렌더링 로직 (WebView 사용)
const MobileKakaoMap = React.memo(forwardRef<any, KakaoMapProps>(({
  latitude,
  longitude,
  markers,
  routeResult,
  onMapIdle,
  onMarkerPress,
  style,
  resetMapLevel,
  onResetMapLevelComplete,
  onGetCurrentMapCenter,
}, ref) => {
  const webViewRef = useRef<WebView>(null);
  
  // ref를 webViewRef에 연결하고 onGetCurrentMapCenter 콜백도 노출
  React.useImperativeHandle(ref, () => ({
    ...webViewRef.current,
    getCurrentMapCenter: onGetCurrentMapCenter
  }));
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
      longitude !== undefined &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    ) {
      const script = `
        updateMapCenter(${latitude}, ${longitude});
        true;
      `;
      
      (webViewRef.current as any).latitude = latitude;
      (webViewRef.current as any).longitude = longitude;
      
      webViewRef.current.injectJavaScript(script);
    }
  }, [isMapInitialized, latitude, longitude]);

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
  }, [markers, isMapInitialized]);

  // 경로 표시 Effect (모바일 WebView)
  useEffect(() => {
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }

    updateTimeout.current = setTimeout(() => {
      if (webViewRef.current && htmlContent && isMapInitialized) {
        if (routeResult && routeResult.coordinates && routeResult.coordinates.length > 0) {
          
          // 경로 표시 스크립트
          const script = `
            if (typeof drawRoute === 'function') {
              drawRoute(${JSON.stringify(routeResult)});
            } else {
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
  }, [routeResult, isMapInitialized]);

  // resetMapLevel prop 처리 (모바일 WebView)
  useEffect(() => {
    if (resetMapLevel && webViewRef.current && isMapInitialized) {
      const script = `
        if (typeof map !== 'undefined' && map) {
          map.setLevel(${MAP_CONFIG.CURRENT_LOCATION_LEVEL});
          
          // 지도 레벨 초기화 후 마커 다시 렌더링
          setTimeout(() => {
            if (typeof updateMarkers === 'function') {
              updateMarkers(${JSON.stringify(markers || [])});
            }
          }, 100);
        }
        true;
      `;
      
      webViewRef.current.injectJavaScript(script);
      
      if (onResetMapLevelComplete) {
        onResetMapLevelComplete();
      }
    }
  }, [resetMapLevel, isMapInitialized, onResetMapLevelComplete, markers]);

  if (!htmlContent) {
    return (
      <View style={styles.webview}>
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
        style={[styles.webview, style]}
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
            if (data.type === "map_idle") {
              if (onMapIdle) {
                onMapIdle(data.latitude, data.longitude);
              }
            }
            if (data.type === "marker_press" && onMarkerPress) {
              onMarkerPress(data.id);
            }
            if (data.type === 'map_api_ready') {
              setIsMapApiReady(true);
              setIsMapInitialized(true); // initMap 성공 후 초기화 완료로 설정
            }
            if (data.type === 'get_current_map_center_for_search') {
              console.log('=== WebView에서 메시지 수신 ===');
              console.log('받은 지도 중심:', data.latitude, data.longitude);
              // 현재 지도 중심을 가져와서 검색 함수에 전달
              if ((global as any).handleSearchInAreaWithCurrentCenter) {
                console.log('전역 함수 호출 시도');
                (global as any).handleSearchInAreaWithCurrentCenter({
                  latitude: data.latitude,
                  longitude: data.longitude
                });
              } else {
                console.log('전역 함수가 존재하지 않음');
              }
            }
            if (data.type === 'route_selected') {
              // 길찾기 버튼 클릭 시 처리
              
              // 전역 함수가 등록되어 있으면 호출
              if ((global as any).setRouteLocationFromInfoWindow) {
                const placeInfo: SearchResult = {
                  placeId: data.placeId,
                  placeName: data.placeName,
                  roadAddress: data.roadAddress || '',
                  lotAddress: data.lotAddress || '',
                  lat: data.latitude || 0,
                  lng: data.longitude || 0,
                  phone: data.phone || '',
                  categoryGroupName: data.category || '',
                  placeUrl: data.placeUrl || '',
                  distance: data.distance || 0,
                  roadAddressDong: ""
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
        <View style={styles.modalOverlay}>
          <View style={styles.routeMenuContainer}>
            <Text style={styles.routeMenuTitle}>
              {selectedPlaceInfo?.placeName}
            </Text>
            <Text style={styles.routeMenuSubtitle}>
              길찾기 옵션을 선택하세요
            </Text>
            
            <TouchableOpacity
              style={styles.routeMenuButton}
              onPress={() => {
                if (selectedPlaceInfo && (global as any).setRouteLocationFromInfoWindow) {
                  (global as any).setRouteLocationFromInfoWindow('departure', selectedPlaceInfo);
                  setShowRouteMenu(false);
                }
              }}
            >
              <Text style={styles.routeMenuButtonText}>출발지로 설정</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.routeMenuButton}
              onPress={() => {
                if (selectedPlaceInfo && (global as any).setRouteLocationFromInfoWindow) {
                  (global as any).setRouteLocationFromInfoWindow('arrival', selectedPlaceInfo);
                  setShowRouteMenu(false);
                }
              }}
            >
              <Text style={styles.routeMenuButtonText}>도착지로 설정</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.routeMenuCancelButton}
              onPress={() => setShowRouteMenu(false)}
            >
              <Text style={styles.routeMenuCancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}));

const KakaoMap = forwardRef<any, KakaoMapProps>((props, ref) => {
  
  if (Platform.OS === "web") {
    return <WebKakaoMap {...props} ref={ref} />;
  }
  return <MobileKakaoMap {...props} ref={ref} />;
});

export default KakaoMap;