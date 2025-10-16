import { StyleSheet } from "react-native";

export const mobileStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16, // Restore padding for mobile
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
