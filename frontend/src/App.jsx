import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'

import Login    from './pages/Login'
import NewCase  from './pages/NewCase'
import Review   from './pages/Review'
import Result   from './pages/Result'
import MyCases  from './pages/MyCases'

// ---------------------------------------------------------------------------
// ProtectedRoute — redirects to /login when there is no active session
// ---------------------------------------------------------------------------
function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null // still loading
  if (!session) return <Navigate to="/login" replace />
  return children
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected */}
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
