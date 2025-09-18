import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Platform, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";
import { KAKAO_MAP_JS_KEY } from "@env";

type MarkerData = {
  latitude: number;
  longitude: number;
  place_name: string;
};

type KakaoMapProps = {
  latitude: number;
  longitude: number;
  style?: ViewStyle;
  markers?: MarkerData[];
  onMapCenterChange?: (latitude: number, longitude: number) => void; // 콜백 prop 추가
};

// 웹 전용 Kakao Map 렌더링 로직
const WebKakaoMap = ({
  latitude,
  longitude,
  markers,
  onMapCenterChange,
}: KakaoMapProps) => {
  // onMapCenterChange prop 받도록 수정
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null); // 지도 인스턴스를 저장할 ref
  const currentMarkers = useRef<any[]>([]); // 현재 지도에 표시된 마커들을 저장할 ref
  const clustererInstance = useRef<any>(null); // 마커 클러스터러 인스턴스를 저장할 ref

  // Effect for initial map creation and event listeners
  useEffect(() => {
    if (mapRef.current) {
      const createMap = () => {
        if (window.kakao && window.kakao.maps) {
          const mapContainer = mapRef.current;
          const mapOption = {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 3,
            maxLevel: 14, // Add maxLevel for almost unlimited zoom-out
          };
          const map = new window.kakao.maps.Map(mapContainer, mapOption);
          mapInstance.current = map;

          window.kakao.maps.event.addListener(
            map,
            "center_changed",
            function () {
              const latlng = map.getCenter();
              onMapCenterChange &&
                onMapCenterChange(latlng.getLat(), latlng.getLng());
            }
          );

          // Marker Clusterer setup
          const clusterer = new window.kakao.maps.MarkerClusterer({
            map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체
            averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커로 표시
            minLevel: 7,
          });
          clustererInstance.current = clusterer; // Store clusterer instance

          // Initial markers (if any)
          if (markers) {
            const kakaoMarkers = markers.map((markerData) => {
              const markerPosition = new window.kakao.maps.LatLng(
                markerData.latitude,
                markerData.longitude
              );
              const marker = new window.kakao.maps.Marker({
                position: markerPosition,
              });
              const infowindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:12px;">${markerData.place_name}</div>`,
              });
              window.kakao.maps.event.addListener(
                marker,
                "mouseover",
                function () {
                  infowindow.open(map, marker);
                }
              );
              window.kakao.maps.event.addListener(
                marker,
                "mouseout",
                function () {
                  infowindow.close();
                }
              );
              return marker;
            });
            clusterer.addMarkers(kakaoMarkers);
          }
        } else {
          const script = document.createElement("script");
          script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_JS_KEY}&libraries=services,clusterer&autoload=false`;
          script.async = true;
          document.head.appendChild(script);

          script.onload = () => {
            window.kakao.maps.load(() => {
              if (window.kakao.maps.MarkerClusterer) {
                // Check for MarkerClusterer
                createMap();
              } else {
                console.error("Kakao Maps MarkerClusterer library not loaded.");
              }
            });
          };
        }
      };

      if (window.kakao && window.kakao.maps) {
        if (window.kakao.maps.MarkerClusterer) {
          // Check for MarkerClusterer
          createMap();
        } else {
          console.error("Kakao Maps MarkerClusterer library not loaded.");
        }
      } else {
        // This block handles the initial script loading if Kakao Maps is not yet available
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_JS_KEY}&libraries=services,clusterer&autoload=false`;
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
          window.kakao.maps.load(() => {
            if (window.kakao.maps.MarkerClusterer) {
              // Check for MarkerClusterer
              createMap();
            } else {
              console.error("Kakao Maps MarkerClusterer library not loaded.");
            }
          });
        };
      }
    }
  }, []); // Run only once on mount

  // Effect for updating map center when latitude/longitude props change
  useEffect(() => {
    if (
      mapInstance.current &&
      latitude !== undefined &&
      longitude !== undefined
    ) {
      const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
      mapInstance.current.setCenter(newCenter);
    }
  }, [latitude, longitude]); // Update when latitude or longitude props change

  // Effect for updating markers when markers prop changes
  useEffect(() => {
    if (mapInstance.current) {
      console.log(
        "WebKakaoMap: Updating markers. clustererInstance.current:",
        clustererInstance.current
      ); // Add this line
      // Clear existing markers from clusterer
      if (clustererInstance.current) {
        clustererInstance.current.clear();
      }
      currentMarkers.current = []; // Clear stored individual markers

      if (markers && markers.length > 0) {
        const kakaoMarkers = markers.map((markerData) => {
          const markerPosition = new window.kakao.maps.LatLng(
            markerData.latitude,
            markerData.longitude
          );
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
          });
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;">${markerData.place_name}</div>`,
          });
          window.kakao.maps.event.addListener(marker, "mouseover", function () {
            infowindow.open(mapInstance.current, marker);
          });
          window.kakao.maps.event.addListener(marker, "mouseout", function () {
            infowindow.close();
          });
          currentMarkers.current.push(marker); // Store individual marker instance
          return marker;
        });
        if (clustererInstance.current) {
          clustererInstance.current.addMarkers(kakaoMarkers);
        }
      }
    }
  }, [markers]); // Update when markers prop changes

  return <div ref={mapRef} style={styles.webMapContainer} />;
};

