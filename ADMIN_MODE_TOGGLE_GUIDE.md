# Admin Mode Toggle 기능 가이드

## 개요
관리자 계정은 **관리자 모드**와 **일반 모드** 간 전환이 가능합니다. 이를 통해 관리자가 일반 사용자 관점에서 플랫폼을 경험하거나, 관리 기능에 접근할 수 있습니다.

## 주요 기능

### 1. 모드 전환 버튼 (AdminModeToggle)
- **위치**: 모든 주요 페이지의 헤더 오른쪽 상단
- **표시 조건**: 관리자 계정만 표시됨
- **아이콘**:
  - 🛡️ Shield (주황색) - 관리자 모드 활성화 상태
  - 👥 Users (회색) - 일반 모드 활성화 상태
- **툴팁**: 
  - "일반 모드로 전환" (관리자 모드 중)
  - "관리자 모드로 전환" (일반 모드 중)

### 2. 적용된 페이지
다음 페이지들의 헤더에 AdminModeToggle이 추가되었습니다:
- ✅ `TeamListPage` - 팀 목록 페이지
- ✅ `SessionListPage` - 세션 목록 페이지
- ✅ `AdminDashboardPage` - 관리자 대시보드
- ✅ `ProfilePage` - 프로필 페이지

### 3. 라우팅 동작
- **관리자 모드 ON + 관리자 계정**: 홈(`/`) → 관리자 대시보드
- **관리자 모드 OFF 또는 일반 사용자**: 홈(`/`) → 팀 목록 페이지

## 기술 구현

### Context 기반 상태 관리
```typescript
// src/features/admin/contexts/AdminModeContext.tsx
const AdminModeContext = createContext<AdminModeContextValue | undefined>(undefined);

export function AdminModeProvider({ children }: { children: ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(() => {
    const saved = localStorage.getItem('adminMode');
    return saved === 'true';
  });

  const toggleAdminMode = () => {
    setIsAdminMode(prev => {
      const newValue = !prev;
      localStorage.setItem('adminMode', String(newValue));
      return newValue;
    });
  };

  return (
    <AdminModeContext.Provider value={{ isAdminMode, toggleAdminMode }}>
      {children}
    </AdminModeContext.Provider>
  );
}
```

### localStorage 지속성
- **키**: `'adminMode'`
- **값**: `'true'` 또는 `'false'`
- **효과**: 페이지 새로고침 후에도 모드 상태 유지

### 컴포넌트 구조
```typescript
// src/shared/components/AdminModeToggle.tsx
export default function AdminModeToggle() {
  const { isAdminMode, toggleAdminMode } = useAdminMode();
  const currentUserId = localStorage.getItem('currentUserId') || '';
  const { isAdmin } = useAdminCheck(currentUserId);

  // 관리자가 아니면 표시하지 않음
  if (!isAdmin) return null;

  return (
    <button onClick={toggleAdminMode} className="...">
      {isAdminMode ? <Shield /> : <Users />}
    </button>
  );
}
```

### App.tsx 통합
```typescript
function AppContent({ user, signOut }: { user: any; signOut?: any }) {
  const { isAdmin } = useAdminCheck(user?.userId || '');
  const { isAdminMode } = useAdminMode();

  useEffect(() => {
    if (!loading && !adminLoading && !needsOnboarding) {
      // 관리자 모드에 따라 홈 페이지 결정
      const homePage = isAdmin && isAdminMode 
        ? <AdminDashboardPage /> 
        : <TeamListPage />;
      
      const userRouter = createBrowserRouter([
        { path: '/', element: homePage },
        // ... 기타 라우트
      ]);
      
      setRouter(userRouter);
    }
  }, [loading, adminLoading, needsOnboarding, isAdmin, isAdminMode]);

  return <RouterProvider router={router} />;
}
```

## 테스트 방법

### 1. 관리자 계정 확인
```bash
# DynamoDB에서 관리자 role 확인
aws dynamodb scan \
  --table-name BasketballUsers \
  --filter-expression "attribute_exists(#role) AND #role = :admin" \
  --expression-attribute-names '{"#role": "role"}' \
  --expression-attribute-values '{":admin": {"S": "ADMIN"}}' \
  --region ap-northeast-2
```

