import Header from "@/components/reusables/Header";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useDispatch } from "react-redux";
import i18n from "../../../i18n";
import { clearUser } from "../../../redux/slices/userSlice";
import { persistor } from "../../../redux/store";
import { useAppTheme } from "../../../theme/ThemeContext";

const { width, height } = Dimensions.get("window");

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { theme, toggleTheme, mode } = useAppTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const dark = mode === "dark";

  const handleLogout = () => {
    dispatch(clearUser());
    persistor.purge();
    router.replace("/(auth)/login");
  };

  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.button.primary.bg }}>
      <Header title={t("SettingsScreen.settings")} />

      {/* Wrapper with HomeScreen-style rounded top corners */}
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background.screen,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
          marginTop: 5,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: width * 0.05,
            paddingBottom: 150,
            paddingTop: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Account Section */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.background.section,
                borderRadius: 16,
                padding: 12,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.primary.base }]}>
              {t("SettingsScreen.account")}
            </Text>

            <TouchableOpacity
              style={[
                styles.settingItem,
                { backgroundColor: theme.background.screen },
              ]}
              onPress={() => router.push("/(tabs)/(setting)/editProfileScreen")}
            >
              <Icon name="user" size={20} color={theme.primary.base} />
              <Text style={[styles.settingText, { color: theme.text.primary }]}>
                {t("SettingsScreen.editProfile")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.settingItem,
                { backgroundColor: theme.background.screen },
              ]}
              
              onPress={() => router.push("/(tabs)/(setting)/handOver")}
            >
              <MaterialIcons
                name="pan-tool"
                size={20}
                color={theme.primary.base}
              />
              <Text style={[styles.settingText, { color: theme.text.primary }]}>
                {t("SettingsScreen.submitHandover")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.settingItem,
                { backgroundColor: theme.background.screen },
              ]}
              onPress={() => router.push("/(tabs)/(setting)/reciveHandover")}
            >
              <MaterialIcons
                name="handyman"
                size={20}
                color={theme.primary.base}
              />
              <Text style={[styles.settingText, { color: theme.text.primary }]}>
                {t("SettingsScreen.recieveHandover")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.settingItem,
                { backgroundColor: theme.background.screen },
              ]}
              onPress={() =>
                router.push("/(tabs)/(setting)/changePasswordScreen")
              }
            >
              <Icon name="lock" size={20} color={theme.primary.base} />
              <Text style={[styles.settingText, { color: theme.text.primary }]}>
                {t("SettingsScreen.changePassword")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.settingItem,
                { backgroundColor: theme.background.screen },
              ]}
              onPress={() =>
                router.push("/(tabs)/(setting)/barcodeScannerScreen")
              }
            >
              <Icon name="qrcode" size={20} color={theme.primary.base} />
              <Text style={[styles.settingText, { color: theme.text.primary }]}>
                {t("SettingsScreen.scanner")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.background.section,
                borderRadius: 16,
                padding: 12,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.primary.base }]}>
              {t("SettingsScreen.preferences")}
            </Text>

            <View
              style={[
                styles.settingItem,
                { backgroundColor: theme.background.screen },
              ]}
            >
              <Icon name="bell" size={20} color={theme.primary.base} />
              <Text style={[styles.settingText, { color: theme.text.primary }]}>
                {t("SettingsScreen.notifications")}
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                thumbColor={theme.primary.base}
                trackColor={{
                  false: theme.text.secondary,
                  true: theme.primary.base,
                }}
              />
            </View>

            <View
              style={[
                styles.settingItem,
                { backgroundColor: theme.background.screen },
              ]}
            >
              <Icon name="moon-o" size={20} color={theme.primary.base} />
              <Text style={[styles.settingText, { color: theme.text.primary }]}>
                {t("SettingsScreen.darkMode")}
              </Text>
              <Switch
                value={dark}
                onValueChange={toggleTheme}
                thumbColor={theme.primary.base}
                trackColor={{
                  false: theme.text.secondary,
                  true: theme.primary.base,
                }}
              />
            </View>
          </View>

          {/* Language Section (Custom Dropdown) */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.background.section,
                borderRadius: 16,
                padding: 12,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.primary.base }]}>
              {t("SettingsScreen.language")}
            </Text>

            <TouchableOpacity
              style={[
                styles.customDropdown,
                {
                  backgroundColor: theme.background.screen,
                  borderColor: theme.primary.base,
                },
              ]}
              onPress={() => setShowLanguageModal(true)}
            >
              <Text
                style={[styles.selectedLanguage, { color: theme.text.primary }]}
              >
                {i18n.language === "en"
                  ? "English"
                  : i18n.language === "hi"
                  ? "हिन्दी"
                  : i18n.language === "mr"
                  ? "मराठी"
                  : i18n.language === "ta"
                  ? "தமிழ்"
                  : i18n.language === "te"
                  ? "తెలుగు"
                  : i18n.language === "bn"
                  ? "বাংলা"
                  : "ਗੁਰਮੁਖੀ"}
              </Text>
              <MaterialIcons
                name="arrow-drop-down"
                size={26}
                color={theme.primary.base}
              />
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.background.section,
                borderRadius: 16,
                padding: 12,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.primary.base }]}>
              {t("SettingsScreen.support")}
            </Text>

            <TouchableOpacity
              style={[
                styles.settingItem,
                { backgroundColor: theme.background.screen },
              ]}
            >
              <Icon
                name="question-circle"
                size={20}
                color={theme.primary.base}
              />
              <Text style={[styles.settingText, { color: theme.text.primary }]}>
                {t("SettingsScreen.helpSupport")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.settingItem,
                { backgroundColor: theme.background.screen },
              ]}
              onPress={() => router.push("/(tabs)/(setting)/about")}
            >
              <Icon name="info-circle" size={20} color={theme.primary.base} />
              <Text style={[styles.settingText, { color: theme.text.primary }]}>
                {t("SettingsScreen.aboutApp")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.settingItem,
                { backgroundColor: theme.background.screen },
              ]}
              onPress={() => router.push("/(tabs)/(setting)/chatBotScreen")}
            >
              <Icon name="comment" size={20} color={theme.primary.base} />
              <Text style={[styles.settingText, { color: theme.text.primary }]}>
                {t("SettingsScreen.chatBot")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={[
              styles.logoutButton,
              { backgroundColor: theme.primary.base, borderRadius: 16 },
            ]}
            onPress={handleLogout}
          >
            <Text
              style={[styles.logoutText, { color: theme.background.screen }]}
            >
              {t("SettingsScreen.logOut")}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ✅ FIXED MODAL outside ScrollView */}
        <Modal
          visible={showLanguageModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: theme.background.section },
              ]}
            >
              {[
                { label: "English", value: "en" },
                { label: "हिन्दी", value: "hi" },
                { label: "मराठी", value: "mr" },
                { label: "தமிழ்", value: "ta" },
                { label: "తెలుగు", value: "te" },
                { label: "বাংলা", value: "bn" },
                { label: "ਗੁਰਮੁਖੀ", value: "pn" },
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  style={[
                    styles.languageOption,
                    {
                      backgroundColor:
                        i18n.language === lang.value
                          ? theme.primary.base
                          : theme.background.section,
                    },
                  ]}
                  onPress={() => {
                    changeLanguage(lang.value);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text
                    style={{
                      color:
                        i18n.language === lang.value
                          ? theme.background.screen
                          : theme.text.primary,
                      fontSize: width * 0.04,
                    }}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setShowLanguageModal(false)}
                style={[
                  styles.closeModalBtn,
                  { backgroundColor: theme.primary.base },
                ]}
              >
                <Text
                  style={{
                    color: theme.background.screen,
                    fontWeight: "bold",
                  }}
                >
                  {t("SettingsScreen.cancel") || "Cancel"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  section: {
    marginBottom: height * 0.035,
  },
  sectionTitle: {
    fontSize: width * 0.045,
    marginBottom: height * 0.012,
    fontWeight: "bold",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: "space-between",
  },
  settingText: {
    flex: 1,
    marginLeft: 15,
    fontSize: width * 0.042,
  },
  logoutButton: {
    paddingVertical: height * 0.018,
    marginTop: 10,
    marginBottom: 40,
    alignItems: "center",
  },
  logoutText: {
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  customDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.04,
    borderRadius: 10,
    borderWidth: 1.2,
  },
  selectedLanguage: {
    fontSize: width * 0.042,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  languageOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 6,
    alignItems: "center",
  },
  closeModalBtn: {
    marginTop: 10,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
});
