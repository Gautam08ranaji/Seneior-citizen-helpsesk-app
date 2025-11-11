import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import bn from "./locales/bn.json";
import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import pn from "./locales/pn.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  te: { translation: te },
  ta: { translation: ta },
  bn: { translation: bn },
  pn: { translation: pn}
};

const fallbackLng = 'en';

// Get locales from expo-localization
const locales = Localization.getLocales();

// Always ensure a valid string
const deviceLanguage: string =
  locales.length > 0 && locales[0]?.languageCode
    ? locales[0].languageCode
    : fallbackLng;

// Initialize i18n synchronously
i18n.use(initReactI18next).init({
  resources,
  lng: fallbackLng,
  fallbackLng,
  interpolation: { escapeValue: false },
});

// Then load saved or device language asynchronously
(async () => {
  try {
    const savedLang = await AsyncStorage.getItem('appLanguage');
    // savedLang can be null, so use || deviceLanguage
    const langToSet: string = savedLang ?? deviceLanguage;
    i18n.changeLanguage(langToSet);
  } catch (error) {
    i18n.changeLanguage(deviceLanguage);
  }
})();

// Save language whenever it changes
i18n.on('languageChanged', async (lng) => {
  await AsyncStorage.setItem('appLanguage', lng);
});

export default i18n;
