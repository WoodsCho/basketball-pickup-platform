import { defineAuth } from '@aws-amplify/backend';

/**
 * Basketball Pickup Platform - Authentication Configuration
 * 
 * Features:
 * - Email + Password login
 * - Phone number as required attribute
 * - User profile attributes (name, position, level)
 * - Account recovery via email
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
