// 마커 타입 정의
export type MarkerType = 'userLocation' | 'selected' | 'default' | 'routeStart' | 'routeEnd';

// 마커 이미지 URL 관리 (SVG 기반)
export const MARKER_IMAGES = {
  // 현재 위치 마커 (파란색 아이콘, 배경 없음)
  USER_LOCATION: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTIgMkM4LjEzIDIgNSA1LjEzIDUgOWMwIDUuMjUgNyAxMyA3IDEzczctNy43NSA3LTEzYzAtMy44Ny0zLjEzLTctNy03em0wIDkuNWMtMS4zOCAwLTIuNS0xLjEyLTIuNS0yLjVzMS4xMi0yLjUgMi41LTIuNSAyLjUgMS4xMiAyLjUgMi41LTEuMTIgMi41LTIuNSAyLjV6IiBmaWxsPSIjMzY5MEZGIi8+Cjwvc3ZnPgo=",
  
  // 선택된 장소 마커 (파란색, 작은 크기)
  SELECTED: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0ic2VsZWN0ZWRHcmFkaWVudCIgY3g9IjMwJSIgY3k9IjMwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzNjkwRkYiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDA3YmZmIi8+CiAgICA8L3JhZGlhbEdyYWRpZW50PgogICAgPGZpbHRlciBpZD0ic2hhZG93LXNlbGVjdGVkIiB4PSItNTAlIiB5PSItNTAlIiB3aWR0aD0iMjAwJSIgaGVpZ2h0PSIyMDAlIj4KICAgICAgPGZlRHJvcFNoYWRvdyBkeD0iMCIgZHk9IjIiIHN0ZERldmlhdGlvbj0iMyIgZmxvb2QtY29sb3I9InJnYmEoMCwwLDAsMC4zKSIvPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogIDxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjciIGZpbGw9InVybCgjc2VsZWN0ZWRHcmFkaWVudCkiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWx0ZXI9InVybCgjc2hhZG93LXNlbGVjdGVkKSIvPgo8L3N2Zz4K",
  
  // 기본 장소 마커 (작은 크기, 회색 그라데이션 + 그림자)
  DEFAULT: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iZGVmYXVsdEdyYWRpZW50IiBjeD0iMzAlIiBjeT0iMzAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzlDQTNBRiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM2Yzc1N2QiLz4KICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgICA8ZmlsdGVyIGlkPSJzaGFkb3ctZGVmYXVsdCIgeD0iLTUwJSIgeT0iLTUwJSIgd2lkdGg9IjIwMCUiIGhlaWdodD0iMjAwJSI+CiAgICAgIDxmZURyb3BTaGFkb3cgZHg9IjAiIGR5PSIxIiBzdGREZXZpYXRpb249IjIiIGZsb29kLWNvbG9yPSJyZ2JhKDAsMCwwLDAuMikiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNSIgZmlsbD0idXJsKCNkZWZhdWx0R3JhZGllbnQpIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMS41IiBmaWx0ZXI9InVybCgjc2hhZG93LWRlZmF1bHQpIi8+Cjwvc3ZnPgo=",
  
  // 경로 출발지 마커 (녹색 그라데이션 + 그림자)
  ROUTE_START: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0ic3RhcnRHcmFkaWVudCIgY3g9IjMwJSIgY3k9IjMwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0Q0FGNTAiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMjhhNzQ1Ii8+CiAgICA8L3JhZGlhbEdyYWRpZW50PgogICAgPGZpbHRlciBpZD0ic2hhZG93LXN0YXJ0IiB4PSItNTAlIiB5PSItNTAlIiB3aWR0aD0iMjAwJSIgaGVpZ2h0PSIyMDAlIj4KICAgICAgPGZlRHJvcFNoYWRvdyBkeD0iMCIgZHk9IjMiIHN0ZERldmlhdGlvbj0iNCIgZmxvb2QtY29sb3I9InJnYmEoMCwwLDAsMC40KSIvPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogIDxjaXJjbGUgY3g9IjE4IiBjeT0iMTgiIHI9IjE0IiBmaWxsPSJ1cmwoI3N0YXJ0R3JhZGllbnQpIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMyIgZmlsdGVyPSJ1cmwoI3NoYWRvdy1zdGFydCkiLz4KICA8Y2lyY2xlIGN4PSIxOCIgY3k9IjE4IiByPSI2IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPgo=",
  
  // 경로 도착지 마커 (빨간색 그라데이션 + 그림자)
  ROUTE_END: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iZW5kR3JhZGllbnQiIGN4PSIzMCUiIGN5PSIzMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkY1NzIyIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2RjMzU0NSIvPgogICAgPC9yYWRpYWxHcmFkaWVudD4KICAgIDxmaWx0ZXIgaWQ9InNoYWRvdy1lbmQiIHg9Ii01MCUiIHk9Ii01MCUiIHdpZHRoPSIyMDAlIiBoZWlnaHQ9IjIwMCUiPgogICAgICA8ZmVEcm9wU2hhZG93IGR4PSIwIiBkeT0iMyIgc3RkRGV2aWF0aW9uPSI0IiBmbG9vZC1jb2xvcj0icmdiYSgwLDAsMCwwLjQpIi8+CiAgICA8L2ZpbHRlcj4KICA8L2RlZnM+CiAgPGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMTQiIGZpbGw9InVybCgjZW5kR3JhZGllbnQpIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMyIgZmlsdGVyPSJ1cmwoI3NoYWRvdy1lbmQpIi8+CiAgPGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iNiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4K",
};

// 마커 설정 관리
export const MARKER_CONFIG = {
  // 현재 위치 마커 설정
  userLocation: {
    image: MARKER_IMAGES.USER_LOCATION,
    size: { width: 40, height: 40 },
    offset: { x: 18, y: 18 }, // 마커 중앙에 위치
    zIndex: 101,
    clickable: false, // 클릭 불가
  },
  
  // 선택된 장소 마커 설정 (작은 크기)
  selected: {
    image: MARKER_IMAGES.SELECTED,
    size: { width: 20, height: 20 },
    offset: { x: 10, y: 10 },
    zIndex: 100,
    clickable: true,
  },
  
  // 기본 장소 마커 설정 (작은 크기)
  default: {
    image: MARKER_IMAGES.DEFAULT,
    size: { width: 16, height: 16 },
    offset: { x: 8, y: 8 },
    zIndex: 1,
    clickable: true,
  },
  
  // 경로 출발지 마커 설정
  routeStart: {
    image: MARKER_IMAGES.ROUTE_START,
    size: { width: 36, height: 36 },
    offset: { x: 18, y: 36 },
    zIndex: 200,
    clickable: false,
  },
  
  // 경로 도착지 마커 설정
  routeEnd: {
    image: MARKER_IMAGES.ROUTE_END,
    size: { width: 36, height: 36 },
    offset: { x: 18, y: 36 },
    zIndex: 200,
    clickable: false,
  },
};

// 마커 타입에 따른 설정 가져오기
export const getMarkerConfig = (markerType: MarkerType) => {
  return MARKER_CONFIG[markerType] || MARKER_CONFIG.default;
};

// 지도 설정
export const MAP_CONFIG = {
  // 지도 초기 레벨 (1: 세계, 14: 건물)
  INITIAL_LEVEL: 3,
  MAX_LEVEL: 14,
  MIN_LEVEL: 1,
  
  // 현재 위치 버튼 더블클릭 시 레벨
  CURRENT_LOCATION_LEVEL: 3,
};