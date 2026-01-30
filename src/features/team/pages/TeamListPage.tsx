import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Users } from 'lucide-react';
import { Button, Input, ThemeToggle, AdminModeToggle, AdBanner } from '@/shared/components';
import TeamCard from '../components/TeamCard';
import { teamService } from '../services/teamService';
import type { Team } from '../types/team.types';

export default function TeamListPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecruitingOnly, setShowRecruitingOnly] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  async function fetchTeams() {
    try {
      setLoading(true);
      const data = await teamService.listTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Get current user ID from localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(userId);
    }
    void fetchTeams();
  }, []);

  // Separate user's teams and other teams
  const myTeams = teams.filter((team) => 
    currentUserId && team.memberIds?.includes(currentUserId)
  );

  const otherTeams = teams.filter((team) => 
    !currentUserId || !team.memberIds?.includes(currentUserId)
  );

  // Apply filters to both myTeams and otherTeams
  const filteredMyTeams = myTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRecruiting = !showRecruitingOnly || team.memberIds.length < team.maxMembers;
    return matchesSearch && matchesRecruiting;
  });

  const filteredOtherTeams = otherTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRecruiting = !showRecruitingOnly || team.memberIds.length < team.maxMembers;
    return matchesSearch && matchesRecruiting;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏀</span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">정기 농구 팀</h1>
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
        {/* 검색 및 필터 */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="팀 이름으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/team/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              팀 만들기
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRecruitingOnly(!showRecruitingOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                showRecruitingOnly
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              팀원 모집중만 보기
            </button>
          </div>
        </div>

        {/* 광고 배너 */}
        <AdBanner />

        {/* 팀 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">팀 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 내 팀 섹션 */}
            {filteredMyTeams.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    내 팀 ({filteredMyTeams.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMyTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      onClick={() => navigate(`/team/${team.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 모든 팀 섹션 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {filteredMyTeams.length > 0 ? '다른 팀' : '모든 팀'} ({filteredOtherTeams.length})
                </h2>
              </div>
              {filteredOtherTeams.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchQuery || showRecruitingOnly
                      ? '검색 결과가 없습니다'
                      : '등록된 팀이 없습니다'}
                  </p>
                  {filteredMyTeams.length === 0 && (
                    <Button onClick={() => navigate('/team/create')}>
                      첫 팀 만들기
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOtherTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      onClick={() => navigate(`/team/${team.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
        <div className="flex items-center justify-around py-3">
          <button
            onClick={() => navigate('/teams')}
            className="flex flex-col items-center gap-1 text-black dark:text-white"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs">팀</span>
          </button>
          <button
            onClick={() => navigate('/sessions')}
            className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400"
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
