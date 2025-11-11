import Card from "@/components/reusables/card";
import Header from "@/components/reusables/Header";
import SuccessAlert from "@/components/ui/SuccessAlertModal"; // ✅ Added custom alert
import { RootState } from "@/redux/store";
import { generateSignature } from "@/services/api/signatureApi";
import { taskClose } from "@/services/api/taskClose";
import { useAppTheme } from "@/theme/ThemeContext";
import { Typography } from "@/theme/Typography";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import SignatureScreen, {
  SignatureViewRef,
} from "react-native-signature-canvas";
import { useSelector } from "react-redux";

export default function SignatureCaptureScreen() {
  const user = useSelector((state: RootState) => state.user);
  const { id } = useLocalSearchParams();
  const ticketId = Number(id) || 0;

  const { t } = useTranslation();
  const ref = useRef<SignatureViewRef>(null);
  const { width } = useWindowDimensions();
  const { theme } = useAppTheme();

  const [signature, setSignature] = useState<string | null>(null);
  const [hasSigned, setHasSigned] = useState(false);
  const [remark, setRemark] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  // Called when signature is finalized
  const handleOK = async (sig: string) => {
    const strByte = sig.split(",")[1];
    setSignature(strByte);
    await uploadSignature(strByte);
  };

  const handleBegin = () => {
    setHasSigned(true);
    setWarning("");
  };

  const handleClear = () => {
    ref.current?.clearSignature();
    setSignature(null);
    setHasSigned(false);
  };

  const handleSubmit = () => {
    if (!hasSigned || !remark.trim()) {
      setWarning("Please add signature and Remarks before submit.");
      return;
    }

    setWarning("");
    ref.current?.readSignature();
  };

  const uploadSignature = async (strByte: string) => {
    try {
      setLoading(true);
      const data = await generateSignature({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        strUserId: user.id,
        TicketId: ticketId,
        strbyte: strByte,
        extension: "png",
      });

      if (data?.StatusCode === 200) {
        setAlertMessage(t("signature.successMessage"));
        setAlertType("success");
        setAlertVisible(true);
        await closeTask();
      } else {
        setAlertMessage("Failed to upload signature.");
        setAlertType("error");
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("Error uploading signature:", error);
      setAlertMessage("Error uploading signature.");
      setAlertType("error");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const closeTask = async () => {
    try {
      const data = await taskClose({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        UserId: user.id,
        TicketId: String(ticketId),
        Remarks: remark,
      });

      const message = (data?.StatusMessage || "").replace(/^"|"$/g, "");

      if (message.toLowerCase().includes("success")) {
        setAlertMessage(message);
        setAlertType("success");
        setAlertVisible(true);
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 2000);
      } else {
        setAlertMessage(message || "Something went wrong");
        setAlertType("error");
        setAlertVisible(true);
      }
    } catch (err) {
      console.error("Failed to close task:", err);
      setAlertMessage("Could not close task. Please try again.");
      setAlertType("error");
      setAlertVisible(true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.screen }]}
    >
      <Header title="Add Requisition" />
      <View
        style={[
          styles.bodyContainer,
          {
            backgroundColor: theme.background.section,
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <Text style={[styles.heading, { color: theme.text.primary }]}>
              {t("signature.title")}
            </Text>
            <Text style={[styles.instructions, { color: theme.text.secondary }]}>
              {t("signature.instruction")}
            </Text>

            <View
              style={[
                styles.signatureWrapper,
                {
                  width: width - 40,
                  borderColor: theme.border.default,
                  backgroundColor: theme.background.card,
                },
              ]}
            >
              <SignatureScreen
                key={signature || "empty"} // Forces re-render
                ref={ref}
                onOK={handleOK}
                onBegin={handleBegin}
                webStyle={getWebStyle(theme.white)}
                backgroundColor="transparent"
                penColor={"#000"}
                dataURL={signature ?? undefined}
              />
            </View>

            <Card style={{ backgroundColor: theme.background.card }}>
              <Text
                style={[
                  Typography.bodyLargeRegular,
                  {
                    color: theme.button.primary.bg,
                    marginBottom: 10,
                  },
                ]}
              >
                Enter Remarks
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text.primary,
                    borderColor: theme.border.subtle,
                    backgroundColor: theme.background.card,
                  },
                ]}
                placeholder={t("signature.placeholder")}
                placeholderTextColor={theme.text.secondary}
                value={remark}
                onChangeText={(text) => {
                  setRemark(text);
                  if (warning) setWarning("");
                }}
                multiline
                scrollEnabled
                textAlignVertical="top"
              />

              {warning ? (
                <Text style={[styles.warningText, { color: theme.status.error }]}>
                  {warning}
                </Text>
              ) : null}

              <View style={styles.buttonRow}>
                <Pressable
                  style={[
                    styles.button,
                    styles.clearBtn,
                    {
                      backgroundColor: theme.background.card,
                      borderColor: theme.text.primary,
                    },
                  ]}
                  onPress={handleClear}
                >
                  <Text style={[styles.buttonText, { color: theme.text.primary }]}>
                    {t("signature.clear")}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.button,
                    styles.submitBtn,
                    { backgroundColor: theme.button.primary.bg },
                  ]}
                  onPress={handleSubmit}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: theme.background.screen },
                    ]}
                  >
                    {t("signature.submit")}
                  </Text>
                </Pressable>
              </View>
            </Card>
          </View>
        </ScrollView>
      </View>

      {/* ✅ Custom Alert */}
      <SuccessAlert
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        onHide={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const getWebStyle = (bgColor: string) => `
  .m-signature-pad {
    box-shadow: none;
    border: none;
    border-radius: 10px;
    background-color: ${bgColor};
  }
  .m-signature-pad--body {
    border: none;
    background-color: ${bgColor};
  }
  .m-signature-pad--footer {
    display: none;
  }
  canvas {
    width: 100% !important;
    height: 100% !important;
    border-radius: 10px;
    background-color: ${bgColor};
  }
`;

const styles = StyleSheet.create({
  container: { flex: 1 },
  bodyContainer: {
    flex: 1,
    paddingBottom: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 15,
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    marginBottom: 16,
  },
  signatureWrapper: {
    height: 200,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  input: {
    height: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 20,
  },
  warningText: {
    marginBottom: 10,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  clearBtn: {
    borderWidth: 1,
    borderRadius: 25,
  },
  submitBtn: {
    borderRadius: 25,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
