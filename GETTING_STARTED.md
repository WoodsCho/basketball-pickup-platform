# 🏀 농구 픽업 매칭 플랫폼 - 빠른 시작 가이드

## 🎉 프로젝트 셋업 완료!

농구 픽업 게임 매칭 플랫폼의 기본 구조가 완성되었습니다.

---

## 📊 현재 진행 상황

### ✅ 완료된 작업

1. **프로젝트 셋업**
   - React + TypeScript + Vite 환경
   - Tailwind CSS 스타일링 시스템
   - Amplify Gen 2 백엔드 구조

2. **데이터 모델 설계**
   - User (사용자)
   - Match (매치)
   - Court (구장)
   - Rating (평가)
   - Badge (배지)
   - UserBadge (사용자-배지 연결)
   - Payment (결제)

3. **인증 시스템**
   - Amplify Auth (이메일 로그인)

4. **UI 컴포넌트**
   - Button, Card, Input, Badge 기본 컴포넌트
   - MatchCard (매치 카드)
   - HomePage (메인 페이지)

5. **유틸리티**
   - 날짜/시간/가격 포맷팅
   - 레벨/포지션 라벨 변환
   - 샘플 데이터 시드 스크립트

---

## 🚀 개발 서버 실행 방법

### 1. 현재 실행 중인 서버 확인

이미 2개의 서버가 실행 중입니다:

```
✅ Amplify Sandbox: 백엔드 API 서버 (터미널 1)
✅ Vite Dev Server: 프론트엔드 개발 서버 (터미널 2)
   → http://localhost:5173/
```

### 2. 브라우저에서 확인

1. 브라우저에서 **http://localhost:5173/** 접속
2. Amplify Authenticator 로그인 화면 표시
3. 계정 생성 또는 로그인
4. 메인 페이지 확인

---

## 🎨 현재 구현된 기능

### 홈 페이지 (HomePage.tsx)
- 헤더 (로고, 매치 만들기 버튼)
- 위치 표시 바
- 검색 및 필터
- 매치 리스트 (MatchCard 컴포넌트)
- 하단 네비게이션 (모바일)

### 인증 (Amplify UI Authenticator)
- 이메일 로그인/회원가입
- 자동 세션 관리

---

## 📝 다음 개발 단계

### Phase 1 - 필수 페이지 (우선순위 높음)

#### 1. 매치 상세 페이지 (`/match/:id`)
```typescript
// src/pages/MatchDetailPage.tsx

- 구장 정보 및 사진
- 매치 상세 정보
- 참가자 리스트
- 참가 신청 버튼
- 결제 플로우
```

#### 2. 매치 생성 페이지 (`/create`)
```typescript
// src/pages/CreateMatchPage.tsx

- 구장 선택
- 날짜/시간 선택
- 게임 타입 (3v3 / 5v5)
- 레벨 범위 설정
- 포지션별 인원
- 참가비 설정
```

#### 3. 프로필 페이지 (`/profile`)
```typescript
// src/pages/ProfilePage.tsx

- 사용자 정보 (이름, 레벨, 포지션)
- 획득 배지
- 최근 경기 통계
- 받은 평가
- 참가 예정 매치
```

#### 4. 평가 페이지 (`/rating/:matchId`)
```typescript
// src/pages/RatingPage.tsx

- 경기 참가자 리스트
- 7가지 카테고리 별점
- 코멘트 입력
- 평가 완료 플로우
```

### Phase 2 - 고급 기능

- 지도 뷰 (카카오맵 연동)
- 필터링 (레벨, 날짜, 거리, 가격)
- 알림 시스템
- 채팅 시스템
- 크루 시스템

---

## 🗂️ 파일 구조

```
src/
├── components/
│   ├── ui/              # 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Badge.tsx
│   └── match/           # 매치 관련 컴포넌트
│       └── MatchCard.tsx
├── pages/
│   └── HomePage.tsx     # 메인 페이지
├── types/
│   └── index.ts         # TypeScript 타입 정의
├── utils/
│   ├── helpers.ts       # 유틸리티 함수
│   └── seed.ts          # 샘플 데이터
├── App.tsx              # 앱 진입점 (인증 포함)
└── main.tsx
```

---

## 🛠️ 개발 팁

### 1. Amplify 샌드박스가 실행 중이어야 합니다

```bash
# 별도 터미널에서 실행
npx ampx sandbox

# ✅ 성공 메시지 확인
# [Sandbox] Watching for file changes...
```

### 2. 샘플 데이터 추가하기

로그인 후, 브라우저 콘솔에서:

```javascript
// 구장, 매치, 배지 샘플 데이터 생성
import { seedAll } from './utils/seed';
await seedAll();
```

### 3. GraphQL API 쿼리 예시

```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

// 매치 리스트 조회
const { data: matches } = await client.models.Match.list({
  filter: {
    status: { eq: 'OPEN' }
  }
});

// 매치 생성
await client.models.Match.create({
  title: '강남 5vs5 게임',
  courtId: 'court-id',
  date: '2025-11-01',
  startTime: '18:00:00',
  duration: 120,
  gameType: 'FIVE_V_FIVE',
  levelMin: 1500,
  levelMax: 2000,
  maxPlayers: 10,
  currentPlayerIds: [],
  guardSlots: 4,
  forwardSlots: 4,
  centerSlots: 2,
  pricePerPerson: 15000,
  status: 'OPEN',
});
```

### 4. Tailwind CSS 커스텀 클래스

```css
/* index.css에 정의됨 */
.btn-primary   → 주 버튼
.btn-secondary → 보조 버튼
.card          → 카드 컴포넌트
.input-field   → 입력 필드
```

---

## 🐛 트러블슈팅

### Amplify 샌드박스 에러

```bash
# 에러: Unable to find associated relationship...
# 해결: 데이터 스키마 수정 후 자동으로 재배포됨

# 에러: CloudFormation 배포 실패
# 해결: 샌드박스 종료 후 재시작
Ctrl+C
npx ampx sandbox
```

### Tailwind CSS 에러

```bash
# 에러: @tailwind directives not working
# 해결: Tailwind CSS 버전 확인
npm install -D tailwindcss@3.4.1
```

### 타입 에러

```bash
# 데이터 스키마 변경 시 타입 자동 생성
# amplify/data/resource.ts 저장 후 잠시 대기
```

---

## 📚 참고 자료

### Amplify
- [Amplify Gen 2 문서](https://docs.amplify.aws/react/build-a-backend/)
- [Amplify Data (GraphQL)](https://docs.amplify.aws/react/build-a-backend/data/)
- [Amplify Auth](https://docs.amplify.aws/react/build-a-backend/auth/)

### React & UI
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [React Router](https://reactrouter.com/)

---

## ✨ 다음 작업 제안

1. **매치 상세 페이지 구현** (가장 중요!)
   - 참가 신청 플로우
   - 참가자 정보 표시

2. **매치 생성 폼**
   - 유효성 검사
   - 구장 선택 UI

3. **프로필 페이지**
   - 사용자 정보 수정
   - 배지 표시

4. **라우팅 추가**
   - React Router 설정
   - 페이지 간 네비게이션

---

**행운을 빕니다! 🚀 질문이 있으면 언제든 물어보세요.**
