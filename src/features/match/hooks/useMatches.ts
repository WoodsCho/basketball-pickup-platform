/**
 * Match Hooks
 * 매치 관련 React 훅
 */
import { useState, useEffect } from 'react';
import { matchService } from '../services/matchService';
import type { Match, MatchFilters } from '../types/match.types';

/**
 * 매치 리스트 훅
 */
export const useMatches = (filters?: MatchFilters) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await matchService.getMatches(filters);
      setMatches(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [JSON.stringify(filters)]);

  return { matches, loading, error, refetch: fetchMatches };
};

/**
 * 매치 상세 훅
 */
export const useMatch = (id: string) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await matchService.getMatch(id);
      setMatch(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMatch();
    }
  }, [id]);

  return { match, loading, error, refetch: fetchMatch };
};

/**
 * 매치 참가 훅
 */
export const useJoinMatch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const joinMatch = async (matchId: string, userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await matchService.joinMatch(matchId, userId);
      return success;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { joinMatch, loading, error };
};
