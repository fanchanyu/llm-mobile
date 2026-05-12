/**
 * Chat Screen — AI 對話
 * 語音+文字輸入，與 ERP LLM 自然對話
 * 支援 SSE 即時回應
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '@/src/constants/theme';
import { chatApi, ChatMessage } from '@/src/api/chat';
import { useAuthStore } from '@/src/stores/authStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是 AI 助手，可以幫您查詢庫存、採購單、生產進度等。請問有什麼需要協助的？',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isThinking) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      // 模擬回應 (正式環境連後端 API)
      // 等後端啟動後，用: const result = await chatApi.sendMessage(text);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `收到您的問題：「${text}」\n\n這是一個模擬回應。當後端服務啟動後，將會連接到 LLM-ERP 的 AI 引擎進行真實對話。`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，發生錯誤，請稍後重試。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsThinking(false);
    }
  }, [inputText, isThinking]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Ionicons name="cube-outline" size={18} color={Colors.primary} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser && { color: Colors.textInverse }]}>
            {item.content}
          </Text>
          <Text style={[styles.timestamp, isUser && { color: 'rgba(255,255,255,0.6)' }]}>
            {item.timestamp.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={() => setIsListening(!isListening)}
        >
          <Ionicons
            name={isListening ? 'mic' : 'mic-outline'}
            size={22}
            color={isListening ? Colors.error : Colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="輸入訊息..."
            placeholderTextColor={Colors.inputPlaceholder}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isThinking}
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isThinking) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isThinking}
        >
          {isThinking ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <Ionicons name="send" size={20} color={Colors.textInverse} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messageList: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
    ...Shadows.sm,
  },
  messageText: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 4,
    textAlign: 'right',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  textInput: {
    minHeight: 36,
    maxHeight: 100,
    fontSize: FontSize.md,
    color: Colors.inputText,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.inputBorder,
  },
});
