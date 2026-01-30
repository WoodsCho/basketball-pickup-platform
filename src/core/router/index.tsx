/**
 * App Router
 * 앱 전체 라우팅 설정
 */
import { createBrowserRouter } from 'react-router-dom';
import { MatchListPage, MatchDetailPage, CreateMatchPage } from '@/features/match';
import { AdminDashboardPage, CourtManagementPage } from '@/features/admin';
import { ProfilePage } from '@/features/user';
import TeamListPage from '@/features/team/pages/TeamListPage';
import SessionListPage from '@/features/team/pages/SessionListPage';
import CreateTeamPage from '@/features/team/pages/CreateTeamPage';
import TeamDetailPage from '@/features/team/pages/TeamDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <TeamListPage />, // 팀 리스트를 메인 페이지로
  },
  {
    path: '/teams',
    element: <TeamListPage />,
  },
  {
    path: '/team/create',
    element: <CreateTeamPage />,
  },
  {
    path: '/team/:teamId',
    element: <TeamDetailPage />,
  },
  {
    path: '/sessions',
    element: <SessionListPage />,
  },
  {
    path: '/matches', // 기존 픽업 게임은 하위 경로로
    element: <MatchListPage />,
  },
  {
    path: '/match/create',
    element: <CreateMatchPage />,
  },
  {
    path: '/match/:matchId',
    element: <MatchDetailPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/admin',
    element: <AdminDashboardPage />,
  },
  {
    path: '/admin/courts',
    element: <CourtManagementPage />,
  },
]);
