/**
 * SSE Hook — 即時同步引擎
 *
 * 連接後端 SSE 端點，接收即時事件推播
 * 桌機和手機共用同一條 SSE stream，後端依角色過濾事件
 *
 * 使用方式:
 *   useSSE({
 *     onEvent: (event) => handleNewEvent(event),
 *   })
 */
import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';

interface SSEOptions {
  /** 收到事件時的回呼 */
  onEvent?: (event: SSEEvent) => void;
  /** 連線狀態改變時的回呼 */
  onStatusChange?: (status: 'connected' | 'disconnected' | 'error') => void;
  /** 重新連線間隔 (ms)，預設 5000 */
  reconnectInterval?: number;
}

export interface SSEEvent {
  type: 'event' | 'connected' | 'ping' | 'error';
  event_type?: string;
  data?: any;
  timestamp?: string;
}

/**
 * 建立 SSE 連接，自動管理生命週期
 * 支援: 斷線重連、App 背景/前景切換
 */
export function useSSE(options: SSEOptions) {
  const { token, serverUrl, isAuthenticated } = useAuthStore();
  const setOnline = useAppStore((s) => s.setOnline);
  const eventSourceRef = useRef<any>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    if (!token || !serverUrl || !isAuthenticated) return;

    // Clean up any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const baseUrl = serverUrl.replace(/\/+$/, '');
    const url = `${baseUrl}/api/events/stream?token=${token}`;

    try {
      // Use EventSource for React Native (requires event-source-polyfill or react-native-sse)
      // For native, we'll use a simple fetch-based approach as fallback
      const controller = new AbortController();
      const connectSSE = async () => {
        try {
          const response = await fetch(url, {
            headers: {
              'Accept': 'text/event-stream',
              'Cache-Control': 'no-cache',
            },
            signal: controller.signal,
          });

          if (!response.ok) {
            optionsRef.current.onStatusChange?.('error');
            setOnline(false);
            scheduleReconnect();
            return;
          }

          optionsRef.current.onStatusChange?.('connected');
          setOnline(true);

          const reader = response.body?.getReader();
          if (!reader) {
            scheduleReconnect();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            let currentEvent = '';
            let currentData = '';

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                currentEvent = line.slice(7).trim();
              } else if (line.startsWith('data: ')) {
                currentData = line.slice(6).trim();
              } else if (line === '' && currentEvent && currentData) {
                // Empty line = end of event
                try {
                  const parsed = JSON.parse(currentData);
                  const event: SSEEvent = {
                    type: currentEvent as SSEEvent['type'],
                    ...parsed,
                  };

                  if (currentEvent === 'connected') {
                    optionsRef.current.onStatusChange?.('connected');
                    setOnline(true);
                  } else if (currentEvent === 'message' && parsed.data) {
                    optionsRef.current.onEvent?.({
                      type: 'event',
                      event_type: parsed.event_type,
                      data: parsed.data,
                      timestamp: parsed.timestamp,
                    });
                  }
                } catch {
                  // Skip malformed data
                }
                currentEvent = '';
                currentData = '';
              }
            }
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            optionsRef.current.onStatusChange?.('error');
            setOnline(false);
            scheduleReconnect();
          }
        }
      };

      eventSourceRef.current = { controller, close: () => controller.abort() };
      connectSSE();
    } catch (err) {
      optionsRef.current.onStatusChange?.('error');
      setOnline(false);
      scheduleReconnect();
    }
  }, [token, serverUrl, isAuthenticated, setOnline]);

  const scheduleReconnect = useCallback(() => {
    const interval = options.reconnectInterval ?? 5000;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    reconnectTimerRef.current = setTimeout(() => {
      if (isAuthenticated) {
        connect();
      }
    }, interval);
  }, [connect, isAuthenticated, options.reconnectInterval]);

  // Connect on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [isAuthenticated, token, connect]);

  // Reconnect when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        // App returned to foreground — reconnect SSE
        if (isAuthenticated) {
          connect();
        }
      }
      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, [connect, isAuthenticated]);

  return {
    disconnect: useCallback(() => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    }, []),
  };
}
