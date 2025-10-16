import React from 'react';
import { View, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import { SearchOptions } from '../../types/search';
import { commonStyles } from './styles/SearchOptionsComponent.common.styles';
import { webStyles } from './styles/SearchOptionsComponent.web.styles';

interface Props {
  searchOptions: SearchOptions;
  setSearchOptions: (options: Partial<SearchOptions>) => void;
}

const WebSearchOptionsComponent: React.FC<Props> = ({ searchOptions, setSearchOptions }) => {
  const platformStyles = webStyles;
  return (
    <View style={[commonStyles.container, platformStyles.container]}>
      <View style={[commonStyles.optionGroup, platformStyles.optionGroup]}>
        <View style={[commonStyles.buttonGroup, platformStyles.buttonGroup]}>
          {[
            { label: '거리순', value: 'distance' },
            { label: '정확도순', value: 'accuracy' },
          ].map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={[
                commonStyles.button,
                platformStyles.button,
                searchOptions.sort === value && commonStyles.buttonActive,
                searchOptions.sort === value && platformStyles.buttonActive,
              ]}
              onPress={() => {
                if (value === 'accuracy') {
                  setSearchOptions({ sort: 'accuracy', forceLocationSearch: false });
                } else {
                  setSearchOptions({ sort: value as 'distance' | 'accuracy' });
                }
              }}
            >
              <Text
                style={[
                  commonStyles.buttonText,
                  platformStyles.buttonText,
                  searchOptions.sort === value && commonStyles.buttonTextActive,
                  searchOptions.sort === value && platformStyles.buttonTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};


export default WebSearchOptionsComponent;
