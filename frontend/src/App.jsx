import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'

import Landing            from './pages/Landing'
import Login              from './pages/Login'
import NewCase            from './pages/NewCase'
import Review             from './pages/Review'
import Result             from './pages/Result'
import MyCases            from './pages/MyCases'
import EvidenceVault      from './pages/EvidenceVault'
import LegalDrafts        from './pages/LegalDrafts'
import RestitutionTracker from './pages/RestitutionTracker'
import SettingsView       from './pages/SettingsView'
import Dashboard          from './pages/Dashboard'

// ---------------------------------------------------------------------------
// ProtectedRoute — redirects to /login when there is no active session
// Temporarily bypassed for UI demo (remove bypass in production)
// ---------------------------------------------------------------------------
function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0D11' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid rgba(132,204,22,0.2)', borderTopColor: '#84CC16', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
  
  // ── UI Preview: remove this bypass line below for production auth ──
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"      element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new"
        element={
          <ProtectedRoute>
            <NewCase />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id/review"
        element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id/result"
        element={
          <ProtectedRoute>
            <Result />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <MyCases />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evidence"
        element={
          <ProtectedRoute>
            <EvidenceVault />
          </ProtectedRoute>
        }
      />
      <Route
        path="/drafts"
        element={
          <ProtectedRoute>
            <LegalDrafts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracker"
        element={
          <ProtectedRoute>
            <RestitutionTracker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsView />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
