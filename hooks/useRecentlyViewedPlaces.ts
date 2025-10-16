import { useState, useEffect, useMemo } from "react"; // Import useMemo
import { MarkerData } from "../types/kakaoMap";

type Place = MarkerData;

const RECENTLY_VIEWED_PLACES_KEY = "recentlyViewedPlaces";
export const MAX_RECENTLY_VIEWED_PLACES = 20; // Increased limit and exported
const ITEMS_PER_PAGE = 5; // Pagination size

export const useRecentlyViewedPlaces = () => {
  const [allRecentlyViewedPlaces, setAllRecentlyViewedPlaces] = useState<Place[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0); // New state for forcing refresh

  useEffect(() => {
    const loadPlaces = () => {
      if (typeof window !== "undefined") {
        const storedPlaces = localStorage.getItem(RECENTLY_VIEWED_PLACES_KEY);
        if (storedPlaces) {
          setAllRecentlyViewedPlaces(JSON.parse(storedPlaces));
        } else {
          setAllRecentlyViewedPlaces([]); // Initialize if nothing in storage
        }
      }
    };

    loadPlaces(); // Load initially

    // Listen for changes from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === RECENTLY_VIEWED_PLACES_KEY) {
        loadPlaces();
      }
    };

    // Listen for custom event for same-tab updates
    const handleCustomStorageChange = () => {
      loadPlaces();
    };

    if (typeof window !== "undefined") {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('recentlyViewedStorageChange', handleCustomStorageChange);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('recentlyViewedStorageChange', handleCustomStorageChange);
      }
    };
  }, [refreshKey]); // refreshKey still triggers a re-read

  const addPlace = (place: Place) => {
    if (typeof window !== "undefined") {
      const storedPlaces = localStorage.getItem(RECENTLY_VIEWED_PLACES_KEY);
      const currentPlaces = storedPlaces ? JSON.parse(storedPlaces) : [];
      
      // Remove if already exists to move it to the top
      const filteredPlaces = currentPlaces.filter((p: Place) => p.placeId !== place.placeId);
      const newPlaces = [place, ...filteredPlaces];
      const limitedPlaces = newPlaces.slice(0, MAX_RECENTLY_VIEWED_PLACES);

      localStorage.setItem(RECENTLY_VIEWED_PLACES_KEY, JSON.stringify(limitedPlaces));
      setRefreshKey((prev) => prev + 1); // Trigger re-read from storage
    }
  };

  const totalPages = useMemo(() => Math.ceil(allRecentlyViewedPlaces.length / ITEMS_PER_PAGE), [allRecentlyViewedPlaces.length]);

  const paginatedPlaces = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return allRecentlyViewedPlaces.slice(startIndex, endIndex);
  }, [allRecentlyViewedPlaces, currentPage]);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const resetPage = () => {
    setCurrentPage(1);
  };

  const removePlace = (placeId: string) => {
    if (typeof window !== "undefined") {
      const storedPlaces = localStorage.getItem(RECENTLY_VIEWED_PLACES_KEY);
      const currentPlaces = storedPlaces ? JSON.parse(storedPlaces) : [];
      const updatedPlaces = currentPlaces.filter((place: Place) => place.placeId !== placeId);
      
      localStorage.setItem(RECENTLY_VIEWED_PLACES_KEY, JSON.stringify(updatedPlaces));
      
      // If the current page becomes empty after removal, go to the previous page
      const newTotalPages = Math.ceil(updatedPlaces.length / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      
      setRefreshKey((prev) => prev + 1); // Trigger re-read from storage
    }
  };

  return {
    recentlyViewedPlaces: paginatedPlaces, // Return paginated slice
    allRecentlyViewedPlaces, // Also return the full list if needed elsewhere
    addPlace,
    removePlace, // Add removePlace to the returned object
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    resetPage,
    totalRecentlyViewedCount: allRecentlyViewedPlaces.length, // Return total count
  };
};
