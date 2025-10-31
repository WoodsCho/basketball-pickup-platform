/**
 * Admin Hooks
 * 관리자 기능 React 훅
 */
import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import type { User, UserRole } from '@/shared/types';

/**
 * 관리자 권한 확인 훅
 */
export const useAdminCheck = (userId: string) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  const checkRole = async () => {
    setLoading(true);
    const userRole = await adminService.checkAdminRole(userId);
    setRole(userRole);
    setIsAdmin(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN');
    setIsSuperAdmin(userRole === 'SUPER_ADMIN');
    setLoading(false);
  };

  useEffect(() => {
    void checkRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { isAdmin, isSuperAdmin, role, loading, refetch: checkRole };
};

/**
 * 전체 사용자 목록 훅
 */
export const useAllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
};

/**
 * 관리자 통계 훅
 */
export const useAdminStatistics = () => {
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalMatches: 0,
    totalCourts: 0,
    activeMatches: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    setLoading(true);
    const stats = await adminService.getStatistics();
    setStatistics(stats);
    setLoading(false);
  };

  useEffect(() => {
    void fetchStatistics();
  }, []);

  return { statistics, loading, refetch: fetchStatistics };
};
