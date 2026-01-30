/**
 * Team Module Types
 * 팀 관련 타입 정의
 */

export type TeamLevel = 1 | 2 | 3 | 4 | 5; // 1: 입문, 5: 상급
export type TeamStatus = 'ACTIVE' | 'INACTIVE' | 'RECRUITING';
export type Position = 'GUARD' | 'FORWARD' | 'CENTER' | 'FLEX';
export type GuestPosition = 'GUARD' | 'FORWARD' | 'CENTER' | 'ANY';

/**
 * 팀 정보
 */
export interface Team {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  foundedDate: string;
  homeCourtId: string; // 홈 구장
  level: TeamLevel;
  status: TeamStatus;
  
  // 팀 구성
  captainId: string; // 팀장
  memberIds: string[]; // 정규 멤버
  maxMembers: number; // 최대 인원
  
  // 정기 일정
  regularSchedule: RegularSchedule;
  
  // 통계
  wins: number;
  losses: number;
  totalGames: number;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * 정기 농구 일정
 */
export interface RegularSchedule {
  dayOfWeek: number; // 0: 일요일, 1: 월요일, ... 6: 토요일
  startTime: string; // "20:00"
  duration: number; // 분 단위
  isActive: boolean;
  exceptions?: string[]; // 제외할 날짜 (YYYY-MM-DD)
}

/**
 * 세션 (이전의 Match를 대체)
 * 팀의 정기 농구 세션
 */
export interface Session {
  id: string;
  teamId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "20:00"
  duration: number;
  courtId: string;
  
  // 참가자
  confirmedMemberIds: string[]; // 확정된 팀원
  guestIds: string[]; // 참가 확정된 게스트
  pendingGuestIds: string[]; // 대기 중인 게스트
  
  // 모집 정보
  neededGuests: number; // 필요한 게스트 수
  maxGuests: number; // 최대 게스트 수
  guestFee: number; // 게스트 참가비
  
  // 포지션별 필요 인원
  needGuard?: number;
  needForward?: number;
  needCenter?: number;
  
  status: SessionStatus;
  description?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type SessionStatus = 
  | 'RECRUITING' // 게스트 모집 중
  | 'CONFIRMED' // 인원 확정
  | 'IN_PROGRESS' // 진행 중
  | 'COMPLETED' // 완료
  | 'CANCELLED'; // 취소됨

/**
 * 게스트 신청
 */
export interface GuestApplication {
  id: string;
  sessionId: string;
  userId: string;
  position: 'GUARD' | 'FORWARD' | 'CENTER' | 'ANY';
  message?: string; // 신청 메시지
  status: ApplicationStatus;
  appliedAt: string;
  respondedAt?: string;
  respondedBy?: string; // 팀장 ID
}

export type ApplicationStatus = 
  | 'PENDING' // 대기 중
  | 'APPROVED' // 승인됨
  | 'REJECTED' // 거절됨
  | 'CANCELLED'; // 취소됨

/**
 * 팀 멤버십
 */
export interface TeamMembership {
  teamId: string;
  userId: string;
  role: 'CAPTAIN' | 'MEMBER';
  position: 'GUARD' | 'FORWARD' | 'CENTER' | 'FLEX';
  joinedAt: string;
  isActive: boolean;
}

/**
 * 팀 생성 입력
 */
export interface CreateTeamInput {
  name: string;
  description?: string;
  homeCourtId: string;
  level: TeamLevel;
  maxMembers: number;
  regularSchedule: RegularSchedule;
  status?: TeamStatus; // 선택적 필드, 기본값은 RECRUITING
}

/**
 * 세션 생성 입력
 */
export interface CreateSessionInput {
  teamId: string;
  date: string;
  startTime: string;
  duration: number;
  confirmedMemberIds: string[];
  neededGuests: number;
  maxGuests?: number;
  guestFee?: number;
  needGuard?: number;
  needForward?: number;
  needCenter?: number;
  description?: string;
}

/**
 * 게스트 신청 입력
 */
export interface ApplyAsGuestInput {
  sessionId: string;
  position: 'GUARD' | 'FORWARD' | 'CENTER' | 'ANY';
  message?: string;
}

/**
 * 팀 가입 신청
 */
export interface TeamJoinRequest {
  id: string;
  teamId: string;
  userId: string;
  position: 'GUARD' | 'FORWARD' | 'CENTER' | 'FLEX';
  message?: string;
  status: ApplicationStatus;
  appliedAt: string;
  respondedAt?: string;
  respondedBy?: string; // 팀장 ID
}

/**
 * 팀 가입 신청 입력
 */
export interface ApplyToTeamInput {
  teamId: string;
  position: 'GUARD' | 'FORWARD' | 'CENTER' | 'FLEX';
  message?: string;
}

/**
 * 팀 필터
 */
export interface TeamFilters {
  status?: TeamStatus;
  level?: TeamLevel;
  dayOfWeek?: number;
  courtId?: string;
  isRecruiting?: boolean;
}

/**
 * 세션 필터
 */
export interface SessionFilters {
  teamId?: string;
  status?: SessionStatus;
  date?: string;
  courtId?: string;
  hasOpenSlots?: boolean; // 게스트 모집 중인 세션만
}
