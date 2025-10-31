/**
 * 매치 생성 페이지
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, DollarSign, Target, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/core/api/client';
import { matchService } from '../services/matchService';
import type { Court, GameType } from '@/shared/types';
import Button from '@/shared/components/Button';

export default function CreateMatchPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courts, setCourts] = useState<Court[]>([]);
  const [currentUserId] = useState(localStorage.getItem('currentUserId') || '');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    courtId: '',
    date: '',
    startTime: '',
    duration: 120,
    gameType: 'FIVE_V_FIVE' as GameType,
    levelMin: 1000,
    levelMax: 3000,
    pricePerPerson: 10000,
    guardSlots: 0,
    forwardSlots: 0,
    centerSlots: 0,
  });

  useEffect(() => {
    void fetchCourts();
  }, []);

  // 게임 타입에 따라 최대 인원과 기본 포지션 슬롯 설정
  useEffect(() => {
    if (formData.gameType === 'THREE_V_THREE') {
      setFormData(prev => ({
        ...prev,
        guardSlots: 2,
        forwardSlots: 2,
        centerSlots: 2,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        guardSlots: 4,
        forwardSlots: 4,
        centerSlots: 2,
      }));
    }
  }, [formData.gameType]);

  const fetchCourts = async () => {
    try {
      const { data } = await apiClient.models.Court.list();
      setCourts(data as Court[]);
    } catch (error) {
      console.error('Failed to fetch courts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const maxPlayers = formData.guardSlots + formData.forwardSlots + formData.centerSlots;

      const newMatch = await matchService.createMatch({
        title: formData.title,
        courtId: formData.courtId,
        date: formData.date,
        startTime: formData.startTime,
        duration: formData.duration,
        gameType: formData.gameType,
        levelMin: formData.levelMin,
        levelMax: formData.levelMax,
        maxPlayers,
        currentPlayerIds: [currentUserId], // 생성자는 자동 참가
        guardSlots: formData.guardSlots,
        forwardSlots: formData.forwardSlots,
        centerSlots: formData.centerSlots,
        pricePerPerson: formData.pricePerPerson,
        status: 'OPEN',
        createdBy: currentUserId,
      });

      if (newMatch) {
        alert('매치가 생성되었습니다! 🏀');
        navigate('/');
      } else {
        alert('매치 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to create match:', error);
      alert('매치 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCourt = courts.find(c => c.id === formData.courtId);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">매치 생성</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">기본 정보</h2>
            
            <div className="space-y-4">
              {/* 매치 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  매치 제목
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="예: 금요일 저녁 픽업게임"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 게임 타입 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  게임 타입
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gameType: 'THREE_V_THREE' })}
                    className={`p-4 border-2 rounded-lg font-medium transition ${
                      formData.gameType === 'THREE_V_THREE'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    3v3
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gameType: 'FIVE_V_FIVE' })}
                    className={`p-4 border-2 rounded-lg font-medium transition ${
                      formData.gameType === 'FIVE_V_FIVE'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    5v5
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 농구장 선택 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              농구장
            </h2>
            
            <select
              value={formData.courtId}
              onChange={(e) => setFormData({ ...formData, courtId: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">농구장을 선택하세요</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name} - {court.address}
                </option>
              ))}
            </select>

            {selectedCourt && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p>💰 시간당 {selectedCourt.pricePerHour.toLocaleString()}원</p>
                <p className="mt-1">{selectedCourt.courtType === 'INDOOR' ? '🏠 실내' : '🌳 실외'} 코트</p>
              </div>
            )}
          </div>

          {/* 날짜 및 시간 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              날짜 및 시간
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  날짜
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작 시간
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  진행 시간 (분)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={60}>60분</option>
                  <option value={90}>90분</option>
                  <option value={120}>120분</option>
                  <option value={150}>150분</option>
                  <option value={180}>180분</option>
                </select>
              </div>
            </div>
          </div>

          {/* 레벨 범위 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              레벨 범위
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최소 레벨: {formData.levelMin}
                </label>
                <input
                  type="range"
                  min="1000"
                  max="3000"
                  step="100"
                  value={formData.levelMin}
                  onChange={(e) => setFormData({ ...formData, levelMin: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>초급 (1000)</span>
                  <span>중급 (2000)</span>
                  <span>프로 (3000)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 레벨: {formData.levelMax}
                </label>
                <input
                  type="range"
                  min="1000"
                  max="3000"
                  step="100"
                  value={formData.levelMax}
                  onChange={(e) => setFormData({ ...formData, levelMax: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>초급 (1000)</span>
                  <span>중급 (2000)</span>
                  <span>프로 (3000)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 포지션 슬롯 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              포지션별 인원
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가드 (Guard)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.guardSlots}
                  onChange={(e) => setFormData({ ...formData, guardSlots: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  포워드 (Forward)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.forwardSlots}
                  onChange={(e) => setFormData({ ...formData, forwardSlots: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  센터 (Center)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.centerSlots}
                  onChange={(e) => setFormData({ ...formData, centerSlots: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600">
                  총 인원: <span className="font-bold text-primary-600">
                    {formData.guardSlots + formData.forwardSlots + formData.centerSlots}명
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 참가 비용 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-600" />
              참가 비용
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1인당 참가비 (원)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.pricePerPerson}
                onChange={(e) => setFormData({ ...formData, pricePerPerson: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                총 예상 비용: {(formData.pricePerPerson * (formData.guardSlots + formData.forwardSlots + formData.centerSlots)).toLocaleString()}원
              </p>
            </div>
          </div>

          {/* 생성 버튼 */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:relative md:border-none md:p-0">
            <div className="max-w-3xl mx-auto">
              <Button
                type="submit"
                disabled={loading || !formData.title || !formData.courtId || !formData.date || !formData.startTime}
                className="w-full"
              >
                {loading ? '생성 중...' : '매치 생성하기'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
