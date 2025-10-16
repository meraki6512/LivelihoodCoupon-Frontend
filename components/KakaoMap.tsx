import { Platform } from "react-native";
import WebKakaoMap, { MapHandles } from "./KakaoMap.web";
import MobileKakaoMap from "./KakaoMap.mobile";
import { KakaoMapProps } from "../types/kakaoMap";
import React, { forwardRef } from "react";

const KakaoMap = forwardRef<MapHandles, KakaoMapProps>((props, ref) => {
  if (Platform.OS === "web") {
    return <WebKakaoMap {...props} ref={ref} />;
  }
  return <MobileKakaoMap {...props} />;
});

export default KakaoMap;
