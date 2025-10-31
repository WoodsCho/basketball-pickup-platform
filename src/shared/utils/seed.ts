/**
 * Seed data for development
 * Run this after authentication to populate the database
 */

import { apiClient as client } from '../../core/api/client';

export async function seedCourts() {
  const courts = [
    {
      name: '강남 스카이 농구장',
      address: '서울특별시 강남구 테헤란로 123',
      lat: 37.5012,
      lng: 127.0396,
      images: ['https://via.placeholder.com/400x300'],
      courtType: 'INDOOR' as const,
      courtSize: 'BOTH' as const,
      floor: '우레탄',
      facilities: ['샤워실', '주차장', '락커룸'],
      isPartner: true,
      hasAICamera: false,
      pricePerHour: 50000,
    },
    {
      name: '홍대 스트리트 코트',
      address: '서울특별시 마포구 홍익로 456',
      lat: 37.5563,
      lng: 126.9237,
      images: ['https://via.placeholder.com/400x300'],
      courtType: 'OUTDOOR' as const,
      courtSize: 'FIVE_V_FIVE' as const,
      floor: '아스팔트',
      facilities: ['주차장'],
      isPartner: false,
      hasAICamera: false,
      pricePerHour: 0,
    },
    {
      name: '잠실 프리미엄 코트',
      address: '서울특별시 송파구 올림픽로 789',
      lat: 37.5133,
      lng: 127.1028,
      images: ['https://via.placeholder.com/400x300'],
      courtType: 'INDOOR' as const,
      courtSize: 'BOTH' as const,
      floor: '마루',
      facilities: ['샤워실', '주차장', '락커룸', '에어컨'],
      isPartner: true,
      hasAICamera: true,
      pricePerHour: 80000,
    },
  ];

  console.log('🏀 Seeding courts...');
  
  for (const court of courts) {
    try {
      await client.models.Court.create(court);
      console.log(`✅ Created court: ${court.name}`);
    } catch (error) {
      console.error(`❌ Failed to create court: ${court.name}`, error);
    }
  }
}

export async function seedMatches(courtIds: string[]) {
  if (courtIds.length === 0) {
    console.log('⚠️ No courts found. Please seed courts first.');
    return;
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const matches = [
    {
      title: '강남 주말 5vs5 게임',
      courtId: courtIds[0],
      date: tomorrow.toISOString().split('T')[0],
      startTime: '18:00:00',
      duration: 120,
      gameType: 'FIVE_V_FIVE' as const,
      levelMin: 1500,
      levelMax: 2000,
      maxPlayers: 10,
      currentPlayerIds: [],
      guardSlots: 4,
      forwardSlots: 4,
      centerSlots: 2,
      pricePerPerson: 15000,
      status: 'OPEN' as const,
    },
    {
      title: '홍대 3vs3 스트리트볼',
      courtId: courtIds[1],
      date: today.toISOString().split('T')[0],
      startTime: '20:00:00',
      duration: 90,
      gameType: 'THREE_V_THREE' as const,
      levelMin: 1000,
      levelMax: 1800,
      maxPlayers: 6,
      currentPlayerIds: [],
      guardSlots: 2,
      forwardSlots: 2,
      centerSlots: 2,
      pricePerPerson: 10000,
      status: 'OPEN' as const,
    },
    {
      title: '잠실 프로급 매치업',
      courtId: courtIds[2],
      date: tomorrow.toISOString().split('T')[0],
      startTime: '19:00:00',
      duration: 150,
      gameType: 'FIVE_V_FIVE' as const,
      levelMin: 2000,
      levelMax: 3000,
      maxPlayers: 10,
      currentPlayerIds: [],
      guardSlots: 4,
      forwardSlots: 4,
      centerSlots: 2,
      pricePerPerson: 20000,
      status: 'OPEN' as const,
    },
  ];

  console.log('🏀 Seeding matches...');
  
  for (const match of matches) {
    try {
      await client.models.Match.create(match);
      console.log(`✅ Created match: ${match.title}`);
    } catch (error) {
      console.error(`❌ Failed to create match: ${match.title}`, error);
    }
  }
}

export async function seedBadges() {
  const badges = [
    {
      name: 'sharpshooter_bronze',
      nameKo: '🥉 슈터 브론즈',
      description: '슈팅 평가 4.0 이상을 3경기 연속 달성',
      category: 'SKILL' as const,
      skillType: 'SHOOTING' as const,
      level: 'BRONZE' as const,
      requirementType: 'CONSECUTIVE_RATING' as const,
      requirementCount: 3,
      requirementThreshold: 4.0,
      benefits: ['슈팅 실력 인증'],
      rarity: 30,
      icon: '🎯',
    },
    {
      name: 'manner_silver',
      nameKo: '🥈 매너왕 실버',
      description: '매너 평가 4.5 이상을 5경기 연속 달성',
      category: 'MANNER' as const,
      level: 'SILVER' as const,
      requirementType: 'CONSECUTIVE_RATING' as const,
      requirementCount: 5,
      requirementThreshold: 4.5,
      benefits: ['신뢰도 상승', '우선 매칭'],
      rarity: 25,
      icon: '😊',
    },
    {
      name: 'attendance_gold',
      nameKo: '🥇 출석왕 골드',
      description: '총 30경기 참가 달성',
      category: 'SPECIAL' as const,
      level: 'GOLD' as const,
      requirementType: 'TOTAL_GAMES' as const,
      requirementCount: 30,
      benefits: ['단골 플레이어 인증', '할인 혜택'],
      rarity: 20,
      icon: '📅',
    },
  ];

  console.log('🏀 Seeding badges...');
  
  for (const badge of badges) {
    try {
      await client.models.Badge.create(badge);
      console.log(`✅ Created badge: ${badge.nameKo}`);
    } catch (error) {
      console.error(`❌ Failed to create badge: ${badge.nameKo}`, error);
    }
  }
}

export async function seedAll() {
  try {
    console.log('🚀 Starting database seed...\n');
    
    // Seed courts first
    await seedCourts();
    
    // Get court IDs
    const { data: courts } = await client.models.Court.list();
    const courtIds = courts.map(court => court.id);
    
    // Seed matches with court IDs
    await seedMatches(courtIds);
    
    // Seed badges
    await seedBadges();
    
    console.log('\n✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}
