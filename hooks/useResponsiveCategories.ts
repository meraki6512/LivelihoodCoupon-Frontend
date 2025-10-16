import { useState, useEffect, useMemo } from 'react';
import { Category } from '../constants/categories';

const BUTTON_AVERAGE_WIDTH = 150; // Average width per button in pixels
const MAX_VISIBLE_CATEGORIES = 9;
const SIDEMENU_WIDTH = 330; // Width of the side menu
const CONTAINER_PADDING = 80; // Horizontal padding around the buttons

export const useResponsiveCategories = (categories: Category[]) => {
  const [visibleCount, setVisibleCount] = useState(MAX_VISIBLE_CATEGORIES);
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const calculateState = () => {
      const availableWidth = window.innerWidth - SIDEMENU_WIDTH - CONTAINER_PADDING;
      const maxBasedOnWidth = Math.floor(availableWidth / BUTTON_AVERAGE_WIDTH);

      if (maxBasedOnWidth < 3) {
        setShouldShow(false);
        setVisibleCount(0);
      } else {
        setShouldShow(true);
        const newVisibleCount = Math.min(MAX_VISIBLE_CATEGORIES, maxBasedOnWidth);
        
        if (newVisibleCount < categories.length) {
          setVisibleCount(Math.max(1, newVisibleCount - 1));
        } else {
          setVisibleCount(newVisibleCount);
        }
      }
    };

    calculateState();
    window.addEventListener('resize', calculateState);

    return () => {
      window.removeEventListener('resize', calculateState);
    };
  }, [categories.length]);

  const visibleCategories = useMemo(() => categories.slice(0, visibleCount), [categories, visibleCount]);
  const hiddenCategories = useMemo(() => categories.slice(visibleCount), [categories, visibleCount]);

  return { visibleCategories, hiddenCategories, shouldShow };
};
