import LangSelect from "@/components/onboarding/LangSelect";
import { RootState } from "@/redux/store";
import apiClient from "@/services/api/axiosInstance";
import { useAppTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";

const { width, height } = Dimensions.get("window");

export default function App() {
  return <LoginScreen />;
}

function LoginScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const { theme } = useAppTheme();
  const { t } = useTranslation(); // ✅ hook ensures reactive language changes

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const phoneContainerHeight = height * 0.62;

  // Animations
  const mainAnim = useRef(new Animated.Value(height)).current;
  const loginAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mainAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(loginAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (user?.token) router.replace("/(tabs)");
  }, [user]);

  /** ------------------ LOGIN HANDLER ------------------ */
  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password) {
      setErrorMsg(t("LoginScreen.enterEmailPassword", "Please enter Email and Password"));
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const { data } = await apiClient.post(
        "/ValidateLogin",
        new URLSearchParams({
          strLoginId: email,
          strPwd: password,
          szDeviceType: Platform.OS === "ios" ? "iOS" : "Android",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      let raw = typeof data === "string" ? data : JSON.stringify(data);
      let parsed: any = null;

      try {
        parsed = JSON.parse(raw);
      } catch {
        const parts = raw
          .split(/}\s*{/)
          .map((p, i, arr) =>
            i < arr.length - 1 ? (i === 0 ? p + "}" : "{" + p + "}") : "{" + p
          );
        for (const p of parts) {
          try {
            const obj = JSON.parse(p);
            if (obj.StatusMessage || obj.Status) {
              parsed = obj;
              break;
            }
          } catch {
            continue;
          }
        }
      }

      if (!parsed) {
        setErrorMsg(t("LoginScreen.unexpectedError", "Unexpected error, please try again."));
        return;
      }

      const statusMessage = (parsed.StatusMessage || parsed.Status || "").replace(/"/g, "");
      if (statusMessage === "Login Success") {
        const info = parsed.LoginInforamtion?.[0];
        dispatch(
          setUser({
            name: info.contact_full_name,
            email: info.contact_emailid,
            token: info.APIKEY,
            id: info.contact_id,
            role: info.contact_role,
            loginId: info.contact_login_id,
            phone: info.contact_phone,
            mobileEnabled: info.conttact_mobile_enable,
            enabled: info.contact_enabled,
            VehicleNo: info.VehicleNo,
            AccountId: info.AccountId,
            AccountName: info.AccountName,
          })
        );
        router.replace("/(tabs)");
      } else {
        setErrorMsg(statusMessage || t("LoginScreen.unexpectedError", "Login failed."));
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg(t("LoginScreen.unableToLogin", "Unable to login. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [email, password, dispatch, t]);

  if (user?.token) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.screen }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top container */}
          <Animated.View style={[styles.mainContainer, { transform: [{ translateY: mainAnim }] }]}>
            <View
              style={{
                alignSelf: "flex-end",
                paddingHorizontal: 10,
                paddingVertical: 10,
                position: "absolute",
              }}
            >
              <LangSelect
                style={{ marginTop: -5 }}
                onLanguageChange={() => console.log("Language changed")}
              />
            </View>

            <View style={styles.topTextContainer}>
              <Text style={[styles.topText, { color: theme.button.primary.bg }]}>
                {t("LoginScreen.trackMonitor", "Track. Monitor. Manage")}
              </Text>
              <Text style={[styles.topText, { color: theme.button.primary.bg }]}>
                {t("LoginScreen.staffsEasily", "Your Ground Level Staffs Easily")}
              </Text>
            </View>

            <View style={[styles.phoneContainer, { height: phoneContainerHeight }]}>
              <Image
                source={require("../../assets/images/Phone.png")}
                resizeMode="contain"
                style={styles.phoneImage}
              />
              <Image
                source={require("../../assets/images/Map.png")}
                resizeMode="contain"
                style={styles.mapOverlay}
              />
              <View style={[styles.marker, { top: height * 0.001, left: width * 0.1 }]}>
                <Image
                  source={require("../../assets/images/LoginMaleMarker.png")}
                  style={styles.leftMarkerInsidePhone}
                  resizeMode="contain"
                />
              </View>
              <View style={[styles.marker, { top: height * 0.021, left: width * 0.1 }]}>
                <Image
                  source={require("../../assets/images/LoginFealeMarker.png")}
                  style={styles.RightMarkerInsidePhoneFemale}
                  resizeMode="contain"
                />
              </View>
              <View style={[styles.marker, { top: height * 0.031, left: width * 0.55 }]}>
                <Image
                  source={require("../../assets/images/LoginMaleMarker1.png")}
                  style={styles.RightMarkerInsidePhoneFemale1}
                  resizeMode="contain"
                />
              </View>
            </View>
          </Animated.View>

          {/* Login Container */}
          <Animated.View
            style={[
              styles.loginContainer,
              {
                backgroundColor: theme.button.primary.bg,
                paddingBottom: insets.bottom + 20,
                position: "absolute",
                bottom: 0,
                width: "100%",
                minHeight: height * 0.35,
                transform: [{ translateY: loginAnim }],
              },
            ]}
          >
            <Text style={[styles.welcomeText, { color: theme.background.screen }]}>
              {t("LoginScreen.welcome", "Welcome back!")}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.background.screen,
                  backgroundColor: theme.button.primary.bg,
                  color: theme.background.screen,
                },
              ]}
              placeholder={t("LoginScreen.email", "E-Mail Id")}
              placeholderTextColor={theme.background.screen}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <View style={{ position: "relative" }}>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: theme.background.screen,
                    backgroundColor: theme.button.primary.bg,
                    color: theme.background.screen,
                  },
                ]}
                placeholder={t("LoginScreen.password", "Password")}
                placeholderTextColor={theme.background.screen}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "25%",
                }}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color={theme.background.screen}
                />
              </TouchableOpacity>
            </View>

            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            <TouchableOpacity style={styles.forgotContainer} 
            onPress={()=>{
              router.push('/(auth)/forgot')
            }}
            >
              <Text style={[styles.forgotText, { color: theme.background.screen }]}>
                {t("LoginScreen.forgotPassword", "Forgot Password?")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: theme.background.screen }]}
              onPress={handleLogin}
            >
              <Text style={[styles.loginButtonText, { color: theme.button.primary.bg }]}>
                {t("LoginScreen.login", "Log In")}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ------------------- Styles -------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  mainContainer: { flex: 1, position: "relative" },
  topTextContainer: {
    marginTop: height * 0.04,
    alignItems: "center",
    paddingHorizontal: width * 0.06,
  },
  topText: {
    fontSize: width * 0.045,
    textAlign: "center",
    marginVertical: height * 0.005,
  },
  phoneContainer: { justifyContent: "flex-end", alignItems: "center", position: "relative" },
  phoneImage: { height: "100%" },
  mapOverlay: { position: "absolute", height: "100%" },
  loginContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.025,
    justifyContent: "center",
  },
  welcomeText: { fontSize: width * 0.055, fontWeight: "bold", marginBottom: height * 0.03, textAlign: "center" },
  input: { borderRadius: 10, padding: height * 0.015, color: "#FFFFFF", marginBottom: height * 0.015, borderWidth: 1 },
  errorText: { color: "red", marginBottom: height * 0.01, fontSize: width * 0.035, textAlign: "left" },
  forgotContainer: { alignSelf: "flex-end", marginBottom: height * 0.02 },
  forgotText: { fontSize: width * 0.035 },
  loginButton: { paddingVertical: height * 0.018, borderRadius: 10, marginTop: height * 0.01 },
  loginButtonText: { textAlign: "center", fontWeight: "bold", fontSize: width * 0.045 },
  RightMarkerInsidePhoneFemale: { position: "absolute", width: width * 0.35, height: height * 0.13, top: height * 0.03, left: height * 0.2, borderRadius: 15 },
  leftMarkerInsidePhone: { position: "absolute", width: width * 0.35, height: height * 0.16, top: height * 0.16, borderRadius: 15 },
  RightMarkerInsidePhoneFemale1: { position: "absolute", width: width * 0.35, height: height * 0.23, top: height * 0.16, left: height * 0.03 },
  marker: { position: "absolute" },
});
