import { StyleSheet } from "react-native";

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
    backgroundColor: '#ff385c',
    paddingVertical: 10,
    paddingHorizontal: 15,
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
    backgroundColor: "#f0f0f0", // Add a background color for visibility
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 120, // Adjust this value based on your layout
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInAreaButton: {
    position: 'absolute',
    bottom: 120, // Adjust this value based on your layout
    alignSelf: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 999,
  },
  searchInAreaButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
