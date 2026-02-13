import { useAppTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import OTPTextView from "react-native-otp-textinput";

const { width, height } = Dimensions.get("window");

const OtpVerificationScreen = () => {
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const otpInputRef = useRef<OTPTextView>(null);

  /** Countdown timer */
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  /** Resend OTP */
  const handleResend = () => {
    setTimer(30);
    setOtp("");
    otpInputRef.current?.clear();
    // TODO: Call API to resend OTP
    console.log("Resend OTP triggered");
  };

  /** Verify OTP */
  const handleVerify = async () => {
    if (otp.length !== 6) {
      alert(t("OtpScreen.enterValidOtp", "Please enter a valid 6-digit OTP"));
      return;
    }

    // TODO: API call for OTP verification
    console.log("Verifying OTP:", otp);

    // On success, navigate to dashboard
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.screen }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.innerContainer}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {t("OtpScreen.title", "Enter OTP")}
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            {t("OtpScreen.subtitle", "We’ve sent a 6-digit OTP to your registered mobile number.")}
          </Text>

          <OTPTextView
            ref={otpInputRef}
            handleTextChange={(text) => setOtp(text)}
            inputCount={6}
            keyboardType="number-pad"
            tintColor={theme.button.primary.bg}
            textInputStyle={StyleSheet.flatten([
              styles.otpInput,
              { borderColor: theme.button.primary.bg, color: theme.text.primary },
            ])}
          />

          <TouchableOpacity
            style={[styles.verifyButton, { backgroundColor: theme.button.primary.bg }]}
            onPress={handleVerify}
          >
            <Text style={[styles.verifyText, { color: theme.background.screen }]}>
              {t("OtpScreen.verify", "Verify")}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <Text style={[styles.resendText, { color: theme.text.secondary }]}>
                {t("OtpScreen.resendIn", "Resend OTP in")} {timer}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={[styles.resendLink, { color: theme.button.primary.bg }]}>
                  {t("OtpScreen.resendOtp", "Resend OTP")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  innerContainer: {
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    justifyContent: "center",
    flex: 1,
  },
  title: {
    fontSize: width * 0.065,
    fontWeight: "700",
    marginBottom: height * 0.015,
  },
  subtitle: {
    fontSize: width * 0.04,
    textAlign: "center",
    marginBottom: height * 0.04,
  },
  otpInput: {
    borderWidth: 1,
    borderRadius: 10,
    height: height * 0.07,
    width: width * 0.12,
    textAlign: "center",
    fontSize: width * 0.05,
    fontWeight: "600",
  },
  verifyButton: {
    marginTop: height * 0.05,
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.3,
    borderRadius: 10,
  },
  verifyText: {
    fontSize: width * 0.045,
    fontWeight: "700",
    textAlign: "center",
  },
  resendContainer: {
    marginTop: height * 0.03,
  },
  resendText: {
    fontSize: width * 0.04,
  },
  resendLink: {
    fontSize: width * 0.045,
    fontWeight: "600",
  },
});
