/**
 * API 응답의 공통 구조를 정의하는 제네릭 타입
 * 모든 API 응답은 이 구조를 따릅니다.
 */
export type ApiResponse<T> = {
  success: boolean; // 요청 성공 여부
  data: T; // 실제 데이터 (제네릭 타입)
  error: { message: string } | null; // 에러 메시지 (성공 시 null)
  timestamp: string; // 응답 생성 시간
};

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  isLast: boolean;
  currentPage: number;
}


