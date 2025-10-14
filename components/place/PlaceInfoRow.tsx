import React from 'react';
import { View, Text } from 'react-native';
import { commonStyles } from './styles/PlaceInfoRow.common.styles';
import { webStyles } from './styles/PlaceInfoRow.web.styles';
import { mobileStyles } from './styles/PlaceInfoRow.mobile.styles';


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
    <View style={commonStyles.row}>
      <Text style={commonStyles.label}>{label}</Text>
      <Text style={commonStyles.value}>{value || '-'}</Text>
    </View>
  );
}



