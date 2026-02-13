import apiClient from "@/services/api/axiosInstance";
import { useAppTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { width: w, height: h } = Dimensions.get("window");

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const { mobile } = useLocalSearchParams<{ mobile: string }>(); // from OTP screen

  const [formData, setFormData] = useState({
    fullName: "",
    aadhaar: "",
    gender: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    emergencyName: "",
    emergencyNumber: "",
    medicalInfo: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInput = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleRegister = async () => {
    const { fullName, gender, dob, address, city, state } = formData;

    if (!fullName || !gender || !dob || !address || !city || !state) {
      setErrorMsg("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await apiClient.post("/auth/register", {
        mobile,
        ...formData,
      });

      if (res.data.success) {
        router.replace("/(tabs)");
    } else {
        setErrorMsg(res.data.message || "Registration failed");
    }
} catch (err) {
    setErrorMsg("Error connecting to server");
} finally {
        router.replace("/TicketDetailsScreen");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.screen }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.header,
              { backgroundColor: theme.button.primary.bg },
            ]}
          >
            <Text
              style={[styles.headerText, { color: theme.background.screen }]}
            >
              {t("SignupScreen.title", "Complete Your Registration")}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Name */}
            <TextInput
              style={[styles.input, { borderColor: theme.button.primary.bg }]}
              placeholder="Full Name *"
              value={formData.fullName}
              onChangeText={(t) => handleInput("fullName", t)}
            />

            {/* Mobile */}
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: "#f2f2f2",
                  color: "#666",
                },
              ]}
              editable={false}
              value={mobile || ""}
            />

            {/* Aadhaar */}
            <TextInput
              style={[styles.input, { borderColor: theme.button.primary.bg }]}
              placeholder="Aadhaar (optional)"
              value={formData.aadhaar}
              keyboardType="numeric"
              onChangeText={(t) => handleInput("aadhaar", t)}
            />

            {/* Gender */}
            <View style={styles.genderRow}>
              {["Male", "Female", "Other"].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => handleInput("gender", g)}
                  style={[
                    styles.genderBtn,
                    {
                      borderColor: theme.button.primary.bg,
                      backgroundColor:
                        formData.gender === g
                          ? theme.button.primary.bg
                          : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        formData.gender === g
                          ? theme.background.screen
                          : theme.button.primary.bg,
                      fontWeight: "500",
                    }}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* DOB */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.input,
                { justifyContent: "center", borderColor: theme.button.primary.bg },
              ]}
            >
              <Text
                style={{
                  color: formData.dob ? "#000" : "#888",
                }}
              >
                {formData.dob || "Select Date of Birth *"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.dob ? new Date(formData.dob) : new Date()}
                mode="date"
                maximumDate={new Date()}
                onChange={(e, date) => {
                  setShowDatePicker(false);
                  if (date)
                    handleInput("dob", date.toISOString().split("T")[0]);
                }}
              />
            )}

            {/* Address */}
            <TextInput
              style={[styles.input, { borderColor: theme.button.primary.bg }]}
              placeholder="Address *"
              value={formData.address}
              onChangeText={(t) => handleInput("address", t)}
            />

            {/* City + State */}
            <View style={styles.row}>
              <TextInput
                style={[
                  styles.input,
                  { flex: 1, borderColor: theme.button.primary.bg },
                ]}
                placeholder="City *"
                value={formData.city}
                onChangeText={(t) => handleInput("city", t)}
              />
              <TextInput
                style={[
                  styles.input,
                  { flex: 1, borderColor: theme.button.primary.bg },
                ]}
                placeholder="State *"
                value={formData.state}
                onChangeText={(t) => handleInput("state", t)}
              />
            </View>

            {/* Emergency Contact */}
            <TextInput
              style={[styles.input, { borderColor: theme.button.primary.bg }]}
              placeholder="Emergency Contact Name"
              value={formData.emergencyName}
              onChangeText={(t) => handleInput("emergencyName", t)}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.button.primary.bg }]}
              placeholder="Emergency Contact Number"
              keyboardType="phone-pad"
              value={formData.emergencyNumber}
              onChangeText={(t) => handleInput("emergencyNumber", t)}
            />

            {/* Medical Info */}
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.button.primary.bg,
                  height: h * 0.12,
                  textAlignVertical: "top",
                },
              ]}
              multiline
              placeholder="Medical / Disability Info (optional)"
              value={formData.medicalInfo}
              onChangeText={(t) => handleInput("medicalInfo", t)}
            />

            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.button.primary.bg },
                loading && { opacity: 0.6 },
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={theme.background.screen}
              />
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.background.screen },
                ]}
              >
                {loading ? "Submitting..." : "Submit & Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingVertical: h * 0.035,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerText: { fontSize: w * 0.05, fontWeight: "700" },
  formContainer: {
    padding: w * 0.06,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: h * 0.015,
    marginBottom: h * 0.02,
    fontSize: w * 0.038,
  },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: h * 0.02,
  },
  genderBtn: {
    flex: 1,
    alignItems: "center",
    padding: h * 0.015,
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: h * 0.018,
    borderRadius: 10,
    marginTop: h * 0.015,
  },
  buttonText: {
    marginLeft: 8,
    fontWeight: "600",
    fontSize: w * 0.045,
  },
  errorText: {
    color: "red",
    fontSize: w * 0.035,
    marginBottom: h * 0.01,
    textAlign: "center",
  },
});
