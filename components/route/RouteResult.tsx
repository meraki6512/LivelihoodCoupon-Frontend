import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteResult, TransportMode } from '../../types/route';

interface RouteResultProps {
  routeResult: RouteResult;
  onClose: () => void;
}

/**
 * 길찾기 결과를 표시하는 컴포넌트
 */
const RouteResultComponent: React.FC<RouteResultProps> = ({ routeResult, onClose }) => {
  // 교통수단 아이콘 매핑 (백엔드 타입 직접 사용)
  const getTransportIcon = (mode: TransportMode): keyof typeof Ionicons.glyphMap => {
    switch (mode) {
      case 'driving': return 'car-outline';
      case 'transit': return 'bus-outline';
      case 'walking': return 'walk-outline';
      case 'cycling': return 'bicycle-outline';
      default: return 'navigate-outline';
    }
  };

  // 교통수단 한글명 매핑 (백엔드 타입 직접 사용)
  const getTransportName = (mode: TransportMode): string => {
    switch (mode) {
      case 'driving': return '자동차';
      case 'transit': return '대중교통';
      case 'walking': return '도보';
      case 'cycling': return '자전거';
      default: return '알 수 없음';
    }
  };

  // 거리 포맷팅 (미터 → 킬로미터)
  const formatDistance = (distance: number): string => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`;
    }
    return `${distance}m`;
  };

  // 시간 포맷팅 (초 → 분:초, 초 단위 반올림)
  const formatDuration = (duration: number): string => {
    const totalMinutes = Math.round(duration / 60); // 초를 분으로 변환하고 반올림
    
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}시간`;
      }
      return `${hours}시간 ${remainingMinutes}분`;
    }
    
    return `${totalMinutes}분`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.routeInfo}>        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="walk-outline" size={20} color="#28a745" />
            <Text style={styles.statValue}>{formatDistance(routeResult.totalDistance)}</Text>
            <Text style={styles.statLabel}>거리</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={20} color="#ffc107" />
            <Text style={styles.statValue}>{formatDuration(routeResult.totalDuration)}</Text>
            <Text style={styles.statLabel}>소요시간</Text>
          </View>
        </View>
      </View>

      {routeResult.steps && routeResult.steps.length > 0 && (
        <View style={styles.directionsContainer}>
          <Text style={styles.directionsTitle}>경로 안내</Text>
          {routeResult.steps.map((step, index) => (
            <View key={index} style={styles.directionItem}>
              <View style={styles.directionStep}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <View style={styles.directionContent}>
                <Text style={styles.directionText}>{step.instruction}</Text>
                <Text style={styles.directionDistance}>
                  {formatDistance(step.distance)} • {formatDuration(step.duration)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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

export default RouteResultComponent;
