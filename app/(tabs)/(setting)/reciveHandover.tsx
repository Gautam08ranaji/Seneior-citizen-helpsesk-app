import Card from "@/components/reusables/card";
import Header from "@/components/reusables/Header";
import HandoverLogsScreen from "@/components/ui/HandoverLogsScreen";
import { useAppTheme } from "@/theme/ThemeContext";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

type Tool = {
  id: string;
  name: string;
  qty: number;
  goodQty: number;
  damagedQty: number;
  note?: string;
  damagedImage?: string;
};

const { width, height } = Dimensions.get("window");

const Handover = () => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const [open, setOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("Shift A");
  const [persons, setPersons] = useState([
    { label: "Shift A", value: "Shift A" },
    { label: "Shift B", value: "Shift B" },
    { label: "Shift C", value: "Shift C" },
  ]);

  const [tools, setTools] = useState<Tool[]>([
    { id: "hm322", name: "12 inch Hammer", qty: 5, goodQty: 5, damagedQty: 0 },
    { id: "wr432", name: "Wrench 12 mm", qty: 2, goodQty: 2, damagedQty: 0 },
    { id: "wr433", name: "Nails 6 cm", qty: 22, goodQty: 22, damagedQty: 0 },
  ]);

  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [goodQty, setGoodQty] = useState(0);
  const [damagedQty, setDamagedQty] = useState(0);
  const [comments, setComments] = useState("");
  const [handoverImage, setHandoverImage] = useState<string | null>(null);

  const startEditing = (tool: Tool) => {
    setEditingToolId(tool.id);
    setGoodQty(tool.goodQty);
    setDamagedQty(tool.damagedQty);
    setComments(tool.note ?? "");
  };

  const saveEdit = () => {
    if (!editingToolId) return;
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === editingToolId
          ? { ...tool, goodQty, damagedQty, note: comments }
          : tool
      )
    );
    setEditingToolId(null);
  };

  const takeDamagedImage = (toolId: string) => {
    const dummyImageUri = "damaged-image-uri";
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === toolId ? { ...tool, damagedImage: dummyImageUri } : tool
      )
    );
    Alert.alert(t("handoverScreen.imageTaken"), t("handoverScreen.damagedToolImageAdded"));
  };

  const takeHandoverImage = () => {
    const dummyImageUri = "handover-image-uri";
    setHandoverImage(dummyImageUri);
    Alert.alert(t("handoverScreen.imageTaken"), t("handoverScreen.handoverImageAdded"));
  };

  const handleHandover = () => {
    console.log("Handover Log:", { person: selectedPerson, tools, handoverImage });
    Alert.alert(t("handoverScreen.success"), t("handoverScreen.handoverSaved"));
  };

  const renderTool = ({ item }: { item: Tool }) => {
    const isEditing = item.id === editingToolId;
    const total = goodQty + damagedQty;

    return (
      <View
        style={[
          styles.toolCard,
          { borderColor: theme.background.card, backgroundColor: theme.background.section },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.toolName, { color: theme.text.primary }]}>
            {item.name}{" "}
            <Text style={[styles.toolId, { color: theme.text.secondary }]}>
              (Id: {item.id})
            </Text>
          </Text>
          <Text style={[styles.toolInfo, { color: theme.text.secondary }]}>
            {item.qty} {t("handoverScreen.toolsAllotted", { count: item.qty })}
          </Text>

          {isEditing && (
            <View
              style={[
                styles.editSection,
                { backgroundColor: theme.background.input },
              ]}
            >
              <Text style={[styles.subLabel, { color: theme.text.primary }]}>
                {t("handoverScreen.goodTools")}
              </Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={[styles.counterBtn, { borderColor: theme.text.secondary }]}
                  onPress={() => setGoodQty((prev) => Math.max(0, prev - 1))}
                >
                  <Text style={[styles.counterText, { color: theme.text.primary }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: theme.text.primary }]}>{goodQty}</Text>
                <TouchableOpacity
                  style={[styles.counterBtn, { borderColor: theme.text.secondary }]}
                  onPress={() =>
                    setGoodQty((prev) =>
                      prev + damagedQty < item.qty ? prev + 1 : prev
                    )
                  }
                >
                  <Text style={[styles.counterText, { color: theme.text.primary }]}>+</Text>
                </TouchableOpacity>
              </View>

              <Text
                style={[styles.subLabel, { color: theme.text.primary, marginTop: 12 }]}
              >
                {t("handoverScreen.damagedTools")}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={[styles.counterBtn, { borderColor: theme.text.secondary }]}
                    onPress={() => setDamagedQty((prev) => Math.max(0, prev - 1))}
                  >
                    <Text style={[styles.counterText, { color: theme.text.primary }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: theme.text.primary }]}>{damagedQty}</Text>
                  <TouchableOpacity
                    style={[styles.counterBtn, { borderColor: theme.text.secondary }]}
                    onPress={() =>
                      setDamagedQty((prev) =>
                        prev + goodQty < item.qty ? prev + 1 : prev
                      )
                    }
                  >
                    <Text style={[styles.counterText, { color: theme.text.primary }]}>+</Text>
                  </TouchableOpacity>
                </View>

                {damagedQty > 0 && !item.damagedImage && (
                  <TouchableOpacity
                    style={[styles.takeImageBtn, { backgroundColor: theme.primary.base }]}
                    onPress={() => takeDamagedImage(item.id)}
                  >
                    <Text style={[styles.takeImageText, { color: theme.text.label }]}>
                      {t("handoverScreen.takeImage")}
                    </Text>
                  </TouchableOpacity>
                )}

                {item.damagedImage && (
                  <Text style={{ marginTop: 4, fontSize: 12, color: theme.status?.success || "green" }}>
                    {t("handoverScreen.imageSelected")}
                  </Text>
                )}
              </View>

              <TextInput
                style={[
                  styles.commentInput,
                  {
                    borderColor: theme.text.secondary,
                    color: theme.text.primary,
                    backgroundColor: theme.background.input,
                  },
                ]}
                placeholder={t("handoverScreen.commentPlaceholder")}
                placeholderTextColor={theme.text.placeholder}
                value={comments}
                onChangeText={setComments}
                multiline
              />

              {total !== item.qty && (
                <Text style={[styles.warning, { color: theme.status?.error || "red" }]}>
                  {t("handoverScreen.warning", { qty: item.qty, name: item.name })}
                </Text>
              )}
            </View>
          )}
        </View>

        {!isEditing && (
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: theme.primary.base }]}
            onPress={() => startEditing(item)}
          >
            <Text style={[styles.editText, { color: theme.white }]}>
              {t("handoverScreen.edit")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.screen }}>
      <Header title={t("handoverScreen.title")} />

      <View
        style={{
          flex: 1,
          marginTop: height * 0.01,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
          backgroundColor: theme.background.section,
        }}
      >
        <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Card style={{ padding: 16, borderRadius: 12, backgroundColor: theme.background.card }}>
            <Text style={[styles.heading, { color: theme.text.primary }]}>
              {t("handoverScreen.toolsAllotted", { count: tools.length })}
            </Text>

            <View style={styles.dropdownRow}>
              <Text style={[styles.label, { color: theme.text.primary }]}>
                {t("handoverScreen.handoverReceivedFrom")}
              </Text>
              <View style={[styles.dropdownWrapper, { borderColor: theme.primary.base }]}>
                <DropDownPicker
                  open={open}
                  value={selectedPerson}
                  items={persons}
                  setOpen={setOpen}
                  setValue={setSelectedPerson}
                  setItems={setPersons}
                  containerStyle={{ width: 120 }}
                  style={[styles.dropdownStyle, { backgroundColor: theme.button.primary.bg }]}
                  dropDownContainerStyle={{ backgroundColor: theme.button.primary.bg }}
                  textStyle={{ color: theme.white }}
                  arrowIconStyle={{ tintColor: theme.white }}
                />
              </View>
            </View>

            <FlatList
              data={tools}
              keyExtractor={(item) => item.id}
              renderItem={renderTool}
              contentContainerStyle={{ marginTop: 10 }}
              scrollEnabled={false}
            />

            {editingToolId ? (
              <TouchableOpacity style={[styles.handoverBtn, { backgroundColor: theme.primary.base }]} onPress={saveEdit}>
                <Text style={[styles.handoverText, { color: theme.text.label }]}>
                  {t("handoverScreen.save")}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                {!handoverImage && (
                  <TouchableOpacity
                    style={[styles.handoverBtn, { backgroundColor: theme.text.secondary }]}
                    onPress={takeHandoverImage}
                  >
                    <Text style={[styles.handoverText, { color: theme.white }]}>
                      {t("handoverScreen.takeHandoverImage")}
                    </Text>
                  </TouchableOpacity>
                )}

                {handoverImage && (
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: theme.status?.success || "green",
                      alignSelf: "center",
                    }}
                  >
                    {t("handoverScreen.handoverImageSelected")}
                  </Text>
                )}

                <TouchableOpacity
                  style={[styles.handoverBtn, { backgroundColor: theme.primary.base }]}
                  onPress={() => {
                    const hasDamagedWithoutImage = tools.some(
                      (tool) => tool.damagedQty > 0 && !tool.damagedImage
                    );
                    if (hasDamagedWithoutImage) {
                      Alert.alert(
                        t("handoverScreen.takeImageAlertTitle"),
                        t("handoverScreen.takeImageAlertMessageDamaged")
                      );
                      return;
                    }

                    if (!handoverImage) {
                      Alert.alert(
                        t("handoverScreen.takeImageAlertTitle"),
                        t("handoverScreen.takeImageAlertMessageHandover")
                      );
                      return;
                    }

                    handleHandover();
                  }}
                >
                  <Text style={[styles.handoverText, { color: theme.white }]}>
                    {t("handoverScreen.receiveHandover")}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Card>

          <HandoverLogsScreen />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Handover;

