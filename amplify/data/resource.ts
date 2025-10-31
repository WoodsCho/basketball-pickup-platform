import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * Basketball Pickup Platform - Data Schema
 * 
 * Defines the data models for:
 * - Users (basketball players)
 * - Matches (pickup games)
 * - Courts (basketball venues)
 * - Ratings (player evaluations)
 * - Badges (achievements)
 */

const schema = a.schema({
  // ============================================================
  // User Model
  // ============================================================
  User: a
    .model({
      email: a.string().required(),
      name: a.string().required(),
      phone: a.string().required(),
      profileImage: a.string(),
      
      // Basketball info
      position: a.enum(['GUARD', 'FORWARD', 'CENTER', 'ALL_ROUND']),
      level: a.integer().required().default(1500), // 1000-3000
      
      // Stats
      totalMatches: a.integer().default(0),
      totalRating: a.float().default(0),
      attendanceRate: a.float().default(100),
      noShowCount: a.integer().default(0),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  // ============================================================
  // Match Model
  // ============================================================
  Match: a
    .model({
      title: a.string().required(),
      courtId: a.id().required(),
      date: a.date().required(),
      startTime: a.string().required(),
      duration: a.integer().required(), // minutes
      
      // Game settings
      gameType: a.enum(['THREE_V_THREE', 'FIVE_V_FIVE']),
      levelMin: a.integer().required(),
      levelMax: a.integer().required(),
      
      // Players
      maxPlayers: a.integer().required(),
      currentPlayerIds: a.string().array(),
      guardSlots: a.integer().required(),
      forwardSlots: a.integer().required(),
      centerSlots: a.integer().required(),
      
      // Price
      pricePerPerson: a.integer().required(),
      
      // Status
      status: a.enum(['OPEN', 'FULL', 'CLOSED', 'COMPLETED']),
      
      // Owner
      createdBy: a.string(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read', 'create']),
      allow.owner().to(['update', 'delete']),
    ]),

  // ============================================================
  // Court Model
  // ============================================================
  Court: a
    .model({
      name: a.string().required(),
      address: a.string().required(),
      lat: a.float().required(),
      lng: a.float().required(),
      images: a.string().array(),
      
      // Facility info
      courtType: a.enum(['INDOOR', 'OUTDOOR']),
      courtSize: a.enum(['THREE_V_THREE', 'FIVE_V_FIVE', 'BOTH']),
      floor: a.string(),
      facilities: a.string().array(),
      
      // Partner court
      isPartner: a.boolean().default(false),
      hasAICamera: a.boolean().default(false),
      
      // Price
      pricePerHour: a.integer().required(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'update', 'delete']),
    ]),

  // ============================================================
  // Rating Model
  // ============================================================
  Rating: a
    .model({
      matchId: a.string().required(),
      fromUserId: a.string().required(),
      toUserId: a.string().required(),
      
      // Ratings (1-5)
      shooting: a.integer().required(),
      dribble: a.integer().required(),
      pass: a.integer().required(),
      defense: a.integer().required(),
      teamwork: a.integer().required(),
      manner: a.integer().required(),
      communication: a.integer().required(),
      
      // Overall
      overallRating: a.float().required(),
      comment: a.string(),
    })
    .authorization((allow) => [
      allow.owner().to(['create']),
      allow.authenticated().to(['read']),
    ]),

  // ============================================================
  // Badge Model
  // ============================================================
  Badge: a
    .model({
      name: a.string().required(),
      nameKo: a.string().required(),
      description: a.string().required(),
      
      category: a.enum(['SKILL', 'MANNER', 'SPECIAL']),
      skillType: a.enum(['SHOOTING', 'DRIBBLE', 'DEFENSE', 'PLAYMAKING']),
      level: a.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'LEGEND']),
      
      // Requirements
      requirementType: a.enum(['CONSECUTIVE_RATING', 'TOTAL_GAMES', 'MVP_COUNT']),
      requirementCount: a.integer().required(),
      requirementThreshold: a.float(),
      
      // Benefits
      benefits: a.string().array(),
      
      // Meta
      rarity: a.integer().required(), // 1-100
      icon: a.string().required(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'update', 'delete']),
    ]),

  // ============================================================
  // UserBadge Model (Junction table for User-Badge with progress)
  // ============================================================
  UserBadge: a
    .model({
      userId: a.string().required(),
      badgeId: a.string().required(),
      
      progress: a.float().default(0), // 0-100
      isCompleted: a.boolean().default(false),
      completedAt: a.datetime(),
      
      // Progress tracking
      currentStreak: a.integer().default(0),
      bestStreak: a.integer().default(0),
    })
    .authorization((allow) => [
      allow.owner().to(['read']),
      allow.authenticated().to(['read']),
    ]),

  // ============================================================
  // Payment Model
  // ============================================================
  Payment: a
    .model({
      userId: a.string().required(),
      matchId: a.string().required(),
      
      amount: a.integer().required(),
      status: a.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
      
      paymentMethod: a.string().required(),
      transactionId: a.string(),
    })
    .authorization((allow) => [
      allow.owner().to(['read', 'create']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key is used for public data access
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
