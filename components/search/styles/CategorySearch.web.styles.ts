
import styled from 'styled-components';
import { COLORS } from '../../../constants/colors';

export const CategoryContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 0px;
  background-color: transparent;
  border-radius: 12px;
`;

export const CategoryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${COLORS.border};
  background-color: ${COLORS.white};
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: ${COLORS.primaryLight};
    border-color: ${COLORS.primary};
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
`;

export const CategoryButtonText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${COLORS.textSecondary};
`;

export const MoreButton = styled(CategoryButton)`
  // Style for the '...' button
`;

export const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${COLORS.white};
  border-radius: 8px;
  border: 1px solid ${COLORS.border};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 150px;
  margin-top: 8px;
`;

export const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background-color: transparent;
  border: none;
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: ${COLORS.gray50};
  }
`;
