# 팀 가입 신청 기능 테스트 가이드

## 🎯 구현된 기능

### 1. 사용자 관점 (팀 가입 신청)
- ✅ 팀 상세 페이지에서 "팀 가입 신청" 버튼
- ✅ 포지션 선택 모달 (가드/포워드/센터/올라운더)
- ✅ 자기소개 메시지 입력
- ✅ 중복 신청 방지
- ✅ 팀 정원 초과 방지

### 2. 팀장 관점 (신청 관리)
- ✅ 팀 상세 페이지에서 가입 신청 목록 표시
- ✅ 신청자 정보 확인 (ID, 포지션, 메시지, 신청일)
- ✅ 승인/거절 버튼
- ✅ 승인 시 자동으로 팀 멤버에 추가
- ✅ 거절 시 신청 상태 업데이트

## 📋 테스트 시나리오

### 시나리오 1: 새 사용자가 팀에 가입 신청

#### 1단계: 개발 서버 실행
```bash
npm run dev
# 서버: http://localhost:5174/
```

#### 2단계: 새 사용자로 로그인
- 브라우저에서 http://localhost:5174/ 접속
- AWS Cognito 인증 (Sign Up 또는 Sign In)
- 온보딩 완료

#### 3단계: 팀 목록에서 OpenCourt 팀 선택
- 홈 화면에서 "OpenCourt" 팀 카드 클릭
- 또는 직접 `/team/d6e61942-dbc5-4106-a847-3efdce3edf89` 접속

#### 4단계: 팀 가입 신청
1. **"팀 가입 신청" 버튼 클릭**
   - 팀원이 아니고 RECRUITING 상태일 때만 보임
   
2. **포지션 선택 모달이 열림**
   - 4가지 옵션: 가드, 포워드, 센터, 올라운더
   - 각 포지션 설명 표시
   - 기본값: 올라운더(FLEX)

3. **포지션 선택**
   - 원하는 포지션 카드 클릭
   - 선택된 카드는 주황색으로 하이라이트

4. **자기소개 작성 (선택사항)**
   ```
   예시:
   - "매주 농구하는 직장인입니다. 주로 가드 포지션을 합니다!"
   - "농구 시작한지 1년 됐습니다. 포워드 포지션 선호합니다."
   - "센터 포지션으로 골밑 플레이에 자신 있습니다!"
   ```

5. **"신청하기" 버튼 클릭**
   - 성공 시: "팀 가입 신청이 완료되었습니다!" 알림
   - 모달 자동 닫힘
   - 버튼이 사라짐 (이미 신청했으므로)

#### 5단계: 중복 신청 방지 확인
- 같은 팀에 다시 신청 시도
- 에러: "Already applied to this team"

### 시나리오 2: 팀장이 신청 승인/거절

#### 1단계: 팀장 계정으로 로그인
- captainId: `14780ddc-9051-7039-c30d-ec71b25e75c0`
- 또는 OpenCourt 팀을 만든 계정으로 로그인

#### 2단계: OpenCourt 팀 상세 페이지 접속
- 팀장으로 로그인하면 "가입 신청 (N)" 섹션이 보임

#### 3단계: 신청자 정보 확인
```
표시되는 정보:
- 신청자 ID: 123abc45... (앞 8자리만)
- 포지션: 가드 / 포워드 / 센터 / 올라운더
- 메시지: 신청자가 작성한 자기소개
- 신청일: 2026. 1. 26.
```

#### 4단계: 승인 또는 거절
**승인 시:**
- "승인" 버튼 클릭
- "가입 신청을 승인했습니다!" 알림
- 해당 신청이 목록에서 사라짐
- 팀 멤버 섹션에 새 멤버 추가됨
- 팀원 수 업데이트 (예: 1/19 → 2/19)

**거절 시:**
- "거절" 버튼 클릭
- "가입 신청을 거절했습니다!" 알림
- 해당 신청이 목록에서 사라짐

## 🔍 DynamoDB 직접 확인

### 가입 신청 목록 조회
```bash
curl -s -X POST https://9t0x4zyb4l.execute-api.ap-northeast-2.amazonaws.com/aaa/handler \
  -H "Content-Type: application/json" \
  -d '{
    "action": "scanItems",
    "tableName": "BasketballTeamJoinRequests"
  }' | python3 -m json.tool
```

### 특정 팀의 신청 목록 조회
```bash
curl -s -X POST https://9t0x4zyb4l.execute-api.ap-northeast-2.amazonaws.com/aaa/handler \
  -H "Content-Type: application/json" \
  -d '{
    "action": "query",
    "tableName": "BasketballTeamJoinRequests",
    "indexName": "TeamIdIndex",
    "keyConditionExpression": "teamId = :teamId",
    "expressionAttributeValues": {
      ":teamId": "d6e61942-dbc5-4106-a847-3efdce3edf89"
    }
  }' | python3 -m json.tool
```

