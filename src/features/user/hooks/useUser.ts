/**
 * User Hooks
 * 사용자 프로필 관련 React 훅
 */
import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import type { User, Match } from '@/shared/types';

/**
 * 사용자 프로필 훅
 */
export const useUserProfile = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUserProfile(userId);
      setUser(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      void fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { user, loading, error, refetch: fetchUser };
};

/**
 * 사용자 매치 목록 훅
 */
export const useUserMatches = (userId: string) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUserMatches(userId);
      setMatches(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      void fetchMatches();
    }
  }, [userId]);

  return { matches, loading, error, refetch: fetchMatches };
};

/**
 * 사용자 통계 훅
 */
export const useUserStats = (userId: string) => {
  const [stats, setStats] = useState({
    totalMatches: 0,
    upcomingMatches: 0,
    completedMatches: 0,
    createdMatches: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const data = await userService.getUserStats(userId);
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      void fetchStats();
    }
  }, [userId]);

  return { stats, loading, refetch: fetchStats };
};
