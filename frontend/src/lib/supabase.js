import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Fallback dummy client in case Supabase credentials fail or in mock mode
const createMockClient = () => ({
  auth: {
    getSession: async () => ({
      data: {
        session: {
          access_token: 'mock-token-demo',
          user: { id: 'mock-user-1', email: 'consumer@claimkaro.ai' },
        },
      },
      error: null,
    }),
    onAuthStateChange: (callback) => {
      // Mock immediate callback
      callback('SIGNED_IN', {
        access_token: 'mock-token-demo',
        user: { id: 'mock-user-1', email: 'consumer@claimkaro.ai' },
      })
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      }
    },
    signInWithPassword: async ({ email }) => ({
      data: {
        session: {
          access_token: 'mock-token-demo',
          user: { id: 'mock-user-1', email: email || 'consumer@claimkaro.ai' },
        },
        user: { id: 'mock-user-1', email: email || 'consumer@claimkaro.ai' },
      },
      error: null,
    }),
    signUp: async ({ email }) => ({
      data: {
        session: {
          access_token: 'mock-token-demo',
          user: { id: 'mock-user-1', email: email || 'consumer@claimkaro.ai' },
        },
        user: { id: 'mock-user-1', email: email || 'consumer@claimkaro.ai' },
      },
      error: null,
    }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        execute: () => Promise.resolve({ data: [], error: null }),
      }),
      execute: () => Promise.resolve({ data: [], error: null }),
    }),
    insert: () => ({
      execute: () => Promise.resolve({ data: [{ id: 'mock-id' }], error: null }),
    }),
    update: () => ({
      eq: () => ({
        execute: () => Promise.resolve({ data: [{}], error: null }),
      }),
    }),
  }),
})

let client
try {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    client = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    client = createMockClient()
  }
} catch (e) {
  console.warn('Supabase initialization failed, falling back to mock client:', e)
  client = createMockClient()
}

export const supabase = client
