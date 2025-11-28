import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'Homepage',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="Homepage" options={{ presentation: 'modal', title: 'Typux', headerShown: false }} />
        <Stack.Screen name="AddPlace" options={{ presentation: 'modal', title: 'Add Spot', headerShown: false }} />
        <Stack.Screen name="PlaceInfo" options={{ presentation: 'modal', title: 'Spot Info', headerShown: false }} />
        <Stack.Screen name="Settings" options={{ presentation: 'modal', title: 'Settings', headerShown: false }} />
        <Stack.Screen name="Score" options={{ presentation: 'modal', title: 'Score', headerShown: false }} />
        <Stack.Screen name="History" options={{ presentation: 'modal', title: 'History', headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
