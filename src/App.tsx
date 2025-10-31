import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <HomePage />
          {/* Debug info - remove later */}
          <div className="fixed bottom-20 right-4 bg-white p-4 rounded-lg shadow-lg text-xs md:bottom-4">
            <p className="font-bold">로그인: {user?.signInDetails?.loginId}</p>
            <button 
              onClick={signOut}
              className="mt-2 text-red-600 hover:underline"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
