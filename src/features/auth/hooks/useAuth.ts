/**
 * useAuth Hook
 * 인증 관련 상태 및 로직 관리
 */
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User, CognitoUser, OnboardingData } from '../types/auth.types';

export function useAuth(cognitoUser: CognitoUser | null) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const checkUserProfile = async () => {
    if (!cognitoUser) return;

    try {
      setLoading(true);
      const profile = await authService.getUserProfile(cognitoUser.userId);

      if (profile) {
        setUser(profile);
        setNeedsOnboarding(false);
      } else {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('[useAuth] Error checking profile:', error);
      setNeedsOnboarding(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cognitoUser) {
      void checkUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cognitoUser]);

  const completeOnboarding = async (data: OnboardingData): Promise<boolean> => {
    if (!cognitoUser) return false;

    try {
      const newProfile = await authService.createUserProfile({
        id: cognitoUser.userId,
        email: cognitoUser.signInDetails?.loginId || '',
        name: data.name,
        phone: data.phone,
        position: data.position,
        level: data.level,
        totalMatches: 0,
        totalRating: 0,
        attendanceRate: 100,
        noShowCount: 0,
      });

      if (newProfile) {
        setUser(newProfile);
        setNeedsOnboarding(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[useAuth] Error completing onboarding:', error);
      return false;
    }
  };

  return {
    user,
    loading,
    needsOnboarding,
    completeOnboarding,
    refreshProfile: checkUserProfile,
  };
}
