import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasValidConfig =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey !== 'your-anon-key'

export const isMockClient = !hasValidConfig

// If a real client exists, never inject a mock token.
// Keep the mock client only when VITE_SUPABASE_URL is missing,
// and make its getSession return session: null (no fake access_token)
// so the backend's dev mode accepts requests without a token.
export const supabase = hasValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        async getSession() {
          return { data: { session: null }, error: null }
        },
        async getUser() {
          return { data: { user: null }, error: null }
        },
        onAuthStateChange(_callback) {
          return {
            data: {
              subscription: {
                unsubscribe() {},
              },
            },
          }
        },
        async signInWithPassword() {
          return { data: { user: null, session: null }, error: null }
        },
        async signOut() {
          return { error: null }
        },
      },
    }
