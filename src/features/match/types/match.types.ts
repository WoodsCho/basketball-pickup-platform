/**
 * Match Module Types
 * 매치 관련 타입 정의
 */
import type { Match as BaseMatch } from '../../../shared/types';

export type Match = BaseMatch;

export type MatchStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'COMPLETED';
export type GameType = 'THREE_V_THREE' | 'FIVE_V_FIVE';

export interface MatchFilters {
  status?: MatchStatus;
  gameType?: GameType;
  date?: string;
  courtId?: string;
}

export interface CreateMatchInput {
  title: string;
  courtId: string;
  date: string;
  startTime: string;
  duration: number;
  gameType: GameType;
  levelMin: number;
  levelMax: number;
  maxPlayers: number;
  currentPlayerIds?: string[];
  guardSlots: number;
  forwardSlots: number;
  centerSlots: number;
  pricePerPerson: number;
  status: MatchStatus;
  createdBy?: string;
}

export interface JoinMatchResult {
  success: boolean;
  message?: string;
}
