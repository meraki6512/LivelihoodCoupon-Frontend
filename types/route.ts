/**
 * 길찾기 관련 타입 정의 (백엔드 구조에 맞춤)
 */

/**
 * 교통수단 타입 (백엔드 RouteType enum에 맞춤)
 */
export type TransportMode = 'driving' | 'transit' | 'walking' | 'cycling';

/**
 * 좌표 정보 (백엔드 Coordinate DTO에 맞춤)
 */
export interface Coordinate {
  lng: number;  // 경도 (X 좌표)
  lat: number;  // 위도 (Y 좌표)
}

/**
 * 경로 구간 정보 (백엔드 RouteStep에 맞춤)
 */
export interface RouteStep {
  instruction: string;      // 안내 문구
  distance: number;         // 거리 (미터)
  duration: number;         // 소요시간 (초)
  startLocation: Coordinate; // 시작 위치
  endLocation: Coordinate;   // 종료 위치
}

/**
 * 길찾기 결과 (백엔드 RouteResponse에 맞춤)
 */
export interface RouteResult {
  coordinates: Coordinate[]; // 경로 좌표 리스트
  totalDistance: number;     // 총 거리 (미터)
  totalDuration: number;     // 총 소요시간 (초)
  routeType: TransportMode;  // 경로 타입
  steps: RouteStep[];        // 경로 상세 정보
}

/**
 * 백엔드 에러 정보 (CustomApiResponse.Error에 맞춤)
 */
export interface ApiError {
  code: string;    // 에러 코드 (예: "R001")
  message: string; // 에러 메시지
}

/**
 * 백엔드 API 응답 (CustomApiResponse에 맞춤)
 */
export interface CustomApiResponse<T> {
  success: boolean;           // 성공 여부
  data?: T;                   // 응답 데이터
  error?: ApiError;           // 에러 정보
  timestamp?: string;         // 응답 시간
}

/**
 * 길찾기 API 응답 타입
 */
export type RouteResponse = CustomApiResponse<RouteResult>;
