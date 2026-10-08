import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isMockClient } from '../lib/supabase'
import { setDemoInbox, getErrorMessage } from '../lib/api'

const PENDING_KEY = 'ck_pending_demo_inbox'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [demoInbox, setDemoInboxValue] = useState('')

  // Save the demo merchant inbox for the logged-in user (skips silently if empty)
  const saveDemoInbox = async (value) => {
    const v = (value || '').trim()
    if (!v) return
    await setDemoInbox(v)
    try { localStorage.removeItem(PENDING_KEY) } catch { /* ignore */ }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isMockClient) {
        // Dev mode: save the demo inbox, then go to the dashboard
        await saveDemoInbox(demoInbox)
        navigate('/dashboard')
        return
      }

      if (isSignUp) {
        const { data, error: signUpErr } = await supabase.auth.signUp({ email, password })
        if (signUpErr) throw signUpErr
        if (data?.session) {
          await saveDemoInbox(demoInbox)
          navigate('/dashboard')
        } else {
          // Email confirmation is on: remember the inbox and save it after first sign-in
          try { localStorage.setItem(PENDING_KEY, demoInbox.trim()) } catch { /* ignore */ }
          alert('Check your email to confirm your account, then sign in.')
          setIsSignUp(false)
        }
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
        if (signInErr) throw signInErr
        let pending = ''
        try { pending = localStorage.getItem(PENDING_KEY) || '' } catch { /* ignore */ }
        await saveDemoInbox(demoInbox || pending)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(getErrorMessage(err) || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/30">
            ⚡
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">ClaimKaro</h1>
            <p className="text-xs text-slate-400">AI-Powered Warranty & Defect Claims</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}

        {isMockClient ? (
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl">
              <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                Demo merchant inbox
              </label>
              <p className="text-xs text-amber-200/70 mb-2">
                Evaluators: enter your email. Complaint emails the agent sends to the company will be delivered here, so you can see them arrive.
              </p>
              <input
                type="email"
                required
                value={demoInbox}
                onChange={(e) => setDemoInboxValue(e.target.value)}
                placeholder="evaluator@example.com"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="p-4 bg-indigo-950/50 border border-indigo-500/30 rounded-xl text-indigo-200 text-sm">
              <span className="font-semibold block text-indigo-300 mb-1">Developer Mode Active</span>
              Backend <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">DEV_AUTH</code> mode is enabled. No Supabase login required.
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {loading ? 'Saving…' : 'Continue to Dashboard →'}
            </button>
            <button
              type="button"
              onClick={async () => { await saveDemoInbox(demoInbox).catch(() => {}); navigate('/new') }}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all cursor-pointer"
            >
              File a New Claim +
            </button>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl">
              <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                Demo merchant inbox
              </label>
              <p className="text-xs text-amber-200/70 mb-2">
                Evaluators: enter your email. Complaint emails the agent sends to the company will be delivered here, so you can see them arrive.
              </p>
              <input
                type="email"
                required={isSignUp}
                value={demoInbox}
                onChange={(e) => setDemoInboxValue(e.target.value)}
                placeholder="evaluator@example.com"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer mt-2"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
