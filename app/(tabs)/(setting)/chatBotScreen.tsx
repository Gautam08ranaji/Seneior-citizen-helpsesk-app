import { useAppTheme } from "@/theme/ThemeContext"; // ✅ custom theme
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

type QA = {
  id: string;
  question: string;
  answer: string;
  children: QA[];
};

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

const { width } = Dimensions.get("window");
const AVATAR_SIZE = RFValue(44);
const BUBBLE_MAX_WIDTH = width * 0.75;

export default function ChatScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme(); // ✅ use app theme
  const flatListRef = useRef<FlatList>(null);

  // 🔹 Static FAQs
  const allStaticQA: QA[] = [
    {
      id: "q1",
      question: t("chatBotScreen.faq_openingHours"),
      answer: t("chatBotScreen.faq_openingHours_answer"),
      children: [],
    },
    {
      id: "q2",
      question: t("chatBotScreen.faq_refundPolicy"),
      answer: t("chatBotScreen.faq_refundPolicy_answer"),
      children: [],
    },
    {
      id: "q3",
      question: t("chatBotScreen.faq_contactInfo"),
      answer: t("chatBotScreen.faq_contactInfo_answer"),
      children: [],
    },
  ];

  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", text: t("chatBotScreen.welcome"), sender: "bot" },
  ]);

  const [staticQA, setStaticQA] = useState<QA[]>(allStaticQA);
  const [currentChildren, setCurrentChildren] = useState<QA[] | null>(null);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [liveChatActive, setLiveChatActive] = useState(false);
  const [liveChatInput, setLiveChatInput] = useState("");

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const onSelectQuestion = (qa: QA) => {
    const userMsg: Message = { id: `u_${Date.now()}`, text: qa.question, sender: "user" };
    const botMsg: Message = { id: `b_${Date.now() + 1}`, text: qa.answer, sender: "bot" };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setCurrentChildren(qa.children.length > 0 ? qa.children : null);
    setShowMainMenu(true);
    setLiveChatActive(false);
    setLiveChatInput("");
  };

  const onGoBack = () => {
    setCurrentChildren(null);
    setShowMainMenu(false);
    setLiveChatActive(false);
    setLiveChatInput("");
  };

  const onMainMenu = () => {
    setStaticQA(allStaticQA);
    setMessages([{ id: "welcome", text: t("chatBotScreen.welcome"), sender: "bot" }]);
    setCurrentChildren(null);
    setShowMainMenu(false);
    setLiveChatActive(false);
    setLiveChatInput("");
  };

  const onTalkWithExecutive = () => {
    setLiveChatActive(true);
    setCurrentChildren(null);
    setShowMainMenu(false);
    setStaticQA([]);
    setMessages((prev) => [
      ...prev,
      {
        id: `b_${Date.now()}`,
        text: t("chatBotScreen.liveSupport"),
        sender: "bot",
      },
    ]);
  };

  const onSendLiveChatMessage = () => {
    if (!liveChatInput.trim()) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      text: liveChatInput.trim(),
      sender: "user",
    };
    const botMsg: Message = {
      id: `b_${Date.now() + 1}`,
      text: "Thank you for your message. Our executive will respond shortly.",
      sender: "bot",
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setLiveChatInput("");
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user"
          ? [styles.userContainer, { backgroundColor: theme.primary.base }]
          : [styles.botContainer, { backgroundColor: theme.background.card }],
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "user"
            ? [styles.userText]
            : [styles.botText, { color: theme.text.primary }],
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  const renderQuestions = (questions: QA[]) =>
    questions.map((qa) => (
      <TouchableOpacity
        key={qa.id}
        style={[styles.questionButton, { backgroundColor: theme.primary.base }]}
        onPress={() => onSelectQuestion(qa)}
      >
        <Text style={{ color: theme.white, padding: RFValue(10) }}>{qa.question}</Text>
      </TouchableOpacity>
    ));

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background.screen }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? RFValue(90) : 0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.border.default, backgroundColor: theme.background.screen },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: theme.primary.base }]}>
          <Ionicons name="chatbubbles-outline" size={RFValue(24)} color={theme.white} />
        </View>
        <View>
          <Text style={[styles.botName, { color: theme.text.primary }]}>
            {t("chatBotScreen.liveSupport")}
          </Text>
          <Text style={[styles.onlineStatus, { color: "green" }]}>● Online</Text>
        </View>
      </View>

      {/* Chat */}
      <FlatList
        ref={flatListRef}
        style={{ flex: 1 }}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: RFValue(16), flexGrow: 1 }}
        ListFooterComponent={
          <View style={{ marginTop: RFValue(16), alignItems: "center" }}>
            {currentChildren ? (
              <>
                {renderQuestions(currentChildren)}
                <TouchableOpacity
                  style={[styles.questionButton, { backgroundColor: theme.primary.base }]}
                  onPress={onTalkWithExecutive}
                >
                  <Text
                    style={{ color: theme.text.primary, padding: RFValue(10), textAlign: "center" }}
                  >
                    {t("chatBotScreen.liveSupport")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.questionButton, { backgroundColor: theme.border.default}]}
                  onPress={onGoBack}
                >
                  <Text
                    style={{ color: theme.text.primary, padding: RFValue(10), textAlign: "center" }}
                  >
                    ← {t("common.back")}
                  </Text>
                </TouchableOpacity>
              </>
            ) : !showMainMenu && staticQA.length > 0 ? (
              <>
                {renderQuestions(staticQA)}
                <TouchableOpacity
                  style={[styles.questionButton, { backgroundColor: theme.primary.base }]}
                  onPress={onTalkWithExecutive}
                >
                  <Text
                    style={{ color: theme.white, padding: RFValue(10), textAlign: "center" }}
                  >
                    {t("chatBotScreen.liveSupport")}
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}

            {showMainMenu && !currentChildren && !liveChatActive && (
              <TouchableOpacity
                style={[styles.questionButton, { backgroundColor: theme.primary.base }]}
                onPress={onMainMenu}
              >
                <Text
                  style={{ color: theme.text.primary, padding: RFValue(10), textAlign: "center" }}
                >
                  {t("common.mainMenu")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Input */}
      {liveChatActive && (
        <View
          style={[
            styles.inputRow,
            { borderColor: theme.border.default, backgroundColor: theme.background.screen },
          ]}
        >
          <View style={[styles.inputWrapper, { backgroundColor: theme.background.card }]}>
            <TextInput
              style={[styles.input, { color: theme.text.primary }]}
              placeholder={t("chatBotScreen.Type_a_message")}
              placeholderTextColor={theme.text.placeholder}
              value={liveChatInput}
              onChangeText={setLiveChatInput}
              returnKeyType="send"
              onSubmitEditing={onSendLiveChatMessage}
            />
            <TouchableOpacity
              onPress={onSendLiveChatMessage}
              style={[styles.sendButton, { backgroundColor: theme.primary.base }]}
            >
              <Ionicons name="arrow-up" size={RFValue(18)} color={theme.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    padding: RFValue(12),
    borderBottomWidth: 1,
    alignItems: "center",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: RFValue(12),
  },
  botName: {
    fontWeight: "bold",
    fontSize: RFValue(16),
  },
  onlineStatus: {
    fontSize: RFValue(12),
    marginTop: RFValue(2),
  },
  messageContainer: {
    maxWidth: BUBBLE_MAX_WIDTH,
    padding: RFValue(12),
    borderRadius: RFValue(20),
    marginVertical: RFValue(6),
  },
  userContainer: {
    alignSelf: "flex-end",
    borderTopRightRadius: 0,
  },
  botContainer: {
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
  },
  messageText: { fontSize: RFValue(14) },
  userText: { color: "#fff" },
  botText: {},
  questionButton: {
    borderRadius: RFValue(8),
    marginVertical: RFValue(4),
    width: "80%",
    alignSelf: "flex-end",
  },
  inputRow: {
    borderTopWidth: 1,
    padding: RFValue(8),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RFValue(24),
    paddingHorizontal: RFValue(12),
  },
  input: {
    flex: 1,
    height: RFValue(40),
    paddingHorizontal: RFValue(12),
    fontSize: RFValue(14),
  },
  sendButton: {
    borderRadius: RFValue(20),
    padding: RFValue(8),
    marginLeft: RFValue(8),
    justifyContent: "center",
    alignItems: "center",
  },
});
