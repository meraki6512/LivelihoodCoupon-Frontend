/**
 * UI 관련 상수값들
 */

export const UI_CONSTANTS = {
  // 검색 관련
  search: {
    minQueryLength: 2,
    debounceDelay: 300,
    autoSearchDelay: 500,
    defaultRadius: 3000,
    maxResults: 50,
  },
  
  // 지도 관련
  map: {
    minDistanceForWalking: 150, // 미터
    defaultZoomLevel: 3,
    currentLocationZoomLevel: 3,
    maxZoomLevel: 14,
    minZoomLevel: 1,
  },
  
  // 바텀시트 관련
  bottomSheet: {
    smallHandleHeight: 60,
    closedHeight: 60,
    animationDuration: 300,
  },
  
  // 애니메이션
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // 디바운스 시간
  debounce: {
    search: 300,
    location: 500,
    mapUpdate: 200,
  },
  
  // 화면 비율
  screenRatio: {
    bottomSheet: 0.6,
    placeDetail: 0.5,
    routeDetail: 0.65,
  },
  
  // 거리 단위
  distance: {
    walkingThreshold: 150, // 미터
    shortDistance: 1000, // 1km
    mediumDistance: 4000, // 4km
  },
} as const;

export type UIConstantKey = keyof typeof UI_CONSTANTS;
