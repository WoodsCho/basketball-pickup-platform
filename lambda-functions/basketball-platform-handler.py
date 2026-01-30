"""
Basketball Platform - Unified Lambda Handler
팀 기반 정기 농구 플랫폼의 모든 DynamoDB 작업을 처리하는 통합 Lambda 함수
"""

import json
import boto3
import os
import urllib.request
import urllib.parse
from datetime import datetime
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr

# DynamoDB 클라이언트 초기화
dynamodb = boto3.resource('dynamodb', region_name='ap-northeast-2')

# 네이버 검색 API 설정 (Naver Developers)
NAVER_CLIENT_ID = os.environ.get('NAVER_CLIENT_ID', 'KCMHZc2NtQA3rVjizK3A')
NAVER_CLIENT_SECRET = os.environ.get('NAVER_CLIENT_SECRET', 'PpuDHvUPOH')

# Helper: Decimal을 JSON 직렬화 가능하게 변환
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def response(status_code, body, proxy_mode=False):
    """API Gateway 응답 포맷"""
    # Non-proxy integration: 직접 데이터 반환 (API Gateway가 포맷팅)
    return body

def get_item(table_name, item_id):
    """아이템 조회"""
    try:
        table = dynamodb.Table(table_name)
        result = table.get_item(Key={'id': item_id})
        
        if 'Item' in result:
            return response(200, {'item': result['Item']})
        else:
            return response(404, {'error': 'Item not found'})
    except Exception as e:
        return response(500, {'error': str(e)})

def put_item(table_name, item):
    """아이템 저장"""
    try:
        table = dynamodb.Table(table_name)
        
        # updatedAt 자동 추가
        item['updatedAt'] = datetime.utcnow().isoformat()
        if 'createdAt' not in item:
            item['createdAt'] = item['updatedAt']
        
        table.put_item(Item=item)
        return response(200, {'message': 'Item saved successfully', 'item': item})
    except Exception as e:
        return response(500, {'error': str(e)})

