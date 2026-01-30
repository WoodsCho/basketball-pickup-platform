#!/bin/bash

# API Gateway + Lambda 배포 스크립트

REGION="ap-northeast-2"
FUNCTION_NAME="basketball-platform-handler"
API_NAME="basketball-platform-api"

echo "🏀 API Gateway 생성 및 Lambda 연결..."
echo ""

# 1. REST API 생성
echo "📋 1. REST API 생성 중..."
API_ID=$(python3 -m awscli apigateway create-rest-api \
  --name $API_NAME \
  --description "Basketball Platform REST API" \
  --endpoint-configuration types=REGIONAL \
  --region $REGION \
  --query 'id' \
  --output text)

echo "✅ API 생성 완료: $API_ID"
echo ""

# 2. Root 리소스 ID 가져오기
echo "📋 2. Root 리소스 가져오기..."
ROOT_RESOURCE_ID=$(python3 -m awscli apigateway get-resources \
  --rest-api-id $API_ID \
  --region $REGION \
  --query 'items[0].id' \
  --output text)

echo "✅ Root Resource ID: $ROOT_RESOURCE_ID"
echo ""

# 3. ANY 메서드 생성
echo "📋 3. ANY 메서드 생성 중..."
python3 -m awscli apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $ROOT_RESOURCE_ID \
  --http-method ANY \
  --authorization-type NONE \
  --region $REGION

echo "✅ ANY 메서드 생성 완료"
echo ""

# 4. Lambda 통합 설정
echo "📋 4. Lambda 통합 설정 중..."
ACCOUNT_ID=$(python3 -m awscli sts get-caller-identity --query Account --output text)
LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"

python3 -m awscli apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $ROOT_RESOURCE_ID \
  --http-method ANY \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations" \
  --region $REGION

echo "✅ Lambda 통합 완료"
echo ""

# 5. Lambda 실행 권한 부여
echo "📋 5. Lambda 실행 권한 부여 중..."
python3 -m awscli lambda add-permission \
  --function-name $FUNCTION_NAME \
  --statement-id apigateway-any-root \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" \
  --region $REGION 2>/dev/null || echo "권한이 이미 존재합니다"

echo "✅ 권한 부여 완료"
echo ""

# 6. OPTIONS 메서드 생성 (CORS)
echo "📋 6. CORS 설정 (OPTIONS 메서드)..."
python3 -m awscli apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $ROOT_RESOURCE_ID \
  --http-method OPTIONS \
  --authorization-type NONE \
  --region $REGION

python3 -m awscli apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $ROOT_RESOURCE_ID \
  --http-method OPTIONS \
  --type MOCK \
  --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
  --region $REGION

python3 -m awscli apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $ROOT_RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters \
    "method.response.header.Access-Control-Allow-Headers=false,method.response.header.Access-Control-Allow-Methods=false,method.response.header.Access-Control-Allow-Origin=false" \
  --region $REGION

python3 -m awscli apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $ROOT_RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters \
    "method.response.header.Access-Control-Allow-Headers='Content-Type,Authorization',method.response.header.Access-Control-Allow-Methods='GET,POST,PUT,DELETE,OPTIONS',method.response.header.Access-Control-Allow-Origin='*'" \
  --region $REGION

echo "✅ CORS 설정 완료"
echo ""

# 7. 배포 생성
echo "📋 7. API 배포 중..."
python3 -m awscli apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod \
  --region $REGION

echo "✅ API 배포 완료"
echo ""

# 8. API URL 출력
API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"

echo "🎉 API Gateway 설정 완료!"
echo ""
echo "API URL: $API_URL"
echo ""
echo "프론트엔드 설정:"
echo "  .env 파일에 다음을 추가하세요:"
echo "  VITE_LAMBDA_API_URL=$API_URL"
echo ""
echo "테스트:"
echo "  curl -X POST $API_URL \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"action\":\"scanItems\",\"tableName\":\"BasketballTeams\"}'"
