import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

import Header from "@/components/reusables/Header";
import HeaderCard from "@/components/reusables/HeaderCard";
import Card from "@/components/reusables/card";
import Loader from "@/components/reusables/loader";
import CustomAlertModal from "@/components/ui/CustomAlertModal";
import SuccessAlert from "@/components/ui/SuccessAlertModal";

import { GetDashMonthyWiseTicketStatus } from "@/services/api/DashMonthyWiseTicketStatus";
import { getEmpDashCount } from "@/services/api/GetEmpDashCountParams ";
import { getUserListByReportTo } from "@/services/api/GetUserListByReportTo";
import { getUserPhoto } from "@/services/api/getUserPhoto";
import { uploadSelfi } from "@/services/api/uploadSelfi";

import { useAppTheme } from "@/theme/ThemeContext";
import { Typography } from "@/theme/Typography";
import AbsentIcon from "../../assets/svgs/AbsentIcon.svg";
import People from "../../assets/svgs/People.svg";
import PresentIcon from "../../assets/svgs/PresentIcon.svg";
import { useLocation } from "../../hooks/LocationContext";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();
  const { location } = useLocation();
  const user = useSelector((state: RootState) => state.user);

  const { theme, mode } = useAppTheme();

  const [currentUploadId, setCurrentUploadId] = useState<number | null>(null);
  const [userList, setUserList] = useState<any[]>([]);
  const [userPhotos, setUserPhotos] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [counts, setCounts] = useState({
    Total: 0,
    PresentCount: 0,
    AbsentCount: 0,
  });
  const [ticketCounts, setTicketCounts] = useState({
    Total: 0,
    Open: 0,
    Working: 0,
    Close: 0,
  });
  const [attendanceExpanded, setAttendanceExpanded] = useState(false);
  const [handoverExpanded, setHandoverExpanded] = useState(false);

  // Fetch Dashboard Counts
  const fetchData = async () => {
    try {
      const response = await getEmpDashCount({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        UserId: user.id,
        AccountId: user.AccountId,
      });
      setCounts({
        Total: response.Total,
        PresentCount: response.PresentCount ?? 0,
        AbsentCount: response.AbsentCount ?? 0,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard counts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Ticket Counts
  const fetchTicketCount = async () => {
    try {
      const response = await GetDashMonthyWiseTicketStatus({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        UserId: user.id,
      });
      setTicketCounts({
        Total: response.Total ?? 0,
        Open: response.OPEN ?? 0,
        Close: response.CLOSE ?? 0,
        Working: response.WORKING ?? 0,
      });
    } catch (err) {
      console.error("Failed to fetch ticket counts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user photo
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

  // Fetch user list and photos
  const fetchUserList = async () => {
    try {
      const data = await getUserListByReportTo({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        UserId: user.id,
        AccountId: user.AccountId,
      });
      if (data?.StatusCode === 200 && Array.isArray(data.UserListByReportTo)) {
        setUserList(data.UserListByReportTo);
        await Promise.all(
          data.UserListByReportTo.map((u: any) => fetchPhoto(u.Id))
        );
      }
    } catch (err) {
      console.log("Fetch user list error:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
      fetchUserList();
      fetchTicketCount();
    }, [])
  );

  // Image Handling
  const pickImageOption = () => setShowOptions(true);

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permission denied for camera");

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) handleImage(result.assets[0].uri);
  };

  const chooseFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permission denied for gallery");

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) handleImage(result.assets[0].uri);
  };

  const handleImage = (uri: string) => {
    if (!currentUploadId) return Alert.alert("Please Retry");

    let retried = false;
    const attemptUpload = async (uri: string) => {
      try {
        setLoading(true);
        const fileExt = uri.split(".").pop() || "jpg";
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const res = await uploadSelfi({
          szAPIKey: user.token,
          szDeviceType: Platform.OS,
          strUserId: currentUploadId,
          strbyte: base64,
          FileExtension: fileExt,
          DocumentFileName: `${fileExt}.${fileExt}`,
        });

        if (res?.StatusCode === 200) {
          Alert.alert("✅ Image Uploaded Successfully");
          fetchUserList();
          fetchData();
        }
      } catch (error) {
        if (!retried) {
          retried = true;
          setTimeout(() => attemptUpload(uri), 2000);
        } else {
          Alert.alert("Error", "Failed to upload selfie");
          console.log("Upload error", error);
        }
      } finally {
        setLoading(false);
      }
    };
    attemptUpload(uri);
  };

  // Attendance render
  const renderAttendanceItem = ({ item }: any) => {
    const status = item.CheckInTime ? "Present" : "Absent";
    const statusColors: any = {
      Present: { borderColor: theme.status.success, textColor: theme.status.success },
      Absent: { borderColor: theme.status.error, textColor: theme.status.error },
    };
    const userPhoto = userPhotos[item.Id];

    return (
      <View style={styles.attendanceItem}>
        <Image
          source={
            userPhoto
              ? { uri: userPhoto }
              : require("../../assets/images/avatar.png")
          }
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={[
              Typography.bodyDefaultMedium,
              { color: theme.button.primary.bg },
            ]}
          >
            {item.Name}
          </Text>
          {item.CheckInTime ? (
            <>
              <Text
                style={[Typography.bodySmallRegular, { color: theme.status.success }]}
              >
                Check In: {item.CheckInTime}
              </Text>
              <Text
                style={[
                  Typography.bodySmallRegular,
                  { color: item.CheckOutTime ? theme.status.error : theme.status.error },
                ]}
              >
                {item.CheckOutTime
                  ? `Check Out: ${item.CheckOutTime}`
                  : "No Check Out"}
              </Text>
            </>
          ) : (
            <Text
              style={[Typography.bodySmallRegular, { color: theme.text.secondary }]}
            >
              No Check In
            </Text>
          )}
        </View>
        <View
          style={[
            styles.statusBadge,
            { borderColor: statusColors[status].borderColor },
          ]}
        >
          <Text style={{ color: statusColors[status].textColor }}>
            {status}
          </Text>
        </View>
      </View>
    );
  };

  // Card helper component
  const SummaryCard = ({ icon: Icon, count, label, backgroundColor }: any) => (
    <Card
      style={[
        styles.sectionCards,
        { backgroundColor: backgroundColor || theme.background.screen },
      ]}
    >
      <Icon width={24} height={24} color={theme.background.screen} />
      <Text style={[Typography.displayLargeMedium, { color: theme.white }]}>
        {count}
      </Text>
      <Text style={[Typography.bodyLargeRegular, { color: theme.white }]}>
        {label}
      </Text>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.screen }}>
      <Header isHome />
      <Loader visible={loading} />
      <SuccessAlert
        visible={alertVisible}
        message="Data saved successfully!"
        onHide={() => setAlertVisible(false)}
        type="success"
      />

      <View
        style={{
          flex: 1,
          backgroundColor: theme.button.primary.bg,
          paddingTop: 10,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.background.screen,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: "hidden", // ✅ keeps scroll inside and shows rounded edges
            marginTop: 5,

          }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingBottom: tabBarHeight + 20,
              paddingTop: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            <HeaderCard mobileNumber={user.name} vehicleNumber={user.VehicleNo} />

            {/* Options Modal */}
            <CustomAlertModal
              visible={showOptions}
              onClose={() => setShowOptions(false)}
              title="Select Option"
              options={[
                { text: t("HomeScreen.takeSelfie"), onPress: takeSelfie },
                {
                  text: t("HomeScreen.chooseFromGallery"),
                  onPress: chooseFromGallery,
                },
                {
                  text: t("HomeScreen.cancel"),
                  onPress: () => { },
                  type: "cancel",
                },
              ]}
            />

            {/* Tickets Summary */}
            <Card
              style={{
                width: "90%",
                alignSelf: "center",
                marginTop: 20,
                padding: 16,
                backgroundColor: theme.background.section,
              }}
            >
              <Text
                style={[Typography.headingH2Bold, { color: theme.button.primary.bg }]}
              >
                {t("HomeScreen.ticketsSummary")}
              </Text>
              <View style={styles.row}>
                <SummaryCard
                  icon={People}
                  count={ticketCounts.Open}
                  label={t("HomeScreen.open")}
                  backgroundColor="#71D6C9"
                />
                <SummaryCard
                  icon={PresentIcon}
                  count={ticketCounts.Working}
                  label={t("HomeScreen.progress")}
                  backgroundColor="#6C7AAE"
                />
                <SummaryCard
                  icon={AbsentIcon}
                  count={ticketCounts.Close}
                  label={t("HomeScreen.closed")}
                  backgroundColor="#F0A84C"
                />
              </View>
            </Card>

            {/* Attendance Summary */}
            <Card
              style={{
                width: "90%",
                alignSelf: "center",
                marginTop: 20,
                padding: 16,
                backgroundColor: theme.background.section,
              }}
            >
              <Text
                style={[Typography.headingH2Bold, { color: theme.button.primary.bg }]}
              >
                {t("HomeScreen.attendanceSummary")}
              </Text>
              <View style={styles.row}>
                <SummaryCard
                  icon={People}
                  count={counts.Total}
                  label={t("HomeScreen.total")}
                  backgroundColor="#F0A84C"
                />
                <SummaryCard
                  icon={PresentIcon}
                  count={counts.PresentCount}
                  label={t("HomeScreen.present")}
                  backgroundColor="#6C7AAE"
                />
                <SummaryCard
                  icon={AbsentIcon}
                  count={counts.AbsentCount}
                  label={t("HomeScreen.absent")}
                  backgroundColor="#71D6C9"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.expandButton,
                  ,
                ]}
                onPress={() => setAttendanceExpanded(!attendanceExpanded)}
              >
                <Text style={{ color: theme.button.primary.bg, fontWeight: "bold" }}>
                  {attendanceExpanded
                    ? `${t("HomeScreen.hideList")} ▲`
                    : `${t("HomeScreen.viewList")} ▼`}
                </Text>
              </TouchableOpacity>

              {attendanceExpanded && (
                <FlatList
                  data={[...userList].sort((a, b) => (a.CheckInTime ? -1 : 1))}
                  keyExtractor={(item) => item.Id.toString()}
                  renderItem={renderAttendanceItem}
                  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                  style={{ marginTop: 10 }}
                />
              )}
            </Card>

            {/* Handover Tools */}
            <Card
              style={{
                width: "90%",
                alignSelf: "center",
                marginTop: 20,
                padding: 16,
                backgroundColor: theme.button.primary.bg,
                borderRadius: 16,
              }}
            >
              <Text
                style={[
                  Typography.headingH2Bold,
                  {
                    color: theme.background.screen,
                    fontSize: width * 0.045,
                    marginBottom: 12,
                  },
                ]}
              >
                {t("HomeScreen.handoverTools")}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                }}
              >
                <Image
                  source={require("./../../assets/images/avatar.png")}
                  style={{
                    width: width * 0.15,
                    height: width * 0.15,
                    borderRadius: width * 0.075,
                    marginRight: 10,
                    borderWidth: 2,
                    borderColor: theme.background.screen,
                  }}
                />
                <View>
                  <Text
                    style={{
                      color: theme.background.screen,
                      fontWeight: "bold",
                      fontSize: width * 0.04,
                    }}
                  >
                    {user.VehicleNo}
                  </Text>
                  <Text
                    style={{ color: theme.background.screen, fontSize: width * 0.032 }}
                  >
                    {t("HomeScreen.nextShiftAt")}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.background.screen,
                  borderRadius: 12,
                  paddingVertical: height * 0.015,
                  alignItems: "center",
                  width: "100%",
                }}
                onPress={() => setHandoverExpanded(true)}
              >
                <Text
                  style={{
                    color: theme.button.primary.bg,
                    fontWeight: "700",
                    fontSize: width * 0.04,
                  }}
                >
                  {t("HomeScreen.handover")}
                </Text>
              </TouchableOpacity>

              <CustomAlertModal
                visible={handoverExpanded}
                onClose={() => setHandoverExpanded(false)}
                title="Select Handover Action"
                options={[
                  {
                    text: "Submit Handover",
                    onPress: () => {
                      setHandoverExpanded(false);
                      router.push("/(tabs)/(setting)/handOver");
                    },
                  },
                  {
                    text: "Receive Handover",
                    onPress: () => {
                      setHandoverExpanded(false);
                      router.push("/(tabs)/(setting)/reciveHandover");
                    },
                  },
                  {
                    text: "Cancel",
                    onPress: () => setHandoverExpanded(false),
                    type: "cancel",
                  },
                ]}
              />
            </Card>

            {/* Vehicle Employee List */}
            <Card
              style={{
                width: "90%",
                alignSelf: "center",
                marginTop: 20,
                padding: 16,
                backgroundColor: theme.background.screen,
              }}
            >
              <Text
                style={[
                  Typography.headingH2Bold,
                  { color: theme.button.primary.bg, marginBottom: 10 },
                ]}
              >
                {t("HomeScreen.vehicleEmployeeList")}
              </Text>
              <FlatList
                data={userList}
                keyExtractor={(item) => item.Id.toString()}
                numColumns={2}
                columnWrapperStyle={{
                  justifyContent: "flex-start",
                  marginBottom: 12,
                }}
                renderItem={({ item }) => {
                  const userPhoto = userPhotos[item.Id];
                  return (
                    <Card
                      style={[
                        styles.mappingCard,
                        { width: "48%", backgroundColor: theme.background.section },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => {
                          setCurrentUploadId(Number(item.Id));
                          pickImageOption();
                        }}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={18}
                          color={theme.button.primary.bg}
                        />
                      </TouchableOpacity>
                      <Image
                        source={
                          userPhoto
                            ? { uri: userPhoto }
                            : require("../../assets/images/avatar.png")
                        }
                        style={styles.mappingAvatar}
                      />
                      <Text
                        style={[
                          Typography.bodyDefaultMedium,
                          {
                            marginTop: 8,
                            textAlign: "center",
                            color: theme.button.primary.bg,
                          },
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.Name}
                      </Text>
                    </Card>
                  );
                }}
              />
            </Card>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  sectionCards: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    alignItems: "center",
    gap: 5,
    borderRadius: 12,
  },
  attendanceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 4,
    width: 70,
    alignItems: "center",
  },
  mappingCard: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginHorizontal: "1%",
  },
  mappingAvatar: { width: 60, height: 60, borderRadius: 30 },
  menuButton: { position: "absolute", top: 8, right: 8, padding: 4, zIndex: 1 },
  expandButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1
  },
});
