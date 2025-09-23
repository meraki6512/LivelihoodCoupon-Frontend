import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Platform } from 'react-native';

const RADIUS_STEPS = [100, 500, 1000, 1500, 2000, 2500, 3000];
const THUMB_WIDTH = 60; // 슬라이더 버튼(썸)의 너비

interface CustomRadiusSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

const formatLabel = (value: number) => {
  if (value < 1000) {
    return `${value}m`;
  }
  return `${value / 1000}km`;
};

const CustomRadiusSlider: React.FC<CustomRadiusSliderProps> = ({ value, onValueChange }) => {
  const [trackWidth, setTrackWidth] = React.useState(280); // 초기 너비, onLayout에서 업데이트됨
  const trackLayout = React.useRef({ width: trackWidth, x: 0 });
  const valueRef = React.useRef(value);
  valueRef.current = value;

  const initialIndex = RADIUS_STEPS.indexOf(value);
  const selectedIndex = initialIndex > -1 ? initialIndex : 2;
  const thumbPosition = React.useRef(new Animated.Value(selectedIndex)).current;

  React.useEffect(() => {
    const newIndex = RADIUS_STEPS.indexOf(value);
    if (newIndex !== -1) {
      Animated.spring(thumbPosition, {
        toValue: newIndex,
        useNativeDriver: false,
      }).start();
    }
  }, [value]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const relativeX = gestureState.moveX - trackLayout.current.x;
        const percentage = Math.max(0, Math.min(1, relativeX / trackLayout.current.width));
        const newIndex = Math.round(percentage * (RADIUS_STEPS.length - 1));
        const newValue = RADIUS_STEPS[newIndex];

        if (valueRef.current !== newValue) {
          onValueChange(newValue);
        }
      },
    })
  ).current;

  const handlePress = (index: number) => {
    onValueChange(RADIUS_STEPS[index]);
  };

  const thumbLeft = thumbPosition.interpolate({
    inputRange: [0, RADIUS_STEPS.length - 1],
    outputRange: [0, trackWidth], // 동적 너비 사용
    extrapolate: 'clamp',
  });

  const trackFillWidth = thumbPosition.interpolate({
    inputRange: [0, RADIUS_STEPS.length - 1],
    outputRange: [0, trackWidth], // 동적 너비 사용
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View
        style={styles.track}
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          trackLayout.current = layout;
          setTrackWidth(layout.width);
        }}
      >
        <View style={styles.trackBackground} />
        <Animated.View style={[styles.trackFill, { width: trackFillWidth }]} />

        {RADIUS_STEPS.map((step, index) => (
          <TouchableOpacity
            key={step}
            style={[styles.stepContainer, { left: `${(index / (RADIUS_STEPS.length - 1)) * 100}%` }]}
            onPress={() => handlePress(index)}
            hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }}
          >
            <View style={[styles.stepPoint, RADIUS_STEPS.indexOf(value) >= index ? styles.stepPointActive : {}]} />
          </TouchableOpacity>
        ))}
        
        <Animated.View {...panResponder.panHandlers} style={[styles.thumb, { left: thumbLeft }]}>
          <Text style={styles.thumbText} pointerEvents="none">{formatLabel(value)}</Text>
        </Animated.View>
      </View>
      <View style={styles.labels}>
        <Text style={styles.minMaxLabel}>{formatLabel(RADIUS_STEPS[0])}</Text>
        <Text style={styles.minMaxLabel}>{formatLabel(RADIUS_STEPS[RADIUS_STEPS.length - 1])}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    justifyContent: 'center',
    marginVertical: 10,
    paddingHorizontal: THUMB_WIDTH / 2,
  },
  track: {
    height: 6,
    borderRadius: 3,
  },
  trackBackground: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: '#e9ecef',
    borderRadius: 3,
  },
  trackFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 3,
  },
  stepContainer: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: -7,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
  },
  stepPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ced4da',
  },
  stepPointActive: {
    backgroundColor: '#007bff',
  },
  thumb: {
    width: THUMB_WIDTH,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -9, 
    marginLeft: -THUMB_WIDTH / 2,
    borderWidth: 2,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.3)',
      },
    }),
  },
  thumbText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    ...Platform.select({
      web: {
        userSelect: 'none'
      }
    })
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  minMaxLabel: {
    fontSize: 12,
    color: '#868e96',
    ...Platform.select({
      web: {
        userSelect: 'none'
      }
    })
  },
});

export default CustomRadiusSlider;