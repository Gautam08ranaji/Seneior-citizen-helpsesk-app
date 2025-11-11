import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../../theme/ThemeContext';

export default function AboutScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { theme, mode } = useAppTheme();
  const dark = mode === 'dark';

  // Dynamic scaling based on screen width
  const scaleFont = (size: number) => size * (width / 375);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background.screen }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background.card,
            borderBottomColor: theme.border.default, // use single color
          },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={26}
          color={theme.text.primary}
        />
        <Text
          style={[
            styles.headerTitle,
            { fontSize: scaleFont(20), color: theme.text.primary },
          ]}
        >
          {t('AboutScreen.title')}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: Platform.OS === 'ios' ? 120 : 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* About Section */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.background.card,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <Text
            style={[styles.title, { color: theme.text.primary, fontSize: scaleFont(22) }]}
          >
            {t('AboutScreen.appTitle')}
          </Text>
          <Text
            style={[styles.text, { color: theme.text.secondary, fontSize: scaleFont(15) }]}
          >
            {t('AboutScreen.description')}
          </Text>
        </View>

        {/* Features Section */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: dark ? theme.background.section : theme.background.screen,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons
              name="star-outline"
              size={20}
              color={theme.text.primary}
              style={styles.sectionIcon}
            />
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text.primary, fontSize: scaleFont(18) },
              ]}
            >
              {t('AboutScreen.featuresTitle')}
            </Text>
          </View>

          {[
            t('AboutScreen.features.liveTracking'),
            t('AboutScreen.features.realTimeUpdates'),
            t('AboutScreen.features.attendance'),
            t('AboutScreen.features.expenseReporting'),
            t('AboutScreen.features.communication'),
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={theme.primary.base}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[styles.feature, { color: theme.text.secondary, fontSize: scaleFont(14) }]}
              >
                • {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Mission Section */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.background.card, shadowColor: theme.shadow },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons
              name="flag-outline"
              size={20}
              color={theme.text.primary}
              style={styles.sectionIcon}
            />
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text.primary, fontSize: scaleFont(18) },
              ]}
            >
              {t('AboutScreen.missionTitle')}
            </Text>
          </View>
          <Text style={[styles.text, { color: theme.text.secondary, fontSize: scaleFont(15) }]}>
            {t('AboutScreen.mission')}
          </Text>
        </View>

        {/* Footer */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.background.card,
              borderTopColor: theme.border.default, // fix
            },
          ]}
        >
          <Text style={[styles.footerText, { color: theme.text.muted }]}>
            {t('AboutScreen.footer.copyright')}
          </Text>
          <Text style={[styles.footerVersion, { color: theme.text.primary }]}>
            {t('AboutScreen.footer.version')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    lineHeight: 22,
    opacity: 0.9,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionIcon: {
    marginRight: 6,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  feature: {},
  footer: {
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
    margin: -12,
  },
  footerText: {
    fontSize: 12,
  },
  footerVersion: {
    fontSize: 12,
    marginTop: 2,
  },
});
