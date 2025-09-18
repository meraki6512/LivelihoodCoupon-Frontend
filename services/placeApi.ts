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
  const payload = res.data;
  if (!payload || payload.success === false) {
    throw new Error(payload?.error || 'Failed to fetch place details');
  }
  if (!payload.data) {
    throw new Error('Place details not found');
  }
  return payload.data;
}


