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

          // markerImages 초기화 로직
          markerImages = {
            default: new kakao.maps.MarkerImage(
              createDotMarkerImage(false),
              new kakao.maps.Size(16, 16), // New size
              { offset: new kakao.maps.Point(8, 8) } // New offset (size / 2)
            ),
            selected: new kakao.maps.MarkerImage(
              createDotMarkerImage(true),
              new kakao.maps.Size(24, 24), // New size
              { offset: new kakao.maps.Point(12, 12) } // New offset (size / 2)
            ),
            userLocation: new kakao.maps.MarkerImage(
              'MARKER_IMAGE_USER_LOCATION_PLACEHOLDER',
              new kakao.maps.Size(36, 36),
              { offset: new kakao.maps.Point(18, 36) }
            )
          };

        } catch (e) {
          console.error('Error creating Kakao Map instance:', e);
          return;
        }

        clusterer = new kakao.maps.MarkerClusterer({
          map: map,
          averageCenter: true,
          minLevel: 7,
        });

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
          map.setCenter(new kakao.maps.LatLng(lat, lng));
        }
      }

      function updateMapCenterWithMarkers(lat, lng, markersData) {
        if (map) {
          const newCenter = new kakao.maps.LatLng(lat, lng);
          map.setCenter(newCenter);

          if (markersData && markersData.length > 0) {
            if (markersData.length > 1) {
              const bounds = new kakao.maps.LatLngBounds();
              markersData.forEach(marker => {
                bounds.extend(new kakao.maps.LatLng(marker.lat, marker.lng));
              });
              map.setBounds(bounds);
            } else if (markersData.length === 1) {
              // 단일 마커의 경우, 적절한 줌 레벨 설정 (예: 3)
              map.setLevel(3);
            } else {
              // 마커가 없는 경우, 기본 줌 레벨 설정 (예: 5)
              map.setLevel(5);
            }
          }
        }
      }

      function createDotMarkerImage(isSelected) {
        const size = isSelected ? 24 : 16; // 선택됨 24px, 기본 16px
        const borderWidth = isSelected ? 2 : 1;
        const fillColor = isSelected ? '#FF385C' : '#007bff'; // 선택됨 빨간색, 기본 파란색
        const borderColor = '#fff'; // 흰색 테두리
        const svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">' +
                    '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + ((size - borderWidth * 2) / 2) + '" fill="' + fillColor + '" stroke="' + borderColor + '" stroke-width="' + borderWidth + '"/>' +
                    '</svg>';
        return 'data:image/svg+xml;base64,' + btoa(svg); // 수정됨
      }

      let markerImages;

      function updateMarkers(markersData) {
        try {
          if (!map || !clusterer) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Map or clusterer not initialized in updateMarkers.' }));
            return;
          }

          clusterer.clear();
          if (userLocationMarker) {
              userLocationMarker.setMap(null);
          }

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
                      // 기존 InfoWindow 제거
                      if (infoWindowOverlay) {
                          infoWindowOverlay.setMap(null);
                      }
                      
                      // InfoWindow 표시
                      showInfoWindow(markerData);
                      
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'marker_press',
                          id: markerData.placeId
                      }));
                  });
                  return marker;
              });
              clusterer.addMarkers(kakaoMarkers);
          }
        } catch (e) {
          console.error('Error in updateMarkers:', e);
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
              <button onclick="selectRouteLocation('\${markerData.placeId}', '\${markerData.placeName}')" style="
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
        window.selectRouteLocation = function(placeId, placeName) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'route_selected',
            placeId: placeId,
            placeName: placeName
          }));
          closeInfoWindow();
        };

        // CustomOverlay 생성
        infoWindowOverlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(markerData.lat, markerData.lng),
          content: infoWindowContent,
          yAnchor: 1.1, // 마커 위쪽에 배치
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

      // 경로 표시 함수
      function drawRoute(routeResult) {
        try {
          console.log('drawRoute 호출됨:', routeResult);
          
          if (!map) {
            console.error('Map instance not available');
            return;
          }

          // 기존 경로 요소들 제거
          clearRoute();

          if (!routeResult || !routeResult.coordinates || routeResult.coordinates.length === 0) {
            console.log('경로 데이터가 없습니다');
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

          // 4. 경로 전체가 보이도록 지도 범위 조정
          const bounds = new kakao.maps.LatLngBounds();
          path.forEach(point => bounds.extend(point));
          map.setBounds(bounds);
          
          console.log('경로 표시 완료');
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
          console.log('경로 제거 완료');
        } catch (error) {
          console.error('clearRoute 오류:', error);
        }
      }

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
          imageSrc = \`data:image/svg+xml;base64,\${btoa(svg)}\`;
        } else {
          // 도착지 마커 (빨간색 원)
          const svg = \`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#dc3545" stroke="#fff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">E</text>
            </svg>
          \`;
          imageSrc = \`data:image/svg+xml;base64,\${btoa(svg)}\`;
        }
        
        return new kakao.maps.MarkerImage(imageSrc, size, { offset });
      }

    </script>  </body>
</html>
`;