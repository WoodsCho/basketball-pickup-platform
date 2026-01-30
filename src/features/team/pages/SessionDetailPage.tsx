import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, DollarSign, Clock, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button, Card } from '@/shared/components';
import { teamService } from '../services/teamService';
import { authService } from '@/features/auth/services/authService';
import type { Session, Team, GuestApplication } from '../types/team.types';
import type { User } from '@/features/auth/types/auth.types';

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [applications, setApplications] = useState<GuestApplication[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId]);

  async function loadSessionData() {
    try {
      setLoading(true);
      const sessionData = await teamService.getSession(sessionId!);
      if (sessionData) {
        setSession(sessionData);
        
        // 팀 정보 가져오기
        const teamData = await teamService.getTeam(sessionData.teamId);
        setTeam(teamData);

        // 게스트 신청 목록 가져오기
        const apps = await teamService.getGuestApplications(sessionId!);
        console.log('[SessionDetailPage] Guest applications:', apps);
        setApplications(apps);

        // 모든 관련 유저 정보 가져오기
        const allUserIds = [
          ...sessionData.confirmedMemberIds,
          ...sessionData.guestIds,
          ...sessionData.pendingGuestIds,
          ...apps.map(app => app.userId)
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
      console.error('Error loading session:', error);
      alert('세션 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyAsGuest() {
    try {
      const userId = localStorage.getItem('currentUserId') || '';
      await teamService.applyAsGuest({
        sessionId: sessionId!,
        position: 'ANY',
      }, userId);
      alert('게스트 신청이 완료되었습니다!');
      loadSessionData();
    } catch (error: any) {
      console.error('Error applying as guest:', error);
      alert(error.message || '게스트 신청 중 오류가 발생했습니다');
    }
  }

  async function handleDeleteSession() {
    if (!confirm('정말 이 세션을 삭제하시겠습니까?')) return;
    
    try {
      const userId = localStorage.getItem('currentUserId') || '';
      await teamService.deleteSession(sessionId!, userId);
      alert('세션이 삭제되었습니다!');
      navigate(`/team/${team?.id}`);
    } catch (error: any) {
      console.error('Error deleting session:', error);
      alert(error.message || '세션 삭제 중 오류가 발생했습니다');
    }
  }

  async function handleChangeStatus(newStatus: 'RECRUITING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') {
    try {
      const userId = localStorage.getItem('currentUserId') || '';
      await teamService.updateSessionStatus(sessionId!, newStatus, userId);
      alert('세션 상태가 변경되었습니다!');
      loadSessionData();
    } catch (error: any) {
      console.error('Error changing status:', error);
      alert(error.message || '상태 변경 중 오류가 발생했습니다');
    }
  }

  async function handleApproveGuest(applicationId: string) {
    try {
      const userId = localStorage.getItem('currentUserId') || '';
      await teamService.approveGuest(applicationId, userId);
      alert('게스트 신청을 승인했습니다!');
      loadSessionData();
    } catch (error: any) {
      console.error('Error approving guest:', error);
      alert(error.message || '승인 중 오류가 발생했습니다');
    }
  }

  async function handleRejectGuest(applicationId: string) {
    try {
      const userId = localStorage.getItem('currentUserId') || '';
      await teamService.rejectGuest(applicationId, userId);
      alert('게스트 신청을 거절했습니다!');
      loadSessionData();
    } catch (error: any) {
      console.error('Error rejecting guest:', error);
      alert(error.message || '거절 중 오류가 발생했습니다');
    }
  }

  async function handleCancelApplication() {
    if (!confirm('신청을 취소하시겠습니까?')) return;
    
    try {
      const userId = localStorage.getItem('currentUserId') || '';
      // 본인의 신청 찾기
      const myApplication = applications.find(app => 
        app.userId === userId && app.status === 'PENDING'
      );
      
      if (!myApplication) {
        throw new Error('취소할 신청을 찾을 수 없습니다');
      }

      await teamService.cancelGuestApplication(myApplication.id, userId);
      alert('신청이 취소되었습니다!');
      loadSessionData();
    } catch (error: any) {
      console.error('Error canceling application:', error);
      alert(error.message || '취소 중 오류가 발생했습니다');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!session || !team) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">세션을 찾을 수 없습니다</p>
          <Button onClick={() => navigate('/sessions')}>세션 목록으로</Button>
        </div>
      </div>
    );
  }

  const currentUserId = localStorage.getItem('currentUserId') || '';
  const isCaptain = team.captainId === currentUserId;
  const isConfirmedMember = session.confirmedMemberIds.includes(currentUserId);
  const isGuest = session.guestIds.includes(currentUserId);
  const isPending = session.pendingGuestIds.includes(currentUserId);
  const canApply = !isConfirmedMember && !isGuest && !isPending && session.status === 'RECRUITING';

  console.log('[SessionDetailPage] Debug Info:', {
    currentUserId,
    isCaptain,
    isConfirmedMember,
    isGuest,
    isPending,
    sessionStatus: session.status,
    canApply
  });

  const totalParticipants = session.confirmedMemberIds.length + session.guestIds.length;
  const availableSlots = session.maxGuests - session.guestIds.length;
  const pendingApplications = applications.filter(app => app.status === 'PENDING');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">세션 상세</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{team.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 세션 정보 */}
        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {new Date(session.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </h2>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{session.startTime} ({session.duration}분)</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  session.status === 'CONFIRMED'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : session.status === 'RECRUITING'
                    ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-black'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {session.status === 'CONFIRMED' ? '확정' : 
                 session.status === 'RECRUITING' ? '모집중' : 
                 session.status === 'COMPLETED' ? '완료' : '취소'}
              </span>
            </div>

            {session.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">{session.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="w-5 h-5" />
                <span>참가자 {totalParticipants}명</span>
              </div>
              {session.guestFee && session.guestFee > 0 && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-5 h-5" />
                  <span>게스트 {session.guestFee.toLocaleString()}원</span>
                </div>
              )}
            </div>

            {/* 게스트 모집 정보 */}
            {session.neededGuests > 0 && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      게스트 모집 중
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      필요 인원: {session.neededGuests}명 · 남은 자리: {availableSlots}명
                    </p>
                    {/* 디버깅 정보 */}
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                      <p>🔍 디버그: 팀멤버={isConfirmedMember ? '예' : '아니오'} | 
                        게스트={isGuest ? '예' : '아니오'} | 
                        대기중={isPending ? '예' : '아니오'} | 
                        상태={session.status} | 
                        신청가능={canApply ? '예' : '아니오'}
                      </p>
                      <p>현재 유저 ID: {currentUserId}</p>
                      <p>pendingGuestIds: [{session.pendingGuestIds.join(', ')}]</p>
                      <p>신청서 개수: {applications.length}개 (대기: {pendingApplications.length}개)</p>
                    </div>
                  </div>
                  {canApply ? (
                    <Button onClick={handleApplyAsGuest}>
                      신청하기
                    </Button>
                  ) : isPending ? (
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                        ⏳ 신청 대기 중
                      </p>
                      <button 
                        onClick={handleCancelApplication}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        신청 취소
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      {isConfirmedMember && '✅ 팀 멤버입니다'}
                      {isGuest && '✅ 이미 게스트로 참가 중'}
                      {session.status !== 'RECRUITING' && '모집 중이 아닙니다'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 팀장 전용: 세션 관리 */}
            {isCaptain && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-gray-900 dark:text-white mb-3">
                  📋 세션 관리 (팀장 전용)
                </p>
                
                {/* 상태 변경 버튼 */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">상태 변경:</p>
                  <div className="flex flex-wrap gap-2">
                    {session.status !== 'RECRUITING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChangeStatus('RECRUITING')}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        모집중으로 변경
                      </Button>
                    )}
                    {session.status !== 'CONFIRMED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChangeStatus('CONFIRMED')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        확정으로 변경
                      </Button>
                    )}
                    {session.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChangeStatus('COMPLETED')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        완료로 변경
                      </Button>
                    )}
                    {session.status !== 'CANCELLED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChangeStatus('CANCELLED')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        취소로 변경
                      </Button>
                    )}
                  </div>
                </div>

                {/* 세션 삭제 */}
                <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDeleteSession}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    세션 삭제
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 참가자 목록 */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            참가자 ({totalParticipants})
          </h3>
          
          <div className="space-y-3">
            {/* 팀 멤버 */}
            <Card>
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                  팀 멤버 ({session.confirmedMemberIds.length})
                </p>
                <div className="space-y-2">
                  {session.confirmedMemberIds.map((memberId) => {
                    const user = users[memberId];
                    return (
                      <div key={memberId} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user ? user.name : '로딩 중...'}
                          </p>
                          {memberId === team.captainId && (
                            <span className="text-xs text-orange-600 dark:text-orange-400">주장</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* 게스트 */}
            {session.guestIds.length > 0 && (
              <Card>
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                    게스트 ({session.guestIds.length})
                  </p>
                  <div className="space-y-2">
                    {session.guestIds.map((guestId) => {
                      const user = users[guestId];
                      return (
                        <div key={guestId} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user ? user.name : '로딩 중...'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* 팀장 전용: 게스트 신청 관리 */}
        {isCaptain && applications.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              게스트 신청 ({applications.filter(app => app.status === 'PENDING').length})
            </h3>
            <Card>
              <div className="p-4 space-y-3">
                {applications
                  .filter(app => app.status === 'PENDING')
                  .map((app) => {
                    const user = users[app.userId];
                    return (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user ? user.name : '로딩 중...'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            포지션: {app.position === 'ANY' ? '무관' : app.position}
                          </p>
                          {app.message && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{app.message}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            신청일: {new Date(app.appliedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveGuest(app.id)}
                          >
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectGuest(app.id)}
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
      </main>
    </div>
  );
}
