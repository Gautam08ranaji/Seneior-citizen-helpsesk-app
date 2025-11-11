import Header from "@/components/reusables/Header";
import Loader from "@/components/reusables/loader";
import SuccessAlert from "@/components/ui/SuccessAlertModal"; // ✅ custom alert
import { RootState } from "@/redux/store";
import { addRequisition } from "@/services/api/AddRequisition";
import { uploadDocument } from "@/services/api/UploadDocument";
import { useAppTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

export default function RequisitionScreen() {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.user);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<
    { name: string; uri: string; type: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    attachment: "",
  });

  // ✅ custom alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const { ticketDetail } = useLocalSearchParams();

  const parsedItem = useMemo(() => {
    if (!ticketDetail) return undefined;
    try {
      return JSON.parse(ticketDetail as string);
    } catch (e) {
      console.error("Failed to parse ticket param:", e);
      return undefined;
    }
  }, [ticketDetail]);

  // 📄 Pick document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;
      const file = result.assets[0];
      setSelectedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          uri: file.uri,
          type: file.mimeType || "application/octet-stream",
        },
      ]);
      setErrors((prev) => ({ ...prev, attachment: "" }));
    } catch (error) {
      console.error("Document Picker Error:", error);
      setAlertMessage("Failed to pick document.");
      setAlertType("error");
      setAlertVisible(true);
    }
  };

  // 📸 Take photo
  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setAlertMessage(t("RequisitionScreen.cameraPermission"));
        setAlertType("error");
        setAlertVisible(true);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setSelectedFiles((prev) => [
          ...prev,
          {
            name: file.fileName || "photo.jpg",
            uri: file.uri,
            type: "image/jpeg",
          },
        ]);
        setErrors((prev) => ({ ...prev, attachment: "" }));
      }
    } catch (error) {
      console.error("Camera Error:", error);
      setAlertMessage("Camera error occurred.");
      setAlertType("error");
      setAlertVisible(true);
    }
  };

  // 📤 Handle document upload
  const handleUpload = async (
    requisitionsNo: string | number,
    RQFNumber: string | number
  ) => {
    try {
      for (const file of selectedFiles) {
        const base64String = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const fileExt = file.name.split(".").pop() || "jpg";

        const params = {
          szAPIKey: user.token,
          szDeviceType: Platform.OS,
          strUserId: String(user.id),
          RelatedTo: String(requisitionsNo),
          RelatedToId: RQFNumber,
          RelatedToName: "Requisition Form",
          strbyte: base64String,
          FileExtension: fileExt,
          DocumentName: file.name,
          DocumentFileName: file.name,
        };

        await uploadDocument(params);
      }

      setAlertMessage("Files uploaded successfully!");
      setAlertType("success");
      setAlertVisible(true);
    } catch (error) {
      console.error("❌ Upload error:", error);
      setAlertMessage("Failed to upload files.");
      setAlertType("error");
      setAlertVisible(true);
    }
  };

  // 🧾 Submit requisition
  const AddRequisition = async () => {
    let newErrors = { title: "", description: "", attachment: "" };
    let valid = true;

    if (!title.trim()) {
      newErrors.title = t("RequisitionScreen.errorTitle");
      valid = false;
    }
    if (!description.trim()) {
      newErrors.description = t("RequisitionScreen.errorDescription");
      valid = false;
    }
    if (selectedFiles.length === 0) {
      newErrors.attachment = t("RequisitionScreen.errorAttachment");
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    try {
      setLoading(true);
      const raw = await addRequisition({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        strUserId: user.id,
        TaskId: parsedItem?.id,
        TaskNumber: parsedItem?.TicketNo,
        Subject: title,
        Discriptions: description,
      });

      const data = normalizeApiResponse(raw);

      if (typeof data.Status === "string") {
        data.Status = data.Status.replace(/^"|"$/g, "").trim();
      }

      if (/successfully/i.test(data.Status)) {
        await handleUpload(data.RequisitionsNo, data.RQFNumber);
        setSelectedFiles([]);
        setTitle("");
        setDescription("");
        setAlertMessage("Requisition added successfully!");
        setAlertType("success");
        setAlertVisible(true);
      } else {
        setAlertMessage("Something went wrong. Please try again.");
        setAlertType("error");
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("AddRequisition error:", error);
      setAlertMessage("Error adding requisition.");
      setAlertType("error");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // 🔧 Normalize backend response
  function normalizeApiResponse(raw: any) {
    if (raw && typeof raw === "object") return raw;
    if (typeof raw !== "string") raw = String(raw || "");
    const text = raw.trim();

    try {
      return JSON.parse(text);
    } catch {}

    if (text.includes("}{")) {
      const parts = text
        .split("}{")
        .map((p: string, i: number, arr: string[]) => {
          if (i === 0) return p + "}";
          if (i === arr.length - 1) return "{" + p;
          return "{" + p + "}";
        });
      for (let i = parts.length - 1; i >= 0; i--) {
        try {
          const obj = JSON.parse(parts[i]);
          if (obj && (obj.Status || obj.RQFNumber)) return obj;
        } catch {}
      }
    }

    const matches = text.match(/\{[\s\S]*?\}/g);
    if (matches && matches.length) {
      for (let i = matches.length - 1; i >= 0; i--) {
        try {
          const obj = JSON.parse(matches[i]);
          if (obj && (obj.Status || obj.RQFNumber)) return obj;
        } catch {}
      }
    }

    return { raw: text };
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primary.base }]}
    >
      <Header title={t("RequisitionScreen.title")} />

      <ScrollView
        style={[styles.body, { backgroundColor: theme.background.screen }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Title */}
          <Text style={[styles.label, { color: theme.text.primary }]}>
            {t("RequisitionScreen.labelTitle")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.input.background,
                borderColor: theme.input.border,
                color: theme.text.primary,
              },
            ]}
            placeholder={t("RequisitionScreen.placeholderTitle")}
            placeholderTextColor={theme.text.placeholder}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (text.trim()) setErrors((prev) => ({ ...prev, title: "" }));
            }}
          />
          {errors.title ? (
            <Text style={[styles.errorText, { color: theme.status.error }]}>
              {errors.title}
            </Text>
          ) : null}

          {/* Description */}
          <Text style={[styles.label, { color: theme.text.primary }]}>
            {t("RequisitionScreen.labelDescription")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                minHeight: 100,
                textAlignVertical: "top",
                backgroundColor: theme.input.background,
                borderColor: theme.input.border,
                color: theme.text.primary,
              },
            ]}
            placeholder={t("RequisitionScreen.placeholderDescription")}
            placeholderTextColor={theme.text.placeholder}
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (text.trim())
                setErrors((prev) => ({ ...prev, description: "" }));
            }}
            multiline
          />
          {errors.description ? (
            <Text style={[styles.errorText, { color: theme.status.error }]}>
              {errors.description}
            </Text>
          ) : null}

          {/* Attach Options */}
          <Text style={[styles.label, { color: theme.text.primary }]}>
            {t("RequisitionScreen.labelAttachment")}
          </Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.attachBtn,
                {
                  borderColor: theme.input.border,
                  backgroundColor: theme.background.section,
                },
              ]}
              onPress={pickDocument}
            >
              <Ionicons
                name="document-attach"
                size={18}
                color={theme.button.primary.bg}
              />
              <Text style={[styles.attachText, { color: theme.text.primary }]}>
                {t("RequisitionScreen.attachDocument")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.attachBtn,
                {
                  borderColor: theme.input.border,
                  backgroundColor: theme.background.section,
                },
              ]}
              onPress={takePhoto}
            >
              <Ionicons
                name="camera"
                size={18}
                color={theme.button.primary.bg}
              />
              <Text style={[styles.attachText, { color: theme.text.primary }]}>
                {t("RequisitionScreen.openCamera")}
              </Text>
            </TouchableOpacity>
          </View>

          {errors.attachment ? (
            <Text style={[styles.errorText, { color: theme.status.error }]}>
              {errors.attachment}
            </Text>
          ) : null}

          {/* File List */}
          {selectedFiles.map((file, idx) => (
            <View
              key={idx}
              style={[
                styles.fileCard,
                {
                  borderColor: theme.border.default,
                  backgroundColor: theme.background.card,
                },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={theme.button.primary.bg}
              />
              <Text
                style={[styles.fileName, { color: theme.text.primary }]}
                numberOfLines={1}
              >
                {file.name}
              </Text>
            </View>
          ))}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.button.primary.bg },
            ]}
            onPress={AddRequisition}
            disabled={loading}
          >
            <Text
              style={[
                styles.submitText,
                { color: theme.button.primary.text },
              ]}
            >
              {loading
                ? t("RequisitionScreen.submitting")
                : t("RequisitionScreen.submit")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Loader visible={loading} />

      {/* ✅ Custom Alert */}
      <SuccessAlert
        visible={alertVisible}
        message={alertMessage}
        onHide={() => setAlertVisible(false)}
        type={alertType}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: 15,
    marginBottom: 60,
  },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 14,
    marginBottom: 8,
  },
  errorText: { fontSize: 12, marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  attachBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  attachText: { marginLeft: 6, fontWeight: "600" },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  fileName: { marginLeft: 8, flexShrink: 1 },
  submitButton: {
    borderRadius: 25,
    paddingVertical: 15,
    alignSelf: "center",
    width: 200,
    marginTop: 20,
  },
  submitText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});
