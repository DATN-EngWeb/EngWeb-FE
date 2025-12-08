'use client';

/* global localStorage */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(redirectTo = '/login') {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      const role = localStorage.getItem('userRole');
      const avatar = localStorage.getItem('avatar');
      const status = localStorage.getItem('userStatus');

      if (!token || !userId) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Set user data
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
  }, []);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('userRole');
      localStorage.removeItem('avatar');
      localStorage.removeItem('userStatus');
    }
    setIsAuthenticated(false);
    setUser(null);
    if (redirectTo) {
      router.push(redirectTo);
    }
  };

  return { isAuthenticated, isLoading, user, logout };
}
