import Header from "@/components/reusables/Header";
import MapCard from "@/components/reusables/MapCard";
import { RootState } from "@/redux/store";
import { getCustSignature } from "@/services/api/GetCustSignature";
import { getRelatedDocument } from "@/services/api/GetRelatedDocument";
import { GetRequisitionByTicketId } from "@/services/api/GetRequisitionByTicketId";
import { useAppTheme } from "@/theme/ThemeContext";
import { Typography } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import { useSelector } from "react-redux";
import CategorySvg from "../../../assets/svgs/CategorySvg.svg";
import DateSvg from "../../../assets/svgs/DateSvg.svg";
import Glove from "../../../assets/svgs/Glove.svg";
import SiteNameSvg from "../../../assets/svgs/SiteNameSvg.svg";
import SubjectSvg from "../../../assets/svgs/SubjectSvg.svg";
import VehicleSvg from "../../../assets/svgs/VehicleSvg.svg";
import { getRequisitionDocList } from "../../../services/api/GetRequisitionDocList";

const { width, height } = Dimensions.get("window");

const getSeverityColor = (severity?: string) => {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "#FF0000";
    case "high":
      return "#FF5733";
    case "medium":
      return "#FFA500";
    case "low":
      return "#4CAF50";
    default:
      return "#9E9E9E";
  }
};

