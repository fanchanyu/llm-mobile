/**
 * LLM-Mobile 中文翻譯
 */
const zh = {
  // App
  appName: 'LLM-Mobile',
  appSubtitle: '工廠管理隨身版',

  // Auth
  login: '登入',
  loginTitle: 'LLM-Mobile',
  loginSubtitle: '工廠管理 • 桌機一體',
  username: '帳號',
  password: '密碼',
  loginButton: '登入系統',
  loggingIn: '登入中...',
  loginError: '帳號或密碼錯誤',
  logout: '登出',

  // Tabs
  tabChat: 'AI 對話',
  tabDashboard: '看板',
  tabNotifications: '通知',
  tabProfile: '設定',

  // Chat
  chatTitle: 'AI 助手',
  chatPlaceholder: '輸入訊息或點擊麥克風...',
  chatSend: '傳送',
  chatVoice: '語音輸入',
  chatListening: '聆聽中...',
  chatThinking: '思考中...',
  chatError: '抱歉，發生錯誤，請重試',

  // Dashboard
  dashboardTitle: '營運看板',
  kpiInventory: '庫存',
  kpiOrders: '訂單',
  kpiProduction: '生產',
  kpiQuality: '品質',
  kpiApprovals: '待核准',
  kpiAlerts: '異常警示',
  kpiPendingApprovals: '待核准單',
  statusOnline: '正常',
  statusWarning: '注意',
  statusCritical: '緊急',

  // Notifications
  notifTitle: '通知中心',
  notifEmpty: '暫無通知',
  notifMarkRead: '標記已讀',
  notifMarkAllRead: '全部已讀',
  notifApproval: '核准請求',
  notifAlert: '異常警示',
  notifSystem: '系統通知',

  // Profile
  profileTitle: '個人設定',
  profileRole: '角色',
  profileDepartment: '部門',
  profileServer: '伺服器設定',
  profileServerUrl: '伺服器網址',
  profileLanguage: '語言',
  profileLangZh: '中文',
  profileLangEn: 'English',
  profileVersion: '版本',
  profileAbout: '關於',

  // Approvals
  approvalTitle: '待核准',
  approvalApprove: '核准',
  approvalReject: '駁回',
  approvalComment: '意見',
  approvalBy: '申請人',
  approvalDate: '申請日期',
  approvalEmpty: '暫無待核准項目',
  approvalApproved: '已核准',
  approvalRejected: '已駁回',
  approvalProcessing: '處理中...',

  // Inventory
  inventoryTitle: '庫存查詢',
  inventorySearch: '搜尋料號或名稱',
  inventoryPartNo: '料號',
  inventoryName: '名稱',
  inventoryQty: '數量',
  inventoryLocation: '位置',
  inventoryLowStock: '庫存偏低',

  // Common
  loading: '載入中...',
  error: '發生錯誤',
  retry: '重試',
  confirm: '確認',
  cancel: '取消',
  save: '儲存',
  back: '返回',
  noData: '暫無資料',
  pullToRefresh: '下拉重新整理',
  updatedAt: '更新時間',
  online: '連線中',
  offline: '離線',
};

export type TranslationKeys = typeof zh;
export default zh;
