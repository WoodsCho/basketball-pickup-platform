import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useAuth, OnboardingPage } from '@/features/auth';
import { MatchListPage, MatchDetailPage, CreateMatchPage } from '@/features/match';
import { AdminDashboardPage, CourtManagementPage, useAdminCheck } from '@/features/admin';
import { useEffect, useState } from 'react';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <AppContent user={user} signOut={signOut} />
      )}
    </Authenticator>
  );
}

function AppContent({ user, signOut }: { user: any; signOut?: any }) {
  const { user: userProfile, loading, needsOnboarding, completeOnboarding } = useAuth(user);
  const { isAdmin, loading: adminLoading } = useAdminCheck(user?.userId || '');
  const [router, setRouter] = useState<ReturnType<typeof createBrowserRouter> | null>(null);

  // 사용자 ID를 localStorage에 저장 (MatchDetailPage에서 사용)
  useEffect(() => {
    if (user?.userId) {
      localStorage.setItem('currentUserId', user.userId);
    }
  }, [user]);

  // 라우터 생성 (사용자 정보와 함께)
  useEffect(() => {
    if (!loading && !adminLoading && !needsOnboarding) {
      const userRouter = createBrowserRouter([
        {
          path: '/',
          element: isAdmin ? <AdminDashboardPage /> : <MatchListPage />,
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
        {
          path: '/admin/courts',
          element: <CourtManagementPage />,
        },
      ]);
      setRouter(userRouter);
    }
  }, [loading, adminLoading, needsOnboarding, isAdmin]);

  // 로딩 중
  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 온보딩 필요
  if (needsOnboarding) {
    return (
      <OnboardingPage
        cognitoUser={user}
        onComplete={completeOnboarding}
      />
    );
  }

  // 관리자 또는 일반 사용자 플로우
  if (router) {
    return (
      <>
        <RouterProvider router={router} />
        
        {/* 디버그 정보 */}
        <div className="fixed bottom-20 right-4 bg-white p-4 rounded-lg shadow-lg text-xs md:bottom-4 z-50">
          <p className="font-bold">사용자 정보</p>
          <p className="text-gray-600">이메일: {user.signInDetails?.loginId}</p>
          <p className="text-gray-600">이름: {userProfile?.name}</p>
          <p className="text-gray-600">레벨: {userProfile?.level}</p>
          <p className="text-gray-600">포지션: {userProfile?.position}</p>
          <p className="text-gray-600">역할: {userProfile?.role || 'USER'}</p>
          <button 
            onClick={signOut}
            className="mt-2 text-red-600 hover:underline text-sm"
          >
            로그아웃
          </button>
        </div>
      </>
    );
  }

  // 폴백
  return null;
}

export default App;