### 2. 브라우저 테스트 체크리스트

#### 관리자 계정으로 로그인
- [ ] 헤더에 AdminModeToggle 버튼이 보이는지 확인
- [ ] 초기 상태 확인 (localStorage 'adminMode' 값)

#### 일반 모드 (기본값)
- [ ] Users 아이콘(회색)이 표시됨
- [ ] 홈(`/`) 접속 시 TeamListPage로 이동
- [ ] 툴팁: "관리자 모드로 전환"

#### 모드 전환
- [ ] 버튼 클릭 → 아이콘이 Shield(주황색)로 변경
- [ ] 홈(`/`) 다시 접속 → AdminDashboardPage로 이동
- [ ] localStorage에 'adminMode' = 'true' 저장 확인

#### 지속성 테스트
- [ ] 관리자 모드에서 페이지 새로고침
- [ ] 모드 상태가 유지되는지 확인
- [ ] 브라우저 탭 닫았다 다시 열기 → 모드 유지 확인

#### 일반 사용자 계정
- [ ] 일반 사용자로 로그인
- [ ] AdminModeToggle 버튼이 표시되지 않음

### 3. 개발자 도구 확인
```javascript
// 콘솔에서 현재 모드 확인
localStorage.getItem('adminMode')

// 모드 수동 변경 (테스트용)
localStorage.setItem('adminMode', 'true')
localStorage.setItem('adminMode', 'false')
```

## 향후 개선 사항 (Optional)

### 1. 시각적 피드백 강화
```typescript
// 전환 애니메이션 추가
<button
  onClick={toggleAdminMode}
  className="... transition-all duration-300 transform hover:scale-110"
>
```

### 2. 모드 표시 배지
```typescript
// 현재 모드를 명확히 표시
{isAdminMode && (
  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
    관리자
  </span>
)}
```

### 3. 확인 다이얼로그
```typescript
// 처음 전환 시 확인 요청
const handleToggle = () => {
  if (firstTime) {
    if (confirm('관리자 모드로 전환하시겠습니까?')) {
      toggleAdminMode();
    }
  } else {
    toggleAdminMode();
  }
};
```

### 4. 토스트 알림
```typescript
// 모드 전환 시 알림
toggleAdminMode();
toast.success(
  isAdminMode ? '일반 모드로 전환되었습니다' : '관리자 모드로 전환되었습니다'
);
```

## 파일 구조
```
src/
├── features/
│   └── admin/
│       ├── contexts/
│       │   └── AdminModeContext.tsx    # Context + Provider
│       └── index.ts                     # exports AdminModeProvider, useAdminMode
├── shared/
│   └── components/
│       ├── AdminModeToggle.tsx          # 토글 버튼 컴포넌트
│       └── index.ts                     # export AdminModeToggle
└── App.tsx                              # AdminModeProvider 래퍼 + 라우팅 로직
```

## 참고 사항
- AdminModeToggle은 관리자에게만 렌더링되므로 일반 사용자에게는 완전히 숨겨집니다
- localStorage를 사용하므로 도메인별로 상태가 분리됩니다
- isAdminMode 변경 시 useEffect가 트리거되어 라우터가 재생성됩니다
- 관리자 권한 확인은 `useAdminCheck` 훅을 통해 실시간으로 수행됩니다

## 문제 해결

### 버튼이 보이지 않음
1. 계정이 ADMIN role을 가지고 있는지 확인
2. `useAdminCheck` 훅이 올바르게 작동하는지 확인
3. 브라우저 캐시 삭제 후 재시도

### 모드 전환이 작동하지 않음
1. localStorage 접근 권한 확인
2. AdminModeProvider가 App 루트에 래핑되어 있는지 확인
3. useEffect의 dependency array에 isAdminMode가 포함되어 있는지 확인

### 새로고침 후 모드가 리셋됨
1. localStorage에 값이 제대로 저장되는지 확인
2. 초기 상태 로딩 로직 확인 (`useState(() => localStorage.getItem(...)`)
