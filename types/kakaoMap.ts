import { ViewStyle } from "react-native";

export type MarkerData = {
  id?: string;
  latitude: number;
  longitude: number;
  place_name: string;
};

export type KakaoMapProps = {
  latitude: number;
  longitude: number;
  style?: ViewStyle;
  markers?: MarkerData[];
  onMapCenterChange?: (latitude: number, longitude: number) => void;
  onMarkerPress?: (placeId?: string) => void;
};
