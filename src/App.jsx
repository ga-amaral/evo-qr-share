import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import PublicConnect from './components/PublicConnect'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [publicToken, setPublicToken] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('t')
    if (token) {
      setPublicToken(token)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  function handleLogin(user) {
    setUser(user)
  }

  function handleLogout() {
    supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        Carregando...
      </div>
    )
  }

  if (publicToken) {
    return <PublicConnect token={publicToken} />
  }

  return user ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  )
}