export default function TicketDetailsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { ticket, tabName } = useLocalSearchParams();
  const user = useSelector((state: RootState) => state.user);
    const { theme } = useAppTheme();

  const [custSignature, setCustSignature] = useState<string | null>(null);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [requisitionDocs, setRequisitionDocs] = useState<{
    [key: number]: any[];
  }>({});
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  const parsedItem = useMemo(() => {
    if (!ticket) return undefined;
    try {
      return JSON.parse(ticket as string);
    } catch (e) {
      console.error("Failed to parse ticket param:", e);
      return undefined;
    }
  }, [ticket]);

  if (!parsedItem) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: "#293160" }}>Invalid ticket data</Text>
      </SafeAreaView>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split(" ");
    if (parts.length >= 3) return `${parts[0]} ${parts[1]} ${parts[2]}`;
    return dateStr;
  };

  const fetchSignature = async () => {
    if (!parsedItem?.id) return;
    try {
      const response = await getCustSignature({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        strUserId: user.id,
        TicketId: parsedItem.id,
      });
      if (response?.CustSignatureByTicketId)
        setCustSignature(response.CustSignatureByTicketId);
    } catch (error) {
      console.error("Error fetching signature:", error);
    }
  };

  const fetchRequisitionDocList = async (
    requisitionId: number
  ): Promise<any[]> => {
    try {
      const response = await getRequisitionDocList({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        strUserId: user.id,
        RequisitionId: String(requisitionId),
      });
      return response?.GetRequisitionDocList || [];
    } catch (error) {
      console.error("Error fetching DocList:", error);
      return [];
    }
  };

  const fetchRequisitionByTicketId = async () => {
    try {
      const response = await GetRequisitionByTicketId({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        UserId: Number(user.id),
        TicketId: Number(parsedItem.id),
      });

      if (response?.GetRequisitionByTicketId && response.StatusCode === 200) {
        const requisitionsData = response.GetRequisitionByTicketId;
        setRequisitions(requisitionsData);

        requisitionsData.forEach(async (req: any) => {
          const docs = await fetchRequisitionDocList(req.RQFId);
          setRequisitionDocs((prev) => ({ ...prev, [req.RQFId]: docs }));
        });
      } else {
        setRequisitions([]);
      }
    } catch (error) {
      console.error("Error fetching requisitions:", error);
    }
  };

  const fetchRelatedDocument = async (DocId: number) => {
    try {
      setLoadingDoc(true);

      const result = await getRelatedDocument(
        user.token,
        Platform.OS,
        user.id,
        DocId
      );
      const base64Data = result?.RetrieveDocumentsbytes;
      const fileExtension = result?.fileExtension?.toLowerCase() || "";
      const fileName = result?.fileName || "document";

      if (!base64Data) return;

      const fileUri = `${FileSystem.cacheDirectory}${fileName}${fileExtension}`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (fileExtension === ".pdf") {
        setPdfUri(fileUri);
      } else if (
        fileExtension === ".jpg" ||
        fileExtension === ".jpeg" ||
        fileExtension === ".png"
      ) {
        setModalImage(
          `data:image/${fileExtension.replace(".", "")};base64,${base64Data}`
        );
      } else {
        console.error(
          "Unsupported file type:",
          fileExtension,
          "Response:",
          result
        );
      }
    } catch (error) {
      console.error("Failed to fetch/open document:", error);
    } finally {
      setLoadingDoc(false);
    }
  };

  useEffect(() => {
    fetchSignature();
    fetchRequisitionByTicketId();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.button.primary.bg }}>
      <Header isHome />
      <View
        style={{
          flex: 1,
          paddingBottom: tabBarHeight + 20,
          backgroundColor: theme.background.screen,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginTop: 15,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingBottom: tabBarHeight + 20,
            paddingHorizontal: width * 0.05,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* ---------- Ticket Details ---------- */}
          <Text style={[styles.sectionTitle,{color: theme.button.primary.bg}]}>
            {t("TicketDetailsScreen.ticketDetails")}
          </Text>
          <View style={[styles.card,{backgroundColor:theme.background.section,borderColor:theme.button.primary.bg}]}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="receipt-outline" size={16} color={theme.button.primary.bg} />
                <Text
                  style={[Typography.bodyDefaultBold, { color: theme.button.primary.bg }]}
                >
                  {" "}
                  {parsedItem.TicketNo}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: getSeverityColor(
                        parsedItem.case_severity_desc
                      ),
                    },
                  ]}
                />
                <Text
                  style={{
                    color: getSeverityColor(parsedItem.case_severity_desc),
                    marginLeft: 4,
                  }}
                >
                  {parsedItem.case_severity_desc || "N/A"}
                </Text>
              </View>
            </View>

            {/* Info Rows */}
            {[
              {
                label: t("TicketDetailsScreen.vehicleNo"),
                icon: <VehicleSvg height={16} width={16} />,
                value: parsedItem.VehicleNo,
              },
              {
                label: t("TicketDetailsScreen.subject"),
                icon: <SubjectSvg height={16} width={16} />,
                value: parsedItem.case_subject,
              },
              {
                label: t("TicketDetailsScreen.category"),
                icon: <CategorySvg height={16} width={16} />,
                value: parsedItem.CategoryName,
              },
              {
                label: t("TicketDetailsScreen.subCategory"),
                icon: <CategorySvg height={16} width={16} />,
                value: parsedItem.SubCategoryName,
              },
              {
                label: t("TicketDetailsScreen.region"),
                icon: <Glove height={16} width={16} />,
                value: parsedItem.Region,
              },
              {
                label: t("TicketDetailsScreen.siteName"),
                icon: <SiteNameSvg height={16} width={16} />,
                value: parsedItem.SiteName,
              },
            ].map((item, idx) => (
              <View key={idx} style={styles.infoRow}>
                <View style={styles.labelContainer}>
                  {item.icon}
                  <Text style={[Typography.bodySmallRegular, styles.label,{color:theme.text.secondary}]}>
                    {item.label}:
                  </Text>
                </View>
                <Text style={[Typography.bodySmallRegular, styles.value,{color:theme.text.secondary}]}>
                  {item.value}
                </Text>
              </View>
            ))}

            {/* Dates */}
            <View style={[styles.infoRow, { marginTop: 20 }]}>
              <View style={styles.dateRow}>
                <View style={[styles.infoRow, { gap: 5 }]}>
                  <DateSvg height={16} width={16} color={theme.button.primary.bg } />
                  <Text
                    style={[Typography.bodySmallBold, { color: theme.button.primary.bg }]}
                  >
                      {t("TicketDetailsScreen.openDate")}
                  </Text>
                </View>
                <Text style={[Typography.bodySmallRegular, styles.datevalue,{color:theme.text.secondary}]}>
                  {formatDate(parsedItem.open_time)}
                </Text>
              </View>

              {tabName === "Closed" ? (
                <View style={styles.dateRow}>
                  <View style={[styles.infoRow, { gap: 5 }]}>
                    <DateSvg height={16} width={16} color={theme.button.primary.bg } />
                    <Text
                      style={[Typography.bodySmallBold, { color: theme.button.primary.bg  }]}
                    >
                      {t("TicketDetailsScreen.closedDate")}
                    </Text>
                  </View>
                  <Text style={[Typography.bodySmallRegular, styles.datevalue,{color:theme.text.secondary}]}>
                    {formatDate(parsedItem.end_time)}
                  </Text>
                </View>
              ) : (
                <View style={styles.dateRow}>
                  <View style={[styles.infoRow, { gap: 5 }]}>
                    <DateSvg height={16} width={16} color={theme.button.primary.bg } />
                    <Text
                      style={[Typography.bodySmallBold, { color: theme.button.primary.bg  }]}
                    >
                      {t("TicketDetailsScreen.targetDate")}
                    </Text>
                  </View>
                  <Text style={[Typography.bodySmallRegular, styles.datevalue]}>
                    {formatDate(parsedItem.target_end_time)}
                  </Text>
                </View>
              )}
            </View>

            {/* Progress Button */}
            {tabName !== "Closed" && (
              <TouchableOpacity
                style={[styles.acceptButton,{backgroundColor:theme.button.primary.bg }]}
                onPress={() => {
                  router.push({
                    pathname: "/progress",
                    params: { ticketDetail: JSON.stringify(parsedItem) },
                  });
                }}
              >
                <Text style={[styles.acceptText,{color:theme.background.screen}]}>{t("TicketDetailsScreen.progress")}</Text>
              </TouchableOpacity>
            )}

            {/* Closed Tab: Signature & Remarks */}
            {tabName === "Closed" && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 15,color:theme.button.primary.bg  }]}>
                  {t("TicketDetailsScreen.signature")}
                </Text>
                <View
                  style={{
                    alignItems: "center",
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: theme.button.primary.bg ,
                    backgroundColor: theme.white,
                    padding: 10,
                    borderRadius: 8,
                  }}
                >
                  {custSignature ? (
                    <Image
                      source={{ uri: `data:image/png;base64,${custSignature}` }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text
                      style={{
                        color: theme.text.secondary,
                        textAlign: "center",
                        marginTop: 10,
                      }}
                    >
                      {t("TicketDetailsScreen.signatureNotAvailable")}
                    </Text>
                  )}
                </View>

                <Text style={[styles.sectionTitle, { marginBottom: 8 ,color:theme.button.primary.bg }]}>
                  {t("TicketDetailsScreen.remarks")}
                </Text>
                <View style={[styles.card, { borderColor: theme.button.primary.bg  }]}>
                  <Text style={{ color: theme.text.secondary }}>
                    {parsedItem.end_remarks || t("TicketDetailsScreen.noRemarks")}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* ---------- Requisitions ---------- */}
          <Text style={[styles.sectionTitle,{color:theme.button.primary.bg }]}>{t("TicketDetailsScreen.requisitions")}</Text>
          {requisitions.length > 0 ? (
            requisitions.map((req, index) => (
              <View key={req.RQFId || index} style={[styles.reqCard,{borderColor:theme.button.primary.bg ,backgroundColor:theme.background.screen}]}>
                <View style={styles.reqHeader}>
                  <Text style={[styles.reqCode,{color:theme.button.primary.bg }]}>{req.RQFNo}</Text>
                  <Text style={[styles.reqDate,{color:theme.text.secondary}]}>
                    {t("TicketDetailsScreen.date")}: {formatDate(req.created_date)}
                  </Text>
                </View>

                <View style={styles.reqRow}>
                  <View style={styles.reqLeft}>
                    <Ionicons name="person-outline" size={16} color={theme.button.primary.bg} />
                    <Text style={[styles.reqLabel,{color:theme.text.secondary}]}>{t("TicketDetailsScreen.owner")}</Text>
                  </View>
                  <Text style={[styles.reqValue,{color:theme.text.secondary}]}>{req.OwnerName}</Text>
                </View>

                <View style={styles.reqRow}>
                  <View style={styles.reqLeft}>
                    <Ionicons
                      name="bookmark-outline"
                      size={16}
                      color={theme.button.primary.bg}
                    />
                    <Text style={[styles.reqLabel,{color:theme.text.secondary}]}>{t("TicketDetailsScreen.subject")}</Text>
                  </View>
                  <Text style={[styles.reqValue,{color:theme.text.secondary}]}>{req.Subject}</Text>
                </View>

                <View style={[styles.reqRow, { alignItems: "flex-start" }]}>
                  <View style={styles.reqLeft}>
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color={theme.button.primary.bg}
                    />
                    <Text style={[styles.reqLabel,{color:theme.text.secondary}]}>{t("TicketDetailsScreen.description")}</Text>
                  </View>
                  <Text style={[styles.reqValue, { flex: 1,color:theme.text.secondary }]}>
                    {req.Discription}
                  </Text>
                </View>

                <View style={styles.reqRow}>
                  <View style={styles.reqLeft}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color={theme.button.primary.bg}
                    />
                    <Text style={[styles.reqLabel,{color:theme.text.secondary}]}>{t("TicketDetailsScreen.status")}</Text>
                  </View>
                  <Text
                    style={[
                      styles.reqValue,
                      { color: req.Status === "Open" ? "green" : "red" },
                    ]}
                  >
                    {req.Status}
                  </Text>
                </View>

                <View style={[styles.docsContainer ,{backgroundColor:theme.background.section}] } >
                  {loadingDoc && (
                    <ActivityIndicator size="small" color={theme.button.primary.bg} />
                  )}
                  {requisitionDocs[req.RQFId] &&
                  requisitionDocs[req.RQFId].length > 0 ? (
                    requisitionDocs[req.RQFId].map((doc) => (
                      <TouchableOpacity
                        key={doc.DocId}
                        style={[styles.docItem,{backgroundColor:theme.background.section}]}
                        onPress={() => fetchRelatedDocument(doc.DocId)}
                      >
                        <Ionicons
                          name="document-outline"
                          size={18}
                          color={theme.button.primary.bg }
                        />
                        <Text style={[styles.docName,{color:theme.button.primary.bg}]}>{doc.DocName}</Text>
                        <Ionicons
                          name="open-outline"
                          size={16}
                             color={theme.button.primary.bg }
                        />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text
                      style={{
                        color: theme.text.secondary,
                        textAlign: "center",
                        marginVertical: 5,
                      }}
                    >
                      {t("TicketDetailsScreen.noDocuments")}
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text
              style={{
                  color: theme.text.secondary,
                textAlign: "center",
                marginVertical: 10,
              }}
            >
             {t("TicketDetailsScreen.noRequisitions")}
            </Text>
          )}

          <MapCard />
        </ScrollView>
      </View>

      {/* Image Modal */}
      {modalImage && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{ position: "absolute", top: 40, right: 20 }}
            onPress={() => setModalImage(null)}
          >
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: modalImage }}
            style={{
              width: width * 0.9,
              height: height * 0.7,
              borderRadius: 12,
            }}
            resizeMode="contain"
          />
        </View>
      )}

      {/* PDF Modal */}
      {pdfUri && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <TouchableOpacity
            style={{ position: "absolute", top: 40, right: 20 }}
            onPress={() => setPdfUri(null)}
          >
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>

          <Pdf
            source={{ uri: pdfUri }}
            style={{ width: width * 0.95, height: height * 0.85 }}
            onError={(error) => console.log("PDF load error:", error)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: width * 0.04,
    borderRadius: 12,
    marginBottom: height * 0.015,
    borderWidth: 1,
   
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: height * 0.01,
  },
  dot: { width: 6, height: 6, borderRadius: 6 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: "column",
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  labelContainer: { flexDirection: "row", gap: 4 },
  label: { color: "#727272", marginTop: -2 },
  value: { color: "#727272", flexShrink: 1, textAlign: "right" },
  datevalue: { color: "#727272", left: 15 },
  acceptButton: {
    marginTop: 10,
    backgroundColor: "#293160",
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 10,
  },
  acceptText: { color: "#fff", fontWeight: "600" },
  sectionTitle: {
    fontSize: width * 0.045,
    fontWeight: "700",
    marginVertical: 5,
    // color: "#293160",
  },
  image: { width: "100%", height: width * 0.35, borderRadius: 8, marginTop: 8 },

  // Requisition
  reqCard: {
    padding: width * 0.04,
    borderRadius: 12,
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: "#293160",
    backgroundColor: "#fff",
  },
  reqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reqCode: { fontWeight: "700", color: "#293160" },
  reqDate: { color: "#727272", fontSize: 12 },
  reqRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 5,
  },
  reqLeft: { flexDirection: "row", alignItems: "center", gap: 5 },
  reqLabel: { color: "#727272", fontSize: 13 },
  reqValue: {
    color: "#293160",
    fontSize: 13,
    flexShrink: 1,
    textAlign: "right",
  },
  docsContainer: {
    marginTop: 10,
    backgroundColor: "#f0f2f8",
    borderRadius: 8,
    padding: 10,
  },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  docName: { flex: 1, marginLeft: 10, color: "#293160", fontWeight: "500" },
});
