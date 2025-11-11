import { useRouter } from 'expo-router';
import React, { Suspense, useCallback, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import LangSelectBase from '../../components/onboarding/LangSelect';

const { width } = Dimensions.get('window');
const mapSize = width * 0.6; // calculated once

// Lazy load heavy SVG
const MapSvg = React.lazy(() => import('../../components/svg/onboarding/MapSvg'));
const LangSelect = React.memo(LangSelectBase);

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleLanguageChange = useCallback(() => {
    forceUpdate();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Selector */}
      <View style={styles.langContainer}>
        <LangSelect style={styles.langSelect} onLanguageChange={handleLanguageChange} />
      </View>

      {/* Map Section */}
      <View style={styles.mapWrapper}>
        <View style={styles.mapContainer}>
          <Suspense fallback={<ActivityIndicator size="large" color="#293160" />}>
            <MapSvg width={mapSize} height={mapSize} style={styles.mapSvg} />
          </Suspense>
        </View>
      </View>

      {/* App Title */}
      <Text style={styles.title}>{t('WelcomeScreen.title')}</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>{t('WelcomeScreen.tagline')}</Text>

      {/* Welcome Button */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.buttonText}>{t('WelcomeScreen.button')}</Text>
      </TouchableOpacity>

      {/* Register Row */}
      <View style={styles.registerRow}>
        <Text style={styles.grayText}>{t('WelcomeScreen.noAccount')}</Text>
        <TouchableOpacity>
          <Text style={styles.register}> {t('WelcomeScreen.register')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  langContainer: {
    position: 'absolute',
    top: 10,
    right: 0,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
    zIndex: 10,
    elevation: 5,
  },
  langSelect: {
    backgroundColor: 'transparent',
  },
  mapWrapper: {
    marginBottom: 30,
    width: width * 0.75,
    height: width * 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.375,
    overflow: 'hidden',
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapSvg: {
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#293160',
    paddingVertical: 15,
    paddingHorizontal: 70,
    borderRadius: 30,
    marginBottom: 25,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  registerRow: { alignItems: 'center' },
  grayText: { color: '#888', fontSize: 14 },
  register: { color: '#293160', fontWeight: '600', fontSize: 14, paddingBottom: 10 },
});
