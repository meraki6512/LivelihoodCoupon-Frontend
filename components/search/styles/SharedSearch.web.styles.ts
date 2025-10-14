import { StyleSheet } from "react-native";

export const webStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 0, // Keep padding 0 for web
  },
  suggestionsContainer: {
    top: 65, // Adjusted from 60
    left: 16,
    right: 16,
  },
});
