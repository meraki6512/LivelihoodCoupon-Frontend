import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * PlaceInfoRow 컴포넌트의 Props 타입
 */
type Props = {
  label: string; // 정보 라벨
  value?: string; // 정보 값 (선택적)
};

/**
 * PlaceInfoRow 컴포넌트
 * 장소 정보를 라벨과 값으로 표시하는 재사용 가능한 행 컴포넌트
 */
export default function PlaceInfoRow({ label, value }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#111',
  },
});


