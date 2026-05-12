/**
 * Inventory Screen — 庫存查詢
 *
 * 功能:
 * - 搜尋料號/名稱
 * - 低庫存警示列表
 * - 條碼掃描 (預留)
 * - 與桌機 Web 端資料同步 (同一組 API)
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '@/src/constants/theme';

// ─── 資料型態 ───────────────────────────────

interface StockItem {
  id: number;
  part_no: string;
  part_name: string;
  quantity: number;
  location: string;
  unit: string;
  min_stock?: number;
  is_low?: boolean;
}

// ─── 元件 ───────────────────────────────────

function StockCard({ item }: { item: StockItem }) {
  const isLow = item.is_low || (item.min_stock != null && item.quantity <= item.min_stock);
  return (
    <View style={[styles.stockCard, isLow && styles.stockCardLow]}>
      <View style={styles.stockHeader}>
        <View style={styles.stockInfo}>
          <Text style={styles.partNo}>{item.part_no}</Text>
          <Text style={styles.partName}>{item.part_name}</Text>
        </View>
        <View style={[styles.qtyBadge, isLow && styles.qtyBadgeLow]}>
          <Text style={[styles.qtyText, isLow && { color: Colors.error }]}>
            {item.quantity}
          </Text>
          <Text style={styles.unitText}>{item.unit}</Text>
        </View>
      </View>
      <View style={styles.stockFooter}>
        <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
        <Text style={styles.locationText}>{item.location}</Text>
        {isLow && (
          <View style={styles.lowTag}>
            <Ionicons name="alert-circle" size={12} color={Colors.error} />
            <Text style={styles.lowTagText}>庫存偏低</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── 主頁面 ─────────────────────────────────

export default function InventoryScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 模擬資料 (正式連後端 API)
  const mockData: StockItem[] = [
    { id: 1, part_no: 'AL-6061-T6', part_name: '鋁板 6061-T6 6mm', quantity: 12, location: 'A-01-03', unit: '片', min_stock: 50, is_low: true },
    { id: 2, part_no: 'ST-SS304', part_name: '不鏽鋼板 SUS304 3mm', quantity: 85, location: 'A-02-01', unit: '片', min_stock: 30 },
    { id: 3, part_no: 'BT-M8x30', part_name: '螺栓 M8 x 30mm', quantity: 1200, location: 'B-01-05', unit: '顆', min_stock: 500 },
    { id: 4, part_no: 'NT-H12', part_name: '螺母 H12 不鏽鋼', quantity: 45, location: 'B-01-08', unit: '顆', min_stock: 200, is_low: true },
    { id: 5, part_no: 'SP-CNC-001', part_name: 'CNC 主軸軸承', quantity: 3, location: 'C-03-01', unit: '組', min_stock: 5, is_low: true },
    { id: 6, part_no: 'PK-EPE-2mm', part_name: 'EPE 緩衝墊 2mm', quantity: 500, location: 'D-01-10', unit: '片', min_stock: 100 },
  ];

  const filteredData = mockData
    .filter((item) => {
      if (showLowStock && !item.is_low && !(item.min_stock != null && item.quantity <= item.min_stock)) {
        return false;
      }
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        return item.part_no.toLowerCase().includes(q) || item.part_name.toLowerCase().includes(q);
      }
      return true;
    });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const lowStockCount = mockData.filter((i) => i.is_low || (i.min_stock != null && i.quantity <= i.min_stock)).length;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* 搜尋列 */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={Colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜尋料號或名稱..."
          placeholderTextColor={Colors.inputPlaceholder}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons name="camera-outline" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 篩選標籤 */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, showLowStock && styles.filterChipActive]}
          onPress={() => setShowLowStock(!showLowStock)}
        >
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color={showLowStock ? Colors.textInverse : Colors.error}
          />
          <Text style={[styles.filterChipText, showLowStock && { color: Colors.textInverse }]}>
            低庫存 ({lowStockCount})
          </Text>
        </TouchableOpacity>
        <Text style={styles.resultCount}>共 {filteredData.length} 項</Text>
      </View>

      {/* 列表 */}
      <FlatList
        data={filteredData}
        renderItem={({ item }) => <StockCard item={item} />}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>無符合條件的庫存</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── 樣式 ───────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: Spacing.md,
    marginBottom: 0,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    ...Shadows.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: FontSize.md,
    color: Colors.inputText,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  filterChipActive: {
    backgroundColor: Colors.error,
  },
  filterChipText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  resultCount: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  list: {
    padding: Spacing.md,
  },
  stockCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  stockCardLow: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stockInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  partNo: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  partName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  qtyBadge: {
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
  },
  qtyBadgeLow: {
    backgroundColor: '#FEF2F2',
  },
  qtyText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  unitText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  stockFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  locationText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginLeft: 4,
    marginRight: Spacing.md,
  },
  lowTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  lowTagText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginLeft: 3,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
  },
});
