import { StyleSheet } from "react-native";

export const mobileStyles = StyleSheet.create({
  sideMenuContainer: {
    width: 350,
    backgroundColor: '#f8f9fa',
    padding: 16,
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    // iOS
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    // Android
    elevation: 15,
  },
  toggleButton: {
    position: 'absolute',
    top: '50%',
    right: -30,
    width: 30,
    height: 60,
    backgroundColor: '#f8f9fa',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#dee2e6',
    // iOS
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Android
    elevation: 10,
  },
});
