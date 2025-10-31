# Basketball Pickup Platform - 개발 문서

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [시작하기](#시작하기)
5. [아키텍처 설계](#아키텍처-설계)
6. [주요 기능](#주요-기능)
7. [데이터베이스 스키마](#데이터베이스-스키마)
8. [API 가이드](#api-가이드)
9. [개발 가이드](#개발-가이드)
10. [배포](#배포)

---

## 프로젝트 개요

농구 픽업 게임 매칭 플랫폼 MVP입니다. 사용자가 원하는 시간과 장소에서 같은 레벨의 플레이어들과 농구 게임을 구성할 수 있습니다.

### 주요 목표
- 🏀 빠르고 쉬운 픽업 게임 매칭
- 👥 실력 기반 플레이어 매칭
- 📍 지역별 농구장 정보 제공
- ⭐ 플레이어 평가 및 피드백 시스템

---

## 기술 스택

### Frontend
- **React 18.2.0** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite 5.4.10** - 빌드 도구
- **Tailwind CSS 3.4.1** - 스타일링
- **Lucide React** - 아이콘

### Backend
- **AWS Amplify Gen 2** - 백엔드 인프라
- **AWS AppSync** - GraphQL API
- **Amazon DynamoDB** - NoSQL 데이터베이스
- **Amazon Cognito** - 사용자 인증

### 상태 관리 & 데이터 페칭
- **React Hooks** - 로컬 상태 관리
- **AWS Amplify Data Client** - 서버 상태 관리

---

## 프로젝트 구조

```
basketball-pickup-platform/
├── amplify/                    # AWS Amplify 백엔드 설정
│   ├── auth/
│   │   └── resource.ts        # Cognito 인증 설정
│   ├── data/
│   │   └── resource.ts        # GraphQL 스키마 & DynamoDB 모델
│   └── backend.ts             # Amplify 백엔드 정의
│
├── src/
│   ├── core/                  # 핵심 인프라 레이어
│   │   └── api/
│   │       └── client.ts      # Amplify API 클라이언트 (Singleton)
│   │
│   ├── features/              # 기능별 모듈 (MSA 패턴)
│   │   ├── auth/             # 인증 모듈
│   │   │   ├── components/   # OnboardingPage.tsx
│   │   │   ├── services/     # authService.ts (비즈니스 로직)
│   │   │   ├── hooks/        # useAuth.ts (React 상태 관리)
│   │   │   ├── types/        # auth.types.ts
│   │   │   └── index.ts      # 공개 API
│   │   │
│   │   └── match/            # 매치 모듈
│   │       ├── components/   # MatchCard.tsx
│   │       ├── pages/        # MatchListPage.tsx
│   │       ├── services/     # matchService.ts
│   │       ├── hooks/        # useMatches.ts, useMatch.ts
│   │       ├── types/        # match.types.ts
│   │       └── index.ts      # 공개 API
│   │
│   └── shared/               # 공통 리소스
│       ├── components/       # Button, Card, Input, Badge
│       ├── utils/            # helpers.ts (formatDate, formatPrice, etc.)
│       └── types/            # 공통 타입 정의
│
├── public/                   # 정적 파일
├── dist/                     # 빌드 결과물
├── package.json
├── tsconfig.json             # TypeScript 설정 (path aliases 포함)
├── vite.config.ts            # Vite 설정
├── tailwind.config.js        # Tailwind CSS 설정
└── amplify.yml               # Amplify 호스팅 빌드 설정
```

### 폴더 구조 설계 원칙

#### 1. **Feature-based Architecture (기능 기반 아키텍처)**
각 기능이 독립적인 모듈로 구성되어 있습니다:
- 관련 코드가 한 곳에 모여 있어 찾기 쉬움
- 기능 단위로 개발/테스트 가능
- 팀 협업 시 충돌 최소화

#### 2. **Layered Architecture (계층 아키텍처)**
각 모듈은 다음 계층으로 구성됩니다:
- **Components**: UI 컴포넌트
- **Pages**: 페이지 컴포넌트
- **Services**: 비즈니스 로직 & API 호출
- **Hooks**: React 상태 관리
- **Types**: TypeScript 타입 정의

#### 3. **Shared Resources (공통 리소스)**
여러 모듈에서 사용하는 코드는 `shared/`에 위치:
- UI 컴포넌트 (Button, Card, Input 등)
- 유틸리티 함수 (날짜 포맷, 가격 포맷 등)
- 공통 타입 정의

---

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn
- AWS 계정 (Amplify 배포 시)

### 설치

```bash
# 저장소 클론
git clone https://github.com/WoodsCho/basketball-pickup-platform.git
cd basketball-pickup-platform

# 의존성 설치
npm install

# Amplify 백엔드 설정 (로컬)
npm run dev
```

### 환경 변수

프로젝트는 Amplify가 자동으로 생성하는 환경 변수를 사용합니다.
별도의 `.env` 파일이 필요하지 않습니다.

### 로컬 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 아키텍처 설계

### MSA (Microservices Architecture) 패턴

이 프로젝트는 MSA 원칙을 적용하여 구성되었습니다:

#### 모듈 독립성
각 기능 모듈(`auth`, `match`, `user` 등)은:
- 독립적으로 개발/배포 가능
- 명확한 책임 영역 (Single Responsibility)
- 다른 모듈과의 의존성 최소화

#### Service Layer Pattern
```typescript
// 비즈니스 로직은 Service에서 처리
export class MatchService {
  async getMatches(filters?: MatchFilters): Promise<Match[]> {
    // API 호출 로직
  }
  
  async joinMatch(matchId: string, userId: string): Promise<boolean> {
    // 참가 로직
  }
}

// React 컴포넌트는 Hook을 통해 Service 사용
export const useMatches = (filters?: MatchFilters) => {
  const [matches, setMatches] = useState<Match[]>([]);
  // Hook 로직
};
```

#### 의존성 방향
```
Components → Hooks → Services → Core API Client
     ↓
   Types
```

### TypeScript Path Aliases

깔끔한 import를 위한 경로 별칭 설정:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"],
      "@/core/*": ["src/core/*"]
    }
  }
}
```

사용 예시:
```typescript
// ❌ 상대 경로 (복잡함)
import { Button } from '../../../shared/components/Button';

// ✅ 절대 경로 (깔끔함)
import { Button } from '@/shared/components';
```

---

## 주요 기능

### 1. 사용자 인증 (Auth)

#### 회원가입 & 로그인
- AWS Cognito 기반 이메일 인증
- 자동 토큰 관리

#### 온보딩 플로우
사용자가 처음 로그인하면 3단계 온보딩:
1. **기본 정보**: 이름, 전화번호
2. **포지션 선택**: 가드/포워드/센터/올라운드
3. **레벨 설정**: 1000-3000 (초급~프로)

```typescript
// useAuth 훅 사용 예시
const { user, loading, needsOnboarding, completeOnboarding } = useAuth(cognitoUser);

if (needsOnboarding) {
  return <OnboardingPage onComplete={completeOnboarding} />;
}
```

### 2. 매치 시스템 (Match)

#### 매치 리스트
- 모집 중인 게임 목록 표시
- 실시간 참가 인원 업데이트
- 필터링 (날짜, 게임 타입, 레벨 등)

#### 매치 카드 정보
- 게임 타입 (3v3 / 5v5)
- 날짜 및 시간
- 농구장 정보
- 레벨 범위
- 참가 인원 / 최대 인원
- 참가 비용

```typescript
// useMatches 훅 사용 예시
const { matches, loading, refetch } = useMatches({ status: 'OPEN' });
```

### 3. 농구장 정보 (Court)

- 농구장 위치 (지도)
- 시설 정보 (실내/실외, 바닥 재질, 편의시설)
- 파트너 코트 여부
- 시간당 대관료

---

## 데이터베이스 스키마

### User (사용자)

```typescript
{
  id: string;              // Cognito User ID
  email: string;
  name: string;
  phone: string;
  profileImage?: string;
  
  // 농구 정보
  position: 'GUARD' | 'FORWARD' | 'CENTER' | 'ALL_ROUND';
  level: number;           // 1000-3000
  
  // 통계
  totalMatches: number;
  totalRating: number;
  attendanceRate: number;
  noShowCount: number;
  
  createdAt: string;
  updatedAt: string;
}
```

### Match (매치)

```typescript
{
  id: string;
  title: string;
  courtId: string;
  date: string;            // ISO 8601
  startTime: string;
  duration: number;        // 분
  
  // 게임 설정
  gameType: 'THREE_V_THREE' | 'FIVE_V_FIVE';
  levelMin: number;
  levelMax: number;
  
  // 참가자
  maxPlayers: number;
  currentPlayerIds: string[];
  guardSlots: number;
  forwardSlots: number;
  centerSlots: number;
  
  // 금액
  pricePerPerson: number;
  
  // 상태
  status: 'OPEN' | 'FULL' | 'CLOSED' | 'COMPLETED';
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### Court (농구장)

```typescript
{
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  images: string[];
  
  // 시설 정보
  courtType: 'INDOOR' | 'OUTDOOR';
  courtSize: 'THREE_V_THREE' | 'FIVE_V_FIVE' | 'BOTH';
  floor: string;           // 우레탄, 마루 등
  facilities: string[];    // 샤워실, 주차장 등
  
  // 파트너
  isPartner: boolean;
  hasAICamera: boolean;
  
  pricePerHour: number;
  
  createdAt: string;
  updatedAt: string;
}
```

### Rating (평가)

```typescript
{
  id: string;
  matchId: string;
  fromUserId: string;      // 평가자
  toUserId: string;        // 피평가자
  
  // 세부 평가 (1-5점)
  ratings: {
    shooting: number;
    dribble: number;
    pass: number;
    defense: number;
    teamwork: number;
    manner: number;
    communication: number;
  };
  
  overallRating: number;
  comment?: string;
  
  createdAt: string;
}
```

### Badge (뱃지)

```typescript
{
  id: string;
  name: string;
  nameKo: string;
  description: string;
  
  category: 'SKILL' | 'MANNER' | 'SPECIAL';
  skillType?: 'SHOOTING' | 'DRIBBLE' | 'DEFENSE' | 'PLAYMAKING';
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'LEGEND';
  
  // 획득 조건
  requirement: {
    type: 'CONSECUTIVE_RATING' | 'TOTAL_GAMES' | 'MVP_COUNT';
    count: number;
    threshold?: number;
  };
  
  benefits: string[];
  rarity: number;          // 1-100
  icon: string;
}
```

---

## API 가이드

### Amplify Data Client 사용법

#### 1. API Client 가져오기

```typescript
import { apiClient } from '@/core/api/client';
```

#### 2. CRUD 작업

**Create (생성)**
```typescript
const { data, errors } = await apiClient.models.Match.create({
  title: "강남 5v5 풀코트",
  courtId: "court-123",
  date: "2024-12-01",
  startTime: "19:00",
  duration: 120,
  gameType: "FIVE_V_FIVE",
  // ... 나머지 필드
});
```

**Read (조회)**
```typescript
// 단일 조회
const { data } = await apiClient.models.Match.get({ id: "match-123" });

// 리스트 조회
const { data } = await apiClient.models.Match.list();

// 필터링
const { data } = await apiClient.models.Match.list({
  filter: {
    status: { eq: 'OPEN' },
    date: { ge: '2024-12-01' }
  }
});
```

**Update (수정)**
```typescript
const { data } = await apiClient.models.Match.update({
  id: "match-123",
  status: "FULL"
});
```

**Delete (삭제)**
```typescript
const { data } = await apiClient.models.Match.delete({
  id: "match-123"
});
```

### Service Layer 패턴

비즈니스 로직은 Service 클래스에서 처리:

```typescript
// features/match/services/matchService.ts
export class MatchService {
  async joinMatch(matchId: string, userId: string): Promise<boolean> {
    try {
      // 1. 현재 매치 정보 조회
      const match = await this.getMatch(matchId);
      if (!match) return false;
      
      // 2. 검증 로직
      if (match.currentPlayerIds.includes(userId)) return false;
      if (match.currentPlayerIds.length >= match.maxPlayers) return false;
      
      // 3. 업데이트
      const updatedPlayers = [...match.currentPlayerIds, userId];
      const newStatus = updatedPlayers.length >= match.maxPlayers 
        ? 'FULL' 
        : match.status;
      
      await apiClient.models.Match.update({
        id: matchId,
        currentPlayerIds: updatedPlayers,
        status: newStatus,
      });
      
      return true;
    } catch (error) {
      console.error('Error joining match:', error);
      return false;
    }
  }
}
```

---

## 개발 가이드

### 새 기능 모듈 추가하기

#### 1. 폴더 구조 생성

```bash
src/features/새기능/
├── components/
├── pages/
├── services/
├── hooks/
├── types/
└── index.ts
```

#### 2. Service 작성

```typescript
// services/새기능Service.ts
import { apiClient } from '@/core/api/client';

export class 새기능Service {
  async getData() {
    const { data } = await apiClient.models.모델명.list();
    return data;
  }
}

export const 새기능Service = new 새기능Service();
```

#### 3. Hook 작성

```typescript
// hooks/use새기능.ts
import { useState, useEffect } from 'react';
import { 새기능Service } from '../services/새기능Service';

export const use새기능 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    const result = await 새기능Service.getData();
    setData(result);
    setLoading(false);
  };
  
  return { data, loading, refetch: fetchData };
};
```

#### 4. 공개 API 정의

```typescript
// index.ts
export { 새기능Service } from './services/새기능Service';
export { use새기능 } from './hooks/use새기능';
export type { 새기능Type } from './types/새기능.types';
```

### UI 컴포넌트 개발

#### Shared 컴포넌트 사용

```typescript
import { Button, Card, Input, Badge } from '@/shared/components';

function MyComponent() {
  return (
    <Card hover onClick={handleClick}>
      <h3>제목</h3>
      <Input placeholder="입력하세요" />
      <Button variant="primary" size="lg">
        확인
      </Button>
      <Badge level="GOLD">골드</Badge>
    </Card>
  );
}
```

#### 컴포넌트 Props

**Button**
```typescript
{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}
```

**Card**
```typescript
{
  hover?: boolean;  // hover 효과
}
```

**Input**
```typescript
{
  label?: string;
  error?: string;
  helperText?: string;
}
```

**Badge**
```typescript
{
  level?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'LEGEND';
  size?: 'sm' | 'md' | 'lg';
}
```

### 유틸리티 함수

```typescript
import { 
  formatDate,      // '2024-12-01' → '12월 1일 (일)'
  formatTime,      // '19:00' → '오후 7:00'
  formatPrice,     // 15000 → '15,000원'
  getLevelLabel,   // 1800 → '중급'
  getLevelCategory // 1800 → 'INTERMEDIATE'
} from '@/shared/utils';
```

### 타입 정의

공통 타입은 `@/shared/types`에서 import:

```typescript
import type { 
  Match, 
  User, 
  Court, 
  Position, 
  GameType, 
  MatchStatus 
} from '@/shared/types';
```

---

## 배포

### AWS Amplify 호스팅

#### 자동 배포 설정
GitHub `main` 브랜치에 push하면 자동으로 배포됩니다.

```bash
git add .
git commit -m "feat: 새 기능 추가"
git push origin main
```

#### 빌드 설정 (amplify.yml)

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci --cache .npm --prefer-offline
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - .npm/**/*
      - node_modules/**/*
```

#### 환경 변수
Amplify 콘솔에서 자동 설정됨:
- `AWS_APP_ID`
- `AWS_BRANCH`
- Cognito 설정
- AppSync API 엔드포인트

### 로컬 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

---

## 트러블슈팅

### 자주 발생하는 문제

#### 1. Tailwind CSS 4.0 오류
**증상**: PostCSS 플러그인 에러

**해결**:
```bash
npm uninstall tailwindcss
npm install -D tailwindcss@3.4.1
```

#### 2. GraphQL Enum 값 에러
**증상**: '3v3', '5v5' 같은 숫자로 시작하는 enum 오류

**해결**: Enum 값을 문자로 시작하도록 변경
```typescript
// ❌ 잘못된 예
gameType: '3v3' | '5v5'

// ✅ 올바른 예
gameType: 'THREE_V_THREE' | 'FIVE_V_FIVE'
```

#### 3. Amplify 배포 실패
**증상**: CloudFormation 스택 생성 실패

**해결**: 
- `amplify/auth/resource.ts`에서 복잡한 설정 제거
- MFA, custom attributes 등 단순화

#### 4. Import 경로 에러
**증상**: 모듈을 찾을 수 없음

**해결**: tsconfig.json 및 vite.config.ts의 path alias 확인

---

## 개발 로드맵

### Phase 1 (MVP) ✅ 완료
- [x] 프로젝트 설정
- [x] 사용자 인증 (Cognito)
- [x] 온보딩 플로우
- [x] 매치 리스트 페이지
- [x] MSA 아키텍처 적용

### Phase 2 (진행 중)
- [ ] 매치 상세 페이지
- [ ] 매치 생성 페이지
- [ ] 프로필 페이지
- [ ] React Router 통합

### Phase 3
- [ ] 평가 시스템
- [ ] 뱃지 시스템
- [ ] 실시간 알림

### Phase 4
- [ ] 지도 통합 (Kakao/Naver)
- [ ] 결제 시스템
- [ ] AI 카메라 연동

---

## 코드 컨벤션

### TypeScript
- PascalCase: 컴포넌트, 타입, 인터페이스
- camelCase: 함수, 변수
- UPPER_SNAKE_CASE: 상수

### 파일명
- 컴포넌트: `PascalCase.tsx`
- 서비스: `camelCaseService.ts`
- 훅: `useCamelCase.ts`
- 타입: `camelCase.types.ts`

### Import 순서
```typescript
// 1. 외부 라이브러리
import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

// 2. 내부 모듈 (@/ alias)
import { Button, Card } from '@/shared/components';
import { useAuth } from '@/features/auth';

// 3. 상대 경로
import { helper } from './utils';

// 4. 타입
import type { Match } from '@/shared/types';
```

### 커밋 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
docs: 문서 수정
style: 코드 포맷팅
test: 테스트 추가
chore: 빌드/설정 변경
```

---

## 팀 협업

### PR 프로세스
1. feature 브랜치 생성
2. 개발 및 커밋
3. GitHub PR 생성
4. 코드 리뷰
5. main 브랜치 병합
6. 자동 배포

### 코드 리뷰 체크리스트
- [ ] 타입 안정성 확인
- [ ] 에러 핸들링 존재
- [ ] 컴포넌트 재사용성
- [ ] 성능 최적화 (memo, useMemo 등)
- [ ] 접근성 (a11y)
- [ ] 반응형 디자인

---

## 참고 자료

### 공식 문서
- [AWS Amplify Gen 2](https://docs.amplify.aws/)
- [React 공식 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 프로젝트 링크
- **GitHub**: https://github.com/WoodsCho/basketball-pickup-platform
- **배포 URL**: AWS Amplify 콘솔에서 확인

---

## 라이센스

MIT License

---

## 문의

프로젝트 관련 문의사항은 GitHub Issues를 이용해주세요.
