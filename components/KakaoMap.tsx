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
    showInfoWindow,
    selectedPlaceId,
    selectedMarkerLat,
    selectedMarkerLng,
    onCloseInfoWindow,
  }: KakaoMapProps) => {
    const { isLoaded, error: scriptError } = useKakaoMapScript();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const clustererInstance = useRef<any>(null);
    const infowindowInstance = useRef<any>(null); // Single infowindow instance
    const userLocationMarkerInstance = useRef<any>(null);
    const infoWindowOverlayInstance = useRef<any>(null); // InfoWindow CustomOverlay instance
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
        infowindowInstance.current?.setMap(null);

        // Clear previous user location marker if it exists
        if (userLocationMarkerInstance.current) {
          userLocationMarkerInstance.current.setMap(null);
        }

        // Helper function to get marker image based on type (only for userLocation)
        const getUserLocationMarkerImage = () => {
          const imageSrc = MARKER_IMAGES.USER_LOCATION;
          const imageSize = new window.kakao.maps.Size(36, 36);
          const imageOption = { offset: new window.kakao.maps.Point(18, 36) };
          return new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
        };

        // Create a small SVG as a data URI for the dot marker image.
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
            zIndex: 101 // Ensure it's on top
          });
          marker.setMap(mapInstance.current);
          userLocationMarkerInstance.current = marker; // Save instance
        }

        // Handle place markers with clusterer
        if (placeMarkersData && placeMarkersData.length > 0) {
          clustererInstance.current.clear(); // Clear existing markers from clusterer

          const kakaoMarkers = placeMarkersData.map((markerData) => {
            const markerPosition = new window.kakao.maps.LatLng(
              markerData.lat,
              markerData.lng
            );

            const markerImageSrc = createDotMarkerImage(markerData.markerType === "selected");
            const imageSize = new window.kakao.maps.Size(markerData.markerType === "selected" ? 16 : 12, markerData.markerType === "selected" ? 16 : 12);
            const imageOption = { offset: new window.kakao.maps.Point(imageSize.width / 2, imageSize.height / 2) }; // Center the dot

            const marker = new window.kakao.maps.Marker({
              position: markerPosition,
              image: new window.kakao.maps.MarkerImage(markerImageSrc, imageSize, imageOption),
              zIndex: markerData.markerType === "selected" ? 100 : 1,
            });

            const customOverlayContent = `
              <div style="
                position: relative;
                bottom: 15px; /* Adjust to position above the marker */
                background-color: white;
                border-radius: 6px;
                padding: 8px 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                font-size: 13px;
                color: #333;
                white-space: nowrap;
                text-align: center;
                border: 1px solid #ddd; /* Add a subtle border */
              ">
                <span style="font-weight: bold; display: block;">${markerData.placeName}</span>
                <span style="font-size: 11px; color: #666;">${markerData.categoryGroupName}</span>
                <div style="
                  position: absolute;
                  bottom: -6px; /* Position the arrow at the bottom center */
                  left: 50%;
                  transform: translateX(-50%) rotate(45deg);
                  width: 12px;
                  height: 12px;
                  background-color: white;
                  border-right: 1px solid #ddd; /* Match main border */
                  border-bottom: 1px solid #ddd; /* Match main border */
                  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.05);
                  z-index: -1; /* Ensure arrow is behind the main content */
                "></div>
              </div>
            `;

            const customOverlay = new window.kakao.maps.CustomOverlay({
              position: markerPosition,
              content: customOverlayContent,
              yAnchor: 1, // Anchor the bottom of the overlay to the marker position
              zIndex: 102, // Ensure it's above all markers
            });

            // Show custom overlay on mouseover
            window.kakao.maps.event.addListener(marker, "mouseover", function () {
              customOverlay.setMap(mapInstance.current);
            });

            // Close custom overlay on mouseout
            window.kakao.maps.event.addListener(marker, "mouseout", function () {
              customOverlay.setMap(null);
            });

            // Handle click event
            window.kakao.maps.event.addListener(marker, "click", function () {
              // Close any currently open custom overlay if it's not this one
              if (infowindowInstance.current && infowindowInstance.current !== customOverlay) {
                infowindowInstance.current.setMap(null);
              }
              // Open this custom overlay if it's not already open (e.g., from hover)
              if (!customOverlay.getMap()) {
                customOverlay.setMap(mapInstance.current);
              }
              infowindowInstance.current = customOverlay; // Keep track of the last opened custom overlay

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

        // 선택된 마커 데이터 찾기
        const selectedMarker = markers?.find(marker => marker.placeId === selectedPlaceId);
        console.log('Selected marker found:', selectedMarker);
        
        if (!selectedMarker) {
          console.log('No selected marker found for placeId:', selectedPlaceId);
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
            ">
              <button onclick="window.closeInfoWindow()" style="
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 6px 12px;
                font-size: 12px;
                cursor: pointer;
              ">길찾기</button>
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
      KAKAO_MAP_JS_KEY
    );
    content = content.replace("MARKER_IMAGE_USER_LOCATION_PLACEHOLDER", MARKER_IMAGES.USER_LOCATION);
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