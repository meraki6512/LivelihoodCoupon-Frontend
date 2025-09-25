const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  let timeout: NodeJS.Timeout;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Platform, ViewStyle, Text } from "react-native";
import { WebView } from "react-native-webview";
import { KAKAO_MAP_JS_KEY } from "@env";
import { useKakaoMapScript } from "../hooks/useKakaoMapScript";

import { MarkerData, KakaoMapProps } from "../types/kakaoMap";
import { styles } from "./KakaoMap.styles";
import { MARKER_IMAGES } from "../constants/mapConstants";

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
    const infowindowInstance = useRef<any>(null); // Single infowindow instance
    const userLocationMarkerInstance = useRef<any>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    // Effect for initial map creation
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

        const debouncedOnMapCenterChange = debounce(() => {
          const latlng = map.getCenter();
          onMapCenterChange &&
            onMapCenterChange(latlng.getLat(), latlng.getLng());
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
    }, [isLoaded, mapRef.current, latitude, longitude]);

    // Effect for updating map center
    useEffect(() => {
      if (mapInstance.current && latitude !== undefined && longitude !== undefined) {
        const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
        mapInstance.current.setCenter(newCenter);
      }
    }, [latitude, longitude]);

    // Effect for updating markers
    useEffect(() => {
      if (isMapReady && mapInstance.current && clustererInstance.current) {
        // Clear clustered markers
        clustererInstance.current.clear();
        infowindowInstance.current?.close();

        // Clear previous user location marker if it exists
        if (userLocationMarkerInstance.current) {
          userLocationMarkerInstance.current.setMap(null);
        }

        // Helper function to get marker image based on type
        const getMarkerImage = (type?: string) => {
          const imageSrc =
            type === "selected"
              ? MARKER_IMAGES.SELECTED
              : type === "userLocation"
              ? MARKER_IMAGES.USER_LOCATION
              : MARKER_IMAGES.DEFAULT;

          const imageSize = new window.kakao.maps.Size(36, 36);
          const imageOption = { offset: new window.kakao.maps.Point(18, 36) };

          return new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
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
            image: getMarkerImage(userLocationMarkerData.markerType),
            zIndex: 101 // Ensure it's on top
          });
          marker.setMap(mapInstance.current);
          userLocationMarkerInstance.current = marker; // Save instance
        }

        // Handle place markers with clusterer
        if (placeMarkersData && placeMarkersData.length > 0) {
          const kakaoMarkers = placeMarkersData.map((markerData) => {
            const markerPosition = new window.kakao.maps.LatLng(
              markerData.lat,
              markerData.lng
            );
            const marker = new window.kakao.maps.Marker({
              position: markerPosition,
              image: getMarkerImage(markerData.markerType),
              zIndex: markerData.markerType === "selected" ? 100 : 1,
            });

            const infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:5px;font-size:12px;"><span style="font-weight:bold;">${markerData.placeName}</span><br><span>${markerData.categoryGroupName}</span></div>`,
            });

            window.kakao.maps.event.addListener(marker, "click", function () {
              if (infowindowInstance.current) {
                infowindowInstance.current.close();
              }
              infowindow.open(mapInstance.current, marker);
              infowindowInstance.current = infowindow;

              if (markerData.markerType !== "userLocation" && onMarkerPress) {
                onMarkerPress(markerData.placeId);
              }
            });

            return marker;
          });

          clustererInstance.current.addMarkers(kakaoMarkers);
        }
      }
    }, [isMapReady, markers]);

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

import { kakaoMapWebViewHtml } from "./kakaoMapWebViewSource";

// 모바일 전용 Kakao Map 렌더링 로직 (WebView 사용)
const MobileKakaoMap: React.FC<KakaoMapProps> = React.memo(({
  latitude,
  longitude,
  markers,
  onMapCenterChange,
  onMarkerPress,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isMapApiReady, setIsMapApiReady] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const htmlContent = useMemo(() => {
    let content = kakaoMapWebViewHtml.replace(
      "KAKAO_MAP_JS_KEY_PLACEHOLDER",
      `"${KAKAO_MAP_JS_KEY}"`
    );
    content = content.replace("MARKER_IMAGE_SELECTED_PLACEHOLDER", MARKER_IMAGES.SELECTED);
    content = content.replace("MARKER_IMAGE_USER_LOCATION_PLACEHOLDER", MARKER_IMAGES.USER_LOCATION);
    content = content.replace("MARKER_IMAGE_DEFAULT_PLACEHOLDER", MARKER_IMAGES.DEFAULT);
    return content;
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