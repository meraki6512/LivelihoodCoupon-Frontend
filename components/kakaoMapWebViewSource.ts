export const kakaoMapWebViewHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=KAKAO_MAP_JS_KEY_PLACEHOLDER&libraries=services,clusterer&autoload=false"></script>
    <style>
      body { margin: 0; padding: 0; height: 100%; }
      html { height: 100%; }
      #map { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      let map;
      let clusterer;
      let userLocationMarker = null;
      let infoWindowOverlay = null;
      let markerImages = null;

      function initMap(lat, lng) {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
          return;
        }
        const mapOption = {
          center: new kakao.maps.LatLng(lat, lng),
          level: 3,
          maxLevel: 14,
        };
        try {
          map = new kakao.maps.Map(mapContainer, mapOption);
          
          // 지도 초기화 완료 (마커는 updateMarkers에서 처리)

          // markerImages 초기화 로직
          markerImages = {
            default: new kakao.maps.MarkerImage(
              createDotMarkerImage(false),
              new kakao.maps.Size(16, 16),
              { offset: new kakao.maps.Point(8, 8) }
            ),
            selected: new kakao.maps.MarkerImage(
              createDotMarkerImage(true),
              new kakao.maps.Size(24, 24),
              { offset: new kakao.maps.Point(12, 12) }
            ),
            userLocation: new kakao.maps.MarkerImage(
              'MARKER_IMAGE_USER_LOCATION_PLACEHOLDER',
              new kakao.maps.Size(28, 28),
              { offset: new kakao.maps.Point(14, 14) }
            )
          };

        } catch (e) {
          console.error('Error creating Kakao Map instance:', e);
          return;
        }

        try {
          clusterer = new kakao.maps.MarkerClusterer({
            map: map,
            averageCenter: true,
            minLevel: 7,
          });
          // 클러스터 초기화 성공
        } catch (clusterError) {
          // 클러스터 초기화 실패
          // 클러스터 없이도 작동하도록 설정
          clusterer = null;
        }

        kakao.maps.event.addListener(map, 'idle', function() {
          const latlng = map.getCenter();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'map_idle',
            latitude: latlng.getLat(),
            longitude: latlng.getLng()
          }));
        });
      }

