import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SearchResult } from '../../types/search';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  item: SearchResult;
  onPress: (item: SearchResult) => void;
}

// 거리를 km 단위로 변환하고 소수점 한 자리까지 표시하는 함수
const formatDistance = (distance: number) => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
};

const SearchResultItem: React.FC<Props> = ({ item, onPress }) => {
  return (
    <Pressable onPress={() => onPress(item)} style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="location-sharp" size={24} color="#007bff" />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.placeName}>{item.placeName}</Text>
        <Text style={styles.address}>{item.roadAddress || item.lotAddress}</Text>
      </View>
      <View style={styles.distanceContainer}>
        <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#6c757d',
  },
  distanceContainer: {
    marginLeft: 12,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
});

export default SearchResultItem;
