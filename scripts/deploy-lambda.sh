#!/bin/bash

# Basketball Platform Lambda 배포 스크립트

REGION="ap-northeast-2"
FUNCTION_NAME="basketball-platform-handler"
ROLE_NAME="basketball-lambda-execution-role"
ZIP_FILE="basketball-platform-handler.zip"

echo "🏀 농구 플랫폼 Lambda 함수 배포 시작..."
echo ""

# 1. Lambda 실행 역할 생성 (없으면)
echo "📋 1. IAM 역할 확인 중..."
ROLE_ARN=$(python3 -m awscli iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null)

if [ -z "$ROLE_ARN" ]; then
  echo "IAM 역할이 없습니다. 생성 중..."
  
  # Trust policy 생성
  cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  # 역할 생성
  ROLE_ARN=$(python3 -m awscli iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file://trust-policy.json \
    --query 'Role.Arn' \
    --output text)
  
  # 기본 Lambda 실행 정책 연결
  python3 -m awscli iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  
  # DynamoDB 정책 생성 및 연결
  cat > dynamodb-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:${REGION}:*:table/Basketball*"
      ]
    }
  ]
}
EOF

  python3 -m awscli iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name BasketballDynamoDBAccess \
    --policy-document file://dynamodb-policy.json
  
  echo "✅ IAM 역할 생성 완료: $ROLE_ARN"
  echo "⏳ 역할 전파 대기 중 (10초)..."
  sleep 10
  
  rm trust-policy.json dynamodb-policy.json
else
  echo "✅ IAM 역할 존재: $ROLE_ARN"
fi
echo ""

# 2. Lambda 함수 패키징
echo "📦 2. Lambda 함수 패키징 중..."
cd lambda-functions
rm -f $ZIP_FILE
zip $ZIP_FILE basketball-platform-handler.py
echo "✅ 패키징 완료: $ZIP_FILE"
echo ""

# 3. Lambda 함수 배포
echo "🚀 3. Lambda 함수 배포 중..."
FUNCTION_EXISTS=$(python3 -m awscli lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>/dev/null)

if [ -z "$FUNCTION_EXISTS" ]; then
  echo "새 Lambda 함수 생성 중..."
  python3 -m awscli lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime python3.12 \
    --role $ROLE_ARN \
    --handler basketball-platform-handler.lambda_handler \
    --zip-file fileb://$ZIP_FILE \
    --timeout 30 \
    --memory-size 256 \
    --region $REGION \
    --description "Basketball Platform - Unified DynamoDB Handler"
  
  echo "✅ Lambda 함수 생성 완료"
else
  echo "기존 Lambda 함수 업데이트 중..."
  python3 -m awscli lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://$ZIP_FILE \
    --region $REGION
  
  echo "✅ Lambda 함수 업데이트 완료"
fi
echo ""

# 4. Function URL 생성 (없으면)
echo "🔗 4. Function URL 확인 중..."
FUNCTION_URL=$(python3 -m awscli lambda get-function-url-config \
  --function-name $FUNCTION_NAME \
  --region $REGION \
  --query 'FunctionUrl' \
  --output text 2>/dev/null)

if [ -z "$FUNCTION_URL" ] || [ "$FUNCTION_URL" == "None" ]; then
  echo "Function URL 생성 중..."
  FUNCTION_URL=$(python3 -m awscli lambda create-function-url-config \
    --function-name $FUNCTION_NAME \
    --auth-type NONE \
    --cors "AllowOrigins=['*'],AllowMethods=['*'],AllowHeaders=['*']" \
    --region $REGION \
    --query 'FunctionUrl' \
    --output text)
  
  # Public 접근 권한 추가
  python3 -m awscli lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id FunctionURLAllowPublicAccess \
    --action lambda:InvokeFunctionUrl \
    --principal "*" \
    --function-url-auth-type NONE \
    --region $REGION
  
  echo "✅ Function URL 생성 완료"
else
  echo "✅ Function URL 존재"
fi
echo ""

# 5. 결과 출력
echo "🎉 배포 완료!"
echo ""
echo "Function URL: $FUNCTION_URL"
echo ""
echo "프론트엔드 설정:"
echo "  환경 변수에 다음을 추가하세요:"
echo "  VITE_LAMBDA_API_URL=$FUNCTION_URL"
echo ""
echo "테스트:"
echo "  curl -X POST $FUNCTION_URL \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"action\":\"scanItems\",\"tableName\":\"BasketballTeams\"}'"

cd ..
