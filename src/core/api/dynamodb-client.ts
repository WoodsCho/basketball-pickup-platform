/**
 * DynamoDB Client
 * AWS Lambda를 통한 DynamoDB 작업
 */

const LAMBDA_ENDPOINT = 'https://9t0x4zyb4l.execute-api.ap-northeast-2.amazonaws.com/aaa/handler';

interface LambdaRequest {
  action: 'getItem' | 'putItem' | 'updateItem' | 'deleteItem' | 'scanItems' | 'query';
  tableName: string;
  id?: string;
  item?: any;
  updates?: any;
  filters?: any;
  indexName?: string;
  keyConditionExpression?: string;
  expressionAttributeValues?: any;
}

export class DynamoDBClient {
  private async request<T>(payload: LambdaRequest): Promise<T> {
    try {
      const response = await fetch(LAMBDA_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Lambda request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('[LambdaClient] Request error:', error);
      throw error;
    }
  }

  /**
   * 단일 아이템 조회
   */
  async getItem<T>(tableName: string, id: string): Promise<T | null> {
    const response = await this.request<{ item: T | null }>({
      action: 'getItem',
      tableName,
      id,
    });
    return response.item;
  }

  /**
   * 아이템 생성/업데이트
   */
  async putItem<T>(tableName: string, item: T): Promise<T> {
    await this.request({
      action: 'putItem',
      tableName,
      item,
    });
    return item;
  }

  /**
   * 아이템 업데이트
   */
  async updateItem<T>(tableName: string, id: string, updates: Partial<T>): Promise<T> {
    const response = await this.request<{ item: T }>({
      action: 'updateItem',
      tableName,
      id,
      updates,
    });
    return response.item;
  }

  /**
   * 아이템 삭제
   */
  async deleteItem(tableName: string, id: string): Promise<void> {
    await this.request({
      action: 'deleteItem',
      tableName,
      id,
    });
  }

  /**
   * 테이블 스캔 (전체 조회)
   */
  async scanItems<T>(tableName: string, filters?: any): Promise<T[]> {
    const response = await this.request<{ items: T[]; count: number }>({
      action: 'scanItems',
      tableName,
      filters,
    });
    return response.items;
  }

  /**
   * 쿼리 (인덱스 사용)
   */
  async query<T>(
    tableName: string,
    indexName: string,
    keyConditionExpression: string,
    expressionAttributeValues: any
  ): Promise<T[]> {
    const response = await this.request<{ items: T[]; count: number }>({
      action: 'query',
      tableName,
      indexName,
      keyConditionExpression,
      expressionAttributeValues,
    });
    return response.items;
  }
}

export const dynamoDBClient = new DynamoDBClient();