// 모바일 전용 Kakao Map 렌더링 로직 (WebView 사용)
const MobileKakaoMap = ({
  latitude,
  longitude,
  markers,
  onMapCenterChange,
}: KakaoMapProps) => {
  const webViewRef = useRef<WebView>(null); // Add this line
  // onMapCenterChange prop 받도록 수정
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_JS_KEY}&libraries=services,clusterer"></script>
        <style>
          body { margin: 0; padding: 0; height: 100%; }
          html { height: 100%; }<div id="map"></div>
        <script>
          let map; // Declare map in a wider scope
          function initMap(lat, lng) {
            const mapContainer = document.getElementById('map');
            const mapOption = {
              center: new kakao.maps.LatLng(lat, lng),
              level: 3,
              maxLevel: 14, // Add maxLevel for almost unlimited zoom-out
            };
            map = new kakao.maps.Map(mapContainer, mapOption);

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

          let clusterer; // Declare clusterer in a wider scope for MobileKakaoMap

          function initMap(lat, lng) {
            const mapContainer = document.getElementById('map');
            const mapOption = {
              center: new kakao.maps.LatLng(lat, lng),
              level: 3,
              maxLevel: 14, // Add maxLevel for almost unlimited zoom-out
            };
            map = new kakao.maps.Map(mapContainer, mapOption);

            clusterer = new kakao.maps.MarkerClusterer({
              map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체
              averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커로 표시
              minLevel: 7, // Changed from 10 to 7
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

          function updateMarkers(markersData) {
            if (map) { // Removed '&& clusterer'
              console.log('MobileKakaoMap: Updating markers. clusterer:', clusterer); // Add this line
              // Temporarily disable clustering for debugging
              // if (clusterer) {
              //   clusterer.clear();
              // }
              // Clear existing markers (assuming currentMarkers is available in this scope)
              // This part needs to be handled carefully as currentMarkers is not directly accessible here.
              // For now, let's just add directly. This might lead to duplicate markers if not handled carefully.

              if (markersData && markersData.length > 0) {
                markersData.forEach(markerData => {
                  const markerPosition = new kakao.maps.LatLng(markerData.latitude, markerData.longitude);
                  const marker = new kakao.maps.Marker({ position: markerPosition, map: map }); // Add directly to map
                  const infowindow = new kakao.maps.InfoWindow({ content: '<div style="padding:5px;font-size:12px;">' + markerData.place_name + '</div>' });
                  kakao.maps.event.addListener(marker, 'mouseover', function() { infowindow.open(map, marker); });
                  kakao.maps.event.addListener(marker, 'mouseout', function() { infowindow.close(); });
                });
                // if (clusterer) {
                //   clusterer.addMarkers(kakaoMarkers);
                // }
              }
            }
          }

          window.onload = function() {
            console.log('Kakao Map API Loaded');
            if (typeof kakao !== 'undefined' && kakao.maps) {
              console.log('Kakao Maps is available');
              // Initial map creation will be triggered from RN side
            } else {
              console.error('Kakao Maps is not available');
            }
          };

        </script>
      </body>
    </html>
  `;

  // Effect to initialize map and update center/markers
  useEffect(() => {
    if (
      webViewRef.current &&
      latitude !== undefined &&
      longitude !== undefined
    ) {
      const script = `initMap(${latitude}, ${longitude}); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  }, [latitude, longitude]); // Re-run when latitude or longitude changes to re-initialize or set center

  useEffect(() => {
    if (webViewRef.current && markers) {
      const script = `updateMarkers(${JSON.stringify(markers)}); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  }, [markers]);

  return (
    <WebView
      ref={webViewRef} // Assign ref to WebView
      originWhitelist={["*"]}
      source={{ html: htmlContent }}
      style={styles.webview}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      onLoad={() => console.log("WebView loaded successfully")}
      onError={(e) => console.error("WebView error: ", e.nativeEvent)}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === "center_changed" && onMapCenterChange) {
            onMapCenterChange(data.latitude, data.longitude);
          }
        } catch (e) {
          console.error("Failed to parse WebView message:", e);
        }
      }}
    />
  );
};

const KakaoMap: React.FC<KakaoMapProps> = (props) => {
  if (Platform.OS === "web") {
    return <WebKakaoMap {...props} />;
  }
  return <MobileKakaoMap {...props} />;
};

const styles = StyleSheet.create({
  webMapContainer: {
    flex: 1,
    width: "100%",
  },
  webview: {
    flex: 1,
    width: "100%",
  },
});

export default KakaoMap;
