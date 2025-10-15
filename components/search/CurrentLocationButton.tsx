import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useBottomSheetHeight } from '../../utils/bottomSheetUtils';

interface CurrentLocationButtonProps {
  onPress: () => void;
  onDoublePress?: () => void; // 더블클릭 시 호출될 함수
  bottomSheetOpen: boolean; // 바텀시트 열림/닫힘 상태
  bottomSheetHeight?: number; // 바텀시트 실제 높이
  showPlaceDetail?: boolean; // 상세정보 표시 여부
  showRouteDetail?: boolean; // 상세 경로 안내 표시 여부
}

const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({
  onPress,
  onDoublePress,
  bottomSheetOpen,
  bottomSheetHeight,
  showPlaceDetail = false,
  showRouteDetail = false,
}) => {
  const animatedBottom = useRef(new Animated.Value(100)).current; // 초기값 100
  const [lastPressTime, setLastPressTime] = useState(0);
  const [pressCount, setPressCount] = useState(0);
  const { calculateButtonPosition } = useBottomSheetHeight();

  // 바텀시트 높이에 따른 애니메이션
  useEffect(() => {
    let type: 'normal' | 'placeDetail' | 'routeDetail' = 'normal';
    if (showPlaceDetail) {
      type = 'placeDetail';
    } else if (showRouteDetail) {
      type = 'routeDetail';
    }
    
    const targetBottom = bottomSheetOpen && bottomSheetHeight ? 
      calculateButtonPosition(bottomSheetHeight, 100, type) : 100;
    
    
    Animated.spring(animatedBottom, {
      toValue: targetBottom,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [bottomSheetHeight, bottomSheetOpen, showPlaceDetail, showRouteDetail]);

  // 즉시 위치 계산 (애니메이션 없이) - 메모이제이션
  const currentBottom = useMemo(() => {
    let type: 'normal' | 'placeDetail' | 'routeDetail' = 'normal';
    if (showPlaceDetail) {
      type = 'placeDetail';
    } else if (showRouteDetail) {
      type = 'routeDetail';
    }
    
    return bottomSheetOpen && bottomSheetHeight ? 
      calculateButtonPosition(bottomSheetHeight, 100, type) : 100;
  }, [bottomSheetOpen, bottomSheetHeight, showPlaceDetail, showRouteDetail, calculateButtonPosition]);

  // 더블클릭 감지 함수 (useCallback 최적화)
  const handlePress = useCallback(() => {
    console.log('CurrentLocationButton handlePress 호출됨');
    const now = Date.now();
    const timeDiff = now - lastPressTime;
    
    if (timeDiff < 300) { // 300ms 이내에 두 번 클릭
      setPressCount(prev => prev + 1);
      if (pressCount === 1) { // 두 번째 클릭
        console.log('더블클릭 감지됨!');
        if (onDoublePress) {
          onDoublePress();
        }
        setPressCount(0);
      }
    } else {
      setPressCount(1);
      if (onPress) {
        onPress();
      }
    }
    
    setLastPressTime(now);
    setTimeout(() => {
      setPressCount(0);
    }, 300);
  }, [lastPressTime, pressCount, onPress, onDoublePress]);

  return (
    <View style={[styles.container, { bottom: currentBottom }]}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Ionicons name="locate" size={20} color="#3690FF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    zIndex: 1001,
  },
  button: {
    width: 40,
    height: 40, 
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CurrentLocationButton;
