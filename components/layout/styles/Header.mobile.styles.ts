import { StyleSheet, Platform } from "react-native";

export const mobileStyles = StyleSheet.create({
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
});