function updateMapCenter(lat, lng) {
  if (map) {
    const moveLatLon = new kakao.maps.LatLng(lat, lng);
    map.setCenter(moveLatLon);
    
    setTimeout(() => {
      const actualCenter = map.getCenter();
    }, 100);
  }
}



      function createDotMarkerImage(isSelected) {
        const size = isSelected ? 24 : 16;
        const borderWidth = isSelected ? 2 : 1;
        const fillColor = isSelected ? '#FF385C' : '#007bff';
        const borderColor = '#fff';
        const svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">' +
                    '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + ((size - borderWidth * 2) / 2) + '" fill="' + fillColor + '" stroke="' + borderColor + '" stroke-width="' + borderWidth + '"/>' +
                    '</svg>';
        return 'data:image/svg+xml;base64,' + btoa(svg);
      }

      function updateMarkers(markersData) {
        try {
          if (!map) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Map not initialized in updateMarkers.' }));
            return;
          }
          
          // markerImages 초기화 (한 번만)
          if (!markerImages) {
            markerImages = {
              default: new kakao.maps.MarkerImage(
                createDotMarkerImage(false),
                new kakao.maps.Size(16, 16),
                { offset: new kakao.maps.Point(8, 8) }
              ),
              selected: new kakao.maps.MarkerImage(
                createDotMarkerImage(true),
                new kakao.maps.Size(24, 24),
                { offset: new kakao.maps.Point(12, 12) }
              ),
              userLocation: new kakao.maps.MarkerImage(
                'MARKER_IMAGE_USER_LOCATION_PLACEHOLDER',
                new kakao.maps.Size(28, 28),
                { offset: new kakao.maps.Point(14, 14) }
              )
            };
          }
          
          // 현재 마커 데이터 저장
          window.currentMarkers = markersData;
          if (clusterer) {
            clusterer.clear();
          } else if (window.existingMarkers) {
            window.existingMarkers.forEach(marker => marker.setMap(null));
            window.existingMarkers = [];
          }
          
          if (userLocationMarker) {
            userLocationMarker.setMap(null);
          }

          // 마커 데이터 분리
          const userLocationData = markersData.find(m => m.markerType === 'userLocation');
          const placeMarkersData = markersData.filter(m => m.markerType !== 'userLocation');
          if (userLocationData) {
            userLocationMarker = new kakao.maps.Marker({
              position: new kakao.maps.LatLng(userLocationData.lat, userLocationData.lng),
              image: markerImages.userLocation,
              zIndex: 101
            });
            userLocationMarker.setMap(map);
          }

          if (placeMarkersData && placeMarkersData.length > 0) {
            const kakaoMarkers = placeMarkersData.map(markerData => {
              const isSelected = markerData.markerType === 'selected';
              const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(markerData.lat, markerData.lng),
                image: isSelected ? markerImages.selected : markerImages.default,
                zIndex: isSelected ? 100 : 1,
              });

              kakao.maps.event.addListener(marker, 'click', function() {
                if (infoWindowOverlay) {
                  infoWindowOverlay.setMap(null);
                }
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'marker_press',
                  id: markerData.placeId
                }));
              });
              return marker;
            });
            
            if (clusterer) {
              clusterer.addMarkers(kakaoMarkers);
            } else {
              kakaoMarkers.forEach(marker => marker.setMap(map));
              window.existingMarkers = kakaoMarkers;
            }
          }
        } catch (e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Error in updateMarkers: ' + e.message }));
        }
      }

      function showInfoWindow(markerData) {
        // 모바일 화면 크기에 맞게 너비 계산
        const screenWidth = window.innerWidth;
        const infoWindowWidth = Math.min(270, screenWidth - 70);
        
        // InfoWindow HTML 콘텐츠 생성
        const infoWindowContent = \`
          <div style="
            position: relative;
            background-color: white;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            font-size: 13px;
            color: #333;
            width: \${infoWindowWidth}px;
            border: 1px solid #ddd;
            z-index: 1000;
            max-width: 65vw;
          ">
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
            ">
              <h3 style="
                margin: 0;
                font-size: 16px;
                font-weight: bold;
                flex: 1;
              ">\${markerData.placeName}</h3>
              <button onclick="closeInfoWindow()" style="
                background: none;
                border: none;
                font-size: 23px;
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
                <span style="margin-left: 14px;">\${markerData.roadAddress || markerData.lotAddress || '-'}</span>
              </div>
              <div style="margin-bottom: 6px; display: flex; align-items: center;">
                <span style="min-width: 50px; font-weight: 500;">전화</span>
                <span style="color: #28a745; margin-left: 14px;">\${markerData.phone || '-'}</span>
              </div>
              <div style="margin-bottom: 6px; display: flex; align-items: center;">
                <span style="min-width: 50px; font-weight: 500;">카테고리</span>
                <span style="margin-left: 14px;">\${markerData.categoryGroupName || '-'}</span>
              </div>
              \${markerData.placeUrl ? \`
                <div style="margin-bottom: 6px; display: flex; align-items: center;">
                  <span style="min-width: 50px; font-weight: 500;">상세보기</span>
                  <a href="\${markerData.placeUrl}" target="_blank" style="color: #007bff; margin-left: 14px;">카카오맵에서 보기</a>
                </div>
              \` : ''}
            </div>
            
            <div style="
              position: absolute;
              bottom: 15px;
              right: 13px;
            ">
              <button onclick="selectRouteLocation('\${markerData.placeId}', '\${markerData.placeName}', \${markerData.lat}, \${markerData.lng})")" style="
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 4px 8px;
                font-size: 11px;
                cursor: pointer;
                font-size: 12px;
                min-width: 48px;
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
        \`;

        // InfoWindow 닫기 함수
        window.closeInfoWindow = function() {
          if (infoWindowOverlay) {
            infoWindowOverlay.setMap(null);
            infoWindowOverlay = null;
          }
        };

        // 길찾기 함수
        window.selectRouteLocation = function(placeId, placeName, lat, lng) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'route_selected',
            placeId: placeId,
            placeName: placeName,
            latitude: lat,
            longitude: lng
          }));
          closeInfoWindow();
        };

        // CustomOverlay 생성
        infoWindowOverlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(markerData.lat, markerData.lng),
          content: infoWindowContent,
          yAnchor: 1.1,
          zIndex: 1000,
        });

        // InfoWindow 표시
        infoWindowOverlay.setMap(map);
      }

      function mapApiReady() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_api_ready' }));
      }

      // 경로 표시 관련 전역 변수
      let routePolyline = null;
      let routeStartMarker = null;
      let routeEndMarker = null;

      // 경로 마커 이미지 생성 함수
      function createRouteMarkerImage(type) {
        const size = new kakao.maps.Size(32, 32);
        const offset = new kakao.maps.Point(16, 32);
        
        let imageSrc;
        if (type === 'start') {
          // 출발지 마커 (녹색 원)
          const svg = \`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#28a745" stroke="#fff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">S</text>
            </svg>
          \`;
          imageSrc = 'data:image/svg+xml;base64,' + btoa(svg);
        } else {
          // 도착지 마커 (빨간색 원)
          const svg = \`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#dc3545" stroke="#fff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">E</text>
            </svg>
          \`;
          imageSrc = 'data:image/svg+xml;base64,' + btoa(svg);
        }
        
        return new kakao.maps.MarkerImage(imageSrc, size, { offset });
      }

      // 경로 표시 함수
      function drawRoute(routeResult) {
        try {
          // drawRoute 호출됨
          
          if (!map) {
            console.error('Map instance not available');
            return;
          }

          // 기존 경로 요소들 제거
          clearRoute();

          if (!routeResult || !routeResult.coordinates || routeResult.coordinates.length === 0) {
            // 경로 데이터가 없습니다
            return;
          }

          // 1. 경로 라인 그리기
                    const path = routeResult.coordinates.map(coord => 
            new kakao.maps.LatLng(coord.lat, coord.lon)
          );
          
          routePolyline = new kakao.maps.Polyline({
            map: map,
            path: path,
            strokeWeight: 5,
            strokeColor: '#FF385C',
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            zIndex: 50
          });

          // 2. 출발지 마커 표시
          if (routeResult.steps && routeResult.steps.length > 0) {
            const startStep = routeResult.steps[0];
            const startPosition = new kakao.maps.LatLng(
              startStep.startLocation.lat, 
              startStep.startLocation.lon
            );
            
            routeStartMarker = new kakao.maps.Marker({
              position: startPosition,
              image: createRouteMarkerImage('start'),
              zIndex: 200
            });
            routeStartMarker.setMap(map);
          }

          // 3. 도착지 마커 표시
          if (routeResult.steps && routeResult.steps.length > 0) {
            const endStep = routeResult.steps[routeResult.steps.length - 1];
            const endPosition = new kakao.maps.LatLng(
              endStep.endLocation.lat, 
              endStep.endLocation.lon
            );
            
            routeEndMarker = new kakao.maps.Marker({
              position: endPosition,
              image: createRouteMarkerImage('end'),
              zIndex: 200
            });
            routeEndMarker.setMap(map);
          }

          // 4. 경로 안내 중심 좌표를 기준으로 지도 중심 설정
          const screenHeight = window.innerHeight;
          const routePanelHeight = screenHeight * 0.25; // 25% 가정
          const targetPosition = routePanelHeight + (screenHeight - routePanelHeight) / 2;
          
          // 경로 안내 중심 좌표 계산 (출발지와 도착지의 중점)
          const startStep = routeResult.steps[0];
          const endStep = routeResult.steps[routeResult.steps.length - 1];
          const centerLat = (startStep.startLocation.lat + endStep.endLocation.lat) / 2;
          const centerLng = (startStep.startLocation.lon + endStep.endLocation.lon) / 2;
          
          // 경로 안내 중심을 목표 위치에 맞춰서 지도 중심 조정
          const offsetLat = (targetPosition / screenHeight - 0.5) * 0.01; // 임시 오프셋
          const adjustedCenter = new kakao.maps.LatLng(
            centerLat + offsetLat,
            centerLng
          );
          
          map.setCenter(adjustedCenter);
          
          // 경로 표시 완료
        } catch (error) {
          console.error('drawRoute 오류:', error);
        }
      }

      // 경로 제거 함수
      function clearRoute() {
        try {
          if (routePolyline) {
            routePolyline.setMap(null);
            routePolyline = null;
          }
          if (routeStartMarker) {
            routeStartMarker.setMap(null);
            routeStartMarker = null;
          }
          if (routeEndMarker) {
            routeEndMarker.setMap(null);
            routeEndMarker = null;
          }
          // 경로 제거 완료
        } catch (error) {
          console.error('clearRoute 오류:', error);
        }
      }

      // 검색 결과 마커들 제거 함수
      function clearSearchMarkers() {
        try {
          if (clusterer) {
            clusterer.clear();
          }
          // 검색 결과 마커들 제거 완료
        } catch (error) {
          console.error('clearSearchMarkers 오류:', error);
        }
      }

        // 검색 결과에 맞는 줌 레벨 조정 함수
        function adjustZoomForSearchResults() {
          try {
            if (!map) {
              console.error('Map instance not available');
              return;
            }

            // 검색 결과에 적합한 고정 줌 레벨 설정
            // 6레벨: 적당한 범위로 검색 결과들이 잘 보이도록 설정
            const targetLevel = 6;
            
            console.log('=== 검색 결과 줌 레벨 조정 ===');
            console.log('현재 줌 레벨:', map.getLevel());
            console.log('목표 줌 레벨:', targetLevel);
            
            // 줌 레벨 변경
            map.setLevel(targetLevel);
            
            console.log('줌 레벨 조정 완료');
            
          } catch (error) {
            console.error('adjustZoomForSearchResults 오류:', error);
          }
        }

        // 길찾기 결과에 맞는 줌 레벨 조정 함수
        function adjustZoomForRouteResults() {
          try {
            if (!map) {
              console.error('Map instance not available');
              return;
            }

            // 경로 거리에 따른 동적 줌 레벨 계산
            const routeDistance = window.currentRouteResult?.totalDistance || 1000; // 미터 단위
            let targetLevel;
            
            if (routeDistance < 1000) {
              targetLevel = 10;
            } else if (routeDistance < 1500) {
              targetLevel = 5;
            } else if (routeDistance < 2000) {
              targetLevel = 4;
            } else if (routeDistance < 2500) {
              targetLevel = 3;
            } else if (routeDistance < 3000) {
              targetLevel = 2;
            } else {
              targetLevel = 1;
            }
            
            console.log('=== 길찾기 결과 줌 레벨 조정 ===');
            console.log('경로 거리:', routeDistance, 'm');
            console.log('경로 거리 (km):', (routeDistance / 1000).toFixed(2), 'km');
            console.log('현재 줌 레벨:', map.getLevel());
            console.log('목표 줌 레벨:', targetLevel);
            console.log('거리 구간:', routeDistance < 1000 ? '1km 미만' : routeDistance < 4000 ? '1km-4km' : '4km 이상');
            
            // 줌 레벨 변경
            map.setLevel(targetLevel);
            
            console.log('길찾기 줌 레벨 조정 완료');
            
          } catch (error) {
            console.error('adjustZoomForRouteResults 오류:', error);
          }
        }

        // 상세 바텀시트를 고려한 지도 중심 조정 함수 (간소화)
        function adjustMapCenterForDetailSheet(detailSheetHeightRatio = 0.6) {
        try {
          if (!map) {
            console.error('Map instance not available');
            return;
          }
          
          // 현재 지도 중심을 원래 위치로 저장 (복원용)
          if (!window.originalMapCenter) {
            window.originalMapCenter = map.getCenter();
          }

          const screenHeight = window.innerHeight;
          const bottomSheetHeight = screenHeight * detailSheetHeightRatio;
          const currentCenter = map.getCenter();
          const centerLat = currentCenter.getLat();
          const centerLng = currentCenter.getLng();
          
          // 간소화된 오프셋 계산
          const offsetPixels = screenHeight - bottomSheetHeight;
          const routeDistance = window.currentRouteResult?.totalDistance || 1000;
          const distanceFactor = Math.min(routeDistance / 1000, 3);
          const visibleRatio = (screenHeight - bottomSheetHeight) / screenHeight;
          const ratioFactor = Math.max(0.5, visibleRatio);
          const combinedFactor = distanceFactor * ratioFactor;
          const additionalOffset = screenHeight * 0.15 * 0.00001;
          const offsetLat = (offsetPixels * 0.00001 * combinedFactor) + additionalOffset;
          
          const adjustedCenter = new kakao.maps.LatLng(
            centerLat - offsetLat,
            centerLng
          );
          
          map.setCenter(adjustedCenter);
          
        } catch (error) {
          console.error('adjustMapCenterForDetailSheet 오류:', error);
        }
      }

      // 바텀시트가 접힐 때 지도 중심을 원래 위치로 복원
      window.restoreMapCenterForBottomSheet = function() {
        try {
          console.log('=== 바텀시트 접힘 - 지도 중심 복원 시작 ===');
          
          // 이전에 저장된 원래 지도 중심이 있다면 복원
          if (window.originalMapCenter) {
            console.log('원래 지도 중심으로 복원:', window.originalMapCenter.getLat(), window.originalMapCenter.getLng());
            map.setCenter(window.originalMapCenter);
            
            // 복원 후 확인
            setTimeout(() => {
              console.log('=== 지도 중심 복원 후 ===');
              console.log('복원된 지도 중심:', map.getCenter().getLat(), map.getCenter().getLng());
            }, 100);
          } else {
            console.log('저장된 원래 지도 중심이 없음 - 복원 불가');
          }
          
        } catch (error) {
          console.error('restoreMapCenterForBottomSheet 오류:', error);
        }
      }

      // 모든 검색 결과 마커 숨기기 (길찾기/상세안내 모드용)
      window.hideAllSearchMarkers = function() {
        try {
          console.log('=== 모든 검색 결과 마커 숨김 ===');
          
          // 검색 결과 마커들 숨기기
          if (window.searchMarkers && window.searchMarkers.length > 0) {
            window.searchMarkers.forEach(marker => {
              marker.setMap(null);
            });
            console.log('검색 결과 마커 개수:', window.searchMarkers.length, '개 숨김');
          }
          
          // 검색 결과 마커 배열 초기화
          window.searchMarkers = [];
          
          // 선택된 장소 마커도 숨기기 (길찾기 모드에서는 필요 없음)
          if (window.selectedMarker) {
            window.selectedMarker.setMap(null);
            window.selectedMarker = null;
            console.log('선택된 장소 마커 숨김');
          }
          
          // 추가로 모든 마커를 강제로 숨기기
          if (window.allMarkers && window.allMarkers.length > 0) {
            window.allMarkers.forEach(marker => {
              marker.setMap(null);
            });
            console.log('전체 마커 개수:', window.allMarkers.length, '개 숨김');
            window.allMarkers = [];
          }
          
          console.log('=== 검색 결과 마커 숨김 완료 ===');
          
        } catch (error) {
          console.error('hideAllSearchMarkers 오류:', error);
        }
      }



    </script>  </body>
</html>
`;