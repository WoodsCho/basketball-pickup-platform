# API Gateway 수동 설정 가이드

## 🎯 목표
Lambda 함수를 API Gateway를 통해 HTTPS 엔드포인트로 노출

## 📋 단계별 설정

### 1. API Gateway Console 접속
1. AWS Console에서 **API Gateway** 서비스 검색
2. 또는 직접 링크: https://console.aws.amazon.com/apigateway

### 2. REST API 생성
1. **"Create API"** 버튼 클릭
2. **REST API** 선택 (NOT HTTP API)
3. **"Build"** 클릭
4. 설정:
   - **API name**: `basketball-platform-api`
   - **Description**: `Basketball Platform REST API`
   - **Endpoint Type**: `Regional`
5. **"Create API"** 클릭

### 3. 리소스 및 메서드 생성
1. **Actions** 드롭다운 클릭
2. **"Create Method"** 선택
3. 드롭다운에서 **POST** 선택
4. 체크마크(✓) 클릭

### 4. Lambda 통합 설정
POST 메서드 설정 화면에서:
1. **Integration type**: `Lambda Function`
2. **Use Lambda Proxy integration**: ✅ **체크**
3. **Lambda Region**: `ap-northeast-2`
4. **Lambda Function**: `basketball-platform-handler` (자동완성으로 선택)
5. **"Save"** 클릭
6. 권한 추가 확인 팝업 → **"OK"** 클릭

### 5. CORS 활성화
1. **Actions** 드롭다운 클릭
2. **"Enable CORS"** 선택
3. 기본 설정 그대로 두고 **"Enable CORS and replace existing CORS headers"** 클릭
4. 확인 팝업 → **"Yes, replace existing values"** 클릭

### 6. API 배포
1. **Actions** 드롭다운 클릭
2. **"Deploy API"** 선택
3. **Deployment stage**: `[New Stage]`
4. **Stage name**: `prod`
5. **"Deploy"** 클릭

### 7. API URL 확인
배포 완료 후 나타나는 **Invoke URL**을 복사합니다.
- 형식: `https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/prod`

### 8. 프론트엔드 설정
복사한 URL을 `.env` 파일에 추가:
```bash
VITE_LAMBDA_API_URL=https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/prod
```

### 9. 테스트
터미널에서 테스트:
```bash
curl -X POST https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/prod \
  -H 'Content-Type: application/json' \
  -d '{"action":"scanItems","tableName":"BasketballTeams"}'
```

예상 응답:
```json
{
  "items": [],
  "count": 0
}
```

## 🔧 문제 해결

### CORS 에러가 발생하는 경우
1. API Gateway Console → 해당 API
2. **Actions** → **Enable CORS**
3. 다시 활성화 후 **Deploy API**

### Lambda 권한 에러
1. Lambda Console → `basketball-platform-handler`
2. **Configuration** → **Permissions**
3. Resource-based policy에 API Gateway 권한이 있는지 확인

### 500 에러
1. Lambda Console → **Monitor** → **View logs in CloudWatch**
2. 에러 로그 확인

## 📝 API 엔드포인트 정보

### Lambda 함수
- **이름**: basketball-platform-handler
- **리전**: ap-northeast-2
- **런타임**: Python 3.12

### 지원하는 액션
- `getItem` - 아이템 조회
- `putItem` - 아이템 저장
- `updateItem` - 아이템 업데이트
- `deleteItem` - 아이템 삭제
- `scanItems` - 전체 스캔
- `query` - GSI 쿼리

### 요청 형식
```json
{
  "action": "액션명",
  "tableName": "테이블명",
  ...추가 파라미터
}
```

## ✅ 완료 체크리스트
- [ ] API Gateway REST API 생성
- [ ] POST 메서드 생성 및 Lambda 통합
- [ ] CORS 활성화
- [ ] API 배포 (prod 스테이지)
- [ ] Invoke URL 복사
- [ ] .env 파일에 URL 추가
- [ ] 브라우저에서 앱 테스트
