import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Filter, Users } from 'lucide-react';
import { Button, ThemeToggle, AdminModeToggle } from '@/shared/components';
import SessionCard from '../components/SessionCard';
import { teamService } from '../services/teamService';
import type { Session, Team } from '../types/team.types';

export default function SessionListPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [teams, setTeams] = useState<Map<string, Team>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showRecruitingOnly, setShowRecruitingOnly] = useState(true);

  async function fetchData() {
    try {
      setLoading(true);
      
      // 세션과 팀 데이터 동시 로드
      const [sessionsData, teamsData] = await Promise.all([
        teamService.listSessions(),
        teamService.listTeams()
      ]);

      setSessions(sessionsData);
      
      // 팀 데이터를 Map으로 변환
      const teamsMap = new Map<string, Team>();
      teamsData.forEach(team => teamsMap.set(team.id, team));
      setTeams(teamsMap);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchData();
  }, []);

  const filteredSessions = sessions.filter(session => {
    if (showRecruitingOnly) {
      return session.status === 'RECRUITING' && 
             session.guestIds.length < session.maxGuests;
    }
    return true;
  }).sort((a, b) => {
    // 날짜순 정렬
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  async function handleApply(sessionId: string) {
    try {
      const currentUserId = localStorage.getItem('currentUserId') || '';
      if (!currentUserId) {
        alert('로그인이 필요합니다');
        return;
      }
      
      // 포지션 선택 (간단히 ANY로 처리, 추후 모달로 개선 가능)
      await teamService.applyAsGuest(
        { sessionId, position: 'ANY' },
        currentUserId
      );
      alert('신청이 완료되었습니다!');
      await fetchData();
    } catch (error: any) {
      alert(error.message || '신청 중 오류가 발생했습니다');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏀</span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                세션 ({filteredSessions.length})
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <AdminModeToggle />
              <ThemeToggle />
              <button
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                title="프로필"
              >
                <Users className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 필터 */}
        <div className="mb-6">
          <button
            onClick={() => setShowRecruitingOnly(!showRecruitingOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              showRecruitingOnly
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            게스트 모집중만 보기
          </button>
        </div>

        {/* 세션 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">세션 목록을 불러오는 중...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {showRecruitingOnly
                ? '현재 게스트를 모집 중인 세션이 없습니다'
                : '등록된 세션이 없습니다'}
            </p>
            <Button onClick={() => navigate('/teams')}>
              팀 둘러보기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => {
              const team = teams.get(session.teamId);
              return (
                <SessionCard
                  key={session.id}
                  session={session}
                  teamName={team?.name}
                  onApply={() => handleApply(session.id)}
                  onViewDetails={() => navigate(`/session/${session.id}`)}
                  showApplyButton={session.status === 'RECRUITING'}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
        <div className="flex items-center justify-around py-3">
          <button
            onClick={() => navigate('/teams')}
            className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs">팀</span>
          </button>
          <button
            onClick={() => navigate('/sessions')}
            className="flex flex-col items-center gap-1 text-black dark:text-white"
          >
            <span className="text-2xl">🏀</span>
            <span className="text-xs">세션</span>
          </button>
          <button
            onClick={() => navigate('/matches')}
            className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400"
          >
            <span className="text-2xl">⚡</span>
            <span className="text-xs">픽업게임</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs">프로필</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
