import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface RequireAuthProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Alternative protected route that redirects to login page
 * Use this when you have dedicated auth pages
 */
export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const { user, token } = useAuthStore();
  
  if (!token || !user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
}