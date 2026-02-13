// RootLayout.tsx
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, StatusBar as RNStatusBar, View } from 'react-native';
import 'react-native-reanimated';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeType } from '../theme/Colors';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '../theme/ThemeContext';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from '../redux/store';

import { CameraPermissionProvider } from '@/context/CameraPermissionProvider';
import { LocationProvider } from '../hooks/LocationContext';

import { I18nextProvider } from 'react-i18next';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import i18n from '../i18n';

// --- Convert ThemeType to Paper theme ---
function mapThemeToPaper(theme: ThemeType, mode: 'light' | 'dark') {
  const baseTheme = mode === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: theme.primary.base,
      onPrimary: theme.text.primary,
      background: theme.background.screen,
      surface: theme.background.section,
      error: theme.status?.error ?? '#B00020',
      onSurface: theme.text.primary,
      onBackground: theme.text.primary,
    },
  };
}

export default function RootLayout() {
  const [loaded] = useFonts({
    "SFProDisplay-Bold": require("../assets/fonts/sf-pro-display/SFProDisplay-Bold.otf"),
    "SFProDisplay-Medium": require("../assets/fonts/sf-pro-display/SFProDisplay-Medium.otf"),
    "SFProDisplay-Regular": require("../assets/fonts/sf-pro-display/SFProDisplay-Regular.otf"),
  });

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <I18nextProvider i18n={i18n}>
            <AppThemeProvider>
              <LocationProvider>
                <CameraPermissionProvider>
                  <ThemedNavigation />
                </CameraPermissionProvider>
              </LocationProvider>
            </AppThemeProvider>
          </I18nextProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}

function ThemedNavigation() {
  const { theme, mode } = useAppTheme();
  const paperTheme = mapThemeToPaper(theme, mode);

  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        {Platform.OS === 'android' && (
          <View style={{ height: RNStatusBar.currentHeight, backgroundColor: theme.button.primary.bg }} />
        )}
        <View style={{ flex: 1, backgroundColor: theme.background.screen }}>
          {/* 🚫 Removed AuthGate — direct access to routes */}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.background.screen },
            }}
          />
          <StatusBar translucent style={mode === 'dark' ? 'light' : 'light'} />
        </View>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
