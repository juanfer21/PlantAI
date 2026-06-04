import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Camera, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import useGlobalReducer from '../hooks/useGlobalReducer'
import api from '../services/api'

export default function Login() {
  const { dispatch } = useGlobalReducer()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      dispatch({ type: 'login', payload: res.data })
      toast.success(`Welcome back, ${res.data.user.username}! 🌿`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f5fbf0 0%, #dff0cc 60%, #c5e4b0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #1a2e0a, #2d5a1b)',
          borderRadius: 24, padding: '32px 24px 24px',
          textAlign: 'center', marginBottom: 16,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 100, height: 100,
            background: 'rgba(255,255,255,.04)', borderRadius: '50%'
          }} />
          <div style={{ fontSize: 52, marginBottom: 12, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.3))' }}>
            🌿
          </div>
          <p style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 4 }}>
            Welcome back
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>
            Your plants are waiting 🌱
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'rgba(255,255,255,.8)', backdropFilter: 'blur(16px)',
          borderRadius: 20, padding: '24px',
          border: '1px solid rgba(255,255,255,.9)',
          boxShadow: '0 4px 24px rgba(45,90,27,.1)'
        }}>
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={15} color="#4a9e2a"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  className="input-field"
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15} color="#4a9e2a"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  className="input-field"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', padding: 0
                  }}
                >
                  {showPassword
                    ? <EyeOff size={15} color="#8aaa7a" />
                    : <Eye size={15} color="#8aaa7a" />
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginBottom: 10, opacity: loading ? .7 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Register */}
            <Link to="/register">
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Create account
              </button>
            </Link>

          </form>

          <p style={{ fontSize: 11, color: '#8aaa7a', textAlign: 'center', marginTop: 14 }}>
            No credit card required · Free forever
          </p>
        </div>

      </div>
    </div>
  )
}