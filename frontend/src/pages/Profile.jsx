import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Crown, Leaf, Settings, LogOut, Edit2, MapPin, Sparkles, Stethoscope, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import useGlobalReducer from '../hooks/useGlobalReducer'
import api from '../services/api'
import SettingsModal from '../components/SettingsModal'
import AddPlantModal from '../components/AddPlantModal'

export default function Profile() {
  const { store, dispatch } = useGlobalReducer()
  const navigate = useNavigate()
  const { username } = useParams()   // /profile/:username

  // Si hay :username en la URL es vista pública; si no, es perfil del usuario logueado
  const isOwnProfile = !username
  const currentUser = store.user

  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: '', location: '', bio: '' })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pendingScans, setPendingScans] = useState([])
  const [expandedScan, setExpandedScan] = useState(null)
  const [linkingScanId, setLinkingScanId] = useState(null)
  const [linkPlantId, setLinkPlantId] = useState('')
  const [showAddPlantModal, setShowAddPlantModal] = useState(false)
  const [newPlantScan, setNewPlantScan] = useState(null)

  useEffect(() => {
    if (isOwnProfile) {
      // Display data for the logged-in user
      setProfileData({
        user: currentUser,
        plants: store.plants,
        is_own: true,
      })
      setForm({
        username: currentUser?.username || '',
        location: currentUser?.location || '',
        bio: currentUser?.bio || '',
      })
      setLoading(false)
      fetchPendingScans()
    } else {
      // Load public profile
      fetchProfile()
    }
  }, [username])

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/${username}`)
      setProfileData(res.data)
    } catch (err) {
      toast.error('User not found')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch({ type: 'logout' })
    navigate('/login')
    toast.success('See you soon! 🌿')
  }

  const handleNewPlantCreated = async (newPlant) => {
  setShowAddPlantModal(false)
  if (newPlantScan) {
    try {
      await api.post(`/doctor/diagnoses/${newPlantScan.id}/assign`, {
        plant_id: newPlant.id
      })
      toast.success(`${newPlant.nickname || newPlant.name} added with scan! 🌿`)
      setNewPlantScan(null)
      fetchPendingScans()
      navigate(`/plant/${newPlant.id}`)
    } catch (err) {
      toast.error('Could not link scan to new plant')
    }
  }
}

  const handleSave = async () => {
    try {
      const res = await api.put('/users/profile', form)
      dispatch({ type: 'update_user', payload: res.data.user })
      setProfileData({ ...profileData, user: res.data.user })
      setEditing(false)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error('Could not update profile')
    }
  }

  const fetchPendingScans = async () => {
  try {
    const res = await api.get('/doctor/pending')
    setPendingScans(res.data.diagnoses || [])
  } catch (err) {
    console.error(err)
  }
}

const handleLinkScan = async (scanId) => {
  if (!linkPlantId) {
    toast.error('Please select a plant')
    return
  }
  try {
    await api.post(`/doctor/diagnoses/${scanId}/assign`, {
      plant_id: linkPlantId
    })
    toast.success('Scan added to plant! 🌿')
    setLinkingScanId(null)
    setLinkPlantId('')
    fetchPendingScans()
  } catch (err) {
    toast.error('Could not link scan')
  }
}

const handleDeleteScan = async (scanId) => {
  if (!confirm('Are you sure you want to discard this scan?')) return
  try {
    await api.delete(`/doctor/diagnoses/${scanId}`)
    toast.success('Scan discarded')
    fetchPendingScans()
  } catch (err) {
    toast.error('Could not discard scan')
  }
}

  const handleUpgrade = () => {
    // For now, we are only simulating the upgrade.
    dispatch({ type: 'upgrade_plan', payload: 'pro' })
    toast.success('Welcome to Pro! 🚀 Stripe coming soon')
  }

  if (loading) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: 40, maxWidth: 600, margin: '40px auto' }}>
        <div className="animate-pulse" style={{ fontSize: 32 }}>🌿</div>
        <p style={{ fontSize: 12, color: '#6a8a5a', marginTop: 10 }}>Loading profile...</p>
      </div>
    )
  }

  const user = profileData.user
  const plants = profileData.plants || []
  const isPro = user?.plan === 'pro'

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>

      {/* Hero card */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2e0a, #2d5a1b, #4a9e2a)',
        borderRadius: 20, padding: '24px 28px',
        position: 'relative', overflow: 'hidden', marginBottom: 16
      }}>
        <div style={{ position: 'absolute', top: -40, right: 40, width: 130, height: 130, background: 'rgba(255,255,255,.05)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7dcf4a, #4a9e2a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#1a2e0a',
            border: '3px solid rgba(255,255,255,.2)'
          }}>
            {user?.username?.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>@{user?.username}</p>
              {isPro && (
                <span style={{
                  background: 'rgba(255,255,255,.15)', color: '#7dcf4a',
                  fontSize: 9, fontWeight: 700, padding: '3px 8px',
                  borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 4
                }}>
                  <Crown size={10} /> PRO
                </span>
              )}
            </div>
            {user?.location && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} /> {user.location}
              </p>
            )}
            {user?.bio && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginTop: 6, lineHeight: 1.5 }}>
                {user.bio}
              </p>
            )}
          </div>

          {isOwnProfile && (
            <button
              onClick={() => setEditing(!editing)}
              style={{
                background: 'rgba(255,255,255,.15)', border: 'none',
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Edit2 size={14} color="white" />
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.1)' }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{plants.length}</p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>PLANTS</p>
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{plants.filter(p => (p.health_score || 0) >= 75).length}</p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>HEALTHY</p>
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{user?.total_diagnoses || 0}</p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>SCANS</p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="glass-card" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2e0a', marginBottom: 12 }}>Edit profile</p>
          <input
            className="input-field"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            style={{ marginBottom: 8 }}
          />
          <input
            className="input-field"
            placeholder="Location (e.g. Miami, FL)"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            style={{ marginBottom: 8 }}
          />
          <textarea
            className="input-field"
            placeholder="Tell us about your plant journey..."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            style={{ marginBottom: 10, resize: 'vertical', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={handleSave} style={{ flex: 1, justifyContent: 'center' }}>
              Save
            </button>
            <button className="btn-secondary" onClick={() => setEditing(false)} style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Upgrade banner (solo own profile y si no es Pro) */}
      {isOwnProfile && !isPro && (
        <div style={{
          background: 'linear-gradient(135deg, #1a2e0a, #2d5a1b)',
          borderRadius: 16, padding: '16px 20px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden'
        }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#7dcf4a', letterSpacing: '.06em', marginBottom: 4 }}>
              ✨ UPGRADE TO PRO
            </p>
            <p style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 4 }}>
              Unlock unlimited scans
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', maxWidth: 280 }}>
              No ads, geo-personalized care tips, and unlimited diagnoses.
            </p>
          </div>
          <button className="btn-pill" onClick={handleUpgrade}>
            <Crown size={12} /> $4.99/mo
          </button>
        </div>
      )}

      {/* Pending scans — only on own profile */}
{isOwnProfile && pendingScans.length > 0 && (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2e0a' }}>
          Pending Scans
        </p>
        <span style={{
          background: '#fff3cc', color: '#9a6800',
          fontSize: 9, fontWeight: 700,
          padding: '2px 8px', borderRadius: 99
        }}>
          {pendingScans.length} pending
        </span>
      </div>
      <Sparkles size={14} color="#f0a020" />
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {pendingScans.map(scan => {
        const isExpanded = expandedScan === scan.id
        const isLinking = linkingScanId === scan.id
        const pct = scan.health_score || 0
        const ringColor = pct >= 75 ? '#4a9e2a'
          : pct >= 50 ? '#f0a020' : '#e04040'
        const statusBg = scan.status === 'healthy' ? '#e0f5d0'
          : scan.status === 'needs_attention' ? '#fff3cc' : '#ffe0e0'
        const statusColor = scan.status === 'healthy' ? '#2d5a1b'
          : scan.status === 'needs_attention' ? '#9a6800' : '#a01010'

        return (
          <div
            key={scan.id}
            className="glass-card"
            style={{ padding: 12, border: '1px solid rgba(240,160,32,.2)' }}
          >
            {/* Card header */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onClick={() => setExpandedScan(isExpanded ? null : scan.id)}
            >
              <div style={{
                width: 48, height: 48,
                borderRadius: 12, overflow: 'hidden',
                background: '#f5fbf0',
                border: `2px solid ${ringColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 22
              }}>
                {scan.photo_url
                  ? <img src={scan.photo_url} alt="scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '🌿'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    padding: '2px 8px', borderRadius: 99,
                    background: statusBg, color: statusColor,
                    textTransform: 'capitalize'
                  }}>
                    {(scan.status || 'unknown').replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: ringColor }}>
                    {pct}%
                  </span>
                </div>
                <p style={{ fontSize: 10, color: '#6a8a5a' }}>
                  {new Date(scan.created_at).toLocaleString()}
                </p>
                <p style={{ fontSize: 10, color: '#8aaa7a', marginTop: 2 }}>
                  {scan.issues_found?.length || 0} {scan.issues_found?.length === 1 ? 'issue' : 'issues'} found
                </p>
              </div>
              <span style={{ fontSize: 12, color: '#8aaa7a' }}>
                {isExpanded ? '▲' : '▼'}
              </span>
            </div>

            {/* Expanded actions */}
            {isExpanded && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(45,90,27,.08)' }}>

                {/* Action selector */}
                {!isLinking && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button
                      onClick={() => {
                        setNewPlantScan(scan)
                        setShowAddPlantModal(true)
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                        background: 'linear-gradient(135deg, #1a2e0a, #2d5a1b)', color: 'white',
                        border: 'none', borderRadius: 99,
                        padding: '8px 14px', fontSize: 11, fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      🌱 Save as new plant
                    </button>
                    {store.plants.length > 0 && (
                      <button
                        onClick={() => {
                          setLinkingScanId(scan.id)
                          setLinkPlantId('')
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                          background: 'rgba(245,251,240,.8)', color: '#1a2e0a',
                          border: '1px solid rgba(45,90,27,.15)', borderRadius: 99,
                          padding: '8px 14px', fontSize: 11, fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Leaf size={12} /> Link to existing plant
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteScan(scan.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                        background: 'transparent', color: '#e04040',
                        border: 'none', borderRadius: 99,
                        padding: '6px 14px', fontSize: 10, fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={11} /> Discard scan
                    </button>
                  </div>
                )}

                {/* Plant selector */}
                {isLinking && (
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#6a8a5a', letterSpacing: '.06em', marginBottom: 6 }}>
                      SELECT A PLANT
                    </p>
                    <select
                      value={linkPlantId}
                      onChange={(e) => setLinkPlantId(e.target.value)}
                      className="input-field"
                      style={{ cursor: 'pointer', marginBottom: 8 }}
                    >
                      <option value="">Choose a plant...</option>
                      {store.plants.map(plant => (
                        <option key={plant.id} value={plant.id}>
                          🌿 {plant.nickname || plant.name}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => {
                          setLinkingScanId(null)
                          setLinkPlantId('')
                        }}
                        className="btn-secondary"
                        style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleLinkScan(scan.id)}
                        className="btn-primary"
                        style={{ flex: 2, justifyContent: 'center', fontSize: 11 }}
                      >
                        Link to plant
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )
      })}
    </div>
  </div>
)}


      {/* Plants section */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2e0a', marginBottom: 10 }}>
          {isOwnProfile ? 'Your plants' : `${user?.username}'s plants`}
        </p>
        {plants.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: 24 }}>
            <p style={{ fontSize: 12, color: '#6a8a5a' }}>No plants shared yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            {plants.map(plant => (
              <div
                key={plant.id}
                className="glass-card"
                style={{ padding: 10, textAlign: 'center', cursor: 'pointer' }}
                onClick={() => isOwnProfile && navigate(`/plant/${plant.id}`)}
              >
                <div style={{ fontSize: 28, marginBottom: 4 }}>🌿</div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#1a2e0a' }}>{plant.nickname || plant.name}</p>
                {plant.health_score && (
                  <p style={{ fontSize: 9, color: '#6a8a5a', marginTop: 2 }}>{plant.health_score}%</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions (solo own profile) */}
      {isOwnProfile && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#1a2e0a', border: 'none', borderBottom: '1px solid rgba(45,90,27,.06)', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <Settings size={16} color="#4a9e2a" />
            Settings
          </button>
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#e04040', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

    <AddPlantModal
  isOpen={showAddPlantModal}
  onClose={() => {
    setShowAddPlantModal(false)
    setNewPlantScan(null)
  }}
  onCreated={handleNewPlantCreated}
  prefillFromScan={newPlantScan}
/>

    </div>
  )
}