/**
 * Admin Mode Toggle
 * 관리자 모드 전환 버튼
 */
import { Shield, Users } from 'lucide-react';
import { useAdminMode } from '@/features/admin';
import { useAdminCheck } from '@/features/admin/hooks/useAdmin';

export default function AdminModeToggle() {
  const { isAdminMode, toggleAdminMode } = useAdminMode();
  const currentUserId = localStorage.getItem('currentUserId') || '';
  const { isAdmin } = useAdminCheck(currentUserId);

  // 관리자가 아니면 표시하지 않음
  if (!isAdmin) return null;

  return (
    <button
      onClick={toggleAdminMode}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={isAdminMode ? '일반 모드로 전환' : '관리자 모드로 전환'}
    >
      {isAdminMode ? (
        <Shield className="w-5 h-5 text-black dark:text-white" />
      ) : (
        <Users className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
}
