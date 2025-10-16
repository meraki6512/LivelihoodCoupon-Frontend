import { StyleSheet } from "react-native";

export const webStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 0, // Keep padding 0 for web
  },
  suggestionsContainer: {
    top: 65, // Adjusted from 60
    // Removed left and right to expand width
  },
  transportModeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportModeButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#3690FF',
    borderWidth: 2,
  },
});
