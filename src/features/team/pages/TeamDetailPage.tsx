import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Trophy, Star, Plus, X, Settings, Trash2 } from 'lucide-react';
import { Button, Card } from '@/shared/components';
import { teamService } from '../services/teamService';
import { authService } from '@/features/auth/services/authService';
import type { Team, Session, TeamJoinRequest, Position } from '../types/team.types';
import type { User } from '@/features/auth/types/auth.types';

const DAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const POSITIONS: { value: Position; label: string; description: string }[] = [
  { value: 'GUARD', label: '가드', description: '볼 핸들링과 외곽 슛' },
  { value: 'FORWARD', label: '포워드', description: '중거리 슛과 리바운드' },
  { value: 'CENTER', label: '센터', description: '골 밑 플레이와 수비' },
  { value: 'FLEX', label: '올라운더', description: '여러 포지션 가능' },
];

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [joinRequests, setJoinRequests] = useState<TeamJoinRequest[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    position: 'FLEX' as Position,
    message: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (teamId) {
      loadTeamData();
    }
  }, [teamId]);

  async function loadTeamData() {
    try {
      setLoading(true);
      console.log('[TeamDetailPage] Loading team:', teamId);
      const teamData = await teamService.getTeam(teamId!);
      console.log('[TeamDetailPage] Team data received:', teamData);
      setTeam(teamData);

      if (teamData) {
        // 팀의 세션 목록 가져오기
        const allSessions = await teamService.listSessions();
        console.log('[TeamDetailPage] Sessions received:', allSessions);
        const teamSessions = allSessions.filter(s => s.teamId === teamId);
        setSessions(teamSessions);

        // 팀장인 경우 가입 신청 목록 가져오기
        const currentUserId = localStorage.getItem('currentUserId') || '';
        console.log('[TeamDetailPage] Current user ID:', currentUserId);
        console.log('[TeamDetailPage] Captain ID:', teamData.captainId);
        console.log('[TeamDetailPage] Is captain?', teamData.captainId === currentUserId);
        
        let requests: TeamJoinRequest[] = [];
        if (teamData.captainId === currentUserId) {
          console.log('[TeamDetailPage] Loading join requests for team:', teamId);
          requests = await teamService.getTeamJoinRequests(teamId!);
          console.log('[TeamDetailPage] Join requests received:', requests);
          setJoinRequests(requests);
        }

        // 모든 관련 유저 정보 가져오기
        const allUserIds = [
          ...teamData.memberIds,
          ...requests.map((req: TeamJoinRequest) => req.userId)
        ];
        const uniqueUserIds = [...new Set(allUserIds)];
        
        const usersData: Record<string, User> = {};
        await Promise.all(
          uniqueUserIds.map(async (userId) => {
            const user = await authService.getUserProfile(userId);
            if (user) {
              usersData[userId] = user;
            }
          })
        );
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading team:', error);
      alert('팀 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">팀을 찾을 수 없습니다</p>
          <Button onClick={() => navigate('/teams')}>팀 목록으로</Button>
        </div>
      </div>
    );
  }

  const currentUserId = localStorage.getItem('currentUserId') || '';
  const isCaptain = team.captainId === currentUserId;
  const isMember = team.memberIds.includes(currentUserId);
  
  console.log('[TeamDetailPage] Auth check:', {
    currentUserId,
    captainId: team.captainId,
    isCaptain,
    isMember
  });

  const handleDeleteTeam = async () => {
    if (!window.confirm('정말로 팀을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setDeleting(true);
      await teamService.deleteTeam(teamId!, currentUserId);
      alert('팀이 삭제되었습니다');
      navigate('/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('팀 삭제에 실패했습니다');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">팀 프로필</h1>
            </div>
            {isCaptain && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/teams/${teamId}/edit`)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  title="팀 정보 수정"
                >
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  title="팀 삭제"
                >
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 팀 정보 카드 */}
        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {team.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {team.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < team.level
                              ? 'fill-gray-800 text-gray-800 dark:fill-gray-200 dark:text-gray-200'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">레벨 {team.level}</span>
                  </div>
                </div>
              </div>
              {team.status === 'RECRUITING' && (
                <span className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-full text-sm font-medium">
                  팀원 모집중
                </span>
              )}
            </div>

            {team.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">{team.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="w-5 h-5" />
                <span>
                  {team.memberIds.length} / {team.maxMembers}명
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Trophy className="w-5 h-5" />
                <span>
                  {team.wins}승 {team.losses}패
                </span>
              </div>
            </div>

            {/* 정기 일정 */}
            {team.regularSchedule && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-black dark:text-white" />
                  <span className="font-semibold text-gray-900 dark:text-white">정기 일정</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  매주 {DAY_NAMES[team.regularSchedule.dayOfWeek]} {team.regularSchedule.startTime}
                  {' '}({team.regularSchedule.duration}분)
                </p>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="mt-6 flex gap-3">
              {isCaptain && (
                <Button
                  onClick={() => navigate(`/team/${teamId}/session/create`)}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  세션 만들기
                </Button>
              )}
              {!isMember && team.status === 'RECRUITING' && (
                <Button
                  onClick={() => setShowApplyModal(true)}
                  className="flex-1"
                >
                  팀 가입 신청
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* 디버깅: 가입 신청 상태 표시 */}
        {isCaptain && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              🔍 디버그 정보 (팀장 전용)
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              • 팀장 여부: {isCaptain ? '예' : '아니오'}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              • 가입 신청 수: {joinRequests.length}개
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              • currentUserId: {localStorage.getItem('currentUserId') || '없음'}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              • captainId: {team.captainId}
            </p>
          </Card>
        )}

        {/* 팀장 전용: 가입 신청 관리 */}
        {isCaptain && joinRequests.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              가입 신청 ({joinRequests.length})
            </h3>
            <Card>
              <div className="p-4 space-y-3">
                {joinRequests.map((request) => {
                  const user = users[request.userId];
                  return (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user ? user.name : '로딩 중...'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          포지션: {request.position}
                        </p>
                        {request.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {request.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          신청일: {new Date(request.appliedAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              const userId = localStorage.getItem('currentUserId') || '';
                              await teamService.approveTeamJoinRequest(request.id, userId);
                              alert('가입 신청을 승인했습니다!');
                              loadTeamData();
                            } catch (error: any) {
                              alert(error.message || '승인 중 오류가 발생했습니다');
                            }
                          }}
                        >
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const userId = localStorage.getItem('currentUserId') || '';
                              await teamService.rejectTeamJoinRequest(request.id, userId);
                              alert('가입 신청을 거절했습니다!');
                              loadTeamData();
                            } catch (error: any) {
                              alert(error.message || '거절 중 오류가 발생했습니다');
                            }
                          }}
                        >
                          거절
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* 예정된 세션 */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            예정된 세션 ({sessions.length})
          </h3>
          
          {sessions.length === 0 ? (
            <Card>
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  아직 예정된 세션이 없습니다
                </p>
                {isCaptain && (
                  <p className="text-sm text-gray-400 mt-2">
                    세션을 만들어 게스트를 모집해보세요
                  </p>
                )}
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card 
                  key={session.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/session/${session.id}`)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(session.date).toLocaleDateString('ko-KR', {
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          session.status === 'CONFIRMED'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : session.status === 'CANCELLED'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {session.status === 'CONFIRMED' ? '확정' : 
                         session.status === 'CANCELLED' ? '취소' : '모집중'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>참가자: {session.confirmedMemberIds.length + session.guestIds.length}명</span>
                      {session.neededGuests > 0 && (
                        <span className="text-orange-600 dark:text-orange-400">
                          게스트 {session.neededGuests}명 필요
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 팀원 목록 */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            팀원 ({team.memberIds.length})
          </h3>
          <Card>
            <div className="p-4">
              <div className="space-y-3">
                {team.memberIds.map((memberId) => {
                  const user = users[memberId];
                  return (
                    <div
                      key={memberId}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user ? user.name : '로딩 중...'}
                          </p>
                          {memberId === team.captainId && (
                            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                              주장
                            </span>
                          )}
                        </div>
                      </div>
                      {isCaptain && memberId !== team.captainId && (
                        <button
                          onClick={async () => {
                            if (!confirm(`${user?.name || '이 멤버'}를 팀에서 탈퇴시키시겠습니까?`)) return;
                            try {
                              const userId = localStorage.getItem('currentUserId') || '';
                              await teamService.removeTeamMember(teamId!, memberId, userId);
                              alert('멤버를 탈퇴시켰습니다');
                              loadTeamData();
                            } catch (error: any) {
                              alert(error.message || '멤버 제거 중 오류가 발생했습니다');
                            }
                          }}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          탈퇴
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* 팀 가입 신청 모달 */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">팀 가입 신청</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 포지션 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  선호 포지션 *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos.value}
                      onClick={() => setApplyForm({ ...applyForm, position: pos.value })}
                      className={`p-3 rounded-lg border-2 transition text-left ${
                        applyForm.position === pos.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">{pos.label}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{pos.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 메시지 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  간단한 자기소개
                </label>
                <textarea
                  value={applyForm.message}
                  onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })}
                  placeholder="예: 매주 농구하는 직장인입니다. 주로 가드 포지션을 합니다!"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const userId = localStorage.getItem('currentUserId') || '';
                      await teamService.applyToTeam({
                        teamId: teamId!,
                        position: applyForm.position,
                        message: applyForm.message || '팀에 가입하고 싶습니다!'
                      }, userId);
                      alert('팀 가입 신청이 완료되었습니다!');
                      setShowApplyModal(false);
                      setApplyForm({ position: 'FLEX', message: '' });
                      loadTeamData();
                    } catch (error: any) {
                      alert(error.message || '팀 가입 신청 중 오류가 발생했습니다');
                    }
                  }}
                  className="flex-1"
                >
                  신청하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    팀 삭제
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    이 작업은 되돌릴 수 없습니다
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                정말로 <strong className="font-bold">{team.name}</strong> 팀을 삭제하시겠습니까?
                <br />팀의 모든 데이터가 영구적으로 삭제됩니다.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleDeleteTeam}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? '삭제 중...' : '삭제'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
