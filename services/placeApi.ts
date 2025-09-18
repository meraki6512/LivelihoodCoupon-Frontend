import axios from 'axios';
import { PlaceDetail } from '../types/place';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: string | null;
  timestamp: string;
};

export async function getPlaceDetailsById(placeId: string): Promise<PlaceDetail> {
  const res = await axios.get<ApiResponse<PlaceDetail>>(`/api/places/${placeId}`);
  return res.data.data;
}


