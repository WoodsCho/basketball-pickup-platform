/**
 * User Service
 * 사용자 프로필 관련 비즈니스 로직
 */
import { apiClient } from '@/core/api/client';
import type { User, Match } from '@/shared/types';

export class UserService {
  /**
   * 사용자 프로필 조회
   */
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data } = await apiClient.models.User.get({ id: userId });
      return data as User | null;
    } catch (error) {
      console.error('[UserService] Error getting user profile:', error);
      return null;
    }
  }

  /**
   * 사용자 프로필 업데이트
   */
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      await apiClient.models.User.update({
        id: userId,
        ...updates,
      });
      return true;
    } catch (error) {
      console.error('[UserService] Error updating user profile:', error);
      return false;
    }
  }

  /**
   * 사용자가 참가한 매치 목록 조회
   */
  async getUserMatches(userId: string): Promise<Match[]> {
    try {
      const { data } = await apiClient.models.Match.list();
      // 사용자가 참가한 매치 필터링
      const userMatches = data
        .filter((match: any) => match.currentPlayerIds?.includes(userId))
        .map(match => ({
          ...match,
          currentPlayers: match.currentPlayerIds || [],
        }));
      return userMatches as Match[];
    } catch (error) {
      console.error('[UserService] Error getting user matches:', error);
      return [];
    }
  }

  /**
   * 사용자가 생성한 매치 목록 조회
   */
  async getUserCreatedMatches(userId: string): Promise<Match[]> {
    try {
      const { data } = await apiClient.models.Match.list({
        filter: {
          createdBy: { eq: userId }
        }
      });
      return data.map(match => ({
        ...match,
        currentPlayers: match.currentPlayerIds || [],
      })) as Match[];
    } catch (error) {
      console.error('[UserService] Error getting user created matches:', error);
      return [];
    }
  }

  /**
   * 사용자 통계 계산
   */
  async getUserStats(userId: string): Promise<{
    totalMatches: number;
    upcomingMatches: number;
    completedMatches: number;
    createdMatches: number;
  }> {
    try {
      const [participatedMatches, createdMatches] = await Promise.all([
        this.getUserMatches(userId),
        this.getUserCreatedMatches(userId),
      ]);

      const now = new Date();
      const upcomingMatches = participatedMatches.filter(
        (m) => new Date(m.date) >= now && m.status !== 'COMPLETED'
      );
      const completedMatches = participatedMatches.filter(
        (m) => m.status === 'COMPLETED'
      );

      return {
        totalMatches: participatedMatches.length,
        upcomingMatches: upcomingMatches.length,
        completedMatches: completedMatches.length,
        createdMatches: createdMatches.length,
      };
    } catch (error) {
      console.error('[UserService] Error calculating user stats:', error);
      return {
        totalMatches: 0,
        upcomingMatches: 0,
        completedMatches: 0,
        createdMatches: 0,
      };
    }
  }
}

export const userService = new UserService();
