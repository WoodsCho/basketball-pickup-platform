import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useAuth, OnboardingPage } from '@/features/auth';
import { MatchListPage } from '@/features/match';
import { AdminDashboardPage, useAdminCheck } from '@/features/admin';

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

  // 관리자 페이지
  if (isAdmin) {
    return <AdminDashboardPage />;
  }

  // 일반 사용자 플로우
  return (
    <div>
      <MatchListPage />
      
      {/* 디버그 정보 */}
      <div className="fixed bottom-20 right-4 bg-white p-4 rounded-lg shadow-lg text-xs md:bottom-4">
        <p className="font-bold">사용자 정보</p>
        <p className="text-gray-600">이메일: {user.signInDetails?.loginId}</p>
        <p className="text-gray-600">이름: {userProfile?.name}</p>
        <p className="text-gray-600">레벨: {userProfile?.level}</p>
        <p className="text-gray-600">포지션: {userProfile?.position}</p>
        <button 
          onClick={signOut}
          className="mt-2 text-red-600 hover:underline text-sm"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default App;
