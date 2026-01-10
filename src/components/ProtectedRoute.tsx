import React, { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from './LoadingSpinner';
import { AuthModal } from './AuthModal';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, token, checkAuth } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const checkAuthentication = async () => {
      if (token) {
        await checkAuth();
      }
      setIsCheckingAuth(false);
    };

    checkAuthentication();
  }, [token, checkAuth]);

  useEffect(() => {
    if (!isCheckingAuth && !user) {
      setShowAuthModal(true);
    }
  }, [isCheckingAuth, user]);

  if (isCheckingAuth) {
    return fallback || <LoadingSpinner />;
  }

  if (!user) {
    return (
      <>
        {fallback || (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '50vh',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <h2>Authentication Required</h2>
            <p>Please log in to access this content.</p>
          </div>
        )}
        
        <AuthModal
          opened={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onModeChange={setAuthMode}
        />
      </>
    );
  }

  return <>{children}</>;
}