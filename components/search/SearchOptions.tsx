import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SearchOptions as SearchOptionsType } from '../../hooks/useSearch';

interface Props {
  searchOptions: SearchOptionsType;
  setSearchOptions: (options: Partial<SearchOptionsType>) => void;
}

const SearchOptions: React.FC<Props> = ({ searchOptions, setSearchOptions }) => {
  return (
    <View style={styles.container}>
      <View style={styles.optionGroup}>
        <Text style={styles.label}>검색 반경</Text>
        <View style={styles.buttonGroup}>
          {[1000, 3000, 5000].map((radius) => (
            <TouchableOpacity
              key={radius}
              style={[styles.button, searchOptions.radius === radius && styles.buttonActive]}
              onPress={() => setSearchOptions({ radius })}
            >
              <Text style={[styles.buttonText, searchOptions.radius === radius && styles.buttonTextActive]}>
                {radius / 1000}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.optionGroup}>
        <Text style={styles.label}>정렬</Text>
        <View style={styles.buttonGroup}>
          {[
            { label: '거리순', value: 'distance' },
            { label: '정확도순', value: 'accuracy' },
          ].map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={[styles.button, searchOptions.sort === value && styles.buttonActive]}
              onPress={() => setSearchOptions({ sort: value })}
            >
              <Text style={[styles.buttonText, searchOptions.sort === value && styles.buttonTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  optionGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#495057',
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 20,
    marginRight: 8,
  },
  buttonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  buttonText: {
    fontSize: 14,
    color: '#495057',
  },
  buttonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SearchOptions;
