import Header from '@/components/reusables/Header';
import Loader from '@/components/reusables/loader'; // Import your Loader component
import CustomAlertModal from '@/components/ui/CustomAlertModal';
import SuccessAlert from '@/components/ui/SuccessAlertModal'; // Make sure this exists
import { RootState } from '@/redux/store';
import { getVehicleUserList } from '@/services/api/getVehicleUserList';
import { uploadSelfi } from '@/services/api/uploadSelfi';
import { userRegistration } from '@/services/api/userRegistration';
import { useAppTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

export default function EnrollmentScreen() {
  const { theme } = useAppTheme(); // Theme
  const user = useSelector((state: RootState) => state.user);

  const [step, setStep] = useState(1);

  // Step 1
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [vehicleError, setVehicleError] = useState('');
  const [vehicleOptions, setVehicleOptions] = useState<{ label: string; value: string }[]>([]);
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeCodeError, setEmployeeCodeError] = useState('');
  const [imagePickerVisible, setImagePickerVisible] = useState(false);

  // Step 2
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [personalErrors, setPersonalErrors] = useState<{ fullName?: string; phone?: string }>({});

  // Step 3
  const [userId, setUserId] = useState('');
  const [accountErrors, setAccountErrors] = useState<{ userId?: string }>({});

  // Step 4
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Registered state
  const [registeredUserID, setRegisteredUserID] = useState<number | null>(null);

  // Loader
  const [loading, setLoading] = useState(false);

  // Custom alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  // Fetch vehicle list
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const data = await getVehicleUserList({
          szAPIKey: user.token,
          szDeviceType: Platform.OS,
          UserId: user.id,
          AccountId: user.AccountId,
        });

        if (Array.isArray(data?.GetVehicleUserList)) {
          const mapped = data.GetVehicleUserList.map((item: any) => ({
            label: item.VehicleName,
            value: item.ID.toString(),
          }));
          setVehicleOptions(mapped);
        }
      } catch (error) {
        console.error('Vehicle list error:', error);
        showAlert('Failed to fetch vehicles', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Step Validations
  const validateStep1 = () => {
    let valid = true;
    if (!selectedVehicle) {
      setVehicleError(t('EnrollmentScreen.emplovehicleErroryeeCode'));
      valid = false;
    } else setVehicleError('');

    if (!employeeCode.trim()) {
      setEmployeeCodeError(t('EnrollmentScreen.employeeCodeError'));
      valid = false;
    } else setEmployeeCodeError('');

    return valid;
  };

  const validateStep2 = () => {
    const errors: any = {};
    if (!fullName.trim()) errors.fullName = t('EnrollmentScreen.fullNameError');
    if (!phone.trim()) errors.phone = t('EnrollmentScreen.phoneErrorRequired');
    else if (!/^\d+$/.test(phone)) errors.phone = t('EnrollmentScreen.phoneErrorDigits');
    else if (phone.length !== 10) errors.phone = t('EnrollmentScreen.phoneErrorLength');

    setPersonalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: any = {};
    if (!userId.trim()) errors.userId = t('EnrollmentScreen.userIdRequired');
    setAccountErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Register User
  const handleRegister = async () => {
    try {
      setLoading(true);
      const rawResponse = await userRegistration({
        CUGNo: String(selectedVehicle),
        strUserCode: employeeCode,
        strUserName: userId,
        strUserPassword: 'NoPassword',
        strUserMobileNo: phone,
        strFullName: fullName,
        strAccountId: user.AccountId.toString(),
      });

      let raw = typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse);
      let parsed: any = null;

      try {
        const chunks = raw.trim().replace(/}\s*{/g, '}|{').split('|');
        parsed = JSON.parse(chunks[0]);
      } catch (err) {
        console.error('Failed parsing response:', err);
        showAlert('Invalid server response', 'error');
        return;
      }

      if (parsed?.Status && parsed.Status.includes('same mobile number')) {
        const cleanMsg = parsed.Status.replace(/"/g, '').trim();
        showAlert(cleanMsg, 'error');
        setStep(2);
        return;
      }

      if (parsed?.Response && parsed.Response.includes('Registerd')) {
        setRegisteredUserID(parsed.ID);
        showAlert(parsed.Response || 'User registered successfully', 'success');
        setStep(4);
        return;
      }

      showAlert(parsed?.Response || 'Unexpected server response', 'error');
    } catch (error: any) {
      showAlert(error.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const pickImageOption = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Take Selfie', 'Choose from Gallery'], cancelButtonIndex: 0 },
        (buttonIndex) => {
          if (buttonIndex === 1) takeSelfie();
          else if (buttonIndex === 2) chooseFromGallery();
        }
      );
    } else {
      setShowOptions(true); // show custom alert modal on Android
    }
  };

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert(t('EnrollmentScreen.cameraPermissionDenied'), 'error');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) handleImage(result.assets[0].uri);
  };

  const chooseFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert(t('EnrollmentScreen.galleryPermissionDenied'), 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) handleImage(result.assets[0].uri);
  };

  const handleImage = (uri: string) => {
    setProfileImage(uri);
    setIsImageSelected(true);
  };

  const uploadImage = async () => {
    if (!profileImage || !registeredUserID) {
      showAlert(t('EnrollmentScreen.registerFirst'), 'error');
      return;
    }
    try {
      setLoading(true);
      const firstName = userId.split(' ')[0];
      const fileExt = profileImage.split('.').pop() || 'jpg';
      const base64 = await FileSystem.readAsStringAsync(profileImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      let res: any = null;
      const attemptUpload = async () =>
        await uploadSelfi({
          szAPIKey: user.token,
          szDeviceType: Platform.OS,
          strUserId: Number(registeredUserID),
          strbyte: base64,
          FileExtension: fileExt,
          DocumentFileName: `${firstName}.${fileExt}`,
        });

      try {
        res = await attemptUpload();
      } catch {
        res = await attemptUpload(); // retry once
      }

      setIsImageUploaded(true);
      setIsImageSelected(false);
      showAlert(t('EnrollmentScreen.successEnrollment'), 'success');
      setTimeout(() => router.replace('/(tabs)'), 2000);
    } catch (error) {
      console.error('Selfie upload error:', error);
      showAlert('Failed to upload selfie', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step Handler
  const handleContinue = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) handleRegister();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.screen }}>
      <Header title={t('EnrollmentScreen.title')} />

      <CustomAlertModal
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        title={t("EnrollmentScreen.selectOption")}
        options={[
          { text: t("HomeScreen.takeSelfie"), onPress: () => { takeSelfie(); setShowOptions(false); } },
          { text: t("HomeScreen.chooseFromGallery"), onPress: () => { chooseFromGallery(); setShowOptions(false); } },
          { text: t("HomeScreen.cancel"), onPress: () => setShowOptions(false), type: "cancel" },
        ]}
      />

      {/* Loader */}
      <Loader visible={loading} />

      <View style={{ flex: 1, backgroundColor: theme.background.section, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: 15 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <Text style={[styles.stepTitle, { color: theme.text.primary }]}>{t('EnrollmentScreen.step1Title')}</Text>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text.primary }]}>{t('EnrollmentScreen.cugNumber')}</Text>
                <TouchableOpacity
                  style={[styles.dropdown, { borderColor: theme.button.primary.bg, backgroundColor: theme.background.screen }]}
                  onPress={() => setDropdownVisible(!dropdownVisible)}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: selectedVehicle ? theme.text.primary : theme.text.secondary }}>
                    {vehicleOptions.find(v => v.value === selectedVehicle)?.label || t('EnrollmentScreen.selectVehicle')}
                  </Text>
                  <Ionicons name={dropdownVisible ? 'chevron-up' : 'chevron-down'} size={18} color={theme.button.primary.bg} />
                </TouchableOpacity>
                {dropdownVisible && (
                  <View style={[styles.dropdownOptions, { backgroundColor: theme.background.section, borderColor: theme.button.primary.bg }]}>
                    {vehicleOptions.map(vehicle => (
                      <TouchableOpacity key={vehicle.value} style={styles.option} onPress={() => { setSelectedVehicle(vehicle.value); setDropdownVisible(false); }}>
                        <Text style={{ color: theme.text.primary }}>{vehicle.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {vehicleError ? <Text style={styles.error}>{vehicleError}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text.primary }]}>{t('EnrollmentScreen.employeeCode')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.button.primary.bg, color: theme.text.primary, backgroundColor: theme.background.screen }]}
                  value={employeeCode}
                  onChangeText={setEmployeeCode}
                  placeholder={t('EnrollmentScreen.enterEmployeeCode')}
                  placeholderTextColor={theme.text.secondary}
                />
                {employeeCodeError ? <Text style={styles.error}>{employeeCodeError}</Text> : null}
              </View>

              <TouchableOpacity style={[styles.continueButton, { backgroundColor: theme.button.primary.bg }]} onPress={handleContinue}>
                <Text style={[styles.continueText, { color: theme.background.screen }]}>{t('EnrollmentScreen.continue')}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <Text style={[styles.stepTitle, { color: theme.text.primary }]}>{t('EnrollmentScreen.step2Title')}</Text>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text.primary }]}>{t('EnrollmentScreen.fullName')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.button.primary.bg, color: theme.text.primary, backgroundColor: theme.background.screen }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t('EnrollmentScreen.enterFullName')}
                  placeholderTextColor={theme.text.secondary}
                />
                {personalErrors.fullName && <Text style={styles.error}>{personalErrors.fullName}</Text>}

                <Text style={[styles.label, { color: theme.text.primary }]}>{t('EnrollmentScreen.phoneNumber')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.button.primary.bg, color: theme.text.primary, backgroundColor: theme.background.screen }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('EnrollmentScreen.enterPhone')}
                  placeholderTextColor={theme.text.secondary}
                  keyboardType="numeric"
                />
                {personalErrors.phone && <Text style={styles.error}>{personalErrors.phone}</Text>}
              </View>

              <TouchableOpacity style={[styles.continueButton, { backgroundColor: theme.button.primary.bg }]} onPress={handleContinue}>
                <Text style={[styles.continueText, { color: theme.background.screen }]}>{t('EnrollmentScreen.continue')}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <Text style={[styles.stepTitle, { color: theme.text.primary }]}>{t('EnrollmentScreen.step3Title')}</Text>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text.primary }]}>{t('EnrollmentScreen.userId')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.button.primary.bg, color: theme.text.primary, backgroundColor: theme.background.screen }]}
                  value={userId}
                  onChangeText={setUserId}
                  placeholder={t('EnrollmentScreen.enterUserId')}
                  placeholderTextColor={theme.text.secondary}
                />
                {accountErrors.userId && <Text style={styles.error}>{accountErrors.userId}</Text>}
              </View>

              <TouchableOpacity style={[styles.continueButton, { backgroundColor: theme.button.primary.bg }]} onPress={handleContinue}>
                <Text style={[styles.continueText, { color: theme.background.screen }]}>{t('EnrollmentScreen.createAccount')}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <>
              <Text style={[styles.stepTitle, { color: theme.text.primary }]}>{t('EnrollmentScreen.step4Title')}</Text>
              <View style={styles.uploadContainer}>
                <View style={[styles.avatarWrapper, { backgroundColor: theme.background.screen }]}>
                  <Image
                    source={profileImage ? { uri: profileImage } : require('../../../assets/images/avatar.png')}
                    style={styles.avatar}
                  />
                  <View style={[styles.addIcon, { backgroundColor: theme.button.primary.bg }]}>
                    <Ionicons name="add" size={18} color="#fff" />
                  </View>
                </View>
                <Text style={[styles.labelCenter, { color: theme.text.primary }]}>{t('EnrollmentScreen.uploadStaffPicture')}</Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.outlinedButton, { borderColor: theme.button.primary.bg }]} onPress={pickImageOption}>
                    <Text style={[styles.outlinedText, { color: theme.button.primary.bg }]}>{t('EnrollmentScreen.selectProfile')}</Text>
                  </TouchableOpacity>
                  {isImageSelected && (
                    <TouchableOpacity style={[styles.filledButton, { backgroundColor: theme.button.primary.bg }]} onPress={uploadImage}>
                      <Text style={[styles.filledText, { color: theme.background.screen }]}>{t('EnrollmentScreen.uploadPhoto')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>

      {/* Success Alert */}
      <SuccessAlert
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        onHide={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stepTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  inputContainer: { marginBottom: 30 },
  label: { fontSize: 14, marginBottom: 6, fontWeight: '600' },
  labelCenter: { fontSize: 15, fontWeight: '600', textAlign: 'center', marginVertical: 15 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  error: { color: 'red', fontSize: 12, marginBottom: 8 },
  dropdown: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownOptions: { marginTop: 8, borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  option: { paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  continueButton: { borderRadius: 25, alignItems: 'center', paddingVertical: 14, marginTop: 10 },
  continueText: { fontSize: 16, fontWeight: '600' },
  uploadContainer: { alignItems: 'center', marginTop: 30 },
  avatarWrapper: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  addIcon: { position: 'absolute', bottom: 0, right: 0, borderRadius: 12, padding: 4 },
  buttonRow: { flexDirection: 'row', marginTop: 15, gap: 12 },
  outlinedButton: { borderWidth: 1, borderRadius: 25, paddingHorizontal: 18, paddingVertical: 10 },
  outlinedText: { fontWeight: '600' },
  filledButton: { borderRadius: 25, paddingHorizontal: 18, paddingVertical: 10 },
  filledText: { fontWeight: '600' },
});
