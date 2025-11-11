import Loader from "@/components/reusables/loader";
import { useAppTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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

export default function ForgotPasswordScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Success message state & animation
  const [successMessage, setSuccessMessage] = useState("");
  const successAnim = useRef(new Animated.Value(0)).current;

  // Fade/Slide animation for screen content
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setSuccessMessage(""));
  };

  // Email validation
  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text && !emailRegex.test(text)) setEmailError("Invalid email address");
    else setEmailError("");
  };

  // OTP handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only allow digits

    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus(); // move to next box
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !otpArray[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const getOtp = () => otpArray.join("");

  // Step 1 → Send OTP
  const handleSendResetLink = async () => {
    if (!email.trim() || emailError) {
      showSuccess("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000)); // simulate API
      showSuccess("OTP sent to your email");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 → Verify OTP
  const handleVerifyOtp = async () => {
    const otp = getOtp();
    if (!otp.trim() || otp.length < 6) {
      showSuccess("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000)); // simulate API
      showSuccess("OTP verified successfully");
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  // Step 3 → Reset Password
  const handleResetPassword = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      showSuccess("Please fill both password fields");
      return;
    }
    if (password !== confirmPassword) {
      showSuccess("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      showSuccess("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200)); // simulate API
      showSuccess("Password reset successfully");
      setTimeout(() => router.back(), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.screen }]}
    >
      <Loader visible={loading} />

      {/* Success message */}
      {successMessage ? (
        <Animated.View
          style={{
            position: "absolute",
            top: insets.top + 20,
            left: width * 0.07,
            right: width * 0.07,
            padding: 12,
            backgroundColor: theme.button.primary.bg,
            borderRadius: 10,
            opacity: successAnim,
            zIndex: 10,
          }}
        >
          <Text
            style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}
          >
            {successMessage}
          </Text>
        </Animated.View>
      ) : null}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                paddingBottom: insets.bottom + 30,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Ionicons
                name="lock-closed-outline"
                size={64}
                color={theme.button.primary.bg}
              />
              <Text style={[styles.title, { color: theme.text.primary }]}>
                {step === 1
                  ? "Forgot Password?"
                  : step === 2
                  ? "Enter OTP"
                  : "Reset Password"}
              </Text>
              <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                {step === 1
                  ? "Enter your registered email to receive a reset code."
                  : step === 2
                  ? "Enter the 6-digit code sent to your email."
                  : "Set your new password below."}
              </Text>
            </View>

            {/* Step 1: Email */}
            {step === 1 && (
              <>
                <View
                  style={[
                    styles.inputContainer,
                    { borderColor: theme.primary.base },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color={theme.primary.base}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.text.primary }]}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.text.placeholder}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={validateEmail}
                  />
                </View>
                {emailError ? (
                  <Text
                    style={{
                      color: "red",
                      marginBottom: 10,
                      fontSize: width * 0.035,
                    }}
                  >
                    {emailError}
                  </Text>
                ) : null}
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: theme.button.primary.bg },
                  ]}
                  onPress={handleSendResetLink}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: theme.background.screen },
                    ]}
                  >
                    Send OTP
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                    marginBottom: 20,
                  }}
                >
                  {otpArray.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }} // <--- fix
                      value={digit}
                      onChangeText={(val) => handleOtpChange(index, val)}
                      onKeyPress={({ nativeEvent }) =>
                        handleOtpKeyPress(index, nativeEvent.key)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      style={{
                        borderWidth: 1.5,
                        borderColor: theme.primary.base,
                        width: width * 0.12,
                        height: 50,
                        textAlign: "center",
                        fontSize: 20,
                        borderRadius: 10,
                        color: theme.text.primary,
                      }}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: theme.button.primary.bg },
                  ]}
                  onPress={handleVerifyOtp}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: theme.background.screen },
                    ]}
                  >
                    Verify OTP
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && (
              <>
                <View
                  style={[
                    styles.inputContainer,
                    { borderColor: theme.primary.base, position: "relative" },
                  ]}
                >
                  <Ionicons
                    name="lock-open-outline"
                    size={22}
                    color={theme.primary.base}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.text.primary }]}
                    placeholder="New Password"
                    placeholderTextColor={theme.text.placeholder}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    style={{ position: "absolute", right: 10 }}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={22}
                      color={theme.primary.base}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    { borderColor: theme.primary.base, position: "relative" },
                  ]}
                >
                  <Ionicons
                    name="checkmark-done-outline"
                    size={22}
                    color={theme.primary.base}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.text.primary }]}
                    placeholder="Confirm Password"
                    placeholderTextColor={theme.text.placeholder}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    style={{ position: "absolute", right: 10 }}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={22}
                      color={theme.primary.base}
                    />
                  </TouchableOpacity>
                </View>

                {confirmPassword && password !== confirmPassword && (
                  <Text
                    style={{
                      color: "red",
                      marginBottom: 10,
                      fontSize: width * 0.035,
                    }}
                  >
                    Passwords do not match
                  </Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: theme.button.primary.bg },
                  ]}
                  onPress={handleResetPassword}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: theme.background.screen },
                    ]}
                  >
                    Reset Password
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backContainer}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={theme.text.secondary}
              />
              <Text style={[styles.backText, { color: theme.text.secondary }]}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: "center", paddingHorizontal: width * 0.07 },
  header: { alignItems: "center", marginBottom: height * 0.04 },
  title: {
    fontSize: width * 0.055,
    fontWeight: "700",
    marginTop: height * 0.015,
  },
  subtitle: {
    fontSize: width * 0.04,
    textAlign: "center",
    marginTop: height * 0.008,
    opacity: 0.8,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 20,
    width: "100%",
  },
  input: { flex: 1, fontSize: width * 0.04 },
  button: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { fontSize: width * 0.045, fontWeight: "bold" },
  backContainer: { flexDirection: "row", alignItems: "center", marginTop: 30 },
  backText: { marginLeft: 6, fontSize: width * 0.04 },
});