// styles (no changes needed)
const styles = StyleSheet.create({
  heading: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  dropdownRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500" },
  dropdownWrapper: { borderWidth: 1, borderRadius: 8 },
  dropdownStyle: { borderRadius: 8 },
  toolCard: { flexDirection: "row", alignItems: "flex-start", borderBottomWidth: 1, paddingVertical: 10 ,paddingHorizontal:10},
  toolName: { fontSize: 15, fontWeight: "500" },
  toolId: { fontSize: 12 },
  toolInfo: { fontSize: 13 },
  warning: { fontSize: 12, marginTop: 6 },
  editBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6, alignSelf: "flex-start", marginLeft: 10, marginTop: 10 },
  editText: { fontWeight: "500", fontSize: 13 },
  editSection: { marginTop: 10, padding: 10, borderRadius: 8 },
  subLabel: { fontSize: 13, fontWeight: "500", marginBottom: 6 },
  counterRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  counterBtn: { width: 32, height: 32, borderWidth: 1, justifyContent: "center", alignItems: "center", borderRadius: 6 },
  counterText: { fontSize: 18, fontWeight: "600" },
  qtyText: { marginHorizontal: 12, fontSize: 16, fontWeight: "500" },
  commentInput: { borderWidth: 1, borderRadius: 6, padding: 8, marginTop: 10, minHeight: 60, textAlignVertical: "top" },
  handoverBtn: { marginTop: 12, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  takeImageBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  takeImageText: { fontSize: 13, fontWeight: "500" },
  handoverText: { fontSize: 15, fontWeight: "600" },
});
