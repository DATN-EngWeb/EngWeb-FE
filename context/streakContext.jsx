'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserStreak } from '../api/dashboard';

const StreakContext = createContext();

export const StreakProvider = ({ children }) => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [streakData, setStreakData] = useState({
    streak_count: 0,
    is_streak_lit_today: false,
    last_submitted_date: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (authLoading) return;

    if (!isAuthenticated || !user || user.role !== 'S') {
      setIsLoading(false);
      return;
    }

    try {
      const res = await getUserStreak();
      setStreakData(res);
    } catch (error) {
      console.error('Streak fetch error:', error); // eslint-disable-line no-console
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return (
    <StreakContext.Provider value={{ streakData, isLoading, refreshStreak: fetchStreak }}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreakContext = () => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreakContext must be used within a StreakProvider');
  }
  return context;
};
