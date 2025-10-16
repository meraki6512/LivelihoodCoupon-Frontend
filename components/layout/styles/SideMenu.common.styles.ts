import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0, // Removed top padding
    paddingBottom: 15, // Keep bottom padding as it was part of paddingVertical: 10
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderWidth: 2, // Add border width
    borderColor: '#FFFFFF', // Add white border color
    borderRadius: 20, // Make it round
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#FFFFFF', // Changed to white
  },
});
