/**
 * Core API Client
 * Amplify Data Client Wrapper
 */
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

// Singleton pattern for API client
class ApiClient {
  private static instance: ReturnType<typeof generateClient<Schema>>;

  static getInstance() {
    if (!ApiClient.instance) {
      ApiClient.instance = generateClient<Schema>();
    }
    return ApiClient.instance;
  }
}

export const apiClient = ApiClient.getInstance();

// Export types
export type { Schema };
