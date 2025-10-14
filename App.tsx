import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import Home from './screens/Home';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { commonStyles } from './styles/App.common.styles';
import { webStyles } from './styles/App.web.styles';
import { mobileStyles } from './styles/App.mobile.styles';


const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <View style={commonStyles.container}>
            <Home />
            <StatusBar style="auto" />
          </View>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

