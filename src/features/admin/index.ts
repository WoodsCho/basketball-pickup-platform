/**
 * Admin Module Public API
 * 관리자 모듈의 공개 인터페이스
 */

// Services
export { adminService } from './services/adminService';

// Hooks
export { useAdminCheck, useAllUsers, useAdminStatistics } from './hooks/useAdmin';

// Pages
export { default as AdminDashboardPage } from './pages/AdminDashboardPage';
