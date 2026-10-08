import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isMockClient } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isMockClient) {
        // Dev mode: immediately go to new case or cases
        navigate('/dashboard')
        return
      }

      if (isSignUp) {
        const { error: signUpErr } = await supabase.auth.signUp({ email, password })
        if (signUpErr) throw signUpErr
        alert('Check your email to confirm your account, or sign in.')
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
        if (signInErr) throw signInErr
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
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
          <div className="space-y-4">
            <div className="p-4 bg-indigo-950/50 border border-indigo-500/30 rounded-xl text-indigo-200 text-sm">
              <span className="font-semibold block text-indigo-300 mb-1">Developer Mode Active</span>
              Backend <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">DEV_AUTH</code> mode is enabled. No Supabase login required.
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Continue to Dashboard →
            </button>
            <button
              onClick={() => navigate('/new')}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all cursor-pointer"
            >
              File a New Claim +
            </button>
          </div>
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
