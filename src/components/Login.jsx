import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    onLogin(data.user)
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Connect Evo</h1>
        <p className="login-subtitle">Painel Admin</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-box {
          background: #1a1a1a;
          padding: 40px;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          border: 1px solid #333;
        }

        .login-box h1 {
          font-size: 28px;
          text-align: center;
          margin-bottom: 8px;
        }

        .login-subtitle {
          color: #666;
          text-align: center;
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #ccc;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #333;
          background: #0f0f0f;
          color: #fff;
          font-size: 16px;
        }

        .form-group input:focus {
          outline: none;
          border-color: #25D366;
        }

        .error {
          background: #2a1a1a;
          color: #ff6b6b;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .btn-primary {
          width: 100%;
          padding: 14px;
          background: #25D366;
          color: #000;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          transition: opacity 0.2s;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}