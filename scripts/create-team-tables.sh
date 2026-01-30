#!/bin/bash

# DynamoDB 테이블 생성 스크립트
# 팀 기반 정기 농구 플랫폼용

REGION="ap-northeast-2"

echo "🏀 농구 플랫폼 DynamoDB 테이블 생성 시작..."
echo "리전: $REGION"
echo ""

# 1. Teams 테이블
echo "📋 1. BasketballTeams 테이블 생성 중..."
aws dynamodb create-table \
  --table-name BasketballTeams \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION \
  --tags Key=Project,Value=BasketballPlatform Key=Environment,Value=production

if [ $? -eq 0 ]; then
  echo "✅ BasketballTeams 테이블 생성 완료"
else
  echo "⚠️  BasketballTeams 테이블 생성 실패 (이미 존재할 수 있음)"
fi
echo ""

# 2. Sessions 테이블
echo "📋 2. BasketballSessions 테이블 생성 중..."
aws dynamodb create-table \
  --table-name BasketballSessions \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=teamId,AttributeType=S \
    AttributeName=date,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=TeamIdIndex,KeySchema=[{AttributeName=teamId,KeyType=HASH},{AttributeName=date,KeyType=RANGE}],Projection={ProjectionType=ALL}" \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION \
  --tags Key=Project,Value=BasketballPlatform Key=Environment,Value=production

if [ $? -eq 0 ]; then
  echo "✅ BasketballSessions 테이블 생성 완료"
else
  echo "⚠️  BasketballSessions 테이블 생성 실패 (이미 존재할 수 있음)"
fi
echo ""

# 3. GuestApplications 테이블
echo "📋 3. BasketballGuestApplications 테이블 생성 중..."
aws dynamodb create-table \
  --table-name BasketballGuestApplications \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=sessionId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=SessionIdIndex,KeySchema=[{AttributeName=sessionId,KeyType=HASH}],Projection={ProjectionType=ALL}" \
    "IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL}" \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION \
  --tags Key=Project,Value=BasketballPlatform Key=Environment,Value=production

if [ $? -eq 0 ]; then
  echo "✅ BasketballGuestApplications 테이블 생성 완료"
else
  echo "⚠️  BasketballGuestApplications 테이블 생성 실패 (이미 존재할 수 있음)"
fi
echo ""

echo "🎉 테이블 생성 프로세스 완료!"
echo ""
echo "생성된 테이블:"
echo "  1. BasketballTeams - 팀 정보"
echo "  2. BasketballSessions - 정기 세션"
echo "  3. BasketballGuestApplications - 게스트 신청"
echo ""
echo "테이블 확인:"
echo "  aws dynamodb list-tables --region $REGION"
