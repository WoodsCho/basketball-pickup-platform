import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, MapPin, Plus } from 'lucide-react';
import { Button, Input } from '@/shared/components';
import type { Court } from '@/shared/types';
import { useMatches } from '../hooks/useMatches';
import MatchCard from '../components/MatchCard';
import { apiClient } from '@/core/api/client';

export default function MatchListPage() {
  const navigate = useNavigate();
  const { matches, loading } = useMatches({ status: 'OPEN' });
  const [courts, setCourts] = useState<Court[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  async function fetchCourts() {
    try {
      const { data } = await apiClient.models.Court.list();
      setCourts(data as any);
    } catch (error) {
      console.error('Error fetching courts:', error);
    }
  }

  useEffect(() => {
    void fetchCourts();
  }, []);

  const filteredMatches = matches.filter(match =>
    match.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏀</span>
              <h1 className="text-xl font-bold text-gray-900">농구 픽업 매칭</h1>
            </div>
            <Button onClick={() => navigate('/match/create')}>
              <Plus className="w-4 h-4 mr-1" />
              매치 만들기
            </Button>
          </div>
        </div>
      </header>

      {/* Location Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center text-gray-700">
            <MapPin className="w-5 h-5 mr-2 text-primary-600" />
            <span className="font-medium">내 위치: 서울 강남구</span>
            <button className="ml-2 text-primary-600 text-sm hover:underline">
              변경
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search & Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="매치 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="secondary">
              <Filter className="w-4 h-4 mr-1" />
              필터
            </Button>
          </div>
        </div>

        {/* Section: 지금 모집중 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">🔥 지금 모집중</h2>
            <button className="text-primary-600 text-sm hover:underline">
              전체보기
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">매치를 불러오는 중...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-600">현재 모집 중인 매치가 없습니다.</p>
              <Button className="mt-4" onClick={() => window.location.href = '/create'}>
                첫 매치 만들기
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMatches.map((match) => {
                const court = courts.find(c => c.id === match.courtId);
                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    court={court}
                    onClick={() => navigate(`/match/${match.id}`)}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">나만의 매치를 만들어보세요!</h3>
          <p className="text-primary-100 mb-6">
            시간과 장소를 정하고, 같은 레벨의 플레이어들과 게임하세요
          </p>
          <Button variant="secondary" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            매치 만들기
          </Button>
        </section>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center p-2 text-primary-600">
            <span className="text-2xl mb-1">🏠</span>
            <span className="text-xs">홈</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-600">
            <span className="text-2xl mb-1">🗺️</span>
            <span className="text-xs">지도</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-600">
            <span className="text-2xl mb-1">📋</span>
            <span className="text-xs">내 매치</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-600">
            <span className="text-2xl mb-1">👤</span>
            <span className="text-xs">프로필</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