### 팀 멤버 확인
```bash
curl -s -X POST https://9t0x4zyb4l.execute-api.ap-northeast-2.amazonaws.com/aaa/handler \
  -H "Content-Type: application/json" \
  -d '{
    "action": "getItem",
    "tableName": "BasketballTeams",
    "id": "d6e61942-dbc5-4106-a847-3efdce3edf89"
  }' | python3 -m json.tool | grep -A 5 "memberIds"
```

## 🎨 UI 개선 사항

### 포지션 선택 모달
```typescript
// 4가지 옵션, 각각 설명 포함
[
  { value: 'GUARD', label: '가드', description: '볼 핸들링과 외곽 슛' },
  { value: 'FORWARD', label: '포워드', description: '중거리 슛과 리바운드' },
  { value: 'CENTER', label: '센터', description: '골 밑 플레이와 수비' },
  { value: 'FLEX', label: '올라운더', description: '여러 포지션 가능' }
]
```

### 모달 디자인
- 배경: 반투명 검은색 오버레이
- 카드: 흰색/다크 모드 대응
- 포지션 버튼: 그리드 2x2 레이아웃
- 선택된 버튼: 주황색 테두리 + 배경
- 자기소개: 3줄 textarea
- 액션 버튼: 취소(outline) + 신청하기(primary)

## ✅ 체크리스트

### 사용자 기능
- [ ] 팀 가입 신청 버튼 표시 (비멤버 + RECRUITING 상태)
- [ ] 포지션 선택 모달 열림
- [ ] 포지션 선택 가능 (4가지)
- [ ] 자기소개 입력 가능
- [ ] 신청하기 성공
- [ ] 중복 신청 방지
- [ ] 정원 초과 팀 신청 불가

### 팀장 기능
- [ ] 가입 신청 목록 표시 (팀장만)
- [ ] 신청자 정보 확인 (ID, 포지션, 메시지, 날짜)
- [ ] 승인 버튼 작동
- [ ] 승인 시 팀 멤버에 추가
- [ ] 거절 버튼 작동
- [ ] 거절 시 신청 상태 업데이트

### 예외 처리
- [ ] 이미 멤버인 경우 신청 불가
- [ ] 이미 신청한 경우 중복 신청 불가
- [ ] 정원 초과 시 신청 불가
- [ ] RECRUITING 상태가 아닌 팀 신청 불가
- [ ] 팀장이 아닌 경우 승인/거절 불가

## 🐛 알려진 이슈 및 개선 사항

### 현재 제한사항
1. **신청자 표시**: 현재 userId만 표시됨
   - 개선안: BasketballUsers 테이블에서 이름/레벨 가져오기

2. **신청 취소**: 사용자가 자신의 신청을 취소하는 기능 없음
   - 개선안: "내 신청" 섹션 추가

3. **알림**: 승인/거절 시 신청자에게 알림 없음
   - 개선안: 푸시 알림 또는 인앱 알림 시스템

4. **히스토리**: 거절된 신청 기록이 사라짐
   - 개선안: status를 REJECTED로 유지하고 필터링

### 향후 개선 사항
```typescript
// 신청자 정보 확장
interface TeamJoinRequestWithUser extends TeamJoinRequest {
  userProfile: {
    name: string;
    level: number;
    totalGames: number;
    winRate: number;
  };
}

// 신청 취소 기능
async cancelTeamJoinRequest(requestId: string, userId: string) {
  // 본인의 PENDING 신청만 취소 가능
}

// 알림 시스템
async notifyApplicant(userId: string, teamName: string, status: 'APPROVED' | 'REJECTED') {
  // 푸시 알림 또는 이메일
}
```

## 📊 데이터 구조

### BasketballTeamJoinRequests 테이블
```typescript
interface TeamJoinRequest {
  id: string;                    // UUID (Primary Key)
  teamId: string;                // 팀 ID (GSI: TeamIdIndex)
  userId: string;                // 신청자 ID (GSI: UserIdIndex)
  position: Position;            // GUARD | FORWARD | CENTER | FLEX
  message?: string;              // 자기소개
  status: ApplicationStatus;     // PENDING | APPROVED | REJECTED
  appliedAt: string;            // 신청 일시 (ISO 8601)
  respondedAt?: string;         // 응답 일시
  respondedBy?: string;         // 응답한 팀장 ID
}
```

### GSI (Global Secondary Index)
- **TeamIdIndex**: 특정 팀의 모든 신청 조회
- **UserIdIndex**: 특정 사용자의 모든 신청 조회

## 🔗 관련 파일

```
src/features/team/
├── types/team.types.ts              # TeamJoinRequest, ApplyToTeamInput, Position
├── services/teamService.ts          # applyToTeam, getTeamJoinRequests, approve/reject
└── pages/TeamDetailPage.tsx         # 신청 모달 + 팀장 승인/거절 UI
```

## 🚀 다음 단계

1. **테스트 실행**: 위 시나리오대로 기능 테스트
2. **버그 수정**: 발견된 이슈 해결
3. **UX 개선**: 신청자 정보 표시 개선
4. **알림 시스템**: 승인/거절 알림 추가
5. **히스토리**: 신청 내역 페이지 추가
