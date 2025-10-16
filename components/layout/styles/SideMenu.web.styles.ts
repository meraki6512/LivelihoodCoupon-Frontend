import { StyleSheet } from "react-native";

export const webStyles = StyleSheet.create({
  sideMenuWrapper: {
    width: 330,
    backgroundColor: '#f8f9fa',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    boxShadow: '5px 0px 6px rgba(0,0,0,0.25)',
  },
  backgroundBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 123,
    backgroundColor: '#3690FF',
  },
  sideMenuContent: {
    padding: 16,
    height: '100%',
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
    boxShadow: '3px 2px 4px rgba(0,0,0,0.2)',
  },
}
);
