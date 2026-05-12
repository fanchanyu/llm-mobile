/**
 * ConnectionStatusBar — 持久連線狀態指示器
 *
 * 放在 Root Layout 底部，跨頁面顯示後端連線狀態。
 * 正常連線時隱藏，異常時顯示可點擊的提示條。
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing } from '@/src/constants/theme';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppStore } from '@/src/stores/appStore';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function ConnectionStatusBar() {
  const { serverUrl, token, isAuthenticated } = useAuthStore();
  const setOnline = useAppStore((s) => s.setOnline);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const appStateRef = useRef(AppState.currentState);

  const checkConnection = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setStatus('disconnected');
      setOnline(false);
      return;
    }

    setStatus('connecting');
    try {
      const baseUrl = serverUrl.replace(/\/+$/, '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${baseUrl}/health`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus('connected');
        setOnline(true);
      } else {
        setStatus('error');
        setOnline(false);
      }
    } catch {
      setStatus('disconnected');
      setOnline(false);
    }
  }, [serverUrl, token, isAuthenticated, setOnline]);

  // 30秒定期檢查
  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  // App 回到前景時重新檢查
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        checkConnection();
      }
      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [checkConnection]);

  // 連線正常時隱藏
  if (status === 'connected') return null;

  const config = {
    connecting: { icon: 'sync-outline' as const, text: '正在連線...', color: Colors.warning, bg: '#FFF7ED' },
    disconnected: { icon: 'cloud-offline-outline' as const, text: '伺服器連線中斷', color: Colors.error, bg: '#FEF2F2' },
    error: { icon: 'alert-circle-outline' as const, text: '伺服器異常', color: Colors.error, bg: '#FEF2F2' },
  };

  const c = config[status];

  return (
    <TouchableOpacity style={[styles.bar, { backgroundColor: c.bg }]} onPress={checkConnection} activeOpacity={0.8}>
      <Ionicons name={c.icon} size={16} color={c.color} />
      <Text style={[styles.text, { color: c.color }]}>{c.text}</Text>
      <Text style={[styles.retry, { color: c.color }]}>重試</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginLeft: Spacing.sm,
  },
  retry: {
    fontSize: FontSize.xs,
    marginLeft: Spacing.md,
    textDecorationLine: 'underline',
  },
});
