/**
 * API Client — 統一的 HTTP 客戶端
 * 自動帶入 JWT Token，統一錯誤處理
 */
import { useAuthStore } from '../stores/authStore';

const DEFAULT_TIMEOUT = 15000;

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { token, serverUrl } = useAuthStore.getState();
  const baseUrl = serverUrl.replace(/\/+$/, '');
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      throw new ApiError(
        errorData?.detail || `HTTP ${response.status}`,
        response.status,
        errorData,
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) throw error;
    if ((error as Error).name === 'AbortError') {
      throw new ApiError('請求超時，請檢查網路連線', 408);
    }
    throw new ApiError('無法連接到伺服器，請檢查網路', 0);
  }
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint),

  post: <T = any>(endpoint: string, data?: any, extra?: RequestInit) =>
    request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...extra,
    }),

  put: <T = any>(endpoint: string, data?: any, extra?: RequestInit) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...extra,
    }),

  patch: <T = any>(endpoint: string, data?: any, extra?: RequestInit) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...extra,
    }),

  delete: <T = any>(endpoint: string, extra?: RequestInit) =>
    request<T>(endpoint, { method: 'DELETE', ...extra }),
};

export { ApiError };
export default api;
