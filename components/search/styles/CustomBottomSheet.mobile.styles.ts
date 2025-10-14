import { StyleSheet } from "react-native";

export const mobileStyles = StyleSheet.create({
  bottomSheetContainer: {
    width: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    left: 0,
    zIndex: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    // iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    // Android
    elevation: 15,
  },
});
