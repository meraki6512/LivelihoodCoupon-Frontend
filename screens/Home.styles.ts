import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingIndicator: {
    marginVertical: 10,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  mapFullScreen: {
    flex: 1,
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultList: {
    position: "absolute",
    top: Platform.OS === "android" ? 180 : 150,
    width: "90%",
    maxHeight: 200,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)",
      },
    }),
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultItemText: {
    fontSize: 16,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff385c',
  },
  searchResultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchResultAddress: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6c757d',
  },
});
