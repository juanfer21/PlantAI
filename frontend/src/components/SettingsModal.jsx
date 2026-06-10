import { useState } from 'react'
import { X, Lock, Globe, Bell, Trash2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import useGlobalReducer from '../hooks/useGlobalReducer'
import api from '../services/api'

export default function SettingsModal({ isOpen, onClose }) {
  const { store, dispatch } = useGlobalReducer()
  const [view, setView] = useState('main')   // 'main' | 'password' | 'notifications' | 'danger'

  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.new !== pwForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (pwForm.new.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await api.put('/users/profile', {
        current_password: pwForm.current,
        new_password: pwForm.new,
      })
      toast.success('Password updated successfully')
      setPwForm({ current: '', new: '', confirm: '' })
      setView('main')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update password')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This will remove all your plants, diagnoses, and posts permanently.'
    )
    if (!confirmed) return

    const doubleConfirm = prompt('Type DELETE to confirm:')
    if (doubleConfirm !== 'DELETE') {
      toast.error('Account deletion cancelled')
      return
    }

    try {
      await api.delete('/users/profile')
      dispatch({ type: 'logout' })
      toast.success('Account deleted')
      window.location.href = '/login'
    } catch (err) {
      toast.error('Could not delete account')
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(13,26,13,.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 20,
          width: '100%', maxWidth: 440,
          maxHeight: '90vh', overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,.3)'
        }}
      >

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a2e0a, #2d5a1b)',
          padding: '20px 22px', borderRadius: '20px 20px 0 0', position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(255,255,255,.15)', border: 'none',
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={14} color="white" />
          </button>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>
            {view === 'main' && 'Settings ⚙️'}
            {view === 'password' && 'Change password 🔒'}
            {view === 'notifications' && 'Notifications 🔔'}
            {view === 'danger' && 'Danger zone ⚠️'}
          </p>
          {view !== 'main' && (
            <button
              onClick={() => setView('main')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 4, padding: 0
              }}
            >
              ← Back to settings
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px' }}>

          {/* MAIN VIEW */}
          {view === 'main' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

              <button
                onClick={() => setView('password')}
                style={menuItemStyle}
              >
                <div style={iconWrapStyle('#e0f5d0')}>
                  <Lock size={16} color="#2d5a1b" />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e0a' }}>Change password</p>
                  <p style={{ fontSize: 10, color: '#6a8a5a' }}>Update your account password</p>
                </div>
              </button>

              <button
                onClick={() => setView('notifications')}
                style={menuItemStyle}
              >
                <div style={iconWrapStyle('#fff3d0')}>
                  <Bell size={16} color="#9a6800" />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e0a' }}>Notifications</p>
                  <p style={{ fontSize: 10, color: '#6a8a5a' }}>Manage reminders and alerts</p>
                </div>
              </button>

              <button
                onClick={() => toast('Privacy settings coming soon')}
                style={menuItemStyle}
              >
                <div style={iconWrapStyle('#d0eeff')}>
                  <Shield size={16} color="#1a5a8a" />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e0a' }}>Privacy</p>
                  <p style={{ fontSize: 10, color: '#6a8a5a' }}>Profile visibility and data</p>
                </div>
              </button>

              <button
                onClick={() => toast('Language settings coming soon')}
                style={menuItemStyle}
              >
                <div style={iconWrapStyle('#f0d0ff')}>
                  <Globe size={16} color="#7030a0" />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e0a' }}>Language</p>
                  <p style={{ fontSize: 10, color: '#6a8a5a' }}>English (US)</p>
                </div>
              </button>

              <div style={{ height: 1, background: 'rgba(45,90,27,.08)', margin: '8px 0' }} />

              <button
                onClick={() => setView('danger')}
                style={{ ...menuItemStyle, color: '#e04040' }}
              >
                <div style={iconWrapStyle('#ffe0e0')}>
                  <Trash2 size={16} color="#e04040" />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#e04040' }}>Danger zone</p>
                  <p style={{ fontSize: 10, color: '#6a8a5a' }}>Delete account permanently</p>
                </div>
              </button>

            </div>
          )}

          {/* PASSWORD VIEW */}
          {view === 'password' && (
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Current password</label>
                <input
                  className="input-field"
                  type="password"
                  value={pwForm.current}
                  onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>New password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="At least 6 characters"
                  value={pwForm.new}
                  onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Confirm new password</label>
                <input
                  className="input-field"
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', opacity: loading ? .7 : 1 }}
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}

          {/* NOTIFICATIONS VIEW */}
          {view === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <ToggleRow label="Watering reminders" desc="Get notified when your plants need water" />
              <ToggleRow label="Health alerts" desc="When a plant's health drops below 60%" />
              <ToggleRow label="Community activity" desc="Likes and comments on your posts" defaultOn={false} />
              <ToggleRow label="Weekly digest" desc="Summary of your garden every Monday" />
              <p style={{ fontSize: 10, color: '#6a8a5a', textAlign: 'center', marginTop: 10 }}>
                These settings will be saved to your account
              </p>
            </div>
          )}

          {/* DANGER ZONE VIEW */}
          {view === 'danger' && (
            <div>
              <div style={{
                background: '#ffe0e0', border: '1px solid #ffb0b0',
                borderRadius: 12, padding: '14px 16px', marginBottom: 16
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#a01010', marginBottom: 4 }}>
                  ⚠️ This action cannot be undone
                </p>
                <p style={{ fontSize: 10, color: '#a04040', lineHeight: 1.5 }}>
                  Deleting your account will permanently remove all your plants, diagnoses,
                  care logs, posts, and likes. We cannot recover this data.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                style={{
                  width: '100%', background: '#e04040', color: 'white',
                  padding: '10px 16px', borderRadius: 99, fontSize: 12,
                  fontWeight: 700, border: 'none', cursor: 'pointer'
                }}
              >
                Delete my account permanently
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// Small subcomponents
const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '10px 12px', background: 'rgba(245,251,240,.6)',
  border: 'none', borderRadius: 12, cursor: 'pointer',
  width: '100%'
}
const iconWrapStyle = (bg) => ({
  width: 36, height: 36, borderRadius: 10, background: bg,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0
})
const labelStyle = {
  fontSize: 11, fontWeight: 700, color: '#6a8a5a',
  marginBottom: 5, display: 'block'
}

function ToggleRow({ label, desc, defaultOn = true }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e0a' }}>{label}</p>
        <p style={{ fontSize: 10, color: '#6a8a5a', marginTop: 1 }}>{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        style={{
          width: 36, height: 20, borderRadius: 99,
          background: on ? '#4a9e2a' : '#d0d0d0', border: 'none',
          cursor: 'pointer', padding: 0, position: 'relative',
          transition: 'background 0.15s'
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: 'white',
          position: 'absolute', top: 2, left: on ? 18 : 2,
          transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,.2)'
        }} />
      </button>
    </div>
  )
}