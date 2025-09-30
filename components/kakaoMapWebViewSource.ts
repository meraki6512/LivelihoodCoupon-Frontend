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

      function initMap(lat, lng) {
        const mapContainer = document.getElementById('map');
        const mapOption = {
          center: new kakao.maps.LatLng(lat, lng),
          level: 3,
          maxLevel: 14,
        };
        map = new kakao.maps.Map(mapContainer, mapOption);

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

      function createDotMarkerImage(isSelected) {
        const size = isSelected ? 24 : 16; // Selected 24px, Default 16px
        const borderWidth = isSelected ? 2 : 1;
        const fillColor = isSelected ? '#FF385C' : '#007bff'; // Red for selected, Blue for default
        const borderColor = '#fff'; // White border for both
        const svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">' +
                    '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + ((size - borderWidth * 2) / 2) + '" fill="' + fillColor + '" stroke="' + borderColor + '" stroke-width="' + borderWidth + '"/>' +
                    '</svg>';
        return 'data:image/svg+xml;base64,' + btoa(svg); // Corrected
      }

      const markerImages = {
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

      function updateMarkers(markersData) {
        if (!map || !clusterer) return;

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
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'marker_press',
                        id: markerData.placeId
                    }));
                });
                return marker;
            });
            clusterer.addMarkers(kakaoMarkers);
        }
      }

      function mapApiReady() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_api_ready' }));
      }

      window.onload = function() {
        if (typeof kakao !== 'undefined' && kakao.maps) {
          kakao.maps.load(function() { mapApiReady(); });
        } else {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Kakao Maps SDK not available' }));
        }
      };
    </script>  </body>
</html>
`;