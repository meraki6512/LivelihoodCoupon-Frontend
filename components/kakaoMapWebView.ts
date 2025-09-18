export const kakaoMapWebViewHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=KAKAO_MAP_JS_KEY_PLACEHOLDER&libraries=services,clusterer"></script>
    <style>
      body { margin: 0; padding: 0; height: 100%; }
      html { height: 100%; }
      #map { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      let map; // Declare map in a wider scope
      let clusterer; // Declare clusterer in a wider scope
      let markers = []; // To keep track of markers

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

        kakao.maps.event.addListener(map, 'center_changed', function() {
          const latlng = map.getCenter();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'center_changed',
            latitude: latlng.getLat(),
            longitude: latlng.getLng()
          }));
        });
      }

      function updateMapCenter(lat, lng) {
        if (map) {
          const newCenter = new kakao.maps.LatLng(lat, lng);
          map.setCenter(newCenter);
        }
      }

      function updateMarkers(markersData) {
        if (map && clusterer) {
          // Clear existing markers
          clusterer.clear();
          markers = [];

          if (markersData && markersData.length > 0) {
            const kakaoMarkers = markersData.map(markerData => {
              const markerPosition = new kakao.maps.LatLng(markerData.latitude, markerData.longitude);
              const marker = new kakao.maps.Marker({ position: markerPosition });
              const infowindow = new kakao.maps.InfoWindow({ content: '<div style="padding:5px;font-size:12px;">' + markerData.place_name + '</div>' });
              kakao.maps.event.addListener(marker, 'mouseover', function() { infowindow.open(map, marker); });
              kakao.maps.event.addListener(marker, 'mouseout', function() { infowindow.close(); });
              kakao.maps.event.addListener(marker, 'click', function() {
                if (markerData.id) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'marker_press', id: markerData.id
                  }));
                }
              });
              return marker;
            });
            clusterer.addMarkers(kakaoMarkers);
            markers = kakaoMarkers; // Store for future clearing
          }
        }
      }

      window.onload = function() {
        if (typeof kakao !== 'undefined' && kakao.maps) {
          // Initial map creation will be triggered from RN side
        } else {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: 'Kakao Maps SDK not available in WebView'
          }));
        }
      };

    </script>
  </body>
</html>
`;