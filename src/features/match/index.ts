/**
 * Match Module Public API
 * 매치 모듈의 공개 인터페이스
 */

// Services
export { matchService } from './services/matchService';

// Hooks
export { useMatches, useMatch, useJoinMatch } from './hooks/useMatches';

// Types
export type { 
  Match, 
  MatchStatus, 
  GameType, 
  MatchFilters, 
  CreateMatchInput,
  JoinMatchResult 
} from './types/match.types';

// Components
export { default as MatchCard } from './components/MatchCard';
export { default as MatchListPage } from './pages/MatchListPage';
