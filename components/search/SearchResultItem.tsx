import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SearchResult } from '../../types/search';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Text as SvgText } from 'react-native-svg'; // Import Svg components
import { commonStyles } from './styles/SearchResultItem.common.styles';
import { webStyles } from './styles/SearchResultItem.web.styles';
import { mobileStyles } from './styles/SearchResultItem.mobile.styles';

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
  const getParkingChargeInfoStyle = (parkingChargeInfo: string) => {
    if (parkingChargeInfo.includes('유료')) {
      return { 
        container: webStyles.parkingChargeInfoPaidBackground,
        text: webStyles.parkingChargeInfoPaidText
      };
    }
    if (parkingChargeInfo.includes('무료')) {
      return { 
        container: webStyles.parkingChargeInfoFreeBackground,
        text: webStyles.parkingChargeInfoFreeText
      };
    }
    return { 
      container: webStyles.parkingChargeInfoDefaultBackground,
      text: webStyles.parkingChargeInfoDefaultText
    };
  };

  const feeStyle = item.parkingChargeInfo ? getParkingChargeInfoStyle(item.parkingChargeInfo) : null;

  const isParkingLot = !!item.parkingChargeInfo;
  const iconColor = isParkingLot ? "#9932CC" : "#007bff"; // Purple for parking, blue for default

  return (
    <Pressable onPress={() => onPress(item)} style={commonStyles.container}>
      <View style={commonStyles.iconContainer}>
        {isParkingLot ? (
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="13" fill={iconColor} stroke="#fff" strokeWidth="2"/>
            <SvgText
              x="12.5"
              y="18"
              fontFamily="Arial, sans-serif"
              fontSize="17"
              fontWeight="bold"
              textAnchor="middle"
              fill="#fff"
            >
              P
            </SvgText>
          </Svg>
        ) : (
          <Ionicons name="location-sharp" size={24} color={iconColor} />
        )}
      </View>
      <View style={commonStyles.infoContainer}>
        <Text style={commonStyles.placeName}>{item.placeName}</Text>
        <Text style={commonStyles.address}>{item.roadAddress || item.lotAddress}</Text>
        {item.parkingChargeInfo && feeStyle && (
          <View style={[webStyles.parkingChargeInfoContainer, feeStyle.container]}>
            <Text style={[webStyles.parkingChargeInfoText, feeStyle.text]}>{item.parkingChargeInfo}</Text>
          </View>
        )}
      </View>
      <View style={commonStyles.distanceContainer}>
        <Text style={commonStyles.distanceText}>{formatDistance(item.distance)}</Text>
      </View>
    </Pressable>
  );
};


export default SearchResultItem;
