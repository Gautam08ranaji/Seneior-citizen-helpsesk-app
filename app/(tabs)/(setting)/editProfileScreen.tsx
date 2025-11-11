import Header from '@/components/reusables/Header';
import HeaderCard from '@/components/reusables/HeaderCard';
import Card from '@/components/reusables/card';
import { RootState } from '@/redux/store';
import { useAppTheme } from '@/theme/ThemeContext';
import { Typography } from '@/theme/Typography';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

export default function EditProfile() {
  const { t } = useTranslation();
  const { theme } = useAppTheme(); // 🎨 Theme Hook
  const tabBarHeight = useBottomTabBarHeight();
  const user = useSelector((state: RootState) => state.user);

  // 🧠 State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  // ✅ Validation
  const validateAndSubmit = () => {
    let valid = true;
    let newErrors: any = {};

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name.trim()) {
      newErrors.name = t('editProfile.nameRequired');
      valid = false;
    } else if (!nameRegex.test(name.trim())) {
      newErrors.name = t('editProfile.nameOnlyLetters');
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      newErrors.email = t('editProfile.validEmail');
      valid = false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      newErrors.phone = t('editProfile.validPhone');
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      Alert.alert(t('editProfile.profileUpdated'));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.primary.base }]}>
      <Header title={t('editProfile.title')} />
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: theme.background.section,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: tabBarHeight + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <HeaderCard mobileNumber={user.name} vehicleNumber={user.VehicleNo} />

          {/* 🔹 Profile Update Form */}
          <Card
            style={[
              styles.profileCard,
              {
                backgroundColor: theme.background.card,
              },
            ]}
          >
            <Text
              style={[
                Typography.headingH2Bold,
                { color: theme.text.primary, marginBottom: 10 },
              ]}
            >
              {t('editProfile.updateProfile')}
            </Text>

            {/* Full Name */}
            <Text style={[styles.label, { color: theme.text.label }]}>
              {t('editProfile.fullName')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background.input,
                  borderColor: theme.primary.base,
                  color: theme.text.primary,
                },
              ]}
              placeholder={t('editProfile.fullNamePlaceholder')}
              placeholderTextColor={theme.text.placeholder}
              value={name}
              onChangeText={setName}
            />
            {errors.name && (
              <Text style={[styles.errorText, { color: theme.status.error }]}>
                {errors.name}
              </Text>
            )}

            {/* Email Address */}
            <Text style={[styles.label, { color: theme.text.label }]}>
              {t('editProfile.emailAddress')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background.input,
                  borderColor: theme.primary.base,
                  color: theme.text.primary,
                },
              ]}
              placeholder={t('editProfile.emailPlaceholder')}
              placeholderTextColor={theme.text.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={[styles.errorText, { color: theme.status.error }]}>
                {errors.email}
              </Text>
            )}
            {errors.email && (
              <Text style={[styles.exampleText, { color: theme.status.error }]}>
                {t('editProfile.emailExample')}
              </Text>
            )}

            {/* Phone Number */}
            <Text style={[styles.label, { color: theme.text.label }]}>
              {t('editProfile.phoneNumber')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background.input,
                  borderColor: theme.primary.base,
                  color: theme.text.primary,
                },
              ]}
              placeholder={t('editProfile.phonePlaceholder')}
              placeholderTextColor={theme.text.placeholder}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.phone && (
              <Text style={[styles.errorText, { color: theme.status.error }]}>
                {errors.phone}
              </Text>
            )}

            {/* Update Button */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.button.primary.bg },
              ]}
              onPress={validateAndSubmit}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.button.primary.text },
                ]}
              >
                {t('editProfile.updateButton')}
              </Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 15,
  },
  scrollContainer: {
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 5,
  },
  profileCard: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 10,
    fontSize: 14,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: 2,
  },
  exampleText: {
    fontSize: 11,
    marginBottom: 4,
  },
  button: {
    borderRadius: 25,
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
