// ========================================
// Basketball Pickup Platform - Type Definitions
// ========================================

// User Types
export type Position = 'GUARD' | 'FORWARD' | 'CENTER' | 'ALL_ROUND';
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
  profileImage?: string;
  
  // Role
  role?: UserRole;
  
  // Basketball info
  position: Position;
  level: number; // 1000-3000
  
  // Stats
  totalMatches: number;
  totalRating: number;
  attendanceRate: number;
  noShowCount: number;
  
  // Badges
  badges?: string[]; // badge IDs
  
  createdAt: string;
  updatedAt: string;
};

// Match Types
export type GameType = 'THREE_V_THREE' | 'FIVE_V_FIVE';
export type MatchStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'COMPLETED';

// Display helpers
export const getGameTypeLabel = (gameType: GameType): string => {
  return gameType === 'THREE_V_THREE' ? '3v3' : '5v5';
};

export type Match = {
  id: string;
  
  // Basic info
  title: string;
  courtId: string;
  date: string; // ISO 8601
  startTime: string;
  duration: number; // minutes
  
  // Game settings
  gameType: GameType;
  levelMin: number;
  levelMax: number;
  
  // Players
  maxPlayers: number;
  currentPlayerIds?: string[]; // user IDs (from DB)
  currentPlayers: string[]; // user IDs (for display compatibility)
  guardSlots: number;
  forwardSlots: number;
  centerSlots: number;
  
  // Price
  pricePerPerson: number;
  
  // Status
  status: MatchStatus;
  
  // Owner
  createdBy?: string; // user ID
  createdAt: string;
  updatedAt: string;
};

// Court Types
export type CourtType = 'INDOOR' | 'OUTDOOR';
export type CourtSize = 'THREE_V_THREE' | 'FIVE_V_FIVE' | 'BOTH';

export const getCourtSizeLabel = (size: CourtSize): string => {
  if (size === 'THREE_V_THREE') return '3v3';
  if (size === 'FIVE_V_FIVE') return '5v5';
  return '3v3 & 5v5';
};

export type Court = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  images?: string[];
  
  // Facility info
  courtType?: CourtType;
  courtSize?: CourtSize;
  floor?: string; // 우레탄, 마루 등
  facilities?: string[]; // 샤워실, 주차장 등
  
  // Partner court
  isPartner?: boolean;
  hasAICamera?: boolean;
  
  // Price
  pricePerHour: number;
  
  createdAt: string;
  updatedAt: string;
};

// Rating Types
export type SkillRatings = {
  shooting: number;
  dribble: number;
  pass: number;
  defense: number;
  teamwork: number;
  manner: number;
  communication: number;
};

export type Rating = {
  id: string;
  matchId: string;
  
  // Rater/Ratee
  fromUserId: string;
  toUserId: string;
  
  // Ratings (1-5)
  ratings: SkillRatings;
  
  // Overall
  overallRating: number;
  comment?: string;
  
  createdAt: string;
};

// Badge Types
export type BadgeCategory = 'SKILL' | 'MANNER' | 'SPECIAL';
export type SkillType = 'SHOOTING' | 'DRIBBLE' | 'DEFENSE' | 'PLAYMAKING';
export type BadgeLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'LEGEND';
export type RequirementType = 'CONSECUTIVE_RATING' | 'TOTAL_GAMES' | 'MVP_COUNT';

export type Badge = {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  
  category: BadgeCategory;
  skillType?: SkillType;
  
  level: BadgeLevel;
  
  // Requirements
  requirement: {
    type: RequirementType;
    count: number;
    threshold?: number; // rating threshold
  };
  
  // Benefits
  benefits: string[];
  
  // Meta
  rarity: number; // 1-100
  icon: string;
};

export type UserBadge = {
  userId: string;
  badgeId: string;
  
  progress: number; // 0-100
  isCompleted: boolean;
  completedAt?: string;
  
  // Progress tracking
  currentStreak: number;
  bestStreak: number;
  
  updatedAt: string;
};

// Payment Types
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type Payment = {
  id: string;
  userId: string;
  matchId: string;
  
  amount: number;
  status: PaymentStatus;
  
  paymentMethod: string;
  transactionId?: string;
  
  createdAt: string;
  updatedAt: string;
};

// Utility Types
export type LevelCategory = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO';

export const getLevelCategory = (level: number): LevelCategory => {
  if (level < 1500) return 'BEGINNER';
  if (level < 2000) return 'INTERMEDIATE';
  if (level < 2500) return 'ADVANCED';
  return 'PRO';
};

export const getLevelLabel = (level: number): string => {
  const category = getLevelCategory(level);
  const labels: Record<LevelCategory, string> = {
    BEGINNER: '초급',
    INTERMEDIATE: '중급',
    ADVANCED: '상급',
    PRO: '프로'
  };
  return labels[category];
};

export const getPositionLabel = (position: Position): string => {
  const labels: Record<Position, string> = {
    GUARD: '가드',
    FORWARD: '포워드',
    CENTER: '센터',
    ALL_ROUND: '올라운드'
  };
  return labels[position];
};
