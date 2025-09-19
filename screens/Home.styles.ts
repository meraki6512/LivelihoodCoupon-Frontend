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
  resultSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: Platform.OS === "web" ? 300 : 320,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: "0 -4px 12px rgba(0,0,0,0.12)",
      },
    }),
  },
  resultSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  resultSheetTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  resultSheetClose: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
  },
  resultList: {
    paddingHorizontal: 8,
    paddingBottom: 8,
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
