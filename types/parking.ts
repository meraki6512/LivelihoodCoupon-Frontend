export interface ParkingLot {
  id: number;
  parkingLotNm: string;
  roadAddress: string;
  lotAddress: string;
  parkingChargeInfo: string;
  lat: number;
  lng: number;
  distance: number;
}

export interface ParkingLotDetail {
  id: number;
  parkingLotNm: string;
  roadAddress: string;
  lotAddress: string;
  parkingCapacity: string;
  operDay: string;
  weekOpenTime: string;
  weekCloseTime: string;
  satOpenTime: string;
  satCloseTime: string;
  holidayOpenTime: string;
  holidayCloseTime: string;
  parkingChargeInfo: string;
  paymentMethod: string;
  specialComment: string;
  phoneNumber: string;
  lat: number;
  lng: number;
}

export interface ParkingLotSearchResponse {
  success: boolean;
  data: {
    content: ParkingLot[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    startPage: number;
    endPage: number;
    hasPrev: boolean;
    hasNext: boolean;
    blockSize: number;
    searchCenterLat: number;
    searchCenterLng: number;
    last: boolean;
    first: boolean;
  };
  timestamp: string;
}

export interface ParkingLotDetailResponse {
  success: boolean;
  data: ParkingLotDetail;
  timestamp: string;
}
