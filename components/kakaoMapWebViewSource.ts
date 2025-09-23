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
      let map; // Declare map in a wider scope
      let clusterer; // Declare clusterer in a wider scope
      let currentOpenInfowindow = null; // To keep track of the currently open infowindow
      let userLocationMarker = null; // To keep track of the user location marker
      let isUpdatingMarkers = false; // Flag to prevent idle event loop

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
          if (isUpdatingMarkers) return; // Do not send idle event during marker updates
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
          const newCenter = new kakao.maps.LatLng(lat, lng);
          map.setCenter(newCenter);
        }
      }

      function getMarkerImage(type) {
        const imageSrc =
            type === "selected"
                ? "https://velog.velcdn.com/images/daeng_ae/post/616c30b6-ec60-43a4-8df7-ae28ba3a1438/image.png"
                : type === "userLocation"
                ? "https://velog.velcdn.com/images/daeng_ae/post/7ae477a1-4f89-4848-9089-7b0186b280cc/image.png"
                : "https://velog.velcdn.com/images/daeng_ae/post/35b23de1-b1f3-458f-82f5-cbc1bc7c230d/image.png";

        const imageSize = new kakao.maps.Size(36, 36);
        const imageOption = { offset: new kakao.maps.Point(18, 36) };

        return new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
      }

      function updateMarkers(markersData) {
        if (!map || !clusterer) return;

        isUpdatingMarkers = true;

        // Clear existing markers and infowindows
        clusterer.clear();
        if (userLocationMarker) {
            userLocationMarker.setMap(null);
        }
        if (currentOpenInfowindow) {
            currentOpenInfowindow.close();
        }

        const userLocationData = markersData.find(m => m.markerType === 'userLocation');
        const placeMarkersData = markersData.filter(m => m.markerType !== 'userLocation');

        // Handle user location marker immediately
        if (userLocationData) {
            const markerPosition = new kakao.maps.LatLng(userLocationData.lat, userLocationData.lng);
            userLocationMarker = new kakao.maps.Marker({
                position: markerPosition,
                image: getMarkerImage(userLocationData.markerType),
                zIndex: 101
            });
            userLocationMarker.setMap(map);
        }

        // Process place markers in chunks to avoid blocking the UI thread
        if (placeMarkersData && placeMarkersData.length > 0) {
            let index = 0;
            const chunkSize = 50; // Process 50 markers at a time

            function processChunk() {
                const end = Math.min(index + chunkSize, placeMarkersData.length);
                const chunk = placeMarkersData.slice(index, end);

                const kakaoMarkers = chunk.map(markerData => {
                    const markerPosition = new kakao.maps.LatLng(markerData.lat, markerData.lng);
                    const marker = new kakao.maps.Marker({
                        position: markerPosition,
                        image: getMarkerImage(markerData.markerType),
                        zIndex: markerData.markerType === "selected" ? 100 : 1,
                    });

                    const infowindow = new kakao.maps.InfoWindow({
                        content: '<div style="padding:5px;font-size:12px;"><span style="font-weight:bold;">' + markerData.placeName + '</span><br><span>' + (markerData.categoryGroupName || '') + '</span></div>',
                        disableAutoPan: true
                    });

                    kakao.maps.event.addListener(marker, 'click', function() {
                        if (currentOpenInfowindow) {
                            currentOpenInfowindow.close();
                        }
                        infowindow.open(map, marker);
                        currentOpenInfowindow = infowindow;

                        if (markerData.placeId && markerData.markerType !== 'userLocation') {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'marker_press',
                                id: markerData.placeId
                            }));
                        }
                    });
                    return marker;
                });

                // Add markers to the clusterer without redrawing
                clusterer.addMarkers(kakaoMarkers);
                index += chunkSize;

                if (index < placeMarkersData.length) {
                    setTimeout(processChunk, 0); // Schedule the next chunk
                } else {
                    // Last chunk finished
                    setTimeout(() => { isUpdatingMarkers = false; }, 100); 
                }
            }

            setTimeout(processChunk, 0); // Start the process
        } else {
            // No place markers to process
            isUpdatingMarkers = false;
        }
      }

      function mapApiReady() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'map_api_ready'
        }));
      }

      window.onload = function() {
        if (typeof kakao !== 'undefined' && kakao.maps) {
          kakao.maps.load(function() {
            mapApiReady();
          });
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