import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 0, // 좌우 margin 제거하여 길찾기 버튼과 같은 너비로
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    // 더 자연스러운 그림자 효과
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // 그림자 위치 조정
    shadowOpacity: 0.08, // 그림자 투명도 줄임
    shadowRadius: 12, // 그림자 블러 반경 증가
    elevation: 8, // Android elevation 증가
    // 경계선 추가로 더 자연스러운 느낌
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  routeInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 50,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 2,
    marginBottom: -12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  directionsContainer: {
    marginStart: 7, 
    paddingVertical: 10,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  directionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  directionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  directionStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  directionContent: {
    flex: 1,
  },
  directionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  directionDistance: {
    fontSize: 12,
    color: '#666',
  },
});
