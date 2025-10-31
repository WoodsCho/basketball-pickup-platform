# 관리자 계정 설정 가이드

## 개요

이 가이드는 플랫폼에서 관리자 계정을 생성하고 관리하는 방법을 설명합니다.

---

## 관리자 권한 시스템

### 역할(Role) 종류

1. **USER** (일반 사용자)
   - 매치 참가, 프로필 수정 등 기본 기능

2. **ADMIN** (관리자)
   - 사용자 목록 조회
   - 매치 관리 (삭제 등)
   - 코트 관리
   - 통계 대시보드 접근

3. **SUPER_ADMIN** (최고 관리자)
   - ADMIN 권한 + 추가 권한
   - 사용자 역할 변경
   - 사용자 삭제
   - 다른 관리자 임명

---

## 관리자 계정 생성 방법

### 방법 1: 회원가입 후 수동 설정 (권장)

#### 1단계: 일반 회원가입
1. 앱에 접속하여 일반 회원가입 진행
2. 온보딩 프로세스 완료 (이름, 전화번호, 포지션, 레벨 설정)

#### 2단계: DynamoDB에서 role 필드 수정

**AWS Console 사용:**
1. AWS Console → DynamoDB 접속
2. 테이블 목록에서 `User` 테이블 찾기
   - 테이블명: `User-{amplify-app-id}-{environment}`
3. `Items` 탭에서 해당 사용자 검색
4. 사용자 항목 클릭 → `Edit` 버튼
5. `role` 필드 추가/수정:
   ```json
   {
     "role": {
       "S": "ADMIN"
     }
   }
   ```
   또는
   ```json
   {
     "role": {
       "S": "SUPER_ADMIN"
     }
   }
   ```
6. `Save changes` 클릭

**AWS CLI 사용:**
```bash
aws dynamodb update-item \
  --table-name User-{your-table-id} \
  --key '{"id": {"S": "USER_ID_HERE"}}' \
  --update-expression "SET #role = :role" \
  --expression-attribute-names '{"#role": "role"}' \
  --expression-attribute-values '{":role": {"S": "ADMIN"}}'
```

#### 3단계: 로그아웃 후 재로그인
- 앱에서 로그아웃
- 다시 로그인하면 자동으로 관리자 대시보드로 이동

---

### 방법 2: Amplify Data Client로 직접 생성

프로젝트를 로컬에서 실행 중일 때 개발자 도구 콘솔에서:

```javascript
// 1. Amplify 클라이언트 가져오기
const { generateClient } = require('aws-amplify/data');
const client = generateClient();

// 2. 사용자 생성 (이미 Cognito 계정이 있다면)
await client.models.User.create({
  id: 'COGNITO_USER_ID',  // Cognito에서 확인
  email: 'admin@example.com',
  name: '관리자',
  phone: '010-1234-5678',
  position: 'ALL_ROUND',
  level: 2000,
  role: 'SUPER_ADMIN',    // 여기서 role 설정
  totalMatches: 0,
  totalRating: 0,
  attendanceRate: 100,
  noShowCount: 0,
});
```

---

### 방법 3: seed 스크립트 사용 (개발 환경)

`src/shared/utils/seed.ts`에 관리자 계정 생성 함수 추가:

```typescript
export async function seedAdmin() {
  const adminEmail = 'admin@example.com';
  
  // Cognito User ID 필요
  const cognitoUserId = 'YOUR_COGNITO_USER_ID';
  
  try {
    await client.models.User.create({
      id: cognitoUserId,
      email: adminEmail,
      name: '시스템 관리자',
      phone: '010-0000-0000',
      position: 'ALL_ROUND',
      level: 3000,
      role: 'SUPER_ADMIN',
      totalMatches: 0,
      totalRating: 0,
      attendanceRate: 100,
      noShowCount: 0,
    });
    
    console.log('✅ 관리자 계정 생성 완료');
  } catch (error) {
    console.error('❌ 관리자 계정 생성 실패:', error);
  }
}
```

개발자 도구 콘솔에서 실행:
```javascript
import { seedAdmin } from '@/shared/utils/seed';
await seedAdmin();
```

---

## Cognito User ID 확인 방법

### 방법 1: AWS Console
1. AWS Console → Cognito → User Pools
2. 해당 User Pool 선택
3. `Users` 탭에서 사용자 검색
4. 사용자 클릭 → `Username (sub)` 값이 User ID

### 방법 2: 앱 내에서 확인
로그인 후 개발자 도구 콘솔:
```javascript
// Authenticator 컴포넌트 내에서
console.log(user.userId);  // 또는
console.log(user.username);
```

