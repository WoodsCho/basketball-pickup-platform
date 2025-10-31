/**
 * App Router
 * 앱 전체 라우팅 설정
 */
import { createBrowserRouter } from 'react-router-dom';
import { MatchListPage, MatchDetailPage, CreateMatchPage } from '@/features/match';
import { AdminDashboardPage } from '@/features/admin';

export const router = createBrowserRouter([
  {
    path: '/',
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
    path: '/admin',
    element: <AdminDashboardPage />,
  },
]);
