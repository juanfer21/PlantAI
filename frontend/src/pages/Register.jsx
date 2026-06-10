import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import useGlobalReducer from '../hooks/useGlobalReducer'
import api from '../services/api'

export default function Register() {
  const { dispatch } = useGlobalReducer()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.username || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        email: form.email,
        username: form.username,
        password: form.password,
      })
      dispatch({ type: 'login', payload: res.data })
      toast.success(`Welcome to PlantAI, ${res.data.user.username}! 🌿`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong')
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
          borderRadius: 24, padding: '28px 24px 20px',
          textAlign: 'center', marginBottom: 16,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 100, height: 100,
            background: 'rgba(255,255,255,.04)', borderRadius: '50%'
          }} />
          <div style={{ fontSize: 44, marginBottom: 10, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.3))' }}>
            🌱
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>
            Join PlantAI
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>
            No credit card required · Free forever
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: 'rgba(255,255,255,.8)', backdropFilter: 'blur(16px)',
          borderRadius: 20, padding: '24px',
          border: '1px solid rgba(255,255,255,.9)',
          boxShadow: '0 4px 24px rgba(45,90,27,.1)'
        }}>
          <form onSubmit={handleSubmit}>

            {/* Username */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ position: 'relative' }}>
                <User size={15} color="#4a9e2a" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="input-field"
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#4a9e2a" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
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
            <div style={{ marginBottom: 10 }}>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#4a9e2a" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="input-field"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password (min 6 characters)"
                  value={form.password}
                  onChange={handleChange}
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={15} color="#8aaa7a" /> : <Eye size={15} color="#8aaa7a" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#4a9e2a" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="input-field"
                  type={showPassword ? 'text' : 'password'}
                  name="confirm"
                  placeholder="Confirm password"
                  value={form.confirm}
                  onChange={handleChange}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginBottom: 10, opacity: loading ? .7 : 1 }}
            >
              {loading ? 'Creating account...' : 'Create account 🌿'}
            </button>

            <Link to="/login">
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Already have an account? Sign in
              </button>
            </Link>

          </form>
        </div>

      </div>
    </div>
  )
}
