/**
 * Mesh Monitor Screen — 跨廠監控
 *
 * 整合 LLM-Mesh 分散式工廠網路
 * 即時顯示各站點狀態、KPI、事件
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '@/src/constants/theme';
import { useAuthStore } from '@/src/stores/authStore';
import api from '@/src/api/client';

// ─── 站點卡片 ───────────────────────────────

interface SiteData {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  uptime: string;
  kpis: { label: string; value: string; status?: 'ok' | 'warn' | 'critical' }[];
  lastEvent?: string;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'online': return Colors.online;
    case 'warning': return Colors.warning;
    case 'offline': return Colors.offline;
    default: return Colors.offline;
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case 'online': return '#F0FDF4';
    case 'warning': return '#FFF7ED';
    case 'offline': return '#F1F5F9';
    default: return '#F1F5F9';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'online': return '正常';
    case 'warning': return '異常';
    case 'offline': return '離線';
    default: return '未知';
  }
}

function SiteCard({ site }: { site: SiteData }) {
  const statusColor = getStatusColor(site.status);
  const statusBg = getStatusBg(site.status);

  return (
    <View style={styles.siteCard}>
      {/* 頂部 */}
      <View style={styles.siteHeader}>
        <View style={[styles.siteStatusDot, { backgroundColor: statusColor }]} />
        <View style={styles.siteInfo}>
          <Text style={styles.siteName}>{site.name}</Text>
          <Text style={styles.siteId}>{site.id}</Text>
        </View>
        <View style={[styles.statusTag, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusLabel(site.status)}
          </Text>
        </View>
      </View>

      {/* Uptime */}
      <View style={styles.uptimeRow}>
        <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
        <Text style={styles.uptimeText}>運行時間: {site.uptime}</Text>
      </View>

      {/* KPI */}
      <View style={styles.kpiRow}>
        {site.kpis.map((kpi, i) => (
          <View key={i} style={styles.kpiMini}>
            <Text style={styles.kpiMiniValue}>{kpi.value}</Text>
            <Text style={styles.kpiMiniLabel}>{kpi.label}</Text>
            {kpi.status && kpi.status !== 'ok' && (
              <Ionicons
                name={kpi.status === 'critical' ? 'alert-circle' : 'warning'}
                size={14}
                color={kpi.status === 'critical' ? Colors.error : Colors.warning}
                style={{ marginTop: 2 }}
              />
            )}
          </View>
        ))}
      </View>

      {/* 最近事件 */}
      {site.lastEvent && (
        <View style={styles.lastEvent}>
          <Ionicons name="pulse-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.lastEventText}>{site.lastEvent}</Text>
        </View>
      )}
    </View>
  );
}

// ─── 主頁面 ─────────────────────────────────

export default function MeshMonitorScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [sites, setSites] = useState<SiteData[]>([]);
  const [loading, setLoading] = useState(true);

  // 載入站點資料 (正式連 LLM-Mesh API)
  const loadSites = useCallback(async () => {
    setLoading(true);
    try {
      // 嘗試從 LLM-Mesh 後端取得站點資料
      // const response = await api.get('/mesh/v1/nodes');
      // setSites(response.nodes);

      // 模擬資料
      await new Promise((r) => setTimeout(r, 600));
      setSites([
        {
          id: 'hq', name: '總部', status: 'online', uptime: '12天 3小時',
          kpis: [
          { label: '訂單', value: '47', status: 'ok' },
          { label: '庫存', value: '1,284' },
          { label: '警示', value: '2', status: 'warn' },
          ],
          lastEvent: '5分鐘前 — PO-2026-0058 已核准',
        },
        {
          id: 'fac-a', name: 'A廠', status: 'online', uptime: '7天 18小時',
          kpis: [
          { label: '工單', value: '12', status: 'ok' },
          { label: '產能', value: '87%' },
          { label: '異常', value: '1', status: 'warn' },
          ],
          lastEvent: '12分鐘前 — CNC-03 溫度恢復正常',
        },
        {
          id: 'fac-b', name: 'B廠', status: 'warning', uptime: '3天 9小時',
          kpis: [
            { label: '工單', value: '8' },
            { label: '產能', value: '62%', status: 'critical' },
            { label: '異常', value: '3', status: 'critical' },
          ],
          lastEvent: '2分鐘前 — 品質異常: ASM-004 尺寸超差',
        },
      ]);
    } catch (err) {
      console.error('Failed to load mesh sites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSites();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSites();
    setRefreshing(false);
  }, [loadSites]);

  // 計算統計
  const onlineCount = sites.filter((s) => s.status === 'online').length;
  const totalCount = sites.length;

  if (loading) {
    return (
      <View style={styles.loading}>
        <Ionicons name="pulse-outline" size={48} color={Colors.primary} />
        <Text style={styles.loadingText}>載入站點資料...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      <StatusBar style="dark" />

      {/* 總覽 */}
      <View style={styles.overview}>
        <View style={styles.overviewItem}>
          <Text style={styles.overviewValue}>{totalCount}</Text>
          <Text style={styles.overviewLabel}>站點總數</Text>
        </View>
        <View style={styles.overviewDivider} />
        <View style={styles.overviewItem}>
          <Text style={[styles.overviewValue, { color: Colors.online }]}>{onlineCount}</Text>
          <Text style={styles.overviewLabel}>正常</Text>
        </View>
        <View style={styles.overviewDivider} />
        <View style={styles.overviewItem}>
          <Text style={[styles.overviewValue, { color: Colors.warning }]}>{totalCount - onlineCount}</Text>
          <Text style={styles.overviewLabel}>異常</Text>
        </View>
      </View>

      {/* 站點卡片 */}
      {sites.map((site) => (
        <SiteCard key={site.id} site={site} />
      ))}

      {totalCount === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="server-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>尚未偵測到任何站點</Text>
          <Text style={styles.emptySubtext}>請確認 LLM-Mesh 後端已啟動</Text>
        </View>
      )}
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
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  overview: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  overviewLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  overviewDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.divider,
  },
  siteCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  siteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  siteStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  siteId: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontFamily: 'monospace',
  },
  statusTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  uptimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  uptimeText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginLeft: 4,
  },
  kpiRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
  },
  kpiMini: {
    flex: 1,
    alignItems: 'center',
  },
  kpiMiniValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  kpiMiniLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  lastEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  lastEventText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginLeft: 4,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
});
