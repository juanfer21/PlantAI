import { Outlet, NavLink, useLocation } from 'react-router-dom'
import useGlobalReducer from '../../hooks/useGlobalReducer'
import {
  Home, Leaf, Stethoscope, Users, User, Plus,
  Search, Bell, Camera
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Layout() {
  const { store, dispatch } = useGlobalReducer();
  const location = useLocation();
  const user = store.user

  const [pendingCount, setPendingCount] = useState(0)


  useEffect(() => {
  // Fetch pending scans count
  if (store.token) {
    fetch('/api/doctor/pending', {
      headers: { Authorization: `Bearer ${store.token}` }
    })
      .then(r => r.ok ? r.json() : { diagnoses: [] })
      .then(d => setPendingCount(d.diagnoses?.length || 0))
      .catch(() => {})
  }
}, [store.token, location.pathname])

  const navItems = [
    { path: '/',          icon: Home,        label: 'Home'      },
    { path: '/garden',    icon: Leaf,        label: 'My Garden' },
    { path: '/doctor',    icon: Stethoscope, label: 'Doctor'    },
    { path: '/community', icon: Users,       label: 'Community' },
    { path: '/profile',   icon: User,        label: 'Profile'   },
  ]

  const plantLinks = store.plants?.slice(0, 3) || []

  const healthColor = (pct) => {
    if (!pct) return '#8aaa7a'
    if (pct >= 75) return '#4a9e2a'
    if (pct >= 50) return '#f0a020'
    return '#e04040'
  }

  return (
    <div className="app-layout">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🌿</div>
          <span className="sidebar-brand-name">PlantAI</span>
        </div>

        <nav>
          {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
            style={{ position: 'relative' }}
          >
            <Icon size={16} />
            {label}
            {path === '/profile' && pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                right: 10, top: '50%',
                transform: 'translateY(-50%)',
                background: '#e04040',
                color: 'white',
                fontSize: 9, fontWeight: 800,
                minWidth: 18, height: 18,
                borderRadius: 99,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 5px',
                boxShadow: '0 2px 6px rgba(224,64,64,.4)'
              }}>
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
        </nav>

        {plantLinks.length > 0 && (
          <>
            <div className="nav-divider" />
            <p className="nav-section">MY PLANTS</p>
            {plantLinks.map(plant => (
              <NavLink
                key={plant.id}
                to={`/plant/${plant.id}`}
                className="plant-link"
              >
                <div
                  className="plant-link-dot"
                  style={{ background: healthColor(plant.health_score) }}
                />
                <span style={{ fontSize: 13 }}>🌿</span>
                {plant.nickname || plant.name}
              </NavLink>
            ))}
            <div
              className="plant-link"
              style={{ color: '#2d5a1b', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => {}}
            >
              <Plus size={14} />
              Add plant
            </div>
          </>
        )}

        <div style={{ marginTop: 'auto' }}>
          <div className="upgrade-card">
            <div className="upgrade-card-tag">
              {store.isPro ? '⭐ PRO PLAN' : '✨ FREE PLAN'}
            </div>
            {store.isPro ? (
              <>
                <p className="upgrade-card-title">You're Pro!</p>
                <p className="upgrade-card-text">Unlimited scans & geo care tips active.</p>
              </>
            ) : (
              <>
                <p className="upgrade-card-title">Go Pro</p>
                <p className="upgrade-card-text">
                  Unlimited scans, no ads, geo-personalized care tips.
                </p>
                <NavLink to="/profile" className="upgrade-card-btn">
                  Upgrade — $4.99/mo
                </NavLink>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main-content">

        {/* Topbar */}
        <div className="topbar">
          <div>
            <p className="topbar-greeting">
              What Are We <span>Growing</span> Today?
            </p>
            <p className="topbar-sub">
              {user?.username} · Plant Lover 🌱
              {user?.location ? ` · ${user.location}` : ''}
            </p>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <Search size={13} color="#4a9e2a" />
              Search plants, problems...
            </div>
            <button className="topbar-btn">
              <Bell size={16} color="#2d5a1b" />
            </button>
            <div className="topbar-avatar">
              {user?.username?.slice(0, 2).toUpperCase() || 'JF'}
            </div>
          </div>
        </div>

        <Outlet />
      </main>

      {/* ── BOTTOM NAV (móvil) ── */}
      <nav 
        className="bottom-nav-mobile"
        style={{
          position: 'fixed', bottom: 10, left: 10, right: 10,
          zIndex: 100,
          background: 'rgba(26, 46, 10, 0.92)',
          backdropFilter: 'blur(12px)',
          borderRadius: 99,
          padding: '8px 12px',
          justifyContent: 'space-around',
          boxShadow: '0 8px 24px rgba(0,0,0,.2)'
        }}
      >
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path))
          const showBadge = path === '/profile' && pendingCount > 0
          return (
            <NavLink
              key={path}
              to={path}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 2, fontSize: 8, fontWeight: 700,
                color: isActive ? 'white' : 'rgba(255,255,255,.4)',
                textDecoration: 'none',
                position: 'relative'
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={18} color={isActive ? '#7dcf4a' : 'rgba(255,255,255,.4)'} />
                {showBadge && (
                  <span style={{
                    position: 'absolute',
                    top: -5, right: -7,
                    background: '#e04040',
                    color: 'white',
                    fontSize: 8, fontWeight: 800,
                    minWidth: 14, height: 14,
                    borderRadius: 99,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    border: '1.5px solid #1a2e0a'
                  }}>
                    {pendingCount}
                  </span>
                )}
              </div>
              {label}
            </NavLink>
          )
        })}
      </nav>

    </div>
  )
}