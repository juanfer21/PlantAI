import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, BookOpen, Droplets, Bell, ArrowRight } from 'lucide-react'
import useGlobalReducer from '../hooks/useGlobalReducer'
import api from '../services/api'

export default function Home() {
  const { store, dispatch } = useGlobalReducer()
  const navigate = useNavigate()
  const { plants, user, isPro } = store

  useEffect(() => {
    fetchPlants()
  }, [])

  const fetchPlants = async () => {
    try {
      const res = await api.get('/plants')
      dispatch({ type: 'set_plants', payload: res.data.plants })
    } catch (err) {
      console.error(err)
    }
  }

  const healthColor = (pct) => {
    if (!pct) return '#8aaa7a'
    if (pct >= 75) return '#4a9e2a'
    if (pct >= 50) return '#f0a020'
    return '#e04040'
  }

  const chips = [
    {
      key: 'doctor',
      emoji: '🩺',
      label: 'AI Diagnosis',
      badge: isPro ? 'Unlimited' : `${store.diagnosis?.remaining ?? 2} left`,
      badgeStyle: { background: 'rgba(125,207,74,.2)', color: '#7dcf4a' },
      urgent: false,
      onClick: () => navigate('/doctor'),
    },
    {
      key: 'care',
      emoji: '📖',
      label: 'Care Guide',
      badge: `${plants.length} plants`,
      badgeStyle: { background: '#e0f5d0', color: '#2d5a1b' },
      urgent: false,
      onClick: () => navigate('/garden'),
    },
    {
      key: 'water',
      emoji: '💧',
      label: 'Watering',
      badge: wateringDue() ? 'Due today' : 'All good',
      badgeStyle: wateringDue()
        ? { background: '#fff3cc', color: '#9a6800' }
        : { background: '#e0f5d0', color: '#2d5a1b' },
      urgent: wateringDue(),
      onClick: () => navigate('/garden'),
    },
    {
      key: 'reminders',
      emoji: '🔔',
      label: 'Reminders',
      badge: '2 active',
      badgeStyle: { background: '#e0f5d0', color: '#2d5a1b' },
      urgent: false,
      onClick: () => {},
    },
  ]

  function wateringDue() {
    return plants.some(p => p.watering_due)
  }

  return (
    <div>

      {/* ── BANNER ── */}
      <div className="scan-banner">
        <div>
          <div className="banner-tag">
            <span>✨</span> AI POWERED
          </div>
          <p className="banner-title">
            Scan & <em>Diagnose</em><br />Any Plant
          </p>
          <p className="banner-desc">
            Upload a photo and get an instant health report
            with personalized care tips.
          </p>
          <button
            className="banner-btn"
            onClick={() => navigate('/doctor')}
          >
            <Camera size={12} />
            Scan Now
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 54, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,.3))', lineHeight: 1 }}>
            🪴
          </div>
          <div className="banner-stats">
            <div className="banner-stat">
              <div className="banner-stat-n">98%</div>
              <div className="banner-stat-l">ACCURACY</div>
            </div>
            <div className="banner-stat">
              <div className="banner-stat-n">500+</div>
              <div className="banner-stat-l">SPECIES</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CHIPS ── */}
      <div className="chips-row">
        {chips.map(chip => (
          <div
            key={chip.key}
            className={`chip ${chip.key === 'doctor' ? 'active' : ''}`}
            onClick={chip.onClick}
          >
            {chip.urgent && <div className="chip-urgent">!</div>}
            <div className="chip-emoji">{chip.emoji}</div>
            <div className="chip-title">{chip.label}</div>
            <span className="chip-badge" style={chip.badgeStyle}>
              {chip.badge}
            </span>
          </div>
        ))}
      </div>

      {/* ── RECENT ── */}
      <div>
        <div className="recent-header">
          <p className="recent-title">Recent Identifications</p>
          <span
            className="recent-see"
            onClick={() => navigate('/garden')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            See All <ArrowRight size={12} />
          </span>
        </div>

        <div className="recent-grid">
          {plants.slice(0, 3).map(plant => {
            const pct = plant.health_score || 0
            const color = healthColor(pct)
            const dash = (pct / 100) * 113
            const isHealthy = pct >= 75

            return (
              <div
                key={plant.id}
                className="recent-pill"
                onClick={() => navigate(`/plant/${plant.id}`)}
              >
                <div className="recent-ring">
                  <svg viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(45,90,27,.1)" strokeWidth="3.5" />
                    <circle
                      cx="24" cy="24" r="20" fill="none"
                      stroke={color} strokeWidth="3.5"
                      strokeDasharray={`${dash} 126`}
                      strokeDashoffset="32"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="recent-emoji">
                    {plant.photo_url ? (
                      <img
                        src={plant.photo_url}
                        alt={plant.name}
                        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : '🌿'}
                  </span>
                </div>
                <div className="recent-info">
                  <p className="recent-name">{plant.nickname || plant.name}</p>
                  <p className="recent-sp">{plant.species}</p>
                  <div
                    className="recent-status"
                    style={{ color }}
                  >
                    <span style={{ fontSize: 7 }}>●</span>
                    {isHealthy ? 'Healthy' : pct >= 50 ? 'Needs Attention' : 'Sick'}
                  </div>
                </div>
                <div className="recent-right">
                  <div className="recent-pct" style={{ color }}>{pct}%</div>
                  <div className="recent-date">Today</div>
                </div>
              </div>
            )
          })}

          {/* Add plant */}
          <div
            className="recent-add"
            onClick={() => navigate('/garden')}
          >
            <span style={{ fontSize: 20, color: '#4a9e2a' }}>+</span>
            <p>Add new plant</p>
          </div>
        </div>
      </div>

    </div>
  )
}