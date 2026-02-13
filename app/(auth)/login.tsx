import LangSelect from "@/components/onboarding/LangSelect";
import { useAppTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

const { width, height } = Dimensions.get("window");

export default function App() {
  return <LoginScreen />;
}

function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(false); // ✅ track first-time login

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

  // ------------------ LOGIN HANDLER ------------------
  const handleLogin = () => {
    if (!email.trim()) {
      setErrorMsg(t("LoginScreen.enterEmail", "Please enter your Email ID"));
      return;
    }

    // 👇 Simulated logic — in real case, check API if account exists
    const accountExists = false; // simulate “not found” for now

    if (!accountExists) {
      setIsFirstTime(true);
      router.push({
        pathname: "/otpVerification",
        params: { email },
      });
      return;
    }

    console.log("Proceed to dashboard for existing user");
  };

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

            {/* Email Field */}
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

            {/* Password Field — hidden if first-time */}
            {!isFirstTime && (
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
            )}

            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            <View style={styles.forgotContainer}>
              <TouchableOpacity
                onPress={() => {
                  router.push("/register");
                }}
              >
                <Text
                  style={[
                    styles.forgotText,
                    { color: theme.background.screen },
                  ]}
                >
                  {t("LoginScreen.signUp")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  router.push("/(auth)/forgot");
                }}
              >
                <Text
                  style={[
                    styles.forgotText,
                    { color: theme.background.screen },
                  ]}
                >
                  {t("LoginScreen.forgotPassword", "Forgot Password?")}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: theme.background.screen }]}
              onPress={handleLogin}
            >
              <Text style={[styles.loginButtonText, { color: theme.button.primary.bg }]}>
                {isFirstTime
                  ? t("LoginScreen.continue", "Continue")
                  : t("LoginScreen.login", "Log In")}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ------------------- Styles -------------------
const { width: w, height: h } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: { flex: 1 },
  mainContainer: { flex: 1, position: "relative" },
  topTextContainer: {
    marginTop: h * 0.04,
    alignItems: "center",
    paddingHorizontal: w * 0.06,
  },
  topText: {
    fontSize: w * 0.045,
    textAlign: "center",
    marginVertical: h * 0.005,
  },
  phoneContainer: { justifyContent: "flex-end", alignItems: "center", position: "relative" },
  phoneImage: { height: "100%" },
  mapOverlay: { position: "absolute", height: "100%" },
  loginContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: w * 0.06,
    paddingTop: h * 0.025,
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: w * 0.055,
    fontWeight: "bold",
    marginBottom: h * 0.03,
    textAlign: "center",
  },
  input: {
    borderRadius: 10,
    padding: h * 0.015,
    color: "#FFFFFF",
    marginBottom: h * 0.015,
    borderWidth: 1,
  },
  errorText: {
    color: "red",
    marginBottom: h * 0.01,
    fontSize: w * 0.035,
    textAlign: "left",
  },
  forgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: h * 0.02,
    gap: 10,
  },
  forgotText: { fontSize: w * 0.035 },
  loginButton: {
    paddingVertical: h * 0.018,
    borderRadius: 10,
    marginTop: h * 0.01,
  },
  loginButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: w * 0.045,
  },
  RightMarkerInsidePhoneFemale: {
    position: "absolute",
    width: w * 0.35,
    height: h * 0.13,
    top: h * 0.03,
    left: h * 0.2,
    borderRadius: 15,
  },
  leftMarkerInsidePhone: {
    position: "absolute",
    width: w * 0.35,
    height: h * 0.16,
    top: h * 0.16,
    borderRadius: 15,
  },
  RightMarkerInsidePhoneFemale1: {
    position: "absolute",
    width: w * 0.35,
    height: h * 0.23,
    top: h * 0.16,
    left: h * 0.03,
  },
  marker: { position: "absolute" },
});
