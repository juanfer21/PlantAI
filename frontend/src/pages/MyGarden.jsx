import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Droplets, Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'
import useGlobalReducer from '../hooks/useGlobalReducer'
import api from '../services/api'
import AddPlantModal from '../components/AddPlantModal'

export default function MyGarden() {
  const { store, dispatch } = useGlobalReducer()
  const navigate = useNavigate()
  const { plants } = store

  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)

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

  // Pot colors cycle through these
  const potColors = [
    'linear-gradient(180deg, #d4894a, #b06030)',
    'linear-gradient(180deg, #c070a0, #903060)',
    'linear-gradient(180deg, #a0b060, #708040)',
    'linear-gradient(180deg, #c88040, #a06030)',
    'linear-gradient(180deg, #60a0c0, #3070a0)',
  ]

  const getStatus = (pct) => {
    if (!pct) return { label: 'Not scanned', cls: 'badge-attention', urgent: false }
    if (pct >= 75) return { label: '✓ Healthy', cls: 'badge-healthy', urgent: false }
    if (pct >= 50) return { label: '⚠ Attention', cls: 'badge-attention', urgent: true }
    return { label: '⚠ Sick', cls: 'badge-attention', urgent: true }
  }

  // Filter plants
  const filtered = plants.filter(p => {
    if (filter === 'healthy') return (p.health_score || 0) >= 75
    if (filter === 'care') return (p.health_score || 0) < 75
    return true
  })

  // Split into shelves of 2-3 plants
  const shelves = []
  const perShelf = 2
  for (let i = 0; i < filtered.length; i += perShelf) {
    shelves.push(filtered.slice(i, i + perShelf))
  }

  // Plants needing care for the alert cards
  const needsWater = plants.find(p => p.watering_due)
  const needsScan = plants.find(p => !p.health_score)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Header with tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'healthy', 'care'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: 11, fontWeight: 700, padding: '5px 14px',
                borderRadius: 99, border: 'none', cursor: 'pointer',
                background: filter === f ? '#2d5a1b' : 'rgba(255,255,255,.6)',
                color: filter === f ? 'white' : '#8a7a6a',
              }}
            >
              {f === 'all' ? 'All' : f === 'healthy' ? 'Healthy' : 'Need care'}
            </button>
          ))}
        </div>
        <button
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: 12 }}
          onClick={() => setModalOpen(true)}
        >
          <Plus size={14} /> Add plant
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🪴</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1a2e0a', marginBottom: 4 }}>
            {filter === 'all' ? 'No plants yet' : 'No plants in this filter'}
          </p>
          <p style={{ fontSize: 12, color: '#6a8a5a', marginBottom: 16 }}>
            Start by adding your first plant
          </p>
          <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Add your first plant
          </button>
        </div>
      )}

      {/* Shelf unit */}
      {filtered.length > 0 && (
        <div style={{
          background: 'linear-gradient(180deg, rgba(200,170,120,.1), rgba(180,150,100,.2))',
          borderRadius: 16, overflow: 'hidden',
          border: '1px solid rgba(180,150,100,.15)', marginBottom: 12
        }}>
          {shelves.map((shelf, si) => (
            <div
              key={si}
              style={{
                borderBottom: si < shelves.length - 1 ? '3px solid rgba(139,90,43,.2)' : 'none',
                padding: '16px 24px 0',
                display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
                background: 'linear-gradient(180deg, transparent, rgba(139,90,43,.04))',
              }}
            >
              {shelf.map((plant, pi) => {
                const status = getStatus(plant.health_score)
                return (
                  <div
                    key={plant.id}
                    onClick={() => navigate(`/plant/${plant.id}`)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      paddingBottom: 8, cursor: 'pointer', position: 'relative'
                    }}
                  >
                    {status.urgent && (
                      <div style={{
                        position: 'absolute', top: -6, right: 'calc(50% - 28px)',
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#f0a020', border: '2px solid white',
                        fontSize: 10, fontWeight: 800, color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2
                      }}>!</div>
                    )}
                    <div style={{ fontSize: 44, lineHeight: 1, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.15))' }}>
                      {plant.photo_url
                        ? <img src={plant.photo_url} alt={plant.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                        : '🌿'}
                    </div>
                    {/* Pot rim */}
                    <div style={{
                      width: 48, height: 6,
                      background: 'linear-gradient(180deg, #e09050, #c07040)',
                      borderRadius: 3, marginTop: -1
                    }} />
                    {/* Pot body */}
                    <div style={{
                      width: 42, height: 26,
                      background: potColors[(si * perShelf + pi) % potColors.length],
                      borderRadius: '4px 4px 8px 8px'
                    }} />
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#2c1a08', marginTop: 6 }}>
                      {plant.nickname || plant.name}
                    </p>
                    <span className={status.cls} style={{ marginTop: 3, fontSize: 8 }}>
                      {status.label}
                    </span>
                  </div>
                )
              })}

              {/* Add placeholder on last shelf */}
              {si === shelves.length - 1 && shelf.length < 3 && (
                <div
                  onClick={() => setModalOpen(true)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    paddingBottom: 8, cursor: 'pointer', opacity: 0.4
                  }}
                >
                  <div style={{
                    width: 44, height: 44, border: '1.5px dashed rgba(44,26,8,.3)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 8
                  }}>
                    <Plus size={18} color="#8a7a6a" />
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#8a7a6a' }}>Add</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Care alert cards */}
      {needsWater && (
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '10px 14px' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff3cc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💧</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#2c1a08' }}>Water {needsWater.nickname || needsWater.name} today</p>
            <p style={{ fontSize: 10, color: '#8a7a6a' }}>Overdue · check the soil</p>
          </div>
          <button className="btn-primary" style={{ padding: '5px 12px', fontSize: 10 }}>Done ✓</button>
        </div>
      )}

      {needsScan && (
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#e0f5d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🩺</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#2c1a08' }}>Diagnose {needsScan.nickname || needsScan.name}</p>
            <p style={{ fontSize: 10, color: '#8a7a6a' }}>Hasn't been scanned yet</p>
          </div>
          <button className="btn-primary" style={{ padding: '5px 12px', fontSize: 10 }} onClick={() => navigate('/doctor')}>Scan</button>
        </div>
      )}

          <AddPlantModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
          />

    </div>
  )
}
