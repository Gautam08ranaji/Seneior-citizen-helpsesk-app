// screens/AddAttendanceScreen.tsx

import Header from "@/components/reusables/Header";
import { RootState } from "@/redux/store";
import { useAppTheme } from "@/theme/ThemeContext";
import { Typography } from "@/theme/Typography";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Network from "expo-network";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

import Loader from "@/components/reusables/loader";
import FramePersonCircleIcon from "@/components/svg/onboarding/FramePersonCircleIcon";
import { useLocation } from "@/hooks/LocationContext";
import { getFaceCompare } from "@/services/api/GetFaceCompare";
import { getUserListByReportTo } from "@/services/api/GetUserListByReportTo";
import { getUserPhoto } from "@/services/api/getUserPhoto";
import { insertAttendance } from "@/services/api/inserAttendenec";
import SecureCameraModal from "../../../components/ui/CameraModal"; // ✅ Updated to secure camera modal
import SuccessAlert from "../../../components/ui/SuccessAlertModal";

export default function AddAttendanceScreen() {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.user);
  const { location, locationName } = useLocation();
  const { theme } = useAppTheme();

  const [userList, setUserList] = useState<any[]>([]);
  const [userPhotos, setUserPhotos] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [hostIp, setHostIp] = useState<string | null>(null);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">(
    "success"
  );

  const [cameraVisible, setCameraVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const showAlert = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  useEffect(() => {
    if (alertVisible) {
      const timer = setTimeout(() => setAlertVisible(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [alertVisible]);

  const getHostIP = async () => {
    try {
      const ip = await Network.getIpAddressAsync();
      setHostIp(ip);
      return ip;
    } catch {
      return "0.0.0.0";
    }
  };

  const fetchPhoto = async (empid: number) => {
    try {
      const res = await getUserPhoto({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        strUserId: empid,
      });

      if (
        res?.StatusCode === 200 &&
        res.StatusMessage.includes("Img Avaiable") &&
        res.GetUserPhoto
      ) {
        setUserPhotos((prev) => ({
          ...prev,
          [empid]: `data:image/jpeg;base64,${res.GetUserPhoto}`,
        }));
      } else {
        setUserPhotos((prev) => ({ ...prev, [empid]: "" }));
      }
    } catch (err) {
      console.log("Fetch photo error:", err);
    }
  };

  const fetchUserList = async () => {
    try {
      const data = await getUserListByReportTo({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        UserId: user.id,
        AccountId: user.AccountId,
      });

      if (data?.StatusCode === 200 && Array.isArray(data.UserListByReportTo)) {
        console.log("data.UserListByReportTo",data.UserListByReportTo);
        
        setUserList(data.UserListByReportTo);
        await Promise.all(
          data.UserListByReportTo.map((u: any) => fetchPhoto(u.Id))
        );
      }
    } catch (err) {
      console.log("Fetch user list error:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUserList();
      getHostIP();
    }, [])
  );

  const runFaceCheck = async (id: number, base64: string) => {
    console.log("hii");

    try {
      setLoading(true);
      const result = await getFaceCompare({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        UserId: id,
        EncodedImage1: base64,
      });

      if (result?.StatusCode === 200) {
        if (result.Status === "Face Match") {
          console.log(id);

          console.log("result", result);

          showAlert(t("attendanceRecord.faceMatched"), "success");
          submitAttendance(String(id));
        } else if (result.Status === "Face Not Match") {
          showAlert(t("attendanceRecord.faceNotMatched"), "error");
        }
      }
    } catch (err) {
      showAlert(`${t("attendanceRecord.faceCheckError")}: ${err}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const submitAttendance = async (id: string) => {
    const employee = userList.find((emp) => String(emp.Id) === id);
    if (!employee) {
      showAlert(t("attendanceRecord.employeeNotFound"), "error");
      return;
    }

    const status = employee.CheckInTime ? "CheckOut" : "CheckIn";

    try {
      setLoading(true);
      const res = await insertAttendance({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        UserId: Number(id),
        HostIP: hostIp || "0.0.0.0",
        Status: status,
        JioLocation: locationName || t("attendanceRecord.unknown"),
        LatLong: `${location?.latitude},${location?.longitude}`,
      });

      const statusMessage = res.StatusMessage?.replace(/"/g, "");
      if (statusMessage === "Attendance Updated") {
        console.log("att",res);
        
        showAlert(t(`attendanceRecord.${status}Submitted`), "success");
        fetchUserList();
      } else {
        showAlert(t("attendanceRecord.attendanceFailed"), "error");
      }
    } catch {
      showAlert(t("attendanceRecord.attendanceSubmitError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async (photoUri: string) => {
    if (!selectedUserId) return;
    try {
      setLoading(true);
      const base64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      runFaceCheck(selectedUserId, base64);
    } catch {
      showAlert(t("attendanceRecord.imageProcessError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const openCamera = (id: number) => {
    setSelectedUserId(id);
    setCameraVisible(true);
  };

  const closeCamera = () => {
    setCameraVisible(false);
    setSelectedUserId(null);
  };

 const renderAttendanceItem = ({ item }: any) => {
  const userPhoto = userPhotos[item.Id];

  // ✅ Determine text and color based on attendance state
  let statusText = "";
  let statusColor = theme.text.secondary;

  if (item.CheckOutTime) {
    statusText = `${t("attendanceRecord.checkedOutAt")} ${item.CheckOutTime}`;
    statusColor = "orange"; // 🔴 Checkout = red
  } else if (item.CheckInTime) {
    statusText = `${t("attendanceRecord.checkedInAt")} ${item.CheckInTime}`;
    statusColor = "green"; // 🟢 Checkin = green
  } else {
    statusText = t("attendanceRecord.notCheckedIn");
    statusColor = theme.text.secondary;
  }

  return (
    <View style={styles.attendanceItem}>
      {userPhoto ? (
        <Image
          source={{ uri: userPhoto }}
          style={styles.avatar}
          resizeMode="cover"
        />
      ) : (
        <Image
          source={require("../../../assets/images/avatar.png")}
          style={styles.avatar}
          resizeMode="cover"
        />
      )}

      <View style={{ flex: 1 }}>
        <Text
          style={[
            Typography.bodyDefaultMedium,
            { color: theme.text.primary },
          ]}
        >
          {item.Name}
        </Text>

        <Text
          style={[
            Typography.bodyDefaultBold,
            { color: statusColor, marginTop: 4 },
          ]}
        >
          {statusText}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.cameraButton,
          { backgroundColor: theme.background.section },
        ]}
        onPress={() => openCamera(Number(item.Id))}
      >
        <FramePersonCircleIcon size={22} color={theme.primary.base} />
      </TouchableOpacity>
    </View>
  );
};


  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.button.primary.bg }]}
    >
      <Header title={t("attendanceRecord.addAttendance")} />
      <Loader visible={loading} />

      <View
        style={[styles.container, { backgroundColor: theme.background.card }]}
      >
        <FlatList
          data={userList}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={renderAttendanceItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <View style={styles.headerContainer}>
              <Text
                style={[
                  Typography.headingH2Bold,
                  { color: theme.text.primary, marginBottom: 8 },
                ]}
              >
                {t("attendanceRecord.employeeAttendance")}
              </Text>
              {/* <Text
                style={[
                  Typography.bodyDefaultBold,
                  { color: theme.text.secondary, marginBottom: 16 },
                ]}
              >
                {t("attendanceRecord.secureVerificationNote")}
              </Text> */}
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text
                  style={[
                    Typography.bodyDefaultBold,
                    { color: theme.text.secondary },
                  ]}
                >
                  {t("attendanceRecord.noEmployeesFound")}
                </Text>
              </View>
            ) : null
          }
        />
      </View>

      <SuccessAlert
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        onHide={() => setAlertVisible(false)}
      />

      {/* ✅ Secure Camera Modal with Liveness Detection */}
      <SecureCameraModal
        visible={cameraVisible}
        onClose={closeCamera}
        onCapture={handleCapture}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 15,
    paddingBottom: 50,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 8,
  },
  attendanceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  cameraButton: {
    padding: 10,
    borderRadius: 28,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
});
