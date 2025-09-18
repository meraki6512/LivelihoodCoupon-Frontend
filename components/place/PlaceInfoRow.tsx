import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  label: string;
  value?: string;
};

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


