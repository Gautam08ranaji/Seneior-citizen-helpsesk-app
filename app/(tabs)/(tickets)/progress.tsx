import Header from "@/components/reusables/Header";
import HeaderCard from "@/components/reusables/HeaderCard";
import { useLocation } from "@/hooks/LocationContext";
import { RootState } from "@/redux/store";
import apiClient from "@/services/api/axiosInstance";
import { getCaseTaskStatusReason } from "@/services/api/GetCaseTaskStatusReasonParams";
import { updateTicketStatus } from "@/services/api/UpdateTicketStatus";
import { updateUserLocationTasks } from "@/services/api/UpdateUserLocationTasks";
import { useAppTheme } from "@/theme/ThemeContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const order = [
  "Accept By User",
  "Ready To Start",
  "Working Progress",
  "Ticket Completed",
  "Pending for feedback",
];

type Reason = {
  reason_id: number;
  reason_description: string;
};

const TaskItem = ({
  icon,
  title,
  value,
  onChangeText,
  disabled = false,
  onAttach,
  attachedFileName,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  onAttach?: () => void;
  attachedFileName?: string;
  theme: any;
}) => (
  <View
    style={[
      styles.taskItem,
      { borderBottomColor: theme.border.default },
    ]}
  >
    {icon}
    <View style={styles.taskContent}>
      <Text style={[styles.taskTitle, { color: theme.text.primary }]}>
        {title}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: theme.input.border,
            backgroundColor: disabled
              ? theme.background.section
              : theme.input.background,
          },
        ]}
      >
        <TextInput
          style={[
            styles.taskInput,
            {
              color: disabled
                ? theme.text.secondary
                : theme.text.primary,
            },
          ]}
          placeholder={t("ProgressTrackerScreen.remarksPlaceholder")}
          placeholderTextColor={theme.text.placeholder}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
        />
        <TouchableOpacity onPress={onAttach} disabled={disabled}>
          <MaterialIcons
            name="attachment"
            size={20}
            color={
              disabled ? theme.disabled : theme.primary.base
            }
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      {attachedFileName ? (
        <Text
          style={[
            styles.fileName,
            { color: theme.text.secondary },
          ]}
        >
          📎 {attachedFileName}
        </Text>
      ) : null}
    </View>
  </View>
);

