import { Platform } from "react-native";
import { useSearch as useSearchWeb } from "./useSearch.web";
import { useSearch as useSearchMobile } from "./useSearch.mobile";

export const useSearch = Platform.OS === "web" ? useSearchWeb : useSearchMobile;
