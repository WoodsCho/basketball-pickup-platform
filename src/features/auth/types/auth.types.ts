/**
 * Auth Module Types
 */
import type { Position, UserRole } from '../../../shared/types';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  profileImage?: string;
  
  // Role
  role?: UserRole;
  
  // Basketball info
  position: Position;
  level: number;
  
  // Stats
  totalMatches: number;
  totalRating: number;
  attendanceRate: number;
  noShowCount: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingData {
  name: string;
  phone: string;
  position: Position;
  level: number;
}

export interface CognitoUser {
  userId: string;
  signInDetails?: {
    loginId?: string;
  };
}
