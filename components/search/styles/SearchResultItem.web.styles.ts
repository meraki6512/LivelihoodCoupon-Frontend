import { StyleSheet } from "react-native";

export const webStyles = StyleSheet.create({
  // 웹 전용 스타일을 여기에 추가하세요.
    parkingChargeInfoContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
    parkingChargeInfoText: { // Base style for parkingChargeInfo text
    fontSize: 12,
    fontWeight: 'bold',
  },
    parkingChargeInfoPaidBackground: {
    backgroundColor: '#F8D7DA',
  },
    parkingChargeInfoPaidText: {
    color: '#DC3545',
  },
    parkingChargeInfoFreeBackground: {
    backgroundColor: '#D4EDDA',
  },
    parkingChargeInfoFreeText: {
    color: '#28A745',
  },
    parkingChargeInfoMixedBackground: {
    backgroundColor: '#CCE5FF',
  },
    parkingChargeInfoMixedText: {
    color: '#007BFF',
  },
    parkingChargeInfoDefaultBackground: {
    backgroundColor: '#E2E6EA',
  },
    parkingChargeInfoDefaultText: {
    color: '#6C757D',
  },
});
