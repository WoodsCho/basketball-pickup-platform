/**
 * 프로필 페이지
 * 사용자의 프로필 정보, 통계, 매치 히스토리 표시
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Calendar, 
  Trophy, 
  Target, 
  Users,
  Save,
  X
} from 'lucide-react';
import { useUserProfile, useUserStats, useUserMatches } from '../hooks/useUser';
import { userService } from '../services/userService';
import { teamService } from '@/features/team/services/teamService';
import Button from '@/shared/components/Button';
import { Card, AdminModeToggle, ThemeToggle } from '@/shared/components';
import { getPositionLabel, getLevelLabel } from '@/shared/types';
import type { Position } from '@/shared/types';
import type { Team } from '@/features/team/types/team.types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('currentUserId') || '';
  const { user, loading: userLoading, refetch } = useUserProfile(userId);
  const { stats, loading: statsLoading } = useUserStats(userId);
  const { matches, loading: matchesLoading } = useUserMatches(userId);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    position: 'GUARD' as Position,
    level: 1500,
  });

  useEffect(() => {
    loadMyTeams();
  }, [userId]);

  async function loadMyTeams() {
    try {
      setTeamsLoading(true);
      const allTeams = await teamService.listTeams();
      // 내가 멤버인 팀 필터링
      const myTeamsList = allTeams.filter(team => team.memberIds.includes(userId));
      setMyTeams(myTeamsList);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setTeamsLoading(false);
    }
  }

  const handleEditClick = () => {
    if (user) {
      setEditForm({
        name: user.name,
        phone: user.phone,
        position: user.position,
        level: user.level,
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      const success = await userService.updateUserProfile(userId, editForm);
      if (success) {
        alert('프로필이 업데이트되었습니다!');
        setIsEditing(false);
        refetch();
      } else {
        alert('프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 로딩 상태
  if (userLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👤</span>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">프로필</h1>
              </div>
              <div className="flex items-center gap-2">
                <AdminModeToggle />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👤</span>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">프로필</h1>
              </div>
              <div className="flex items-center gap-2">
                <AdminModeToggle />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">사용자 정보를 찾을 수 없습니다.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 다가오는 매치
  const upcomingMatches = matches
    .filter(m => new Date(m.date) >= new Date() && m.status !== 'COMPLETED')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👤</span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">프로필</h1>
            </div>
            <div className="flex items-center gap-2">
              <AdminModeToggle />
              <ThemeToggle />
              {!isEditing && (
                <Button onClick={handleEditClick} className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  수정
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      전화번호
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      포지션
                    </label>
                    <select
                      value={editForm.position}
                      onChange={(e) => setEditForm({ ...editForm, position: e.target.value as Position })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="GUARD">가드</option>
                      <option value="FORWARD">포워드</option>
                      <option value="CENTER">센터</option>
                      <option value="ALL_ROUND">올라운드</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      레벨: {editForm.level} ({getLevelLabel(editForm.level)})
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="3000"
                      step="100"
                      value={editForm.level}
                      onChange={(e) => setEditForm({ ...editForm, level: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>초급 (1000)</span>
                      <span>중급 (2000)</span>
                      <span>프로 (3000)</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      <X className="w-4 h-4 mr-1" />
                      취소
                    </Button>
                    <Button onClick={handleSaveEdit} className="flex-1">
                      <Save className="w-4 h-4 mr-1" />
                      저장
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600 mt-1">{user.email}</p>
                  <p className="text-gray-600">{user.phone}</p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 bg-gray-800 text-white dark:bg-gray-200 dark:text-black rounded-full text-sm font-medium">
                      {getPositionLabel(user.position)}
                    </span>
                    <span className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-full text-sm font-medium">
                      {getLevelLabel(user.level)} (Lv.{user.level})
                    </span>
                    {user.role && user.role !== 'USER' && (
                      <span className="px-3 py-1 bg-gray-900 text-white dark:bg-gray-100 dark:text-black rounded-full text-sm font-medium">
                        {user.role === 'ADMIN' ? '관리자' : '슈퍼 관리자'}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <Calendar className="w-8 h-8 text-black dark:text-white mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalMatches}</p>
            <p className="text-sm text-gray-600">총 매치</p>
          </Card>

          <Card className="p-4 text-center">
            <Users className="w-8 h-8 text-black dark:text-white mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.upcomingMatches}</p>
            <p className="text-sm text-gray-600">예정된 매치</p>
          </Card>

          <Card className="p-4 text-center">
            <Trophy className="w-8 h-8 text-black dark:text-white mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.completedMatches}</p>
            <p className="text-sm text-gray-600">완료된 매치</p>
          </Card>

          <Card className="p-4 text-center">
            <Target className="w-8 h-8 text-black dark:text-white mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.createdMatches}</p>
            <p className="text-sm text-gray-600">생성한 매치</p>
          </Card>
        </div>

        {/* 내 팀 목록 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">내 팀</h2>
            <Button
              size="sm"
              onClick={() => navigate('/teams')}
            >
              팀 찾기
            </Button>
          </div>

          {teamsLoading ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
            </Card>
          ) : myTeams.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                아직 가입한 팀이 없습니다
              </p>
              <Button onClick={() => navigate('/teams')}>
                팀 찾아보기
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myTeams.map((team) => (
                <Card
                  key={team.id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/team/${team.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {team.name}
                      </h3>
                      {team.captainId === userId && (
                        <span className="inline-block px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium mt-1">
                          주장
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      team.status === 'RECRUITING' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {team.status === 'RECRUITING' ? '모집 중' : team.status === 'ACTIVE' ? '활동 중' : '비활성'}
                    </span>
                  </div>
                  
                  {team.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {team.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{team.memberIds.length}/{team.maxMembers}명</span>
                    </div>
                    <div>
                      레벨 {team.level}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Matches */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">다가오는 매치</h2>
            {upcomingMatches.length > 0 && (
              <button className="text-primary-600 text-sm hover:underline">
                전체보기
              </button>
            )}
          </div>

          {matchesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : upcomingMatches.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">예정된 매치가 없습니다.</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                매치 찾아보기
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <Card 
                  key={match.id} 
                  className="p-4 cursor-pointer hover:shadow-md transition"
                  onClick={() => navigate(`/match/${match.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{match.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(match.date).toLocaleDateString('ko-KR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {match.currentPlayers.length}/{match.maxPlayers}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      match.status === 'OPEN' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {match.status === 'OPEN' ? '모집중' : '마감임박'}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Account Info */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">계정 정보</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">참가율</span>
              <span className="font-medium">{user.attendanceRate}%</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">노쇼 횟수</span>
              <span className="font-medium">{user.noShowCount}회</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">평균 평점</span>
              <span className="font-medium">
                {user.totalRating > 0 
                  ? (user.totalRating / user.totalMatches).toFixed(1) 
                  : 'N/A'} ⭐
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">가입일</span>
              <span className="font-medium">
                {new Date(user.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </Card>
      </div>

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
            className="flex flex-col items-center gap-1 text-black dark:text-white"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs">프로필</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
