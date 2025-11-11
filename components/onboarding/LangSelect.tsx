import { useAppTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import i18n from '../../i18n';

interface LangSelectProps {
  style?: ViewStyle; // optional
  onLanguageChange: () => void; // Callback to notify parent
}

export default function LangSelect({ style, onLanguageChange }: LangSelectProps) {
  const { theme } = useAppTheme(); // ✅ Theme
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    switch (i18n.language) {
      case 'hi':
        return 'Hindi';
      case 'mr':
        return 'Marathi';
      case 'te':
        return 'Telugu';
      case 'ta':
        return 'Tamil';
      case 'bn':
        return 'Bengoli';
      case 'pn':
        return 'punjabi';
      default:
        return 'English';
    }
  });
  const [buttonWidth, setButtonWidth] = useState(0);
  const buttonRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'mr', label: 'Marathi' },
    { code: 'te', label: 'Telugu' },
    { code: 'ta', label: 'Tamil' },
    { code: 'bn', label: 'Bengoli' },
    { code: 'pn', label: 'punjabi' },
  ];

  const changeLanguage = async (lang: string, label: string) => {
    try {
      await i18n.changeLanguage(lang);
      setSelectedLanguage(label);
      setIsOpen(false);
      onLanguageChange(); // Notify parent
    } catch (err) {
      console.error('Failed to change language:', err);
    }
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setButtonWidth(width);
  };

  return (
    <View style={style}>
      <TouchableOpacity
        ref={buttonRef}
        onLayout={handleLayout}
        style={[
          styles.button,
          {
            backgroundColor: theme.background.card,
            borderColor: theme.border.default,
          },
        ]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Ionicons name="globe-outline" size={14} color={theme.text.primary} />
        <Text style={[styles.buttonText, { color: theme.text.primary }]}>{selectedLanguage}</Text>
        <AntDesign
          name="caretdown"
          size={12}
          color={theme.text.primary}
          style={[styles.chevron, isOpen && styles.chevronUp]}
        />
      </TouchableOpacity>
      {isOpen && (
        <View
          style={[
            styles.dropdown,
            { width: buttonWidth, backgroundColor: theme.background.card },
          ]}
        >
          {languages.map(({ code, label }) => (
            <TouchableOpacity
              key={code}
              style={styles.option}
              onPress={() => changeLanguage(code, label)}
            >
              <Text style={[styles.optionText, { color: theme.text.primary }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderWidth: 1,
    borderRadius: 4,
    zIndex: 1,
  },
  buttonText: {
    marginLeft: 4,
    fontFamily: 'BarlowMedium',
  },
  chevron: {
    marginLeft: 4,
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    borderRadius: 4,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb', // could also use theme.border if preferred
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'BarlowMedium',
  },
});
