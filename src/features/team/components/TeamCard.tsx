import { Calendar, MapPin, Users, Star } from 'lucide-react';
import { Card } from '@/shared/components';
import type { Team } from '../types/team.types';

interface TeamCardProps {
  team: Team;
  onClick?: () => void;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function TeamCard({ team, onClick }: TeamCardProps) {
  const memberCount = team.memberIds.length;
  const isRecruiting = memberCount < team.maxMembers;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="p-4">
        {/* 팀 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {team.logoUrl ? (
              <img 
                src={team.logoUrl} 
                alt={team.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-black dark:from-gray-300 dark:to-gray-100 flex items-center justify-center">
                <span className="text-white dark:text-black font-bold text-lg">
                  {team.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {team.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {[...Array(team.level)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-black dark:fill-white text-black dark:text-white" />
                ))}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  Lv.{team.level}
                </span>
              </div>
            </div>
          </div>
          
          {isRecruiting && (
            <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full">
              팀원 모집중
            </span>
          )}
        </div>

        {/* 팀 설명 */}
        {team.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {team.description}
          </p>
        )}

        {/* 정기 일정 */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
          <Calendar className="w-4 h-4 text-black dark:text-white" />
          <span>
            매주 {DAY_NAMES[team.regularSchedule.dayOfWeek]}요일 {team.regularSchedule.startTime}
          </span>
        </div>

        {/* 홈 구장 */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-3">
          <MapPin className="w-4 h-4 text-black dark:text-white" />
          <span>홈구장 ID: {team.homeCourtId}</span>
        </div>

        {/* 팀 통계 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {memberCount}/{team.maxMembers}명
            </span>
          </div>
          
          {team.totalGames > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {team.wins}승 {team.losses}패
              <span className="ml-2 text-black dark:text-white font-medium">
                ({((team.wins / team.totalGames) * 100).toFixed(0)}%)
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
