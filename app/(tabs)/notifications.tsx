/**
 * Notifications Screen — 通知中心
 * 即時接收後端推播，支援角色過濾
 * SSE 連線時自動更新
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '@/src/constants/theme';
import { notifApi, Notification } from '@/src/api/notifications';
import { useSSE, SSEEvent } from '@/src/api/sse';
import { useAppStore } from '@/src/stores/appStore';

function getSeverityIcon(severity: string): keyof typeof Ionicons.glyphMap {
  switch (severity) {
    case 'critical': return 'alert-circle';
    case 'warning': return 'warning';
    default: return 'information-circle';
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return Colors.error;
    case 'warning': return Colors.warning;
    default: return Colors.info;
  }
}

function getSeverityBg(severity: string) {
  switch (severity) {
    case 'critical': return '#FEF2F2';
    case 'warning': return '#FFF7ED';
    default: return '#EFF6FF';
  }
}

function NotificationItem({
  item,
  onPress,
}: {
  item: Notification;
  onPress: (id: number) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.notifItem, !item.is_read && styles.notifUnread]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.notifIcon, { backgroundColor: getSeverityBg(item.type) }]}>
        <Ionicons
          name={getSeverityIcon(item.type)}
          size={20}
          color={getSeverityColor(item.type)}
        />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, !item.is_read && styles.notifTitleUnread]}>
          {item.title}
        </Text>
        <Text style={styles.notifMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notifTime}>
          {new Date(item.created_at).toLocaleString('zh-TW')}
        </Text>
      </View>
      {!item.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const setUnreadCount = useAppStore((s) => s.setUnreadCount);

  // SSE 即時事件 → 通知 (App 級 SSEListener 已寫入 liveEvents)
  // 這裡只處理 badge 更新
  const onEvent = useCallback((event: SSEEvent) => {
    if (event.type === 'event' && event.data) {
      const newNotif: Notification = {
        id: parseInt(event.data.id?.split('-')?.[1] || String(Date.now())),
        type: event.data.severity || 'info',
        title: event.data.summary?.split('] ')?.[1] || event.event_type || '',
        message: event.data.summary || '',
        is_read: false,
        created_at: event.data.timestamp || new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  }, []);

  useSSE({ onEvent });

  // 模擬載入通知 (等後端啟動)
  useEffect(() => {
    const demoNotifs: Notification[] = [
      {
        id: 1, type: 'warning', title: '庫存偏低',
        message: '料號 AL-6061-T6 庫存僅剩 12，低於安全庫存 50',
        is_read: false, created_at: new Date().toISOString(),
      },
      {
        id: 2, type: 'info', title: '採購單已建立',
        message: 'PO-2026-0058 已建立，供應商：大明金屬，金額 NT$120,000',
        is_read: false, created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 3, type: 'critical', title: '機台異常',
        message: 'CNC-03 溫度異常，已自動停機，請立即處理',
        is_read: true, created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
    setNotifications(demoNotifs);
    setUnreadCount(2);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const handleMarkRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    const unread = notifications.filter((n) => !n.is_read).length - 1;
    setUnreadCount(Math.max(0, unread));
    try {
      await notifApi.markRead(id);
    } catch {}
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationItem item={item} onPress={handleMarkRead} />
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>暫無通知</Text>
          <Text style={styles.emptySubtext}>當有事件發生時，將會即時推播到這裡</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.md,
  },
  notifItem: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  notifUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.text,
  },
  notifTitleUnread: {
    fontWeight: '700',
  },
  notifMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
