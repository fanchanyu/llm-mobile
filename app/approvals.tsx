/**
 * Approvals Screen — 待核准簽核
 *
 * 功能:
 * - 顯示待核准清單 (採購單、投料超發、報廢等)
 * - 一鍵核准 / 駁回
 * - 與桌機 Web 端同步 (SSE 即時更新)
 * - 權限控制: 只有有對應權限的角色才能看到
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '@/src/constants/theme';
import { useAuthStore } from '@/src/stores/authStore';

// ─── 資料型態 ───────────────────────────────

interface ApprovalItem {
  id: number;
  request_type: string;
  type_label: string;
  title: string;
  requester: string;
  amount?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  urgency: 'normal' | 'urgent';
}

// ─── 核准卡片 ───────────────────────────────

function ApprovalCard({
  item,
  onApprove,
  onReject,
}: {
  item: ApprovalItem;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    purchase: 'cart-outline',
    over_issue: 'warning-outline',
    scrap: 'trash-outline',
    payment: 'cash-outline',
  };

  return (
    <View style={styles.card}>
      {/* 頂部：類型 + 緊急標籤 */}
      <View style={styles.cardHeader}>
        <View style={styles.typeRow}>
          <Ionicons
            name={typeIcons[item.request_type] || 'document-outline'}
            size={18}
            color={Colors.primary}
          />
          <Text style={styles.typeLabel}>{item.type_label}</Text>
        </View>
        {item.urgency === 'urgent' && (
          <View style={styles.urgentTag}>
            <Text style={styles.urgentText}>急件</Text>
          </View>
        )}
      </View>

      {/* 內容 */}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.metaText}>{item.requester}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.metaText}>{item.created_at}</Text>
        </View>
        {item.amount && (
          <View style={styles.metaItem}>
            <Ionicons name="pricetag-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>NT$ {item.amount}</Text>
          </View>
        )}
      </View>

      {/* 按鈕 */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => onReject(item.id)}
        >
          <Ionicons name="close" size={18} color={Colors.error} />
          <Text style={styles.rejectText}>駁回</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => onApprove(item.id)}
        >
          <Ionicons name="checkmark" size={18} color={Colors.textInverse} />
          <Text style={styles.approveText}>核准</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── 主頁面 ─────────────────────────────────

export default function ApprovalsScreen() {
  const { user, hasPermission } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // 模擬資料 (正式連後端 API)
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    {
      id: 1, request_type: 'purchase', type_label: '採購核准',
      title: 'PO-2026-0058 — 大明金屬，鋁板 6061-T6 x 200片',
      requester: '王小明 (採購)', amount: '168,000',
      status: 'pending', created_at: '2026-05-12', urgency: 'urgent',
    },
    {
      id: 2, request_type: 'over_issue', type_label: '超發核准',
      title: 'WO-2026-0312 — 底板投料超發 +15 片（BOM 80→95）',
      requester: '陳小華 (生管)',
      status: 'pending', created_at: '2026-05-12', urgency: 'normal',
    },
    {
      id: 3, request_type: 'payment', type_label: '付款核准',
      title: 'AP-2026-0042 — 大明金屬 貨款',
      requester: '李經理 (會計)', amount: '850,000',
      status: 'pending', created_at: '2026-05-11', urgency: 'urgent',
    },
    {
      id: 4, request_type: 'scrap', type_label: '報廢核准',
      title: 'NC-2026-0017 — ASM-004 尺寸超差，建議報廢 x3',
      requester: '張品管 (品管)',
      status: 'pending', created_at: '2026-05-11', urgency: 'normal',
    },
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const handleApprove = (id: number) => {
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'approved' } : item,
      ),
    );
  };

  const handleReject = (id: number) => {
    Alert.alert(
      '駁回確認',
      '確定要駁回此申請嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '駁回',
          style: 'destructive',
          onPress: () => {
            setApprovals((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, status: 'rejected' } : item,
              ),
            );
          },
        },
      ],
    );
  };

  const filtered = approvals.filter((a) => a.status === 'pending');

  // 權限檢查: 如果沒有核准權限就顯示提示
  const canApprove = hasPermission('approve-po-above-100k') ||
    hasPermission('approve-po-below-100k') ||
    user?.role === 'director';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>待核准</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filtered.length} 件</Text>
        </View>
      </View>

      {!canApprove ? (
        <View style={styles.noPermission}>
          <Ionicons name="lock-closed-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.noPermissionText}>
            您目前沒有核准權限
          </Text>
          <Text style={styles.noPermissionSub}>
            目前角色: {user?.role}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={({ item }) => (
            <ApprovalCard
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-outline" size={48} color={Colors.success} />
              <Text style={styles.emptyText}>所有申請已處理完畢</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ─── 樣式 ───────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  countBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  countText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  list: {
    padding: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
  urgentTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  urgentText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.error,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
    marginBottom: 4,
  },
  metaText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.sm,
  },
  rejectText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: Spacing.xs,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },
  approveText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textInverse,
    marginLeft: Spacing.xs,
  },
  noPermission: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  noPermissionText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  noPermissionSub: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.success,
    marginTop: Spacing.md,
  },
});
