import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const authApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
authApiClient.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (error) {
      console.error('Error parsing auth storage:', error);
    }
  }
  return config;
});

// Handle 401 responses
authApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth storage on 401
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
  };
  token?: string;
  token_type?: string;
  needs_password_change?: boolean;
}

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await authApiClient.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await authApiClient.post('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<{ success: boolean; message?: string }> {
    const response = await authApiClient.post('/auth/logout');
    return response.data;
  },

  async me(): Promise<AuthResponse> {
    const response = await authApiClient.get('/auth/me');
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ success: boolean; message?: string }> {
    const response = await authApiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message?: string }> {
    const response = await authApiClient.post('/auth/reset-password', data);
    return response.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message?: string }> {
    const response = await authApiClient.post('/auth/change-password', data);
    return response.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<AuthResponse> {
    const response = await authApiClient.put('/auth/profile', data);
    return response.data;
  },

  async verifyEmail(url: string): Promise<{ success: boolean; message?: string }> {
    const response = await authApiClient.get(url);
    return response.data;
  },

  async resendVerification(): Promise<{ success: boolean; message?: string }> {
    const response = await authApiClient.post('/auth/email/verification-notification');
    return response.data;
  }
};