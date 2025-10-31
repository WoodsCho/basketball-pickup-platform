/**
 * Migration Script - Add role field to existing users
 * 기존 사용자에게 role 필드 추가
 * 
 * 사용법:
 * 1. 개발자 도구 콘솔에서 이 스크립트 복사
 * 2. 로그인한 상태에서 실행
 */

import { apiClient } from '@/core/api/client';

export async function migrateUserRoles() {
  try {
    console.log('🔄 사용자 role 마이그레이션 시작...');
    
    // 모든 사용자 조회
    const { data: users } = await apiClient.models.User.list();
    
    if (!users || users.length === 0) {
      console.log('⚠️ 사용자가 없습니다.');
      return;
    }
    
    console.log(`📊 총 ${users.length}명의 사용자 발견`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const user of users) {
      // role 필드가 이미 있으면 건너뛰기
      if (user.role) {
        console.log(`⏭️ ${user.name} - role이 이미 설정됨: ${user.role}`);
        skipped++;
        continue;
      }
      
      try {
        // role 필드 추가 (기본값: USER)
        await apiClient.models.User.update({
          id: user.id,
          role: 'USER',
        });
        
        console.log(`✅ ${user.name} (${user.email}) - role='USER' 추가 완료`);
        updated++;
      } catch (error) {
        console.error(`❌ ${user.name} 업데이트 실패:`, error);
      }
    }
    
    console.log('\n📈 마이그레이션 완료!');
    console.log(`  - 업데이트: ${updated}명`);
    console.log(`  - 건너뜀: ${skipped}명`);
    console.log(`  - 총: ${users.length}명`);
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
  }
}

// 특정 사용자를 관리자로 설정
export async function setUserAsAdmin(userId: string, role: 'ADMIN' | 'SUPER_ADMIN' = 'ADMIN') {
  try {
    await apiClient.models.User.update({
      id: userId,
      role: role,
    });
    
    console.log(`✅ 사용자 ${userId}의 role을 ${role}로 설정했습니다.`);
    console.log('🔄 로그아웃 후 재로그인하면 관리자 대시보드로 이동합니다.');
  } catch (error) {
    console.error('❌ 권한 설정 실패:', error);
  }
}

// 사용 예시
console.log(`
🛠️ 마이그레이션 스크립트가 로드되었습니다.

사용 방법:
1. 모든 사용자에게 role 추가:
   await migrateUserRoles()

2. 특정 사용자를 관리자로 설정:
   await setUserAsAdmin('YOUR_USER_ID', 'ADMIN')
   또는
   await setUserAsAdmin('YOUR_USER_ID', 'SUPER_ADMIN')

현재 로그인 사용자 ID: ${localStorage.getItem('CognitoIdentityServiceProvider.lastAuthUser') || '확인 불가'}
`);
