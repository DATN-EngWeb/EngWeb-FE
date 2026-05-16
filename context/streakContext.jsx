'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserStreak } from '../api/dashboard';
import StreakRewardOverlay from '../components/Streak/StreakRewardOverlay';

const StreakContext = createContext();

export const StreakProvider = ({ children }) => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [streakData, setStreakData] = useState({
    streak_count: 0,
    is_streak_lit_today: false,
    last_submitted_date: null,
  });
  const [globalRewardData, setGlobalRewardData] = useState(null);
  const [isCelebrationDismissed, setIsCelebrationDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (globalRewardData) {
      setIsCelebrationDismissed(false);
    }
  }, [globalRewardData]);

  const fetchStreak = useCallback(async () => {
    if (authLoading) return;

    // Get the latest role from either user object or localStorage to avoid race conditions during login
    const currentRole =
      user?.role || (typeof window !== 'undefined' ? localStorage.getItem('userRole') : null);

    if (!isAuthenticated || currentRole !== 'S') {
      setIsLoading(false);
      return;
    }

    try {
      const res = await getUserStreak();
      setStreakData(res);
    } catch (error) {
      // If we get a 403, it means the user is not authorized (not a student)
      // We handle this silently to avoid annoying error overlays for non-student users
      if (error.status === 403) {
        setIsLoading(false);
        return;
      }
      console.error('Streak fetch error:', error.message || error); // eslint-disable-line no-console
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return (
    <StreakContext.Provider
      value={{
        streakData,
        isLoading,
        refreshStreak: fetchStreak,
        setGlobalRewardData,
        isCelebrationDismissed,
        setIsCelebrationDismissed,
      }}
    >
      {children}
      <StreakRewardOverlay
        rewardData={globalRewardData}
        onClose={() => {
          setGlobalRewardData(null);
          setIsCelebrationDismissed(true);
        }}
      />
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
