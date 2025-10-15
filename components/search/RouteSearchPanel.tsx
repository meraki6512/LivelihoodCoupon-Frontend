import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchResult } from '../../types/search';
import { COLORS } from '../../constants/colors';

// 거리 포맷팅 함수
const formatDistance = (distance: number) => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
};

interface RouteSearchPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onTransportModeChange: (mode: string) => void;
  selectedTransportMode: string;
  startLocation: string;
  setStartLocation: (location: string) => void;
  endLocation: string;
  setEndLocation: (location: string) => void;
  startLocationResults: SearchResult[];
  endLocationResults: SearchResult[];
  onStartLocationSelect: (result: SearchResult) => void;
  onEndLocationSelect: (result: SearchResult) => void;
  setStartLocationResults: (results: SearchResult[]) => void;
  setEndLocationResults: (results: SearchResult[]) => void;
  startLocationSearching?: boolean;
  endLocationSearching?: boolean;
  onStartLocationSearch?: () => void;
  onEndLocationSearch?: () => void;
  onSwapLocations?: () => void;
}

const RouteSearchPanel: React.FC<RouteSearchPanelProps> = ({
  isVisible,
  onClose,
  onTransportModeChange,
  selectedTransportMode,
  startLocation,
  setStartLocation,
  endLocation,
  setEndLocation,
  startLocationResults,
  endLocationResults,
  onStartLocationSelect,
  onEndLocationSelect,
  setStartLocationResults,
  setEndLocationResults,
  startLocationSearching = false,
  endLocationSearching = false,
  onStartLocationSearch,
  onEndLocationSearch,
  onSwapLocations,
}) => {
  if (!isVisible) return null;

  const transportModes = [
    { id: 'driving', icon: 'car-outline', label: '자동차', disabled: false },
    { id: 'transit', icon: 'bus-outline', label: '대중교통', disabled: true },
    { id: 'walking', icon: 'walk-outline', label: '도보', disabled: false },
    { id: 'cycling', icon: 'bicycle-outline', label: '자전거', disabled: false },
  ];

  // 유효한 경로인지 확인하는 함수
  const isValidRoute = () => {
    // 출발지가 "내 위치"이거나 검색 결과에 있는 경우
    const isValidStart = startLocation === '내 위치' || 
      startLocationResults.some(result => result.placeName === startLocation);
    
    // 목적지가 검색 결과에 있거나, 이미 선택된 장소명이 있는 경우
    const isValidEnd = endLocationResults.some(result => result.placeName === endLocation) ||
      (endLocation && endLocation.trim() !== '');
    
    return isValidStart && isValidEnd && startLocation && endLocation;
  };

  return (
    <View style={styles.container}>

      {/* 교통수단 선택 */}
      <View style={styles.transportContainer}>
        <View style={styles.transportButtons}>
          {transportModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.transportButton,
                selectedTransportMode === mode.id && styles.transportButtonSelected,
                mode.disabled && styles.transportButtonDisabled
              ]}
              onPress={() => {
                if (mode.disabled) {
                  return; // 비활성화된 버튼은 아무 동작 안함
                }
                
                onTransportModeChange(mode.id);
              }}
              disabled={mode.disabled}
            >
              <Ionicons 
                name={mode.icon as any} 
                size={18} 
                color={
                  mode.disabled 
                    ? '#ccc' 
                    : selectedTransportMode === mode.id ? '#fff' : '#666'
                } 
              />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 출발지/목적지 입력 */}
      <View style={styles.inputContainer}>
        <View style={styles.locationInput}>
          <TextInput
            style={styles.input}
            value={startLocation}
            onChangeText={setStartLocation}
            placeholder="출발지"
            placeholderTextColor="#999"
            onSubmitEditing={onStartLocationSearch}
            returnKeyType="search"
          />
          <View style={styles.inputButtons}>
            <TouchableOpacity 
              style={styles.inputButton}
              onPress={() => {
                setStartLocation('내 위치');
                setStartLocationResults([]);
              }}
            >
              <Ionicons name="locate" size={16} color="#007bff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.inputButton}
              onPress={() => {
                setStartLocation('');
                setStartLocationResults([]);
              }}
            >
              <Ionicons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.locationInput}>
          <TextInput
            style={styles.input}
            value={endLocation}
            onChangeText={setEndLocation}
            placeholder="목적지"
            placeholderTextColor="#999"
            onSubmitEditing={onEndLocationSearch}
            returnKeyType="search"
          />
          <View style={styles.inputButtons}>
            <TouchableOpacity 
              style={styles.inputButton}
              onPress={() => {
                setEndLocation('내 위치');
                setEndLocationResults([]);
              }}
            >
              <Ionicons name="locate" size={16} color="#007bff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.inputButton}
              onPress={() => {
                if (onSwapLocations) {
                  onSwapLocations();
                } else {
                  // fallback: 기본 바꾸기 로직
                  const temp = startLocation;
                  setStartLocation(endLocation);
                  setEndLocation(temp);
                  setStartLocationResults([]);
                  setEndLocationResults([]);
                }
              }}
            >
              <Ionicons name="swap-vertical" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 검색 결과 */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {startLocationSearching && startLocationResults.length > 0 && (
          <View style={styles.resultsSection}>
            {startLocationResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultItem}
                onPress={() => onStartLocationSelect(result)}
              >
                <Ionicons name="location" size={16} color="#007bff" />
                <View style={styles.resultContent}>
                  <Text style={styles.resultName}>{result.placeName}</Text>
                  <Text style={styles.resultAddress}>{result.roadAddress}</Text>
                </View>
                <Text style={styles.resultDistance}>{formatDistance(result.distance)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {endLocationSearching && endLocationResults.length > 0 && (
          <View style={styles.resultsSection}>
            {endLocationResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultItem}
                onPress={() => onEndLocationSelect(result)}
              >
                <Ionicons name="location" size={16} color="#007bff" />
                <View style={styles.resultContent}>
                  <Text style={styles.resultName}>{result.placeName}</Text>
                  <Text style={styles.resultAddress}>{result.roadAddress}</Text>
                </View>
                <Text style={styles.resultDistance}>{formatDistance(result.distance)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    zIndex: 1000,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  transportContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  transportButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transportButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportButtonSelected: {
    backgroundColor: '#007bff',
  },
  transportButtonDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginBottom: 6,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsContainer: {
    maxHeight: 330,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  resultsSection: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 12,
    color: '#666',
  },
  resultDistance: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  routeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  routeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
  },
});

export default RouteSearchPanel;
