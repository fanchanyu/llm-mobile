/**
 * Root Layout — App 入口
 *
 * 整合:
 * - React Query (API 快取)
 * - Auth 初始化 + 導航守衛
 * - SSE 即時同步 (App 層級，跨頁面維持)
 * - 連線狀態指示器 (ConnectionStatusBar)
 * - 淺色主題 (強制無深色)
 */
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppStore } from '@/src/stores/appStore';
import { useSSE, SSEEvent } from '@/src/api/sse';
import { ConnectionStatusBar } from '@/src/components/ConnectionStatus';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/src/constants/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  },
});

// 淺色強制主題
const LightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.card,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.error,
  },
};

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// ─── App 級 SSE 監聽器 ─────────────────────
// 放在 Root 層級，確保跨 tab 保持連線，不中斷
// 全域事件寫入 appStore，所有元件都可讀取

function SSEListener() {
  const addEvent = useAppStore((s) => s.addEvent);
  const incrementUnread = useAppStore((s) => s.setUnreadCount);
  const currentUnread = useAppStore((s) => s.unreadCount);

  const onEvent = useCallback((event: SSEEvent) => {
    if (event.type === 'event' && event.data) {
      // 寫入全域事件流 (Dashboard、通知中心都能讀)
      addEvent({
        id: event.data.id || `evt-${Date.now()}`,
        type: event.event_type || 'unknown',
        severity: event.data.severity || 'info',
        title: event.data.summary || event.event_type || '',
        timestamp: event.data.timestamp || new Date().toISOString(),
      });
      // 更新未讀 badge 數
      incrementUnread(currentUnread + 1);
    }
  }, [addEvent, incrementUnread, currentUnread]);

  useSSE({ onEvent });
  return null;
}

// ─── 導航守衛 ───────────────────────────────

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

// ─── 根導航器 ───────────────────────────────

function RootNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />

        {/* 主頁面 (tabs) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 功能頁面 (從 Dashboard Quick Action 進入) */}
        <Stack.Screen
          name="inventory"
          options={{
            headerShown: true,
            headerTitle: '庫存查詢',
            headerStyle: { backgroundColor: Colors.header },
            headerTintColor: Colors.headerText,
            headerShadowVisible: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="approvals"
          options={{
            headerShown: true,
            headerTitle: '待核准',
            headerStyle: { backgroundColor: Colors.header },
            headerTintColor: Colors.headerText,
            headerShadowVisible: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="mesh-monitor"
          options={{
            headerShown: true,
            headerTitle: '跨廠監控',
            headerStyle: { backgroundColor: Colors.header },
            headerTintColor: Colors.headerText,
            headerShadowVisible: false,
            presentation: 'card',
          }}
        />

        {/* 對話詳情 */}
        <Stack.Screen
          name="chat/[id]"
          options={{
            headerShown: true,
            headerTitle: '對話',
            headerStyle: { backgroundColor: Colors.header },
            headerTintColor: Colors.headerText,
            presentation: 'card',
          }}
        />
      </Stack>

      {/* 連線狀態條 (跨頁面持久顯示) */}
      {isAuthenticated && <ConnectionStatusBar />}

      {/* SSE 全域監聽 */}
      {isAuthenticated && <SSEListener />}
    </>
  );
}

// ─── 根佈局 ─────────────────────────────────

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={LightTheme}>
        <AuthGate>
          <RootNavigator />
        </AuthGate>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
