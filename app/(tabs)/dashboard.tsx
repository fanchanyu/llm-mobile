/**
 * Dashboard Screen — 即時營運看板
 *
 * 功能:
 * - KPI 卡片總覽
 * - Quick Action 快速操作 (庫存/簽核/跨廠監控)
 * - 即時事件流 (從 App 級 SSE 接收)
 * - 連線狀態指示
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '@/src/constants/theme';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppStore } from '@/src/stores/appStore';

// ─── KPI 卡片 ──────────────────────────────────

interface KpiData {
  label: string;
  value: string;
  change?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

function KpiCard({ data }: { data: KpiData }) {
  return (
    <View style={styles.kpiCard}>
      <View style={[styles.kpiIcon, { backgroundColor: data.bgColor }]}>
        <Ionicons name={data.icon} size={22} color={data.color} />
      </View>
      <Text style={styles.kpiValue}>{data.value}</Text>
      <Text style={styles.kpiLabel}>{data.label}</Text>
      {data.change && (
        <Text style={[styles.kpiChange, { color: data.change.startsWith('+') ? Colors.success : Colors.error }]}>
          {data.change}
        </Text>
      )}
    </View>
  );
}

// ─── Quick Action ───────────────────────────────

interface QuickAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  route: string;
  badge?: number;
}

function QuickActionCard({ action, onPress }: { action: QuickAction; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.qaCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.qaIcon, { backgroundColor: action.bgColor }]}>
        <Ionicons name={action.icon} size={24} color={action.color} />
        {action.badge != null && action.badge > 0 && (
          <View style={styles.qaBadge}>
            <Text style={styles.qaBadgeText}>{action.badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.qaLabel}>{action.label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

// ─── 即時事件流 ────────────────────────────────

interface EventItem {
  id: string;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return Colors.error;
    case 'warning': return Colors.warning;
    default: return Colors.info;
  }
}

function getSeverityIcon(severity: string): keyof typeof Ionicons.glyphMap {
  switch (severity) {
    case 'critical': return 'alert-circle';
    case 'warning': return 'warning';
    default: return 'information-circle';
  }
}

function EventRow({ event }: { event: EventItem }) {
  return (
    <View style={styles.eventRow}>
      <Ionicons
        name={getSeverityIcon(event.severity)}
        size={18}
        color={getSeverityColor(event.severity)}
        style={styles.eventIcon}
      />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.eventTime}>{event.timestamp}</Text>
      </View>
    </View>
  );
}

// ─── ⚠️ DEMO 模式標籤 ─────────────────────────

function DemoBanner() {
  return (
    <View style={styles.demoBanner}>
      <Ionicons name="information-circle" size={16} color={Colors.warning} />
      <Text style={styles.demoText}>
        預覽模式 — 資料為模擬資料，尚未連接後端
      </Text>
    </View>
  );
}

// ─── 主畫面 ────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isOnline = useAppStore((s) => s.isOnline);
  const unreadCount = useAppStore((s) => s.unreadCount);
  const [refreshing, setRefreshing] = useState(false);

  // 全域事件流 (從 App 級 SSE Listener 寫入)
  const liveEvents = useAppStore((s) => s.liveEvents);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  // 角色對應
  const roleLabels: Record<string, string> = {
    director: '廠長', production: '生管', warehouse: '倉庫',
    purchasing: '採購', quality: '品管', accounting: '會計', sales: '業務',
  };

  // KPI (依角色顯示不同內容)
  const kpiCards: KpiData[] = [
    { label: '庫存料號', value: '1,284', change: '+12', icon: 'cube-outline', color: Colors.primary, bgColor: Colors.primaryLight },
    { label: '採購單', value: '18', change: '+3', icon: 'document-text-outline', color: Colors.warning, bgColor: '#FFF7ED' },
    { label: '生產工單', value: '7', icon: 'construct-outline', color: Colors.success, bgColor: '#F0FDF4' },
    { label: '待核准', value: '5', icon: 'checkmark-circle-outline', color: Colors.error, bgColor: '#FEF2F2' },
  ];

  // Quick Actions
  const quickActions: QuickAction[] = [
    { id: 'inventory', label: '庫存查詢', icon: 'cube-outline', color: Colors.primary, bgColor: Colors.primaryLight, route: '/inventory', badge: 3 },
    { id: 'approvals', label: '待核准', icon: 'checkmark-circle-outline', color: Colors.error, bgColor: '#FEF2F2', route: '/approvals', badge: 4 },
    { id: 'mesh', label: '跨廠監控', icon: 'server-outline', color: Colors.success, bgColor: '#F0FDF4', route: '/mesh-monitor' },
    { id: 'chat', label: 'AI 對話', icon: 'chatbubble-ellipses-outline', color: Colors.warning, bgColor: '#FFF7ED', route: '/(tabs)/chat' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      <StatusBar style="dark" />

      {/* DEMO 模式提示 */}
      <DemoBanner />

      {/* 歡迎區塊 */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.welcomeText}>
            {new Date().getHours() < 12 ? '早安' : new Date().getHours() < 18 ? '午安' : '晚安'}，
            {user?.display_name || '使用者'}
          </Text>
          <Text style={styles.roleLabel}>
            {roleLabels[user?.role || ''] || user?.role || '使用者'}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: isOnline ? '#F0FDF4' : '#FEF2F2' }]}>
          <Ionicons
            name="ellipse"
            size={12}
            color={isOnline ? Colors.online : Colors.error}
          />
          <Text style={[styles.statusText, { color: isOnline ? Colors.online : Colors.error }]}>
            {isOnline ? '已連線' : '離線'}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionLabel}>快速操作</Text>
      <View style={styles.qaGrid}>
        {quickActions.map((action) => (
          <QuickActionCard
            key={action.id}
            action={action}
            onPress={() => router.push(action.route as any)}
          />
        ))}
      </View>

      {/* KPI 網格 */}
      <Text style={styles.sectionLabel}>營運總覽</Text>
      <View style={styles.kpiGrid}>
        {kpiCards.map((kpi, i) => (
          <KpiCard key={i} data={kpi} />
        ))}
      </View>

      {/* 即時事件流 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>即時事件流</Text>
        {liveEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pulse-outline" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>等待事件...</Text>
            <Text style={styles.emptySubtext}>
              當後端事件發生時，將透過 SSE 即時推播到此處
            </Text>
          </View>
        ) : (
          liveEvents.map((evt) => <EventRow key={evt.id} event={evt} />)
        )}
      </View>
    </ScrollView>
  );
}

// ─── 樣式 ───────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  // Demo banner
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  demoText: {
    fontSize: FontSize.sm,
    color: Colors.warning,
    marginLeft: Spacing.sm,
    flex: 1,
  },

  // Welcome
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  welcomeText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  roleLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusDot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },

  // Quick Actions
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.xl,
  },
  qaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    width: '48%',
    marginRight: '4%',
    ...Shadows.sm,
  },
  qaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  qaBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qaBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  qaLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },

  // KPI
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  kpiValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  kpiLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  kpiChange: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginTop: 4,
  },

  // Events
  section: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  eventRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  eventIcon: {
    marginRight: Spacing.md,
    marginTop: 2,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 20,
  },
  eventTime: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
  },
  simulateText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },
});
