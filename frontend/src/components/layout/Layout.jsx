import { Outlet, NavLink, useLocation } from 'react-router-dom'
import useGlobalReducer from '../../hooks/useGlobalReducer'
import {
  Home, Leaf, Stethoscope, Users, User, Plus,
  Search, Bell, Camera
} from 'lucide-react'

export default function Layout() {
  const { store, dispatch } = useGlobalReducer();
  const location = useLocation();
  const user = store.user

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
            >
              <Icon size={16} />
              {label}
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
      <nav className="bottom-nav" style={{
        position: 'fixed', bottom: 10, left: 10, right: 10,
        zIndex: 100, display: 'none'
      }}
        id="mobile-nav"
      >
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path))
          return (
            <NavLink
              key={path}
              to={path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          )
        })}
      </nav>

    </div>
  )
}