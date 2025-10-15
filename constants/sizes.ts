/**
 * UI 크기 및 간격 상수
 */

export const SIZES = {
  // 폰트 크기
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
  },
  
  // 간격 (padding, margin)
  spacing: {
    xs: 4,
    sm: 8,
    base: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  
  // 둥근 모서리
  borderRadius: {
    sm: 4,
    base: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 9999,
  },
  
  // 아이콘 크기
  iconSize: {
    sm: 12,
    base: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
  
  // 버튼 크기
  buttonHeight: {
    sm: 28,
    base: 32,
    md: 40,
    lg: 48,
    xl: 56,
  },
  
  // 바텀시트 높이 비율
  bottomSheetRatio: {
    small: 0.5,
    medium: 0.6,
    large: 0.65,
  },
  
  // 그림자
  shadow: {
    sm: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
} as const;

export type SizeKey = keyof typeof SIZES;
