import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Platform, ViewStyle, Text } from "react-native";
import { WebView } from "react-native-webview";
import { KAKAO_MAP_JS_KEY } from "@env";
import { useKakaoMapScript } from "../hooks/useKakaoMapScript";

import { MarkerData, KakaoMapProps } from "../types/kakaoMap";
import { styles } from "./KakaoMap.styles";

// 웹 전용 Kakao Map 렌더링 로직
const WebKakaoMap = ({
  latitude,
  longitude,
  markers,
  onMapCenterChange,
  onMarkerPress,
}: KakaoMapProps) => {
  const { isLoaded, error: scriptError } = useKakaoMapScript();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const clustererInstance = useRef<any>(null);

  // Effect for initial map creation and event listeners
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

      window.kakao.maps.event.addListener(map, "center_changed", function () {
        const latlng = map.getCenter();
        onMapCenterChange &&
          onMapCenterChange(latlng.getLat(), latlng.getLng());
      });

      const clusterer = new window.kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 7,
      });
      clustererInstance.current = clusterer;

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
          window.kakao.maps.event.addListener(marker, "mouseover", function () {
            infowindow.open(map, marker);
          });
          window.kakao.maps.event.addListener(marker, "mouseout", function () {
            infowindow.close();
          });
          window.kakao.maps.event.addListener(marker, "click", function () {
            if (onMarkerPress) onMarkerPress(markerData.id);
          });
          return marker;
        });
        clusterer.addMarkers(kakaoMarkers);
      }
    }
  }, [isLoaded, mapRef.current, latitude, longitude]); // Re-run when script is loaded or mapRef changes

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
  }, [latitude, longitude]);

  // Effect for updating markers when markers prop changes
  useEffect(() => {
    if (mapInstance.current && clustererInstance.current) {
      clustererInstance.current.clear();

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
          window.kakao.maps.event.addListener(marker, "click", function () {
            if (onMarkerPress) onMarkerPress(markerData.id);
          });
          return marker;
        });
        clustererInstance.current.addMarkers(kakaoMarkers);
      }
    }
  }, [markers]);

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
};

import { kakaoMapHtml } from "./kakaoMapWebViewSource";

// 모바일 전용 Kakao Map 렌더링 로직 (WebView 사용)
const MobileKakaoMap: React.FC<KakaoMapProps> = React.memo(({
  latitude,
  longitude,
  markers,
  onMapCenterChange,
  onMarkerPress,
}) => {
  const webViewRef = useRef<WebView>(null);
  const markerLoadTimer = useRef<NodeJS.Timeout | null>(null);
  const [isMapApiReady, setIsMapApiReady] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isInitialMarkersLoaded, setIsInitialMarkersLoaded] = useState(false);

  const htmlContent = useMemo(() => {
    return kakaoMapHtml.replace(
      "KAKAO_MAP_JS_KEY_PLACEHOLDER",
      KAKAO_MAP_JS_KEY
    );
  }, [KAKAO_MAP_JS_KEY]);

  // Effect to initialize map when API is ready and map is not yet initialized
  useEffect(() => {
    if (
      webViewRef.current &&
      htmlContent &&
      isMapApiReady &&
      !isMapInitialized &&
      latitude !== undefined &&
      longitude !== undefined
    ) {
      const script = `initMap(${latitude}, ${longitude}); true;`;
      webViewRef.current.injectJavaScript(script);
      setIsMapInitialized(true);
    }
  }, [isMapApiReady, isMapInitialized, latitude, longitude, htmlContent]);

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

  // Effect for updating markers when markers prop changes
  useEffect(() => {
    if (webViewRef.current && markers && htmlContent && isMapInitialized) {
      if (!isInitialMarkersLoaded) {
        markerLoadTimer.current = setTimeout(() => {
          if (webViewRef.current) {
            const script = `updateMarkers(${JSON.stringify(markers)}); true;`;
            webViewRef.current.injectJavaScript(script);
            setIsInitialMarkersLoaded(true);
          }
        }, 100);
      } else {
        const script = `updateMarkers(${JSON.stringify(markers)}); true;`;
        webViewRef.current.injectJavaScript(script);
      }
    }

    return () => {
      if (markerLoadTimer.current) {
        clearTimeout(markerLoadTimer.current);
      }
    };
  }, [markers, htmlContent, isMapInitialized]);

  if (!htmlContent) {
    return (
      <View style={styles.webview}>
        <Text>Loading map content...</Text>
      </View>
    );
  }

  return (
    <WebView
      ref={webViewRef} // Assign ref to WebView
      originWhitelist={["*"]}
      source={{ html: htmlContent }}
      style={[styles.webview, style]}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      onLoad={() => console.log("WebView loaded successfully")}
      onError={(e) => console.error("WebView error: ", e.nativeEvent)}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === "map_idle" && onMapCenterChange) {
            onMapCenterChange(data.latitude, data.longitude);
          }
          if (data.type === "marker_press" && onMarkerPress) {
            onMarkerPress(data.id);
          }
          if (data.type === 'map_api_ready') {
            setIsMapApiReady(true);
          }
        } catch (e) {
          console.error("Failed to parse WebView message:", e);
        }
      }}
    />
  );
});

const KakaoMap: React.FC<KakaoMapProps> = (props) => {
  if (Platform.OS === "web") {
    return <WebKakaoMap {...props} />;
  }
  return <MobileKakaoMap {...props} />;
};

export default KakaoMap;