### 방법 3: 디버그 정보 활용
현재 앱 우측 하단에 표시되는 디버그 정보에서 확인 가능

---

## 관리자 페이지 접근

### 자동 리다이렉션
- `role`이 `ADMIN` 또는 `SUPER_ADMIN`인 사용자는 로그인 시 자동으로 관리자 대시보드로 이동
- 일반 사용자 페이지 접근 불가

### 관리자 대시보드 기능

#### 통계 개요
- 전체 사용자 수
- 전체 매치 수
- 진행 중인 매치 수
- 등록된 코트 수

#### 최근 가입 사용자
- 최근 10명의 사용자 목록
- 이름, 이메일, 레벨, 포지션, 역할, 가입일 표시

#### 빠른 작업 (향후 구현 예정)
- 사용자 관리
- 매치 관리
- 코트 관리

---

## 보안 고려사항

### 1. 초기 관리자 설정
프로덕션 배포 전에 반드시 최소 1명의 SUPER_ADMIN 계정을 생성하세요.

### 2. 이메일 도메인 제한 (선택사항)
특정 도메인(예: @company.com)만 관리자로 승격 가능하도록 제한:

```typescript
// authService.ts에 추가
async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  const user = await this.getUserProfile(userId);
  
  // 이메일 도메인 체크
  if (role !== 'USER' && !user?.email.endsWith('@company.com')) {
    throw new Error('권한 없음: 관리자는 회사 이메일만 가능합니다');
  }
  
  // ... 기존 로직
}
```

### 3. Cognito Groups 통합 (선택사항)
더 강력한 보안을 위해 Cognito Groups와 연동:

```typescript
// amplify/auth/resource.ts
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ['ADMIN', 'SUPER_ADMIN'],
});
```

---

## 권한 체크 로직

### 프론트엔드 체크
```typescript
import { useAdminCheck } from '@/features/admin';

function MyComponent() {
  const { isAdmin, isSuperAdmin } = useAdminCheck(userId);
  
  if (!isAdmin) {
    return <div>접근 권한이 없습니다</div>;
  }
  
  return <AdminPanel />;
}
```

### 백엔드 체크 (Amplify Authorization)
```typescript
// amplify/data/resource.ts
User: a
  .model({ /* ... */ })
  .authorization((allow) => [
    allow.owner(),
    allow.authenticated().to(['read']),
    allow.groups(['ADMIN', 'SUPER_ADMIN']).to(['read', 'update', 'delete']),
  ]),
```

---

## 문제 해결

### Q: 관리자로 설정했는데 일반 페이지가 표시됩니다
**A:** 다음을 확인하세요:
1. 로그아웃 후 재로그인
2. 브라우저 캐시 삭제
3. DynamoDB에서 role 필드가 정확히 설정되었는지 확인
4. 개발자 도구에서 `userProfile.role` 값 확인

### Q: role 필드가 표시되지 않습니다
**A:** 
1. Amplify 백엔드가 최신 버전으로 배포되었는지 확인
2. `npx ampx sandbox` 재시작
3. DynamoDB 테이블 스키마 확인

### Q: 권한이 없다는 오류가 발생합니다
**A:**
1. Amplify Data Schema의 authorization 규칙 확인
2. Cognito Groups 설정 확인 (사용하는 경우)
3. 사용자가 올바른 User Pool에 속해있는지 확인

---

## 향후 개선 사항

### 1. 관리자 초대 시스템
- 이메일로 관리자 초대 링크 발송
- 초대 토큰 기반 자동 권한 부여

### 2. 역할 기반 세부 권한
- 권한 매트릭스 정의
- 기능별 접근 제어

### 3. 감사 로그
- 관리자 활동 로깅
- 중요 작업(삭제, 권한 변경 등) 추적

### 4. 관리자 전용 API
- GraphQL Resolver에 권한 체크 추가
- Lambda Authorizer 구현

---

## 관련 파일

- `amplify/data/resource.ts` - User 모델 스키마
- `src/shared/types/index.ts` - UserRole 타입 정의
- `src/features/admin/services/adminService.ts` - 관리자 서비스
- `src/features/admin/hooks/useAdmin.ts` - 관리자 훅
- `src/features/admin/pages/AdminDashboardPage.tsx` - 관리자 대시보드
- `src/App.tsx` - 권한 체크 및 라우팅

---

## 추가 도움말

관리자 기능 관련 문의사항은 GitHub Issues를 이용해주세요.
