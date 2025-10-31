/**
 * Admin Service
 * 관리자 권한 확인 및 관리 기능
 */
import { apiClient } from '@/core/api/client';
import type { User, UserRole } from '@/shared/types';

export class AdminService {
  /**
   * 사용자 권한 확인
   */
  async checkAdminRole(userId: string): Promise<UserRole | null> {
    try {
      const { data } = await apiClient.models.User.get({ id: userId });
      // role이 없으면 기본값 'USER'로 간주
      return (data?.role as UserRole) || 'USER';
    } catch (error) {
      console.error('[AdminService] Error checking admin role:', error);
      return null;
    }
  }

  /**
   * 관리자 여부 확인
   */
  async isAdmin(userId: string): Promise<boolean> {
    const role = await this.checkAdminRole(userId);
    // null이거나 'USER'면 false
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  /**
   * 슈퍼 관리자 여부 확인
   */
  async isSuperAdmin(userId: string): Promise<boolean> {
    const role = await this.checkAdminRole(userId);
    return role === 'SUPER_ADMIN';
  }

  /**
   * 모든 사용자 조회 (관리자 전용)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const { data } = await apiClient.models.User.list();
      return (data as User[]) || [];
    } catch (error) {
      console.error('[AdminService] Error getting users:', error);
      return [];
    }
  }

  /**
   * 모든 매치 조회 (관리자 전용)
   */
  async getAllMatches(): Promise<any[]> {
    try {
      const { data } = await apiClient.models.Match.list();
      return data || [];
    } catch (error) {
      console.error('[AdminService] Error getting matches:', error);
      return [];
    }
  }

  /**
   * 사용자 역할 변경 (슈퍼 관리자 전용)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      await apiClient.models.User.update({
        id: userId,
        role: role,
      });
      return true;
    } catch (error) {
      console.error('[AdminService] Error updating user role:', error);
      return false;
    }
  }

  /**
   * 사용자 삭제 (슈퍼 관리자 전용)
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await apiClient.models.User.delete({ id: userId });
      return true;
    } catch (error) {
      console.error('[AdminService] Error deleting user:', error);
      return false;
    }
  }

  /**
   * 매치 삭제 (관리자)
   */
  async deleteMatch(matchId: string): Promise<boolean> {
    try {
      await apiClient.models.Match.delete({ id: matchId });
      return true;
    } catch (error) {
      console.error('[AdminService] Error deleting match:', error);
      return false;
    }
  }

  /**
   * 통계 조회
   */
  async getStatistics(): Promise<{
    totalUsers: number;
    totalMatches: number;
    totalCourts: number;
    activeMatches: number;
  }> {
    try {
      const [users, matches, courts] = await Promise.all([
        apiClient.models.User.list(),
        apiClient.models.Match.list(),
        apiClient.models.Court.list(),
      ]);

      const activeMatches = matches.data.filter(
        (m: any) => m.status === 'OPEN' || m.status === 'FULL'
      ).length;

      return {
        totalUsers: users.data.length,
        totalMatches: matches.data.length,
        totalCourts: courts.data.length,
        activeMatches,
      };
    } catch (error) {
      console.error('[AdminService] Error getting statistics:', error);
      return {
        totalUsers: 0,
        totalMatches: 0,
        totalCourts: 0,
        activeMatches: 0,
      };
    }
  }

  /**
   * 모든 코트 조회
   */
  async getAllCourts(): Promise<any[]> {
    try {
      const { data } = await apiClient.models.Court.list();
      return data || [];
    } catch (error) {
      console.error('[AdminService] Error getting courts:', error);
      return [];
    }
  }

  /**
   * 코트 추가
   */
  async createCourt(courtData: any): Promise<any | null> {
    try {
      const { data } = await apiClient.models.Court.create(courtData);
      return data;
    } catch (error) {
      console.error('[AdminService] Error creating court:', error);
      throw error;
    }
  }

  /**
   * 코트 수정
   */
  async updateCourt(courtId: string, courtData: any): Promise<boolean> {
    try {
      await apiClient.models.Court.update({
        id: courtId,
        ...courtData,
      });
      return true;
    } catch (error) {
      console.error('[AdminService] Error updating court:', error);
      return false;
    }
  }

  /**
   * 코트 삭제
   */
  async deleteCourt(courtId: string): Promise<boolean> {
    try {
      await apiClient.models.Court.delete({ id: courtId });
      return true;
    } catch (error) {
      console.error('[AdminService] Error deleting court:', error);
      return false;
    }
  }
}

export const adminService = new AdminService();
