import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Zap, ArrowRight, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')

  const inputStyle = (field) => ({
    background: 'rgba(28,32,48,0.8)',
    border: `1px solid ${focused === field ? 'rgba(132,204,22,0.5)' : 'rgba(132,204,22,0.1)'}`,
    borderRadius: '12px',
    color: '#E8EAF6',
    outline: 'none',
    boxShadow: focused === field ? '0 0 0 3px rgba(132,204,22,0.08)' : 'none',
    transition: 'all 0.2s ease',
    padding: '14px 16px',
    fontSize: '14px',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/cases')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setError('Check your email for verification link.')
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0B0D11' }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse at 60% 20%, rgba(132,204,22,0.05) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md flex flex-col gap-8 relative">
        {/* Brand */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #84CC16, #65A300)',
              boxShadow: '0 8px 32px rgba(132,204,22,0.3)',
            }}
          >
            <Shield size={26} color="#0B0D11" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-jakarta font-extrabold text-2xl" style={{ color: '#E8EAF6', letterSpacing: '-0.02em' }}>
              ClaimKaro AI
            </h1>
            <p className="text-sm mt-1" style={{ color: '#9196B0' }}>
              India's AI-powered consumer rights platform
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div
          className="rounded-2xl p-7 flex flex-col gap-6"
          style={{
            background: '#161921',
            border: '1px solid rgba(132,204,22,0.1)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          {/* Tab switcher */}
          <div
            className="flex rounded-xl p-1"
            style={{ background: 'rgba(28,32,48,0.8)' }}
          >
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
                style={{
                  background: mode === m ? 'linear-gradient(135deg, #84CC16, #65A300)' : 'transparent',
                  color: mode === m ? '#0B0D11' : '#9196B0',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#9196B0', letterSpacing: '0.04em' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                placeholder="you@example.com"
                style={inputStyle('email')}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#9196B0', letterSpacing: '0.04em' }}>
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  placeholder="••••••••••"
                  style={{ ...inputStyle('password'), paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#6B7280', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  background: error.includes('Check') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${error.includes('Check') ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: error.includes('Check') ? '#22C55E' : '#EF4444',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm transition-all active:scale-95 mt-1"
              style={{
                background: loading ? 'rgba(132,204,22,0.5)' : 'linear-gradient(135deg, #84CC16, #65A300)',
                color: '#0B0D11',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(132,204,22,0.25)',
              }}
            >
              {loading ? (
                <span className="font-mono-ck text-xs">Authenticating…</span>
              ) : (
                <>
                  <Zap size={15} fill="currentColor" />
                  <span>{mode === 'login' ? 'Sign In to ClaimKaro' : 'Create Account'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(132,204,22,0.07)' }} />
            <span className="text-xs" style={{ color: '#4a5070' }}>or continue with</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(132,204,22,0.07)' }} />
          </div>

          {/* Guest CTA */}
          <button
            onClick={() => navigate('/')}
            className="h-11 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'rgba(28,32,48,0.8)',
              border: '1px solid rgba(132,204,22,0.1)',
              color: '#9196B0',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#84CC16'; e.currentTarget.style.borderColor = 'rgba(132,204,22,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9196B0'; e.currentTarget.style.borderColor = 'rgba(132,204,22,0.1)' }}
          >
            View landing page
          </button>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 text-xs" style={{ color: '#4a5070' }}>
          {['CPA 2019 Compliant', 'NCH Ready', 'SSL Encrypted'].map((b) => (
            <div key={b} className="flex items-center gap-1.5">
              <CheckCircle size={12} style={{ color: '#84CC16' }} />
              {b}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