def update_item(table_name, item_id, updates):
    """아이템 업데이트"""
    try:
        table = dynamodb.Table(table_name)
        
        # 업데이트 표현식 생성
        update_expression = "SET "
        expression_values = {}
        expression_names = {}
        
        updates['updatedAt'] = datetime.utcnow().isoformat()
        
        for i, (key, value) in enumerate(updates.items()):
            attr_name = f"#attr{i}"
            attr_value = f":val{i}"
            update_expression += f"{attr_name} = {attr_value}, "
            expression_names[attr_name] = key
            expression_values[attr_value] = value
        
        update_expression = update_expression.rstrip(', ')
        
        result = table.update_item(
            Key={'id': item_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_names,
            ExpressionAttributeValues=expression_values,
            ReturnValues='ALL_NEW'
        )
        
        return response(200, {'item': result['Attributes']})
    except Exception as e:
        return response(500, {'error': str(e)})

def delete_item(table_name, item_id):
    """아이템 삭제"""
    try:
        table = dynamodb.Table(table_name)
        table.delete_item(Key={'id': item_id})
        return response(200, {'message': 'Item deleted successfully'})
    except Exception as e:
        return response(500, {'error': str(e)})

def scan_items(table_name, filters=None):
    """테이블 전체 스캔"""
    try:
        table = dynamodb.Table(table_name)
        
        if filters:
            # 필터 표현식 적용
            filter_expression = None
            for key, value in filters.items():
                condition = Attr(key).eq(value)
                filter_expression = condition if filter_expression is None else filter_expression & condition
            
            result = table.scan(FilterExpression=filter_expression)
        else:
            result = table.scan()
        
        items = result.get('Items', [])
        
        # 페이지네이션 처리
        while 'LastEvaluatedKey' in result:
            if filters:
                result = table.scan(
                    FilterExpression=filter_expression,
                    ExclusiveStartKey=result['LastEvaluatedKey']
                )
            else:
                result = table.scan(ExclusiveStartKey=result['LastEvaluatedKey'])
            items.extend(result.get('Items', []))
        
        return response(200, {'items': items, 'count': len(items)})
    except Exception as e:
        return response(500, {'error': str(e)})

def query_items(table_name, index_name, key_condition):
    """GSI를 사용한 쿼리"""
    try:
        table = dynamodb.Table(table_name)
        
        # Key condition 생성
        key_conditions = []
        for key, value in key_condition.items():
            key_conditions.append(Key(key).eq(value))
        
        key_condition_expression = key_conditions[0]
        for condition in key_conditions[1:]:
            key_condition_expression = key_condition_expression & condition
        
        if index_name:
            result = table.query(
                IndexName=index_name,
                KeyConditionExpression=key_condition_expression
            )
        else:
            result = table.query(
                KeyConditionExpression=key_condition_expression
            )
        
        items = result.get('Items', [])
        
        # 페이지네이션 처리
        while 'LastEvaluatedKey' in result:
            if index_name:
                result = table.query(
                    IndexName=index_name,
                    KeyConditionExpression=key_condition_expression,
                    ExclusiveStartKey=result['LastEvaluatedKey']
                )
            else:
                result = table.query(
                    KeyConditionExpression=key_condition_expression,
                    ExclusiveStartKey=result['LastEvaluatedKey']
                )
            items.extend(result.get('Items', []))
        
        return response(200, {'items': items, 'count': len(items)})
    except Exception as e:
        return response(500, {'error': str(e)})

def search_place(query):
    """네이버 검색 API (Local)를 사용한 장소 검색"""
    try:
        # URL 인코딩
        encoded_query = urllib.parse.quote(query)
        url = f"https://openapi.naver.com/v1/search/local.json?query={encoded_query}&display=10&start=1&sort=random"
        
        print(f"[DEBUG] Searching place: {query}")
        print(f"[DEBUG] URL: {url}")
        print(f"[DEBUG] CLIENT_ID: {NAVER_CLIENT_ID}")
        
        # 요청 생성
        request = urllib.request.Request(url)
        request.add_header('X-Naver-Client-Id', NAVER_CLIENT_ID)
        request.add_header('X-Naver-Client-Secret', NAVER_CLIENT_SECRET)
        
        # API 호출
        try:
            with urllib.request.urlopen(request) as response_data:
                result = json.loads(response_data.read().decode('utf-8'))
        except urllib.error.HTTPError as http_err:
            error_body = http_err.read().decode('utf-8')
            print(f"[ERROR] HTTP Error: {http_err.code} - {error_body}")
            return response(500, {'error': f'Naver API HTTP Error: {http_err.code}'})
        
        print(f"[DEBUG] Naver API Response: {result}")
        
        # 결과 파싱
        places = []
        if result.get('items'):
            for item in result['items']:
                # HTML 태그 제거
                title = item.get('title', '').replace('<b>', '').replace('</b>', '')
                address = item.get('address', '')
                road_address = item.get('roadAddress', '')
                category = item.get('category', '')
                
                # mapx, mapy 좌표 (WGS84 좌표계, 10^7 배수)
                mapx = item.get('mapx', '')
                mapy = item.get('mapy', '')
                
                # 좌표가 있는 경우만 추가
                if mapx and mapy:
                    try:
                        # 네이버 좌표계는 EPSG:4326 좌표에 10^7을 곱한 값
                        lng = int(mapx) / 10000000.0
                        lat = int(mapy) / 10000000.0
                        
                        place_link = item.get('link', '')
                        
                        places.append({
                            'id': place_link or f"place-{len(places)}",
                            'name': title,
                            'address': address,
                            'roadAddress': road_address or address,  # 도로명 주소가 없으면 지번 주소 사용
                            'category': category,
                            'link': place_link,  # 네이버 장소 상세 페이지 URL
                            'lat': lat,
                            'lng': lng
                        })
                    except (ValueError, TypeError) as e:
                        print(f"[WARN] Invalid coordinates for {title}: {e}")
                        continue
        
        print(f"[DEBUG] Parsed {len(places)} places")
        return response(200, {'places': places})
        
    except Exception as e:
        print(f"[ERROR] Naver API Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return response(500, {'error': f'Naver API Error: {str(e)}'})

def lambda_handler(event, context):
    """Lambda 메인 핸들러"""
    try:
        print(f"[DEBUG] Full event: {json.dumps(event, cls=DecimalEncoder)}")
        
        # OPTIONS 요청 처리 (CORS preflight)
        if event.get('httpMethod') == 'OPTIONS':
            return response(200, {'message': 'OK'})
        
        # 요청 본문 파싱 - API Gateway Integration 방식에 따라 다름
        if 'body' in event and event['body']:
            # Lambda Proxy Integration (body가 문자열로 옴)
            print(f"[DEBUG] Using body field (proxy integration)")
            if isinstance(event['body'], str):
                print(f"[DEBUG] Body is string, parsing: {event.get('body')}")
                body = json.loads(event['body'])
            else:
                print(f"[DEBUG] Body is dict: {event.get('body')}")
                body = event['body']
        else:
            # Lambda Integration (event 자체가 request body)
            print(f"[DEBUG] Using event directly (non-proxy integration)")
            body = event
        
        print(f"[DEBUG] Parsed body: {json.dumps(body, cls=DecimalEncoder)}")
        
        action = body.get('action')
        table_name = body.get('tableName')
        
        print(f"[DEBUG] action={action}, table_name={table_name}")
        
        # 액션별 처리
        if action == 'getItem':
            item_id = body.get('id')
            return get_item(table_name, item_id)
        
        elif action == 'putItem':
            item = body.get('item')
            return put_item(table_name, item)
        
        elif action == 'updateItem':
            item_id = body.get('id')
            updates = body.get('updates')
            return update_item(table_name, item_id, updates)
        
        elif action == 'deleteItem':
            item_id = body.get('id')
            return delete_item(table_name, item_id)
        
        elif action == 'scanItems':
            filters = body.get('filters')
            return scan_items(table_name, filters)
        
        elif action == 'query':
            index_name = body.get('indexName')
            key_condition = body.get('keyCondition')
            return query_items(table_name, index_name, key_condition)
        
        elif action == 'searchPlace':
            query = body.get('query')
            return search_place(query)
        
        else:
            return response(400, {'error': f'Unknown action: {action}'})
    
    except Exception as e:
        return response(500, {'error': str(e)})
