import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteResult, TransportMode } from '../../types/route';
import { commonStyles } from './styles/RouteResult.common.styles';
import { webStyles } from './styles/RouteResult.web.styles';
import { mobileStyles } from './styles/RouteResult.mobile.styles';

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
    <View style={commonStyles.container}>
      <View style={commonStyles.routeInfo}>        
        <View style={commonStyles.statsContainer}>
          <View style={commonStyles.statItem}>
            <Ionicons name="walk-outline" size={20} color="#28a745" />
            <Text style={commonStyles.statValue}>{formatDistance(routeResult.totalDistance)}</Text>
            <Text style={commonStyles.statLabel}>거리</Text>
          </View>
          
          <View style={commonStyles.statItem}>
            <Ionicons name="time-outline" size={20} color="#ffc107" />
            <Text style={commonStyles.statValue}>{formatDuration(routeResult.totalDuration)}</Text>
            <Text style={commonStyles.statLabel}>소요시간</Text>
          </View>
        </View>
      </View>

      {routeResult.steps && routeResult.steps.length > 0 && (
        <View style={commonStyles.directionsContainer}>
          <Text style={commonStyles.directionsTitle}>경로 안내</Text>
          {routeResult.steps.map((step, index) => (
            <View key={index} style={commonStyles.directionItem}>
              <View style={commonStyles.directionStep}>
                <Text style={commonStyles.stepNumber}>{index + 1}</Text>
              </View>
              <View style={commonStyles.directionContent}>
                <Text style={commonStyles.directionText}>{step.instruction}</Text>
                <Text style={commonStyles.directionDistance}>
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


export default RouteResultComponent;
