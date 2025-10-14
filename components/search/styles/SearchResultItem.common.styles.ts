import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#6c757d',
  },
  distanceContainer: {
    marginLeft: 12,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
});
