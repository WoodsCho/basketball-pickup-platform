/**
 * Match Service
 * 매치 관련 비즈니스 로직
 */
import { apiClient } from '../../../core/api/client';
import type { Match, MatchFilters, CreateMatchInput } from '../types/match.types';

export class MatchService {
  /**
   * 매치 리스트 조회
   */
  async getMatches(filters?: MatchFilters): Promise<Match[]> {
    try {
      const { data } = await apiClient.models.Match.list({
        filter: filters ? this.buildFilter(filters) : undefined,
      });
      // Transform DB format to Match type
      return (data.map(match => ({
        ...match,
        currentPlayers: match.currentPlayerIds || [],
      })) as Match[]) || [];
    } catch (error) {
      console.error('[MatchService] Error getting matches:', error);
      return [];
    }
  }

  /**
   * 특정 매치 조회
   */
  async getMatch(id: string): Promise<Match | null> {
    try {
      const { data } = await apiClient.models.Match.get({ id });
      return data as Match | null;
    } catch (error) {
      console.error('[MatchService] Error getting match:', error);
      return null;
    }
  }

  /**
   * 매치 생성
   */
  async createMatch(input: CreateMatchInput): Promise<Match | null> {
    try {
      const { data } = await apiClient.models.Match.create(input);
      return data as Match | null;
    } catch (error) {
      console.error('[MatchService] Error creating match:', error);
      throw error;
    }
  }

  /**
   * 매치 참가
   */
  async joinMatch(matchId: string, userId: string): Promise<boolean> {
    try {
      // 현재 매치 정보 조회
      const match = await this.getMatch(matchId);
      if (!match) return false;

      // 이미 참가했는지 확인
      if (match.currentPlayers.includes(userId)) {
        return false;
      }

      // 인원 초과 확인
      if (match.currentPlayers.length >= match.maxPlayers) {
        return false;
      }

      // 참가자 추가
      const updatedPlayers = [...match.currentPlayers, userId];
      const newStatus = updatedPlayers.length >= match.maxPlayers ? 'FULL' : match.status;

      await apiClient.models.Match.update({
        id: matchId,
        currentPlayerIds: updatedPlayers,
        status: newStatus,
      });

      return true;
    } catch (error) {
      console.error('[MatchService] Error joining match:', error);
      return false;
    }
  }

  /**
   * 필터 빌드
   */
  private buildFilter(filters: MatchFilters) {
    const filter: any = {};

    if (filters.status) {
      filter.status = { eq: filters.status };
    }

    if (filters.gameType) {
      filter.gameType = { eq: filters.gameType };
    }

    if (filters.date) {
      filter.date = { eq: filters.date };
    }

    return filter;
  }
}

export const matchService = new MatchService();
