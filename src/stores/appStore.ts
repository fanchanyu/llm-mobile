/**
 * App Store — 全域應用狀態 (Zustand)
 */
import { create } from 'zustand';

export interface LiveEvent {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  timestamp: string;
}

interface AppState {
  /** 是否連線到伺服器 */
  isOnline: boolean;
  /** 未讀通知數 */
  unreadCount: number;
  /** 語言 */
  language: 'zh' | 'en';
  /** 當前選取的頁面 */
  currentRoute: string;
  /** 全域即時事件流 (由 SSE Listener 填充) */
  liveEvents: LiveEvent[];

  setOnline: (online: boolean) => void;
  setUnreadCount: (count: number) => void;
  setLanguage: (lang: 'zh' | 'en') => void;
  setCurrentRoute: (route: string) => void;
  addEvent: (event: LiveEvent) => void;
  clearEvents: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: false,
  unreadCount: 0,
  language: 'zh',
  currentRoute: '(tabs)',
  liveEvents: [],

  setOnline: (online) => set({ isOnline: online }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setLanguage: (lang) => set({ language: lang }),
  setCurrentRoute: (route) => set({ currentRoute: route }),
  addEvent: (event) =>
    set((state) => ({
      liveEvents: [event, ...state.liveEvents].slice(0, 50), // keep last 50
    })),
  clearEvents: () => set({ liveEvents: [] }),
}));
