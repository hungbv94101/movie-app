import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/authApi';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  needs_password_change?: boolean;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  needsPasswordChange: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, email: string, password: string, passwordConfirmation: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string, newPasswordConfirmation: string) => Promise<boolean>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<boolean>;
  resendVerification: () => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      needsPasswordChange: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login({ email, password });
          
          if (response.success) {
            set({ 
              user: response.data.user, 
              token: response.data.token,
              needsPasswordChange: response.data.needs_password_change || false,
              isLoading: false 
            });
            return true;
          } else {
            set({ 
              error: response.message || 'Login failed',
              isLoading: false 
            });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      register: async (name: string, email: string, password: string, passwordConfirmation: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.register({ 
            name, 
            email, 
            password, 
            password_confirmation: passwordConfirmation 
          });
          
          if (response.success) {
            set({ 
              user: response.data.user, 
              token: response.data.token,
              isLoading: false 
            });
            return true;
          } else {
            set({ 
              error: response.message || 'Registration failed',
              isLoading: false 
            });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      logout: () => {
        const { token } = get();
        
        if (token) {
          // Call logout API endpoint
          authApi.logout().catch(console.error);
        }
        
        set({ 
          user: null, 
          token: null, 
          error: null,
          needsPasswordChange: false
        });

        // Navigate to home page
        window.location.href = '/';
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          return;
        }

        try {
          const response = await authApi.me();
          if (response.success) {
            set({ user: response.data.user });
          } else {
            // Token is invalid, clear auth state
            set({ user: null, token: null });
          }
        } catch (error) {
          // Token is invalid, clear auth state
          set({ user: null, token: null });
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.forgotPassword({ email });
          set({ isLoading: false });
          
          return response.success;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      resetPassword: async (token: string, email: string, password: string, passwordConfirmation: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.resetPassword({ 
            token, 
            email, 
            password, 
            password_confirmation: passwordConfirmation 
          });
          set({ isLoading: false });
          
          return response.success;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string, newPasswordConfirmation: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.changePassword({ 
            current_password: currentPassword, 
            new_password: newPassword, 
            new_password_confirmation: newPasswordConfirmation 
          });
          
          if (response.success) {
            set({ isLoading: false, needsPasswordChange: false });
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Password change failed';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      updateProfile: async (data: { name?: string; email?: string }) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.updateProfile(data);
          
          if (response.success) {
            set({ 
              user: response.data.user,
              isLoading: false 
            });
            return true;
          } else {
            set({ 
              error: response.message || 'Profile update failed',
              isLoading: false 
            });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      resendVerification: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.resendVerification();
          set({ isLoading: false });
          
          return response.success;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to resend verification email';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      })
    }
  )
);