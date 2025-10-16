import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { useRecentlyViewedPlaces, MAX_RECENTLY_VIEWED_PLACES } from "../hooks/useRecentlyViewedPlaces";
import { MarkerData } from "../types/kakaoMap";
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import {View} from "react-native"; // Import Svg components

interface RecentlyViewedPlacesProps {
  onPlaceClick: (place: MarkerData) => void;
  onClickOutside: () => void; // New prop to handle clicks outside
  toggleButtonRef: React.RefObject<any>; // Ref to the button that toggles this component
}

const RecentlyViewedContainer = styled.div`
  position: absolute;
  top: 70px; /* Adjusted to move it further down, considering the button's new position */
  right: 20px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: 300px;
  max-height: 400px;
  overflow-y: auto; /* Ensure the container itself scrolls */
  padding: 15px;
`;

const CountInfo = styled.p`
  font-size: 0.9rem;
  color: #777;
  text-align: right;
  margin-bottom: 10px;
  padding-right: 5px;
`;

const RecentlyViewedPlaces: React.FC<RecentlyViewedPlacesProps> = ({ onPlaceClick, onClickOutside, toggleButtonRef }) => {
  const {
    recentlyViewedPlaces,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    totalRecentlyViewedCount,
    removePlace,
  } = useRecentlyViewedPlaces();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the click is on the toggle button, do nothing
      if (toggleButtonRef.current && toggleButtonRef.current.contains(event.target as Node)) {
        return;
      }
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClickOutside, toggleButtonRef]);

  return (
    <RecentlyViewedContainer ref={containerRef}>
      {totalRecentlyViewedCount > 0 && (
        <CountInfo>({totalRecentlyViewedCount} / {MAX_RECENTLY_VIEWED_PLACES})</CountInfo>
      )}
      {recentlyViewedPlaces.length === 0 && totalRecentlyViewedCount === 0 ? (
        <EmptyMessage>최근 본 장소가 없습니다.</EmptyMessage>
      ) : (
        <>
          {recentlyViewedPlaces.map((place) => {
            const isParkingLot = !!place.isParkingLot;
            const iconColor = isParkingLot ? "#9932CC" : "#007bff";

            return (
              <PlaceItem key={place.placeId}>
                <View style={{ marginRight: 10, flexShrink: 0, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                  {isParkingLot ? (
                      <Svg width="24" height="24" viewBox="0 0 24 24">
                          <Circle cx="12" cy="12" r="11" fill={iconColor} stroke="#fff" strokeWidth="2"/>
                          <SvgText
                              x="12.5"
                              y="18"
                              fontFamily="Arial, sans-serif"
                              fontSize="15"
                              fontWeight="bold"
                              textAnchor="middle"
                              fill="#fff"
                          >
                              P
                          </SvgText>
                      </Svg>
                  ) : (
                    <Ionicons name="location-sharp" size={24} color={iconColor} />
                  )}
                </View>
                <PlaceInfo onClick={() => onPlaceClick(place)}>
                  <PlaceName>{place.placeName}</PlaceName>
                  <PlaceAddress>{place.roadAddress || place.lotAddress}</PlaceAddress>
                </PlaceInfo>
                <RemoveButton onClick={(e) => { e.stopPropagation(); removePlace(place.placeId); }}>
                  &times;
                </RemoveButton>
              </PlaceItem>
            );
          })}
          {totalPages > 1 && (
            <PaginationContainer>
              <PaginationButton onClick={goToPreviousPage} disabled={currentPage === 1}>
                이전
              </PaginationButton>
              <PageInfo>{currentPage} / {totalPages}</PageInfo>
              <PaginationButton onClick={goToNextPage} disabled={currentPage === totalPages}>
                다음
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      )}
    </RecentlyViewedContainer>
  );
};

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  text-align: center;
`;

const PlaceItem = styled.div`
  display: flex;
  align-items: center; /* Align items vertically */
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #f9f9f9;
  }
`;

const PlaceInfo = styled.div`
  flex: 1;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #999;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  margin-left: 10px;
  &:hover {
    color: #ff385c;
  }
`;

const PlaceName = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin: 0;
`;

const PlaceAddress = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 5px 0 0;
`;

const EmptyMessage = styled.p`
  font-size: 0.9rem;
  color: #777;
  text-align: center;
  padding: 20px 0;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  gap: 10px;
`;

const PaginationButton = styled.button`
  background-color: #3690FF;
  color: #F8FAFE;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 0.9rem;
  color: #555;
`;

export default RecentlyViewedPlaces;