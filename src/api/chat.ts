/**
 * Chat API — 與 ERP LLM 對話
 */
import api from './client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  reply: string;
  conversation_id?: string;
}

export const chatApi = {
  /** 傳送訊息給 LLM */
  sendMessage: (message: string, conversationId?: string) =>
    api.post<ChatResponse>('/api/chat/messages', {
      message,
      conversation_id: conversationId,
    }),

  /** 取得對話歷史 */
  getHistory: (conversationId: string) =>
    api.get<{ messages: ChatMessage[] }>(
      `/api/chat/conversations/${conversationId}`,
    ),
};
