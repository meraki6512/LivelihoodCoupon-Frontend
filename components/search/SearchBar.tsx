import { Platform } from "react-native";
import WebSearchBar from "./SearchBar.web";
import MobileSearchBar from "./SearchBar.mobile";
import React, { forwardRef } from "react";
import { TextInput, TextInputProps } from "react-native";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  onFocus?: TextInputProps['onFocus'];
  onBlur?: TextInputProps['onBlur'];
}

const SearchBar = forwardRef<TextInput, SearchBarProps>((props, ref) => {
  if (Platform.OS === "web") {
    return <WebSearchBar {...props} ref={ref} />;
  }
  return <MobileSearchBar {...props} ref={ref} />;
});

export default SearchBar;
