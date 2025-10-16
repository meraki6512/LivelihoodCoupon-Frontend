import { Platform } from "react-native";
import HomeWeb from "./Home.web";
import HomeMobile from "./Home.mobile";

export default function Home() {
  if (Platform.OS === "web") {
    return <HomeWeb />;
  }
  return <HomeMobile />;
}