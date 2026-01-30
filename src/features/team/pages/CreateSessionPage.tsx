import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button, Input, Card } from '@/shared/components';
import { teamService } from '../services/teamService';
import type { Team, CreateSessionInput } from '../types/team.types';

const DAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export default function CreateSessionPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<CreateSessionInput>({
    teamId: teamId || '',
    date: '',
    startTime: '',
    duration: 120,
    confirmedMemberIds: [],
    neededGuests: 2,
    guestFee: 10000,
    description: '',
  });

  useEffect(() => {
    if (teamId) {
      loadTeam();
    }
  }, [teamId]);

  async function loadTeam() {
    try {
      const teamData = await teamService.getTeam(teamId!);
      if (teamData) {
        setTeam(teamData);
        // 팀의 정기 일정으로 초기값 설정
        if (teamData.regularSchedule) {
          setFormData(prev => ({
            ...prev,
            startTime: teamData.regularSchedule.startTime,
            duration: teamData.regularSchedule.duration,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading team:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.date) {
      alert('날짜를 선택해주세요');
      return;
    }

    if (!formData.startTime) {
      alert('시작 시간을 입력해주세요');
      return;
    }

    try {
      setLoading(true);
      const currentUserId = localStorage.getItem('currentUserId') || '';
      
      // 팀장은 자동으로 확정 멤버에 포함
      const session = await teamService.createSession({
        ...formData,
        confirmedMemberIds: [currentUserId],
      });
      
      alert('세션이 생성되었습니다!');
      navigate(`/session/${session.id}`);
    } catch (error: any) {
      console.error('Error creating session:', error);
      alert(error.message || '세션 생성 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">세션 만들기</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{team.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 정기 일정 안내 */}
          {team.regularSchedule && (
            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">팀 정기 일정</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  매주 {DAY_NAMES[team.regularSchedule.dayOfWeek]} {team.regularSchedule.startTime}
                  {' '}({team.regularSchedule.duration}분)
                </p>
              </div>
            </Card>
          )}

          {/* 날짜 및 시간 */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                날짜 및 시간
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  날짜 *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    시작 시간 *
                  </label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    소요 시간 (분)
                  </label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    min={30}
                    max={300}
                    step={30}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* 게스트 모집 */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                게스트 모집
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    필요한 게스트 수
                  </label>
                  <Input
                    type="number"
                    value={formData.neededGuests}
                    onChange={(e) => setFormData({ ...formData, neededGuests: Number(e.target.value) })}
                    min={0}
                    max={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    게스트가 필요 없으면 0으로 설정하세요
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    게스트 참가비 (원)
                  </label>
                  <Input
                    type="number"
                    value={formData.guestFee || 0}
                    onChange={(e) => setFormData({ ...formData, guestFee: Number(e.target.value) })}
                    min={0}
                    step={1000}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* 추가 정보 */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                추가 정보
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  세션 설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           transition-colors"
                  rows={4}
                  placeholder="세션에 대한 추가 설명을 입력하세요..."
                />
              </div>
            </div>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? '생성 중...' : '세션 만들기'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
