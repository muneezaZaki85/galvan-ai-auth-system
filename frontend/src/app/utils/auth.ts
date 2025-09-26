const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  message?: string;
  [key: string]: T;
}

class AuthService {
  private static instance: AuthService;
  private refreshPromise: Promise<string> | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Refresh failed, clear tokens and redirect to login
      this.clearTokens();
      window.location.href = '/login';
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const newAccessToken = data.access_token;

    // Update stored access token
    localStorage.setItem('access_token', newAccessToken);

    return newAccessToken;
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  async apiCall<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const makeRequest = async (accessToken?: string): Promise<Response> => {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (accessToken) {
        (headers as any)['Authorization'] = `Bearer ${accessToken}`;
      }

      return fetch(`${API_URL}${url}`, {
        ...options,
        headers,
      });
    };

    // First attempt with current access token
    let accessToken = localStorage.getItem('access_token');
    let response = await makeRequest(accessToken || undefined);

    // If unauthorized and we have tokens, try to refresh
    if (response.status === 401 && accessToken && localStorage.getItem('refresh_token')) {
      try {
        accessToken = await this.refreshToken();
        response = await makeRequest(accessToken);
      } catch (error) {
        // Refresh failed, user needs to login again
        throw error;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Convenience methods
  async get<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.apiCall<T>(url, { method: 'GET' });
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.apiCall<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.apiCall<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.apiCall<T>(url, { method: 'DELETE' });
  }
}

export const authService = AuthService.getInstance();

// Token expiry checker (optional - for proactive refresh)
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

// Check if token expires within the next 5 minutes
export const shouldRefreshToken = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const fiveMinutesFromNow = currentTime + (5 * 60);
    return payload.exp < fiveMinutesFromNow;
  } catch {
    return true;
  }
};