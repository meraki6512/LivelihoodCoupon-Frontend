// 마커 타입 정의
export type MarkerType = 'userLocation' | 'selected' | 'default' | 'routeStart' | 'routeEnd';

// 마커 이미지 URL 관리 (SVG 기반)
export const MARKER_IMAGES = {
  // 현재 위치 마커 (파란색 아이콘, 배경 없음)
  USER_LOCATION: "data:image/svg+xml;base64," + btoa(`
    <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3690FF"/>
    </svg>
  `),
  
  // 선택된 장소 마커 (파란색, 작은 크기)
  SELECTED: "data:image/svg+xml;base64," + btoa(`
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="selectedGradient" cx="30%" cy="30%">
          <stop offset="0%" stop-color="#3690FF"/>
          <stop offset="100%" stop-color="#007bff"/>
        </radialGradient>
        <filter id="shadow-selected" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <circle cx="10" cy="10" r="7" fill="url(#selectedGradient)" stroke="#fff" stroke-width="2" filter="url(#shadow-selected)"/>
    </svg>
  `),
  
  // 기본 장소 마커 (작은 크기, 회색 그라데이션 + 그림자)
  DEFAULT: "data:image/svg+xml;base64," + btoa(`
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="defaultGradient" cx="30%" cy="30%">
          <stop offset="0%" stop-color="#9CA3AF"/>
          <stop offset="100%" stop-color="#6c757d"/>
        </radialGradient>
        <filter id="shadow-default" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/>
        </filter>
      </defs>
      <circle cx="8" cy="8" r="5" fill="url(#defaultGradient)" stroke="#fff" stroke-width="1.5" filter="url(#shadow-default)"/>
    </svg>
  `),
  
  // 경로 출발지 마커 (녹색 그라데이션 + 그림자)
  ROUTE_START: "data:image/svg+xml;base64," + btoa(`
    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="startGradient" cx="30%" cy="30%">
          <stop offset="0%" stop-color="#4CAF50"/>
          <stop offset="100%" stop-color="#28a745"/>
        </radialGradient>
        <filter id="shadow-start" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.4)"/>
        </filter>
      </defs>
      <circle cx="18" cy="18" r="14" fill="url(#startGradient)" stroke="#fff" stroke-width="3" filter="url(#shadow-start)"/>
      <circle cx="18" cy="18" r="6" fill="#fff"/>
    </svg>
  `),
  
  // 경로 도착지 마커 (빨간색 그라데이션 + 그림자)
  ROUTE_END: "data:image/svg+xml;base64," + btoa(`
    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="endGradient" cx="30%" cy="30%">
          <stop offset="0%" stop-color="#FF5722"/>
          <stop offset="100%" stop-color="#dc3545"/>
        </radialGradient>
        <filter id="shadow-end" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.4)"/>
        </filter>
      </defs>
      <circle cx="18" cy="18" r="14" fill="url(#endGradient)" stroke="#fff" stroke-width="3" filter="url(#shadow-end)"/>
      <circle cx="18" cy="18" r="6" fill="#fff"/>
    </svg>
  `),
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
