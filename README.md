# Livelihood Coupon Frontend
- [Livelihood Coupon Backend 바로가기](https://github.com/livelihoodCoupon/Server-Backend)
- [Demo ▶️ Youtube 바로가기](https://youtu.be/VIBkQQZsk20?si=UZKAkuEXRRWQ3hej)

> **민생회복쿠폰 지도 서비스의 프론트엔드** 레포지토리입니다. </br>
> React Native와 Expo를 기반으로 웹, iOS, Android 플랫폼을 지원합니다.


</br>

## 1. 주요 기능

### 키워드 검색
- **장소 검색**: 키워드 기반 장소 검색 및 자동완성
- **카테고리 검색**: 음식점, 카페, 쇼핑몰 등 카테고리별 검색
- **위치 기반 반경 검색**: 현재 위치 기준 반경 내 장소 검색
- **실시간 검색**: 타이핑과 동시에 실시간 검색 결과 제공

### 주차장 검색
- **검색**: 주변 주차장 검색 및 정보 제공
- **주차 정보**: 주차장별 요금, 운영시간, 위치 등

### 길찾기
- **다양한 교통수단**: 자동차, 도보, 자전거 길찾기 지원
- **경로 안내**: 상세한 경로 정보 및 소요시간 제공

### 지도 서비스
- **카카오맵 통합 반응형 지도**: 웹과 모바일에서 카카오맵 API를 활용한 지도 서비스
- **현재 위치 기반 지도**: GPS를 통한 정확한 위치 기반 서비스 제공

</br>

## 2. 기술 스택

### 핵심
- **React Native** (0.81.4): 크로스 플랫폼 모바일 앱 개발
- **Expo** (~54.0.7): React Native 개발 및 배포 플랫폼
- **TypeScript** (~5.9.2): 타입 안전성을 위한 정적 타입 언어
- **React** (19.1.0): UI 라이브러리
- **React DOM** (19.1.0): 웹 렌더링

### 상태 관리 및 데이터 페칭
- **Zustand** (^5.0.8): 경량 상태 관리 라이브러리
- **@tanstack/react-query** (^5.89.0): 서버 상태 관리 및 캐싱
- **Axios** (^1.12.2): HTTP 클라이언트

### UI/UX 
- **Styled Components** (^6.1.19): CSS-in-JS 스타일링
- **React Native Gesture Handler** (^2.28.0): 제스처 처리
- **React Native Reanimated** (^4.1.3): 고성능 애니메이션
- **React Native Safe Area Context** (^5.6.1): 안전 영역 처리
- **@expo/vector-icons** (^15.0.2): 아이콘 라이브러리

### 지도 및 위치 서비스
- **카카오맵 API**: 지도 서비스
- **Expo Location** (~19.0.7): 위치 정보 서비스
- **React Native WebView** (13.15.0): 웹뷰 기반 지도 렌더링

### 기타 
- **React Native Web** (^0.21.0): 웹 플랫폼 지원
- **React Native Dotenv** (^3.4.11): 환경 변수 관리
- **React Native Modalize** (^2.1.1): 모달 컴포넌트

</br>

## 3. 프로젝트 구조

```
Frontend/
├── components/           # 재사용 가능한 컴포넌트
│   ├── KakaoMap/        # 지도 관련 컴포넌트
│   ├── search/          # 검색 관련 컴포넌트
│   ├── route/           # 길찾기 관련 컴포넌트
│   ├── place/           # 장소 정보 컴포넌트
│   └── layout/          # 레이아웃 컴포넌트
├── screens/             # 화면 컴포넌트
│   ├── Home.tsx         # 메인 화면
│   ├── Home.mobile.tsx  # 모바일 홈 화면
│   └── Home.web.tsx     # 웹 홈 화면
├── hooks/               # 커스텀 훅
│   ├── useSearch.ts     # 검색 관련 훅
│   ├── useRoute.ts      # 길찾기 관련 훅
│   ├── useParking.ts    # 주차장 관련 훅
│   └── useCurrentLocation.ts # 위치 관련 훅
├── services/            # API 서비스
│   ├── searchApi.ts     # 검색 API
│   ├── routeApi.ts      # 길찾기 API
│   └── parkingApi.ts    # 주차장 API
├── types/               # TypeScript 타입 정의
├── utils/               # 유틸리티 함수
├── constants/           # 상수 정의
└── store/              # 상태 관리
```

</br>

## 4. 시작하기

### 요구사항
- Node.js (v18 이상)
- npm 또는 yarn
- Expo CLI
- Android Studio (Android 개발용)
- Xcode (iOS 개발용, macOS만)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/livelihoodCoupon/Frontend.git
cd Frontend
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
# .env 파일 생성
cp .env.example .env
```

4. **개발 서버 실행**
```bash
# 모든 플랫폼
npm start
# 또는
npx expo start #--clear