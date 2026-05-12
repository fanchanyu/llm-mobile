/**
 * Auth Store — JWT 認證狀態管理 (Zustand)
 * 支援角色與權限，桌機手機共用同一套權限模型
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: number;
  username: string;
  display_name: string;
  role: string;
  roles: string[];           // 所有角色 (來自後端)
  permissions: string[];     // 權限列表 (來自後端)
  department: string;
  employee_id?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  serverUrl: string;

  setAuth: (user: User, token: string) => Promise<void>;
  setServerUrl: (url: string) => void;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  /** 檢查使用者是否有特定權限 */
  hasPermission: (perm: string) => boolean;
  /** 檢查使用者是否為特定角色 */
  hasRole: (role: string) => boolean;
}

const AUTH_KEY = 'llm_mobile_auth';
const SERVER_URL_KEY = 'llm_mobile_server_url';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  serverUrl: 'http://localhost:8000',

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify({ user, token }));
    set({ user, token, isAuthenticated: true });
  },

  setServerUrl: (url: string) => {
    SecureStore.setItemAsync(SERVER_URL_KEY, url);
    set({ serverUrl: url });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(AUTH_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const [authData, serverUrl] = await Promise.all([
        SecureStore.getItemAsync(AUTH_KEY),
        SecureStore.getItemAsync(SERVER_URL_KEY),
      ]);
      if (authData) {
        const { user, token } = JSON.parse(authData);
        set({ user, token, isAuthenticated: true, isLoading: false, serverUrl: serverUrl || 'http://localhost:8000' });
      } else {
        set({ isLoading: false, serverUrl: serverUrl || 'http://localhost:8000' });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  hasPermission: (perm: string) => {
    const { user } = get();
    if (!user) return false;
    // 廠長擁有所有權限
    if (user.role === 'director') return true;
    return user.permissions.includes(perm);
  },

  hasRole: (role: string) => {
    const { user } = get();
    if (!user) return false;
    return user.roles.includes(role);
  },
}));
