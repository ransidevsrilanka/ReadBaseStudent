import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="subject/[id]" options={{ presentation: 'card', headerShown: true, headerTitle: 'Topics' }} />
          <Stack.Screen name="topic/[id]" options={{ presentation: 'card', headerShown: true, headerTitle: 'Topic Content' }} />
          <Stack.Screen name="pdf/[id]" options={{ presentation: 'modal', headerShown: true, headerTitle: 'Note Viewer' }} />
        </Stack>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
