import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatDate, formatTime, formatPrice } from '../../utils/helpers';
import { getLevelLabel } from '../../types';
import type { Match, Court } from '../../types';

interface MatchCardProps {
  match: Match;
  court?: Court;
  onClick?: () => void;
}

export default function MatchCard({ match, court, onClick }: MatchCardProps) {
  const spotsLeft = match.maxPlayers - match.currentPlayers.length;
  const isFull = spotsLeft === 0;

  return (
    <Card hover onClick={onClick} className="cursor-pointer">
      <div className="space-y-3">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge className={isFull ? 'bg-gray-400' : 'bg-green-500 text-white'}>
            {isFull ? '마감' : `모집중 ${spotsLeft}/${match.maxPlayers}명`}
          </Badge>
          <Badge>{match.gameType === 'THREE_V_THREE' ? '3v3' : '5v5'}</Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900">{match.title}</h3>

        {/* Court Info */}
        {court && (
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{court.name}</span>
          </div>
        )}

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(match.date)}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            {formatTime(match.startTime)} ({match.duration}분)
          </div>
        </div>

        {/* Level Range */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">레벨:</span>
          <span className="ml-2">
            {getLevelLabel(match.levelMin)} ~ {getLevelLabel(match.levelMax)}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center text-primary-600 font-bold text-lg">
            {formatPrice(match.pricePerPerson)}
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            <span className="text-sm">{match.currentPlayers.length}명 참가 중</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
