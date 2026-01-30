import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Star } from 'lucide-react';
import { Button, Input, Card, NaverMapPicker } from '@/shared/components';
import { teamService } from '../services/teamService';
import type { CreateTeamInput, TeamLevel } from '../types/team.types';

const DAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  } | null>(null);
  
  const [formData, setFormData] = useState<CreateTeamInput>({
    name: '',
    description: '',
    homeCourtId: '',
    level: 3,
    maxMembers: 10,
    regularSchedule: {
      dayOfWeek: 2, // 화요일
      startTime: '20:00',
      duration: 120,
      isActive: true,
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('팀 이름을 입력해주세요');
      return;
    }
    
    if (!formData.homeCourtId) {
      alert('홈 구장을 선택해주세요');
      return;
    }

    try {
      setLoading(true);
      const currentUserId = localStorage.getItem('currentUserId') || 'demo-user';
      
      const team = await teamService.createTeam(formData, currentUserId);
      alert('팀이 생성되었습니다!');
      navigate(`/team/${team.id}`);
    } catch (error: any) {
      console.error('Error creating team:', error);
      alert(error.message || '팀 생성 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">팀 만들기</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                기본 정보
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  팀 이름 *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 화요일 농구회"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  팀 소개
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="팀에 대해 소개해주세요..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  팀 레벨 *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, level: level as TeamLevel })}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                        formData.level === level
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {[...Array(level)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-orange-400 text-orange-400" />
                        ))}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {level === 1 && '입문'}
                        {level === 2 && '초급'}
                        {level === 3 && '중급'}
                        {level === 4 && '상급'}
                        {level === 5 && '고급'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  최대 팀원 수 *
                </label>
                <Input
                  type="number"
                  min="5"
                  max="20"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
          </Card>

          {/* 홈 구장 */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-black dark:text-white" />
                홈 구장
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  구장 선택 *
                </label>
                
                {selectedPlace ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{selectedPlace.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedPlace.address}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMapPicker(true)}
                      className="w-full"
                    >
                      다른 구장 선택
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMapPicker(true)}
                    className="w-full"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    네이버 지도에서 검색
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* 지도 선택 모달 */}
          {showMapPicker && (
            <NaverMapPicker
              selectedPlace={selectedPlace || undefined}
              onSelect={(place) => {
                setSelectedPlace(place);
                setFormData({ ...formData, homeCourtId: place.id });
                setShowMapPicker(false);
              }}
              onClose={() => setShowMapPicker(false)}
            />
          )}

          {/* 정기 일정 */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                정기 일정
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  요일 *
                </label>
                <select
                  value={formData.regularSchedule.dayOfWeek}
                  onChange={(e) => setFormData({
                    ...formData,
                    regularSchedule: {
                      ...formData.regularSchedule,
                      dayOfWeek: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  {DAY_NAMES.map((day, index) => (
                    <option key={index} value={index}>
                      매주 {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  시작 시간 *
                </label>
                <Input
                  type="time"
                  value={formData.regularSchedule.startTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    regularSchedule: {
                      ...formData.regularSchedule,
                      startTime: e.target.value
                    }
                  })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  진행 시간 (분) *
                </label>
                <select
                  value={formData.regularSchedule.duration}
                  onChange={(e) => setFormData({
                    ...formData,
                    regularSchedule: {
                      ...formData.regularSchedule,
                      duration: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="60">1시간</option>
                  <option value="90">1시간 30분</option>
                  <option value="120">2시간</option>
                  <option value="150">2시간 30분</option>
                  <option value="180">3시간</option>
                </select>
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
              {loading ? '생성 중...' : '팀 만들기'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
