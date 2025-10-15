import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { SIZES } from "../constants/sizes";

export const mobileStyles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingIndicator: {
    marginVertical: 10,
  },
  errorText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
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
  mapFullScreen: {
    flex: 1,
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundGray,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 80, // 기본값, 동적으로 조정됨
    right: SIZES.spacing.lg,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius.xxl,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SIZES.shadow.base,
  },
  searchInAreaButton: {
    position: 'absolute',
    bottom: 120, // 기본값, 동적으로 조정됨
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.xl,
    zIndex: 999,
    ...SIZES.shadow.sm,
  },
  searchInAreaButtonText: {
    color: COLORS.blue,
    fontWeight: 'bold',
  },
  routeResultContainer: {
    position: 'absolute',
    bottom: 120,
    left: 80,
    right: 80,
    zIndex: 1000,
  },
  routeSummaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    ...SIZES.shadow.base,
  },
  routeSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeSummaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  routeSummaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeSummaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  routeSummaryLabel: {
    fontSize: 12,
    color: '#666',
  },
});
