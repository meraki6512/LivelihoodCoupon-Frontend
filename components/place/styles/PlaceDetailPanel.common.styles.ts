import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    pointerEvents: 'box-none', // 자식 요소만 터치 이벤트 받음
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  container: {
    position: 'absolute',
    width: 340, // 360 -> 340으로 축소
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    zIndex: 1000,
    elevation: 10, // Android용 그림자
    shadowColor: '#000', // iOS용 그림자
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  arrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -8 }],
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
  routeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    height: 32,
  },
  routeButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  infoContainer: {
    marginBottom: 0, // 길찾기 버튼을 위한 여백
  },
  routeButtonContainer: {
    position: 'absolute',
    bottom: 12, 
    right: 12,  
  },
  // 인라인 정보 스타일들
  infoRowInline: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  infoLabelInline: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
    minWidth: 50, // 라벨 너비를 60에서 50으로 축소
  },
  infoValueInline: {
    fontSize: 14,
    color: '#111',
    flex: 1,
  },
  phoneText: {
    fontSize: 14,
    color: '#28a745', // 전화 걸기를 암시하는 초록색
    flex: 1,
  },
  linkText: {
    fontSize: 14,
    color: '#007bff', // 카카오맵과 같은 파란색
    textDecorationLine: 'underline',
  },
});
