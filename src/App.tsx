import { useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';

const client = generateClient<Schema>();

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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    checkUserProfile();
  }, [user]);

  const checkUserProfile = async () => {
    try {
      // Cognito userId로 User 테이블 조회
      const { data: profile } = await client.models.User.get({
        id: user.userId
      });

      if (profile) {
        // User 프로필이 이미 존재
        setUserProfile(profile);
        setNeedsOnboarding(false);
      } else {
        // User 프로필이 없음 → 온보딩 필요
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      setNeedsOnboarding(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = (profile: any) => {
    setUserProfile(profile);
    setNeedsOnboarding(false);
  };

  // 로딩 중
  if (loading) {
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
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // 정상 플로우
  return (
    <div>
      <HomePage />
      
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
