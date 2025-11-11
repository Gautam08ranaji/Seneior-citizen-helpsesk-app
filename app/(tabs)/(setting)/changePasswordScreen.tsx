import Header from '@/components/reusables/Header';
import Card from '@/components/reusables/card';
import { RootState, persistor } from '@/redux/store';
import apiClient from '@/services/api/axiosInstance';
import { useAppTheme } from '@/theme/ThemeContext';
import { Typography } from '@/theme/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import qs from 'qs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../../../redux/slices/userSlice';

export default function ChangePassword() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [secureEntryCurrent, setSecureEntryCurrent] = useState(true);
  const [secureEntryNew, setSecureEntryNew] = useState(true);
  const [secureEntryConfirm, setSecureEntryConfirm] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleTogglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    if (field === 'current') setSecureEntryCurrent(!secureEntryCurrent);
    else if (field === 'new') setSecureEntryNew(!secureEntryNew);
    else setSecureEntryConfirm(!secureEntryConfirm);
  };

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert(t('changePassword.errorTitle'), t('changePassword.errorFill'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert(t('changePassword.errorTitle'), t('changePassword.errorMismatch'));
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(
        '/ChangedPassword',
        qs.stringify({
          strUserId: user.id,
          strOldPwd: currentPassword,
          strNewPwd: newPassword,
          strConfrimNewPwd: confirmNewPassword,
          szDeviceType: Platform.OS,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, responseType: 'text' }
      );

      const parsed = JSON.parse(response.data);

      if (
        parsed?.StatusCode === 200 &&
        parsed?.StatusMessage?.toLowerCase().includes('update user password successfully')
      ) {
        dispatch(clearUser());
        await persistor.purge();
        router.replace('/(auth)/login');
      } else {
        Alert.alert(t('changePassword.errorTitle'), parsed?.StatusMessage || t('changePassword.errorGeneric'));
      }
    } catch (error) {
      Alert.alert(t('changePassword.errorTitle'), t('changePassword.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    label: string,
    placeholder: string,
    value: string,
    onChange: (text: string) => void,
    secureEntry: boolean,
    toggleField: 'current' | 'new' | 'confirm'
  ) => (
    <View style={{ marginBottom: 15 }}>
      <Text style={[Typography.headingH2Bold, { marginBottom: 10, color: theme.text.primary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: theme.background.input }]}>
        <TextInput
          style={[styles.input, { paddingRight: 40, color: theme.text.primary, borderColor: theme.button.primary.bg }]}
          placeholder={placeholder}
          placeholderTextColor={theme.text.placeholder}
          secureTextEntry={secureEntry}
          value={value}
          onChangeText={onChange}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => handleTogglePasswordVisibility(toggleField)}
        >
          <Ionicons
            name={secureEntry ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={theme.text.secondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.screen }}>
      <Header title={t('changePassword.title')} />
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background.section,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginTop: 15,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ paddingTop: 20, paddingBottom: tabBarHeight + 20 }}
            showsVerticalScrollIndicator={false}
          >
            <Card style={{ padding: 16, borderRadius: 16, backgroundColor: theme.background.card, width: '90%', alignSelf: 'center', marginTop: 20 }}>
              {renderPasswordInput(
                t('changePassword.current'),
                t('changePassword.placeholderCurrent'),
                currentPassword,
                setCurrentPassword,
                secureEntryCurrent,
                'current'
              )}
              {renderPasswordInput(
                t('changePassword.new'),
                t('changePassword.placeholderNew'),
                newPassword,
                setNewPassword,
                secureEntryNew,
                'new'
              )}
              {renderPasswordInput(
                t('changePassword.confirm'),
                t('changePassword.placeholderConfirm'),
                confirmNewPassword,
                setConfirmNewPassword,
                secureEntryConfirm,
                'confirm'
              )}

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary.base }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.white} />
                ) : (
                  <Text style={[styles.buttonText, { color: theme.white }]}>{t('changePassword.update')}</Text>
                )}
              </TouchableOpacity>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputWrapper: { position: 'relative', borderRadius: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  eyeIcon: { position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -10 }] },
  button: {
    borderRadius: 25,
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { fontWeight: '600', fontSize: 15 },
});