export default function ReactNativeApp() {
  const { theme } = useAppTheme();
  const [message, setMessage] = useState<string>("");
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [remarks, setRemarks] = useState<{ [key: number]: string }>({});
  const [attachments, setAttachments] = useState<{ [key: number]: string }>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const { location, locationName } = useLocation();
  const user = useSelector((state: RootState) => state.user);
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

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const cleanApiJson = (raw: string) => {
    const splitJson = raw.split("}{");
    if (splitJson.length > 1) {
      return JSON.parse(`${splitJson[0]}}`);
    }
    return JSON.parse(raw);
  };

  const callUpdateTicketStatus = async (reasonId: number, remark: string) => {
    try {
      const result = await updateTicketStatus({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        UserId: user.id,
        TicketId: Number(parsedItem.id),
        statusId: 3,
        statusReasonId: reasonId,
        strRemarks: remark || "",
      });

      if (result) {
        await sendLocation();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update ticket:", err);
      showMessage("❌ Failed to update ticket status");
      return false;
    }
  };

  const fetchReasons = useCallback(async () => {
    try {
      const raw = await getCaseTaskStatusReason({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        strUserId: user.id,
        szStatusId: "3",
      });

      const cleaned = cleanApiJson(raw);
      let steps = cleaned?.GetStatusReason || [];

      steps = steps.sort(
        (a: any, b: any) =>
          order.indexOf(a.reason_description) -
          order.indexOf(b.reason_description)
      );

      setReasons(steps);
    } catch (err) {
      console.error("Failed to fetch reasons:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchReasons();
  }, [fetchReasons]);

  useEffect(() => {
    if (reasons.length > 0) {
      GetTicketById();
    }
  }, [reasons]);

  const sendLocation = async () => {
    try {
      await updateUserLocationTasks({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        UserId: user.id,
        DriverCurrentLocName: locationName || "Unknown",
        Laltitue: location?.latitude?.toString() || "",
        Longitute: location?.longitude?.toString() || "",
        TaskId: "5",
      });
    } catch (err) {
      console.error("Failed to update location:", err);
    }
  };

  const handleSubmit = async () => {
    if (currentStep < reasons.length) {
      const currentReason = reasons[currentStep];
      const remark = remarks[currentReason.reason_id] || "";

      const success = await callUpdateTicketStatus(
        currentReason.reason_id,
        remark
      );

      if (success) {
        showMessage(`Step "${currentReason.reason_description}" completed`);
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      showMessage("All steps completed!");
      router.push({
        pathname: "/signature",
        params: { id: String(parsedItem.id) },
      });
    }
  };

  const handleAttach = async (reasonId: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setAttachments((prev) => ({ ...prev, [reasonId]: file.name }));

      const formData = new FormData();
      formData.append("reason_id", reasonId.toString());
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      } as any);
    } catch (err) {
      console.error("Attachment error:", err);
      showMessage("❌ Failed to upload document");
    }
  };

  const GetTicketById = async () => {
    try {
      const response = await apiClient.post(
        "/GetTicketById",
        {
          szAPIKey: user.token,
          szDeviceType: Platform.OS,
          UserId: user.id,
          TicketId: Number(parsedItem.id),
        },
        {
          headers: { "Content-Type": "application/json" },
          responseType: "text",
        }
      );

      const cleanString = response.data.split("}{")[0] + "}";
      const parsed = JSON.parse(cleanString);

      const rawList = parsed?.GetTicketById?.[0] ?? null;

      if (rawList) {
        const completedIndex = reasons.findIndex(
          (r) => r.reason_id === Number(rawList.StatusReasonId)
        );

        if (completedIndex !== -1) {
          setCurrentStep(completedIndex + 1);
        } else {
          setCurrentStep(0);
        }
      }
    } catch (error) {
      console.error("Error fetching in-progress tickets:", error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primary.base }]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.primary.base}
      />

      <Header title={t("ProgressTrackerScreen.title")} />

      <ScrollView
        style={[
          styles.body,
          {
            backgroundColor: theme.background.screen,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <HeaderCard
            mobileNumber={user.name}
            vehicleNumber={user.VehicleNo}
          />

          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.button.primary.bg },
            ]}
            onPress={() =>
              router.push({
                pathname: "/requisition",
                params: { ticketDetail: JSON.stringify(parsedItem) },
              })
            }
          >
            <MaterialIcons
              name={"add-box"}
              size={20}
              color={theme.button.primary.text}
            />
            <Text
              style={[
                styles.submitText,
                { color: theme.button.primary.text },
              ]}
            >
              {t("ProgressTrackerScreen.addRequisition")}
            </Text>
          </TouchableOpacity>

          <View style={styles.taskList}>
            {reasons.map((item, index) => (
              <TaskItem
                key={item.reason_id}
                icon={
                  <Ionicons
                    name={
                      index < currentStep
                        ? "checkmark-circle"
                        : index === currentStep
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={24}
                    color={
                      index < currentStep
                        ? theme.status.success
                        : index === currentStep
                        ? theme.status.warning
                        : theme.text.secondary
                    }
                  />
                }
                title={item.reason_description}
                value={remarks[item.reason_id] || ""}
                onChangeText={(text) =>
                  setRemarks((prev) => ({ ...prev, [item.reason_id]: text }))
                }
                disabled={index !== currentStep}
                onAttach={() => handleAttach(item.reason_id)}
                attachedFileName={attachments[item.reason_id]}
                theme={theme}
              />
            ))}
          </View>

          {currentStep <= reasons.length && (
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.button.primary.bg },
              ]}
              onPress={handleSubmit}
            >
              <Text
                style={[
                  styles.submitText,
                  { color: theme.button.primary.text },
                ]}
              >
                {currentStep < reasons.length
                  ? t("ProgressTrackerScreen.submit")
                  : t("ProgressTrackerScreen.close")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {message ? (
        <View
          style={[
            styles.messageToast,
            {
              backgroundColor: theme.background.card,
            },
          ]}
        >
          <Text
            style={[styles.messageText, { color: theme.text.primary }]}
          >
            {message}
          </Text>
        </View>
      ) : null}
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
    marginBottom: 80,
  },
  content: { padding: 20 },
  taskList: { marginBottom: 20 },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
  },
  taskContent: { flex: 1, marginLeft: 15 },
  taskTitle: {
    fontSize: 18,
    marginBottom: 5,
    fontFamily: "Lato",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  taskInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Lato",
    paddingVertical: 8,
  },
  submitButton: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignSelf: "center",
    width: 340,
  },
  addButton: {
    borderRadius: 35,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: "flex-end",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  submitText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Lato",
  },
  messageToast: {
    position: "absolute",
    top: 100,
    left: "50%",
    transform: [{ translateX: -100 }],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  messageText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Lato",
  },
  fileName: {
    marginTop: 5,
    fontSize: 13,
    fontStyle: "italic",
  },
});
