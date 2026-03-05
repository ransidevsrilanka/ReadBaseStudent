import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="session-conflict" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="subject/[id]" options={{ presentation: 'card', headerShown: true, headerTitle: 'Topics' }} />
            <Stack.Screen name="topic/[id]" options={{ presentation: 'card', headerShown: true, headerTitle: 'Topic Content' }} />
            <Stack.Screen name="pdf/[id]" options={{ presentation: 'modal', headerShown: true, headerTitle: 'Note Viewer' }} />
            <Stack.Screen name="print-request" options={{ presentation: 'card', headerShown: true, headerTitle: 'Request Print' }} />
          </Stack>
        </SafeAreaProvider>
      </ThemeProvider>
    </AlertProvider>
  );
}
