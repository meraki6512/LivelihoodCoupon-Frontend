import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  optionGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#495057',
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 20,
    marginRight: 8,
  },
  buttonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  buttonText: {
    fontSize: 14,
    color: '#495057',
  },
  buttonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
