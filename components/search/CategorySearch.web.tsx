import React, { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../../constants/categories';
import { 
  CategoryContainer, 
  CategoryButton, 
  CategoryButtonText, 
  MoreButton, 
  DropdownContainer, 
  DropdownItem 
} from './styles/CategorySearch.web.styles';
import { COLORS } from '../../constants/colors';
import { useResponsiveCategories } from '../../hooks/useResponsiveCategories';

interface CategorySearchWebProps {
  onCategoryClick: (categoryName: string) => void;
}

const CategorySearchWeb: React.FC<CategorySearchWebProps> = ({ onCategoryClick }) => {
  const { visibleCategories, hiddenCategories, shouldShow } = useResponsiveCategories(CATEGORIES);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!shouldShow) {
    return null;
  }

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(prev => !prev);
  }

  return (
    <CategoryContainer>
      {visibleCategories.map((category) => (
        <CategoryButton
          key={category.id}
          onClick={() => onCategoryClick(category.name)}
        >
          <Ionicons
            name={category.icon as any}
            size={16}
            color={COLORS.textSecondary}
          />
          <CategoryButtonText>{category.name}</CategoryButtonText>
        </CategoryButton>
      ))}

      {hiddenCategories.length > 0 && (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <MoreButton onClick={handleMoreClick}>
            <Ionicons name="ellipsis-horizontal" size={16} color={COLORS.textSecondary} />
          </MoreButton>
          {isDropdownOpen && (
            <DropdownContainer>
              {hiddenCategories.map((category) => (
                <DropdownItem
                  key={category.id}
                  onClick={() => {
                    onCategoryClick(category.name);
                    setIsDropdownOpen(false);
                  }}
                >
                  <Ionicons name={category.icon as any} size={16} color={COLORS.textSecondary} />
                  <span>{category.name}</span>
                </DropdownItem>
              ))}
            </DropdownContainer>
          )}
        </div>
      )}
    </CategoryContainer>
  );
};

export default CategorySearchWeb;