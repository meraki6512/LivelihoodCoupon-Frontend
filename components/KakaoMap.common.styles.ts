import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  // 드롭다운 메뉴 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeMenuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 280,
    maxWidth: 320,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  routeMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  routeMenuSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  routeMenuButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  routeMenuButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  routeMenuCancelButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  routeMenuCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  webMapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
