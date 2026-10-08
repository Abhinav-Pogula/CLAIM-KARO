import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const hasSupabaseConfig = Boolean(
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
)

export const isMockAuth = !hasSupabaseConfig

const DEMO_SESSION_KEY = 'claimkaro-demo-session'
const getDemoSession = () => {
  try {
    return JSON.parse(window.localStorage.getItem(DEMO_SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

const saveDemoSession = (email) => {
  const session = {
    access_token: 'mock-token-demo',
    user: { id: 'mock-user-1', email },
  }
  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session))
  return session
}

// Fallback dummy client in case Supabase credentials fail or in mock mode
const createMockClient = () => ({
  auth: {
    getSession: async () => ({
      data: { session: getDemoSession() },
      error: null,
    }),
    onAuthStateChange: (callback) => {
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      }
    },
    signInWithPassword: async ({ email }) => {
      const session = saveDemoSession(email)
      return { data: { session, user: session.user }, error: null }
    },
    signUp: async ({ email }) => {
      const session = saveDemoSession(email)
      return { data: { session, user: session.user }, error: null }
    },
    signOut: async () => {
      window.localStorage.removeItem(DEMO_SESSION_KEY)
      return { error: null }
    },
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
  if (hasSupabaseConfig) {
    client = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    client = createMockClient()
  }
} catch (e) {
  console.warn('Supabase initialization failed, falling back to mock client:', e)
  client = createMockClient()
}

export const supabase = client
