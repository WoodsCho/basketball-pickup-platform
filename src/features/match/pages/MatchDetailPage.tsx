/**
 * Match Detail Page
 * 매치 상세 정보 및 참가 기능
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  ArrowLeft,
  Share2,
  AlertCircle,
  User as UserIcon,
  Trophy
} from 'lucide-react';
import { Button, Card, Badge } from '@/shared/components';
import { useMatch, useJoinMatch } from '../hooks/useMatches';
import { formatDate, formatTime, formatPrice, getLevelLabel } from '@/shared/utils';
import type { Court } from '@/shared/types';
import { apiClient } from '@/core/api/client';

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { match, loading, refetch } = useMatch(matchId || '');
  const { joinMatch, loading: joining } = useJoinMatch();
  const [court, setCourt] = useState<Court | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    // 현재 사용자 ID 가져오기 (임시로 localStorage 사용)
    // 실제로는 useAuth 훅에서 가져와야 함
    const userId = localStorage.getItem('currentUserId') || '';
    setCurrentUserId(userId);
  }, []);

  useEffect(() => {
    const fetchCourt = async () => {
      if (!match?.courtId) return;
      try {
        const { data } = await apiClient.models.Court.get({ id: match.courtId });
        setCourt(data as Court);
      } catch (error) {
        console.error('Error fetching court:', error);
      }
    };

    if (match?.courtId) {
      fetchCourt();
    }
  }, [match?.courtId]);

  const handleJoinMatch = async () => {
    if (!matchId || !currentUserId) {
      alert('로그인이 필요합니다.');
      return;
    }

    const success = await joinMatch(matchId, currentUserId);
    if (success) {
      alert('매치 참가가 완료되었습니다! 🎉');
      refetch();
    } else {
      alert('매치 참가에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: match?.title,
          text: `${match?.title} - 같이 농구하실래요?`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('공유 취소');
      }
    } else {
      // 폴백: URL 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">매치 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">매치를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">삭제되었거나 존재하지 않는 매치입니다.</p>
          <Button onClick={() => navigate('/')}>홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  const spotsLeft = match.maxPlayers - (match.currentPlayerIds?.length || 0);
  const isFull = spotsLeft === 0;
  const isJoined = match.currentPlayerIds?.includes(currentUserId);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              뒤로
            </button>
            <button
              onClick={handleShare}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <Share2 className="w-5 h-5 mr-1" />
              공유
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge className={isFull ? 'bg-gray-400' : 'bg-green-500 text-white'}>
            {isFull ? '마감' : `모집중 ${spotsLeft}/${match.maxPlayers}명`}
          </Badge>
          <Badge>{match.gameType === 'THREE_V_THREE' ? '3v3' : '5v5'}</Badge>
          {isJoined && (
            <Badge className="bg-blue-500 text-white">참가 중</Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900">{match.title}</h1>

        {/* Court Info */}
        {court && (
          <Card className="p-4">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-primary-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{court.name}</h3>
                <p className="text-sm text-gray-600">{court.address}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {court.courtType === 'INDOOR' ? '실내' : '실외'}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {court.floor}
                  </span>
                  {court.isPartner && (
                    <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                      파트너 구장
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Match Details */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center text-gray-700">
            <Calendar className="w-5 h-5 mr-3 text-primary-600" />
            <div>
              <p className="font-medium">날짜</p>
              <p className="text-sm text-gray-600">{formatDate(match.date)}</p>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <Clock className="w-5 h-5 mr-3 text-primary-600" />
            <div>
              <p className="font-medium">시간</p>
              <p className="text-sm text-gray-600">
                {formatTime(match.startTime)} ({match.duration}분)
              </p>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <Trophy className="w-5 h-5 mr-3 text-primary-600" />
            <div>
              <p className="font-medium">레벨 범위</p>
              <p className="text-sm text-gray-600">
                {getLevelLabel(match.levelMin)} ~ {getLevelLabel(match.levelMax)}
              </p>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <Users className="w-5 h-5 mr-3 text-primary-600" />
            <div>
              <p className="font-medium">포지션별 인원</p>
              <p className="text-sm text-gray-600">
                가드 {match.guardSlots}명 / 포워드 {match.forwardSlots}명 / 센터 {match.centerSlots}명
              </p>
            </div>
          </div>
        </Card>

        {/* Price */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">참가 비용</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatPrice(match.pricePerPerson)}
            </span>
          </div>
        </Card>

        {/* Participants */}
        <Card className="p-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <UserIcon className="w-5 h-5 mr-2" />
            참가자 ({match.currentPlayerIds?.length || 0}/{match.maxPlayers})
          </h3>
          
          {match.currentPlayerIds && match.currentPlayerIds.length > 0 ? (
            <div className="space-y-2">
              {match.currentPlayerIds.map((playerId, index) => (
                <div 
                  key={playerId} 
                  className="flex items-center p-2 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <UserIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">플레이어 {index + 1}</p>
                    <p className="text-xs text-gray-500">{playerId.slice(0, 8)}...</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              아직 참가자가 없습니다. 첫 번째 참가자가 되어보세요!
            </p>
          )}
        </Card>

        {/* Rules */}
        <Card className="p-4">
          <h3 className="font-bold text-gray-900 mb-3">게임 규칙</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              경기 시작 10분 전까지 도착해주세요
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              노쇼 시 패널티가 부과됩니다
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              매너있는 플레이 부탁드립니다
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              경기 후 평가를 남겨주세요
            </li>
          </ul>
        </Card>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-10">
        <div className="max-w-3xl mx-auto flex gap-3">
          {isJoined ? (
            <>
              <Button
                variant="outline"
                fullWidth
                onClick={() => alert('참가 취소 기능은 곧 추가됩니다')}
              >
                참가 취소
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => alert('채팅 기능은 곧 추가됩니다')}
              >
                채팅방 입장
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              fullWidth
              onClick={handleJoinMatch}
              disabled={isFull || joining}
              isLoading={joining}
            >
              {isFull ? '마감되었습니다' : '참가하기'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
