'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export function useAuth(redirectTo = '/login') {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const getCookie = (name) => {
    if (typeof window === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const clearAuthData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('avatar');
      localStorage.removeItem('userStatus');
      localStorage.removeItem('userRole');
      document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  const logout = () => {
    clearAuthData();
    if (redirectTo) {
      router.push(redirectTo);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      const role = getCookie('userRole') || localStorage.getItem('userRole');
      const avatar = localStorage.getItem('avatar');
      const status = localStorage.getItem('userStatus');

      if (!token || !userId) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Check if user status is 'V' (Verified) - only verified users can access the app
      if (status !== 'V') {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);

        // Redirect based on status
        if (status === 'I' && role === 'T') {
          // Teacher with incomplete profile
          router.push(`/upload-profile?user_id=${userId}`);
        } else if (status === 'P') {
          // Pending verification
          router.push(`/verify-otp?type=register&user_id=${userId}`);
        } else if (status === 'W') {
          // Waiting for approval - show message and redirect to login
          window.alert('Your account is waiting for admin approval. Please wait.');
          clearAuthData();
          router.push('/login');
        } else if (status === 'D') {
          // Disabled account
          window.alert('Your account has been disabled.');
          clearAuthData();
          router.push('/login');
        } else {
          // Unknown status - redirect to login
          clearAuthData();
          router.push('/login');
        }
        return;
      }

      // Set user data - only if status is 'V'
      setUser({
        id: userId,
        username: username,
        role: role,
        avatar: avatar,
        status: status,
      });
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  return { isAuthenticated, isLoading, user, logout };
}
