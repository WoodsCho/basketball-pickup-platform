/**
 * Team Service
 * 팀 관련 비즈니스 로직
 */
import { dynamoDBClient } from '@/core/api/dynamodb-client';
import type { 
  Team, 
  Session,
  SessionStatus,
  GuestApplication,
  TeamJoinRequest,
  CreateTeamInput,
  CreateSessionInput,
  ApplyAsGuestInput,
  ApplyToTeamInput,
  TeamFilters,
  SessionFilters 
} from '../types/team.types';

const TEAM_TABLE = import.meta.env.EXISTING_TEAM_TABLE_NAME || 'BasketballTeams';
const SESSION_TABLE = import.meta.env.EXISTING_SESSION_TABLE_NAME || 'BasketballSessions';
const APPLICATION_TABLE = import.meta.env.EXISTING_APPLICATION_TABLE_NAME || 'BasketballGuestApplications';
const TEAM_JOIN_REQUEST_TABLE = 'BasketballTeamJoinRequests';

export const teamService = {
  /**
   * 팀 생성
   */
  async createTeam(input: CreateTeamInput, captainId: string): Promise<Team> {
    const team: Team = {
      id: crypto.randomUUID(),
      ...input,
      foundedDate: new Date().toISOString().split('T')[0],
      captainId,
      memberIds: [captainId],
      status: input.status || 'RECRUITING', // 기본값을 RECRUITING으로 변경
      wins: 0,
      losses: 0,
      totalGames: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dynamoDBClient.putItem(TEAM_TABLE, team);
    return team;
  },

  /**
   * 팀 목록 조회
   */
  async listTeams(filters?: TeamFilters): Promise<Team[]> {
    const teams = await dynamoDBClient.scanItems<Team>(TEAM_TABLE);
    
    if (!filters) return teams;

    return teams.filter((team: Team) => {
      if (filters.status && team.status !== filters.status) return false;
      if (filters.level && team.level !== filters.level) return false;
      if (filters.dayOfWeek !== undefined && team.regularSchedule.dayOfWeek !== filters.dayOfWeek) return false;
      if (filters.courtId && team.homeCourtId !== filters.courtId) return false;
      if (filters.isRecruiting && team.memberIds.length >= team.maxMembers) return false;
      return true;
    });
  },

  /**
   * 팀 상세 조회
   */
  async getTeam(teamId: string): Promise<Team | null> {
    return dynamoDBClient.getItem<Team>(TEAM_TABLE, teamId);
  },

  /**
   * 팀 업데이트
   */
  async updateTeam(teamId: string, updates: Partial<Team>): Promise<Team> {
    return dynamoDBClient.updateItem<Team>(TEAM_TABLE, teamId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * 팀 삭제 (팀장 전용)
   */
  async deleteTeam(teamId: string, captainId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    if (team.captainId !== captainId) throw new Error('Unauthorized: Only captain can delete team');

    // 팀 삭제
    await dynamoDBClient.deleteItem(TEAM_TABLE, teamId);
    
    // TODO: 팀 관련 세션, 가입 신청 등도 정리
  },

  /**
   * 세션 생성 (정기 농구 일정)
   */
  async createSession(input: CreateSessionInput): Promise<Session> {
    const team = await this.getTeam(input.teamId);
    if (!team) throw new Error('Team not found');

    const session: Session = {
      id: crypto.randomUUID(),
      teamId: input.teamId,
      date: input.date,
      startTime: input.startTime,
      duration: input.duration,
      courtId: team.homeCourtId,
      confirmedMemberIds: input.confirmedMemberIds,
      guestIds: [],
      pendingGuestIds: [],
      neededGuests: input.neededGuests,
      maxGuests: input.maxGuests || input.neededGuests + 2,
      guestFee: input.guestFee || 0,
      needGuard: input.needGuard,
      needForward: input.needForward,
      needCenter: input.needCenter,
      status: input.neededGuests > 0 ? 'RECRUITING' : 'CONFIRMED',
      description: input.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dynamoDBClient.putItem(SESSION_TABLE, session);
    return session;
  },

  /**
   * 세션 목록 조회
   */
  async listSessions(filters?: SessionFilters): Promise<Session[]> {
    let sessions = await dynamoDBClient.scanItems<Session>(SESSION_TABLE);
    
    if (!filters) return sessions;

    return sessions.filter((session: Session) => {
      if (filters.teamId && session.teamId !== filters.teamId) return false;
      if (filters.status && session.status !== filters.status) return false;
      if (filters.date && session.date !== filters.date) return false;
      if (filters.courtId && session.courtId !== filters.courtId) return false;
      if (filters.hasOpenSlots) {
        const totalGuests = session.guestIds.length;
        if (totalGuests >= session.maxGuests) return false;
      }
      return true;
    });
  },

  /**
   * 세션 상세 조회
   */
  async getSession(sessionId: string): Promise<Session | null> {
    return dynamoDBClient.getItem<Session>(SESSION_TABLE, sessionId);
  },

  /**
   * 게스트로 신청
   */
  async applyAsGuest(input: ApplyAsGuestInput, userId: string): Promise<GuestApplication> {
    const session = await this.getSession(input.sessionId);
    if (!session) throw new Error('Session not found');
    
    // 이미 신청했는지 확인
    const existingApplications = await this.getGuestApplications(input.sessionId);
    const alreadyApplied = existingApplications.some(app => 
      app.userId === userId && app.status === 'PENDING'
    );
    
    if (alreadyApplied) {
      throw new Error('Already applied to this session');
    }

    const application: GuestApplication = {
      id: crypto.randomUUID(),
      ...input,
      userId,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };

    await dynamoDBClient.putItem(APPLICATION_TABLE, application);

    // 세션의 pendingGuestIds 업데이트
    await dynamoDBClient.updateItem(SESSION_TABLE, input.sessionId, {
      pendingGuestIds: [...session.pendingGuestIds, userId],
      updatedAt: new Date().toISOString(),
    });

    return application;
  },

  /**
   * 게스트 신청 승인
   */
  async approveGuest(applicationId: string, captainId: string): Promise<void> {
    const application = await dynamoDBClient.getItem<GuestApplication>(APPLICATION_TABLE, applicationId);
    if (!application) throw new Error('Application not found');

    const session = await this.getSession(application.sessionId);
    if (!session) throw new Error('Session not found');

    const team = await this.getTeam(session.teamId);
    if (!team || team.captainId !== captainId) {
      throw new Error('Unauthorized: Only team captain can approve guests');
    }

    // 신청 승인
    await dynamoDBClient.updateItem(APPLICATION_TABLE, applicationId, {
      status: 'APPROVED',
      respondedAt: new Date().toISOString(),
      respondedBy: captainId,
    });

    // 세션 업데이트
    await dynamoDBClient.updateItem(SESSION_TABLE, application.sessionId, {
      guestIds: [...session.guestIds, application.userId],
      pendingGuestIds: session.pendingGuestIds.filter(id => id !== application.userId),
      status: (session.guestIds.length + 1) >= session.maxGuests ? 'CONFIRMED' : session.status,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * 게스트 신청 거절
   */
  async rejectGuest(applicationId: string, captainId: string): Promise<void> {
    const application = await dynamoDBClient.getItem<GuestApplication>(APPLICATION_TABLE, applicationId);
    if (!application) throw new Error('Application not found');

    const session = await this.getSession(application.sessionId);
    if (!session) throw new Error('Session not found');

    const team = await this.getTeam(session.teamId);
    if (!team || team.captainId !== captainId) {
      throw new Error('Unauthorized: Only team captain can reject guests');
    }

    // 신청 거절
    await dynamoDBClient.updateItem(APPLICATION_TABLE, applicationId, {
      status: 'REJECTED',
      respondedAt: new Date().toISOString(),
      respondedBy: captainId,
    });

    // 세션에서 제거
    await dynamoDBClient.updateItem(SESSION_TABLE, application.sessionId, {
      pendingGuestIds: session.pendingGuestIds.filter(id => id !== application.userId),
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * 게스트 신청 취소 (본인)
   */
  async cancelGuestApplication(applicationId: string, userId: string): Promise<void> {
    const application = await dynamoDBClient.getItem<GuestApplication>(APPLICATION_TABLE, applicationId);
    if (!application) throw new Error('Application not found');

    // 본인의 신청인지 확인
    if (application.userId !== userId) {
      throw new Error('Unauthorized: You can only cancel your own application');
    }

    // 이미 승인/거절된 경우 취소 불가
    if (application.status !== 'PENDING') {
      throw new Error(`Cannot cancel application with status: ${application.status}`);
    }

    const session = await this.getSession(application.sessionId);
    if (!session) throw new Error('Session not found');

    // 신청 취소 (CANCELLED 상태로 변경)
    await dynamoDBClient.updateItem(APPLICATION_TABLE, applicationId, {
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
    });

    // 세션에서 제거
    await dynamoDBClient.updateItem(SESSION_TABLE, application.sessionId, {
      pendingGuestIds: session.pendingGuestIds.filter(id => id !== userId),
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * 세션의 게스트 신청 목록
   */
  async getGuestApplications(sessionId: string): Promise<GuestApplication[]> {
    const allApplications = await dynamoDBClient.scanItems<GuestApplication>(APPLICATION_TABLE);
    return allApplications.filter((app: GuestApplication) => app.sessionId === sessionId);
  },

  /**
   * 내가 신청한 세션 목록
   */
  async getMyApplications(userId: string): Promise<GuestApplication[]> {
    const allApplications = await dynamoDBClient.scanItems<GuestApplication>(APPLICATION_TABLE);
    return allApplications.filter((app: GuestApplication) => app.userId === userId);
  },

  /**
   * 팀원 추가
   */
  async addMember(teamId: string, userId: string, captainId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    if (team.captainId !== captainId) throw new Error('Unauthorized');
    if (team.memberIds.includes(userId)) throw new Error('Already a member');
    if (team.memberIds.length >= team.maxMembers) throw new Error('Team is full');

    await dynamoDBClient.updateItem(TEAM_TABLE, teamId, {
      memberIds: [...team.memberIds, userId],
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * 팀원 제거
   */
  async removeMember(teamId: string, userId: string, captainId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    if (team.captainId !== captainId) throw new Error('Unauthorized');
    if (userId === captainId) throw new Error('Cannot remove team captain');

    await dynamoDBClient.updateItem(TEAM_TABLE, teamId, {
      memberIds: team.memberIds.filter(id => id !== userId),
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * 팀 가입 신청
   */
  async applyToTeam(input: ApplyToTeamInput, userId: string): Promise<TeamJoinRequest> {
    const team = await this.getTeam(input.teamId);
    if (!team) throw new Error('Team not found');
    if (team.memberIds.includes(userId)) throw new Error('Already a member');
    if (team.memberIds.length >= team.maxMembers) throw new Error('Team is full');
    if (team.status !== 'RECRUITING') throw new Error('Team is not recruiting');

    // 기존 신청 확인
    const existingRequests = await dynamoDBClient.scanItems<TeamJoinRequest>(
      TEAM_JOIN_REQUEST_TABLE,
      { teamId: input.teamId, userId, status: 'PENDING' }
    );
    if (existingRequests.length > 0) {
      throw new Error('Already applied to this team');
    }

    const request: TeamJoinRequest = {
      id: crypto.randomUUID(),
      teamId: input.teamId,
      userId,
      position: input.position,
      message: input.message,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };

    await dynamoDBClient.putItem(TEAM_JOIN_REQUEST_TABLE, request);
    return request;
  },

  /**
   * 팀의 가입 신청 목록 조회 (팀장용)
   */
  async getTeamJoinRequests(teamId: string): Promise<TeamJoinRequest[]> {
    const requests = await dynamoDBClient.scanItems<TeamJoinRequest>(TEAM_JOIN_REQUEST_TABLE);
    return requests.filter((r: TeamJoinRequest) => r.teamId === teamId && r.status === 'PENDING');
  },

  /**
   * 팀 가입 신청 승인
   */
  async approveTeamJoinRequest(requestId: string, captainId: string): Promise<void> {
    const request = await dynamoDBClient.getItem<TeamJoinRequest>(TEAM_JOIN_REQUEST_TABLE, requestId);
    if (!request) throw new Error('Request not found');

    const team = await this.getTeam(request.teamId);
    if (!team) throw new Error('Team not found');
    if (team.captainId !== captainId) throw new Error('Unauthorized');
    if (team.memberIds.length >= team.maxMembers) throw new Error('Team is full');

    // 신청 승인
    await dynamoDBClient.updateItem(TEAM_JOIN_REQUEST_TABLE, requestId, {
      status: 'APPROVED',
      respondedAt: new Date().toISOString(),
      respondedBy: captainId,
    });

    // 팀에 멤버 추가
    await dynamoDBClient.updateItem(TEAM_TABLE, request.teamId, {
      memberIds: [...team.memberIds, request.userId],
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * 팀 가입 신청 거절
   */
  async rejectTeamJoinRequest(requestId: string, captainId: string): Promise<void> {
    const request = await dynamoDBClient.getItem<TeamJoinRequest>(TEAM_JOIN_REQUEST_TABLE, requestId);
    if (!request) throw new Error('Request not found');

    const team = await this.getTeam(request.teamId);
    if (!team) throw new Error('Team not found');
    if (team.captainId !== captainId) throw new Error('Unauthorized');

    await dynamoDBClient.updateItem(TEAM_JOIN_REQUEST_TABLE, requestId, {
      status: 'REJECTED',
      respondedAt: new Date().toISOString(),
      respondedBy: captainId,
    });
  },

  /**
   * 팀 멤버 제거 (팀장 전용)
   */
  async removeTeamMember(teamId: string, memberId: string, captainId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    if (team.captainId !== captainId) throw new Error('Unauthorized: Only captain can remove members');
    if (memberId === captainId) throw new Error('Cannot remove captain from team');

    // 팀에서 멤버 제거
    await dynamoDBClient.updateItem(TEAM_TABLE, teamId, {
      memberIds: team.memberIds.filter(id => id !== memberId),
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * 세션 삭제 (팀장 전용)
   */
  async deleteSession(sessionId: string, captainId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const team = await this.getTeam(session.teamId);
    if (!team) throw new Error('Team not found');
    if (team.captainId !== captainId) throw new Error('Unauthorized');

    await dynamoDBClient.deleteItem(SESSION_TABLE, sessionId);
  },

  /**
   * 세션 상태 변경 (팀장 전용)
   */
  async updateSessionStatus(
    sessionId: string, 
    status: SessionStatus, 
    captainId: string
  ): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const team = await this.getTeam(session.teamId);
    if (!team) throw new Error('Team not found');
    if (team.captainId !== captainId) throw new Error('Unauthorized');

    return dynamoDBClient.updateItem<Session>(SESSION_TABLE, sessionId, {
      status,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * 세션 수정 (팀장 전용)
   */
  async updateSession(
    sessionId: string, 
    updates: Partial<Session>, 
    captainId: string
  ): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const team = await this.getTeam(session.teamId);
    if (!team) throw new Error('Team not found');
    if (team.captainId !== captainId) throw new Error('Unauthorized');

    return dynamoDBClient.updateItem<Session>(SESSION_TABLE, sessionId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
};
