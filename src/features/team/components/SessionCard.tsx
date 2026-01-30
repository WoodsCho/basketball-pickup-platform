import { Calendar, Clock, MapPin, Users, DollarSign } from 'lucide-react';
import { Card, Button } from '@/shared/components';
import type { Session } from '../types/team.types';

interface SessionCardProps {
  session: Session;
  teamName?: string;
  onApply?: () => void;
  onViewDetails?: () => void;
  showApplyButton?: boolean;
}

const STATUS_COLORS = {
  RECRUITING: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  CONFIRMED: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  IN_PROGRESS: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  COMPLETED: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  CANCELLED: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
};

const STATUS_LABELS = {
  RECRUITING: '게스트 모집중',
  CONFIRMED: '인원 확정',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

export default function SessionCard({ 
  session, 
  teamName,
  onApply,
  onViewDetails,
  showApplyButton = true
}: SessionCardProps) {
  const totalParticipants = session.confirmedMemberIds.length + session.guestIds.length;
  const availableSlots = session.maxGuests - session.guestIds.length;
  const isRecruiting = session.status === 'RECRUITING' && availableSlots > 0;

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onViewDetails}
    >
      <div className="p-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div>
            {teamName && (
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                {teamName}
              </h3>
            )}
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[session.status]}`}>
                {STATUS_LABELS[session.status]}
              </span>
              {isRecruiting && (
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                  게스트 {availableSlots}명 필요
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 세션 설명 */}
        {session.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {session.description}
          </p>
        )}

        {/* 일시 */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>{session.date}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>{session.startTime} ({session.duration}분)</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span>구장 ID: {session.courtId}</span>
          </div>
        </div>

        {/* 포지션 필요 인원 */}
        {(session.needGuard || session.needForward || session.needCenter) && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">필요 포지션</p>
            <div className="flex gap-2 flex-wrap">
              {session.needGuard && session.needGuard > 0 && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                  가드 {session.needGuard}명
                </span>
              )}
              {session.needForward && session.needForward > 0 && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">
                  포워드 {session.needForward}명
                </span>
              )}
              {session.needCenter && session.needCenter > 0 && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded">
                  센터 {session.needCenter}명
                </span>
              )}
            </div>
          </div>
        )}

        {/* 하단 정보 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {totalParticipants}명 참가
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {session.guestFee.toLocaleString()}원
              </span>
            </div>
          </div>

          {showApplyButton && isRecruiting && onApply && (
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // 카드 클릭 이벤트 방지
                onApply();
              }}
            >
              참가 신청
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
