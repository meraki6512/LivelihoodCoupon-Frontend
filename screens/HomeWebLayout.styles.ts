import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { SIZES } from "../constants/sizes";

// 웹용 스타일 정의
export const webStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  mapContainer: {
    flex: 1,
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: COLORS.red,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.base,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  errorText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: SIZES.spacing.lg,
    right: SIZES.spacing.lg,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius.full,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
    zIndex: 999,
  },
  currentLocationButtonIcon: {
    fontSize: 24,
  },
  searchInAreaButton: {
    position: 'absolute',
    bottom: SIZES.spacing.lg,
    alignSelf: 'center',
    backgroundColor: COLORS.blue,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.xxl,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInAreaButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  recentlyViewedButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#3690FF', // Base blue color
    paddingVertical: 10, // Slightly larger padding
    paddingHorizontal: 15, // Slightly larger padding
    borderRadius: 50, // More rounded
    borderWidth: 1,
    borderColor: '#3690FF', // Match background color
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2, // More prominent shadow
    },
    shadowOpacity: 0.5, // Darker shadow
    shadowRadius: 5.46, // Larger shadow radius
    elevation: 9, // Higher elevation for Android shadow
  },
  recentlyViewedButtonText: {
    flexDirection: 'row', // Enable flexbox
    alignItems: 'center', // Vertically center items
    // No fontSize, color, fontWeight here as they apply to Text components.
    // The Text component inside the View will inherit or have its own styles.
  },
});
