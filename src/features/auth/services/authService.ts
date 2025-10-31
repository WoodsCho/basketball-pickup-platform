/**
 * Auth Service
 * 인증 관련 비즈니스 로직
 */
import { apiClient } from '../../../core/api/client';
import type { User } from '../types/auth.types';

export class AuthService {
  /**
   * User 프로필 조회
   */
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data } = await apiClient.models.User.get({ id: userId });
      return data as User | null;
    } catch (error) {
      console.error('[AuthService] Error getting user profile:', error);
      return null;
    }
  }

  /**
   * User 프로필 생성
   */
  async createUserProfile(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User | null> {
    try {
      const { data } = await apiClient.models.User.create(userData);
      return data as User | null;
    } catch (error) {
      console.error('[AuthService] Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * User 프로필 업데이트
   */
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data } = await apiClient.models.User.update({
        id: userId,
        ...updates,
      });
      return data as User | null;
    } catch (error) {
      console.error('[AuthService] Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * 온보딩 체크
   */
  async needsOnboarding(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    return profile === null;
  }
}

export const authService = new AuthService();
