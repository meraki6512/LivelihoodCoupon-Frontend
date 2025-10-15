import React from 'react';
import { View, Text, SafeAreaView, Platform } from 'react-native';
import { webStyles } from './styles/Header.web.styles';
import { mobileStyles } from './styles/Header.mobile.styles';

/**
 * Header 컴포넌트
 * 앱의 상단 헤더를 담당하며, 제목만 표시합니다.
 * 검색 기능은 SideMenu에서 처리됩니다.
 */
const Header: React.FC = () => {
  const styles = Platform.OS === 'web' ? webStyles : mobileStyles;
  /*
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>제목</Text>
      </View>
    </SafeAreaView>
  );
  */
  return null;
};

export default Header;