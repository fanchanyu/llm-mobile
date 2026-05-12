/**
 * Auth API — 登入 / 登出
 */
import api from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    employee_id: string;
    employee_name?: string;
    last_login?: string;
    status: string;
    created_at?: string;
  };
  roles?: Array<{ id: number; role_name: string; role_label: string }>;
  permissions?: Array<{ id: number; permission_code: string; permission_name: string }>;
}

export const authApi = {
  /** 登入 — 自動帶入裝置資訊 */
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/api/org/login', data, {
      headers: {
        'X-Device': 'llm-mobile',
        'X-Device-Platform': 'mobile',
      },
    }),

  /** 健康檢查 */
  health: () => api.get<{ status: string }>('/health'),
};
