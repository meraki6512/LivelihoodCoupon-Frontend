import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';

/**
 * Header 컴포넌트
 * 앱의 상단 헤더를 담당하며, 제목만 표시합니다.
 * 검색 기능은 SideMenu에서 처리됩니다.
 */
const Header: React.FC = () => {
  const currentStyles = Platform.OS === 'web' ? webStyles : mobileStyles;

  return (
    <SafeAreaView style={currentStyles.safeArea}>
      <View style={currentStyles.headerContainer}>
        <Text style={currentStyles.title}>민생회복 소비쿠폰 사용처</Text>
      </View>
    </SafeAreaView>
  );
};

const commonStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const webStyles = StyleSheet.create({
  ...commonStyles,
  safeArea: {
    ...commonStyles.safeArea,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
});

const mobileStyles = StyleSheet.create({
  ...commonStyles,
  safeArea: {
    ...commonStyles.safeArea,
  },
  headerContainer: {
    ...commonStyles.headerContainer,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
});

export default Header;