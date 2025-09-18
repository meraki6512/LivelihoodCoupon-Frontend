import { create } from 'zustand';

type PlaceState = {
  selectedPlaceId: string | null;
  setSelectedPlaceId: (id: string | null) => void;
};

export const usePlaceStore = create<PlaceState>((set) => ({
  selectedPlaceId: null,
  setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),
}));


