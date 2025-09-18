import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  FlatList,
  Pressable, // Add Pressable
  Animated,
  Keyboard,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as Location from 'expo-location'; // Location 임포트 다시 추가
import KakaoMap from '../components/KakaoMap';
import { KAKAO_REST_API_KEY } from '@env';

type SearchResult = {
  latitude: number;
  longitude: number;
  place_name: string;
};

export default function Home() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<{ latitude: number; longitude: number } | null>(null);
  const animation = useRef(new Animated.Value(0)).current;
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null); // 지도 중심 좌표 상태 추가

  useEffect(() => {
    (async () => { // expo-location 로직 복원
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('위치 접근 권한이 거부되었습니다.');
        return;
      }

      try {
        const { coords } = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setSelectedPlace({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setMapCenter({ // 초기 지도 중심 좌표 설정
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      } catch (error) {
        console.error('위치 정보를 가져오는 데 실패했습니다:', error);
        setErrorMsg('위치 정보를 가져오는 데 실패했습니다.');
      }
    })();
  }, []);

  const searchPlaces = async () => {
    Keyboard.dismiss();
    if (!searchQuery.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }
    if (!mapCenter) { // mapCenter를 사용하도록 변경
      alert('지도 중심 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setLoading(true);
    setSearchResults([]);
    setErrorMsg(null);

    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${searchQuery}&x=${mapCenter.longitude}&y=${mapCenter.latitude}&radius=10000`, // mapCenter 사용
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
          },
        }
      );
      const data = await response.json();

      if (data.documents && data.documents.length > 0) {
        const results = data.documents.map((doc: any) => ({
          latitude: parseFloat(doc.y),
          longitude: parseFloat(doc.x),
          place_name: doc.place_name,
        }));
        setSearchResults(results);
        console.log("Search results:", results); // Add this line
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false, // Set to false for web to suppress warning
        }).start();
      } else {
        alert('검색 결과가 없습니다.');
      }
    } catch (error) {
      console.error('키워드 검색 실패:', error);
      setErrorMsg('키워드 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (item: SearchResult) => {
    setSelectedPlace({ latitude: item.latitude, longitude: item.longitude });
    setSearchResults([]);
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.text}>안녕하세요!</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="장소를 검색하세요..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchPlaces}
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchPlaces}>
            <Text style={styles.searchButtonText}>검색</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="small" color="#0000ff" style={styles.loadingIndicator} />}
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      </View>

      {searchResults.length > 0 && (
        <Animated.View style={[styles.resultList, { transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }] }]}>
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable onPress={() => handleSelectResult(item)}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultItemText}>{item.place_name}</Text>
                </View>
              </Pressable>
            )}
          />
        </Animated.View>
      )}

      {mapCenter ? ( // mapCenter가 있을 때만 렌더링
        <KakaoMap
          latitude={mapCenter.latitude} // mapCenter 사용
          longitude={mapCenter.longitude} // mapCenter 사용
          style={styles.mapFullScreen}
          markers={searchResults}
          onMapCenterChange={(lat, lng) => setMapCenter({ latitude: lat, longitude: lng })} // 지도 중심 변경 핸들러 추가
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>지도를 불러오는 중입니다...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#f8f9fd',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 0,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginVertical: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  mapFullScreen: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultList: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 180 : 150,
    width: '90%',
    maxHeight: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultItemText: {
    fontSize: 16,
  },
});