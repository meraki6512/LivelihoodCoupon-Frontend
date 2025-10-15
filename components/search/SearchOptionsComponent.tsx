import React from 'react';
import { View, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import { SearchOptions } from '../../types/search';
import { commonStyles } from './styles/SearchOptionsComponent.common.styles';
import { webStyles } from './styles/SearchOptionsComponent.web.styles';
import { mobileStyles } from './styles/SearchOptionsComponent.mobile.styles';

interface Props {
  searchOptions: SearchOptions;
  setSearchOptions: (options: Partial<SearchOptions>) => void;
  locationError?: string | null; // 위치 에러 상태
}

const SearchOptionsComponent: React.FC<Props> = ({ searchOptions, setSearchOptions, locationError }) => {
  const platformStyles = Platform.OS === 'web' ? webStyles : mobileStyles;
  return (
    <View style={[commonStyles.container, platformStyles.container]}>
      <View style={[commonStyles.optionGroup, platformStyles.optionGroup]}>
        <Text style={[commonStyles.label, platformStyles.label]}>정렬</Text>
        <View style={[commonStyles.buttonGroup, platformStyles.buttonGroup]}>
          {[
            { label: '거리순', value: 'distance', disabled: !!locationError },
            { label: '정확도순', value: 'accuracy' },
          ].map(({ label, value, disabled }) => (
            <TouchableOpacity
              key={value}
              style={[
                commonStyles.button,
                platformStyles.button,
                searchOptions.sort === value && commonStyles.buttonActive,
                searchOptions.sort === value && platformStyles.buttonActive,
                disabled && { opacity: 0.5 },
              ]}
              onPress={() => !disabled && setSearchOptions({ sort: value })}
              disabled={disabled}
            >
              <Text
                style={[
                  commonStyles.buttonText,
                  platformStyles.buttonText,
                  searchOptions.sort === value && commonStyles.buttonTextActive,
                  searchOptions.sort === value && platformStyles.buttonTextActive,
                  disabled && { color: '#999' },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {locationError && (
          <Text style={[commonStyles.errorText, platformStyles.errorText]}>
            위치 정보를 사용할 수 없어 정확도순으로 검색됩니다.
          </Text>
        )}
      </View>
    </View>
  );
};


export default SearchOptionsComponent;
