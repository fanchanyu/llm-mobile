/**
 * LLM-Mobile Light Theme — 淺色主題系統
 * 靈感來自戰情室設計: 背景 #f0f4f8, 卡片白色, 文字深色
 * 禁用深色模式！桌機一體的統一樣式
 */

export const Colors = {
  // 主色
  primary: '#2563EB',       // 藍色主色
  primaryLight: '#DBEAFE',  // 淺藍背景
  primaryDark: '#1D4ED8',   // 深藍按壓

  // 背景
  background: '#F0F4F8',    // 頁面背景（淺灰藍）
  card: '#FFFFFF',          // 卡片背景
  cardBorder: '#E2E8F0',    // 卡片邊框

  // 文字
  text: '#1E293B',          // 主要文字（深灰）
  textSecondary: '#64748B', // 次要文字
  textTertiary: '#94A3B8',  // 輔助文字
  textInverse: '#FFFFFF',   // 反白文字

  // 功能色
  success: '#16A34A',       // 成功
  warning: '#EA580C',       // 警告
  error: '#DC2626',         // 錯誤
  info: '#0284C7',          // 資訊

  // 分割線
  border: '#E2E8F0',        // 邊框
  divider: '#F1F5F9',       // 分割線

  // Tab Bar
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabActive: '#2563EB',
  tabInactive: '#94A3B8',

  // 導航欄
  header: '#FFFFFF',
  headerText: '#1E293B',

  // 輸入框
  input: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputText: '#1E293B',
  inputPlaceholder: '#94A3B8',

  // 狀態
  online: '#16A34A',
  offline: '#94A3B8',
  busy: '#EA580C',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
};

export default Colors;
