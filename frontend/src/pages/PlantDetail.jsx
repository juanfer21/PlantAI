import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Stethoscope, Droplets, Plus, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import useGlobalReducer from '../hooks/useGlobalReducer'
import api from '../services/api'
import EditPlantModal from '../components/EditPlantModal'

export default function PlantDetail() {
  const { id } = useParams()
  const { store, dispatch } = useGlobalReducer()
  const navigate = useNavigate()

  const [plant, setPlant] = useState(null)
  const [careLogs, setCareLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [diagnoses, setDiagnoses] = useState([])
  const [expandedDiagnosis, setExpandedDiagnosis] = useState(null)

  useEffect(() => {
    fetchPlant()
    fetchCareLogs()
    fetchDiagnoses()
  }, [id])

  const fetchPlant = async () => {
    try {
      const res = await api.get(`/plants/${id}`)
      setPlant(res.data.plant)
    } catch (err) {
      toast.error('Plant not found')
      navigate('/garden')
    } finally {
      setLoading(false)
    }
  }

  const fetchCareLogs = async () => {
    try {
      const res = await api.get(`/plants/${id}/care`)
      setCareLogs(res.data.logs || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchDiagnoses = async () => {
  try {
    const res = await api.get(`/doctor/history/${id}`)
    setDiagnoses(res.data.diagnoses || [])
  } catch (err) {
    console.error(err)
  }
}

  const handleWater = async () => {
    try {
      await api.post(`/plants/${id}/care`, {
        action: 'watered',
        notes: 'Watered today'
      })
      toast.success('Watering logged! 💧')
      fetchCareLogs()
      fetchPlant()
    } catch (err) {
      toast.error('Could not log watering')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this plant from your garden?')) return
    try {
      await api.delete(`/plants/${id}`)
      dispatch({ type: 'delete_plant', payload: parseInt(id) })
      toast.success('Plant removed')
      navigate('/garden')
    } catch (err) {
      toast.error('Could not delete plant')
    }
  }

  const healthColor = (pct) => {
    if (!pct) return '#8aaa7a'
    if (pct >= 75) return '#4a9e2a'
    if (pct >= 50) return '#f0a020'
    return '#e04040'
  }

  const statusLabel = (pct) => {
    if (!pct) return 'Not scanned'
    if (pct >= 75) return '✓ Healthy'
    if (pct >= 50) return '⚠ Needs Attention'
    return '⚠ Sick'
  }

  const iconForAction = (action) => {
    if (action === 'watered') return '💧'
    if (action === 'fertilized') return '🌱'
    if (action === 'pruned') return '✂️'
    if (action === 'repotted') return '🪴'
    if (action === 'diagnosed') return '🩺'
    return '📝'
  }

  if (loading) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: 40, maxWidth: 600, margin: '40px auto' }}>
        <div className="animate-pulse" style={{ fontSize: 32 }}>🌿</div>
        <p style={{ fontSize: 12, color: '#6a8a5a', marginTop: 10 }}>Loading plant...</p>
      </div>
    )
  }

  if (!plant) return null

  const pct = plant.health_score || 0
  const color = healthColor(pct)

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>

      {/* Back button */}
      <button
        onClick={() => navigate('/garden')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: '#4a9e2a', marginBottom: 12
        }}
      >
        <ArrowLeft size={14} /> Back to garden
      </button>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, #1a2e0a, #2d5a1b, ${color})`,
        borderRadius: 20, padding: 24,
        position: 'relative', overflow: 'hidden', marginBottom: 14
      }}>
        <div style={{ position: 'absolute', top: -30, right: 30, width: 120, height: 120, background: 'rgba(255,255,255,.05)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ fontSize: 64, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,.3))' }}>
            {plant.photo_url ? (
              <img src={plant.photo_url} alt={plant.name} style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover' }} />
            ) : '🌿'}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>
              {plant.nickname || plant.name}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>
              {plant.species}
            </p>
            <span style={{
              background: 'rgba(125,207,74,.2)', color: '#7dcf4a',
              fontSize: 10, fontWeight: 700, padding: '3px 10px',
              borderRadius: 99
            }}>
              {statusLabel(pct)}
            </span>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            style={{
              background: 'rgba(255,255,255,.15)', border: 'none',
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Edit2 size={14} color="white" />
          </button>
        </div>

        {/* Health bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <div style={{
                flex: 1, height: 8,
                background: 'rgba(0,0,0,.25)',
                borderRadius: 99, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,.1)'
              }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: 'linear-gradient(90deg, #7dcf4a, #b8e878)',
                  borderRadius: 99,
                  boxShadow: '0 0 12px rgba(125,207,74,.6)',
                  transition: 'width 0.5s'
                }} />
              </div>
              <div style={{
                background: 'rgba(255,255,255,.15)',
                backdropFilter: 'blur(8px)',
                padding: '4px 12px',
                borderRadius: 99,
                border: '1px solid rgba(255,255,255,.2)'
              }}>
                <span style={{
                  fontSize: 16, fontWeight: 800,
                  color: 'white',
                  textShadow: '0 1px 4px rgba(0,0,0,.3)'
                }}>
                  {pct}%
                </span>
              </div>
            </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        <button
          className="glass-card"
          onClick={() => navigate('/doctor')}
          style={{ padding: '12px 10px', textAlign: 'center', cursor: 'pointer', border: 'none' }}
        >
          <Stethoscope size={20} color="#2d5a1b" style={{ marginBottom: 4 }} />
          <p style={{ fontSize: 10, fontWeight: 700, color: '#1a2e0a' }}>Diagnose</p>
        </button>
        <button
          className="glass-card"
          onClick={handleWater}
          style={{ padding: '12px 10px', textAlign: 'center', cursor: 'pointer', border: 'none' }}
        >
          <Droplets size={20} color="#60a0c0" style={{ marginBottom: 4 }} />
          <p style={{ fontSize: 10, fontWeight: 700, color: '#1a2e0a' }}>Water</p>
        </button>
        <button
          className="glass-card"
          onClick={handleDelete}
          style={{ padding: '12px 10px', textAlign: 'center', cursor: 'pointer', border: 'none' }}
        >
          <Trash2 size={20} color="#e04040" style={{ marginBottom: 4 }} />
          <p style={{ fontSize: 10, fontWeight: 700, color: '#1a2e0a' }}>Remove</p>
        </button>
      </div>

      {/* Care info */}
      <div className="glass-card" style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6a8a5a', letterSpacing: '.06em', marginBottom: 10 }}>
          CARE INFO
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <p style={{ fontSize: 9, color: '#6a8a5a', marginBottom: 2 }}>💧 Watering</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#1a2e0a' }}>{plant.watering_frequency || 'Check soil weekly'}</p>
          </div>
          <div>
            <p style={{ fontSize: 9, color: '#6a8a5a', marginBottom: 2 }}>☀️ Light</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#1a2e0a' }}>{plant.light_requirement || 'Bright indirect'}</p>
          </div>
          {plant.added_at && (
            <div>
              <p style={{ fontSize: 9, color: '#6a8a5a', marginBottom: 2 }}>📅 Added</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#1a2e0a' }}>
                {new Date(plant.added_at).toLocaleDateString()}
              </p>
            </div>
          )}
          {plant.location && (
            <div>
              <p style={{ fontSize: 9, color: '#6a8a5a', marginBottom: 2 }}>📍 Location</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#1a2e0a' }}>{plant.location}</p>
            </div>
          )}
        </div>
      </div>

{/* Diagnoses timeline */}
{diagnoses.length > 0 && (
  <div className="glass-card" style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#6a8a5a', letterSpacing: '.06em' }}>
        DIAGNOSES
      </p>
      <span style={{
        fontSize: 9, fontWeight: 700,
        padding: '3px 9px', borderRadius: 99,
        background: '#e0f5d0', color: '#2d5a1b'
      }}>
        {diagnoses.length} {diagnoses.length === 1 ? 'scan' : 'scans'}
      </span>
    </div>

    <div style={{ position: 'relative' }}>
      {/* Vertical line */}
      {diagnoses.length > 1 && (
        <div style={{
          position: 'absolute',
          left: 28, top: 30, bottom: 30,
          width: 2,
          background: 'linear-gradient(180deg, rgba(74,158,42,.3), rgba(45,90,27,.1))',
          zIndex: 0
        }} />
      )}

      {diagnoses.map((d, idx) => {
        const isExpanded = expandedDiagnosis === d.id
        const pct = d.health_score || 0
        const ringColor = pct >= 75 ? '#4a9e2a'
          : pct >= 50 ? '#f0a020' : '#e04040'
        const statusBg = d.status === 'healthy' ? '#e0f5d0'
          : d.status === 'needs_attention' ? '#fff3cc' : '#ffe0e0'
        const statusTextColor = d.status === 'healthy' ? '#2d5a1b'
          : d.status === 'needs_attention' ? '#9a6800' : '#a01010'

        const dash = (pct / 100) * 163.36   // circumference for r=26
        const isLast = idx === diagnoses.length - 1

        return (
          <div
            key={d.id}
            id={`diagnosis-${d.id}`}
            style={{
              position: 'relative',
              marginBottom: isLast ? 0 : 14,
              display: 'flex', gap: 12,
              alignItems: 'flex-start',
              zIndex: 1
            }}
          >
            {/* Photo with progress ring */}
            <div
              onClick={() => setExpandedDiagnosis(isExpanded ? null : d.id)}
              style={{
                width: 58, height: 58, flexShrink: 0,
                position: 'relative', cursor: 'pointer'
              }}
            >
              <svg viewBox="0 0 58 58" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <circle cx="29" cy="29" r="26" fill="white" stroke="rgba(45,90,27,.1)" strokeWidth="3" />
                <circle
                  cx="29" cy="29" r="26" fill="none"
                  stroke={ringColor} strokeWidth="3"
                  strokeDasharray={`${dash} 163.36`}
                  strokeDashoffset="40"
                  strokeLinecap="round"
                  transform="rotate(-90 29 29)"
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 4,
                borderRadius: '50%',
                background: '#f5fbf0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, overflow: 'hidden'
              }}>
                {d.photo_url ? (
                  <img
                    src={d.photo_url}
                    alt="diagnosis"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  '🌿'
                )}
              </div>
            </div>

            {/* Content */}
            <div
              onClick={() => setExpandedDiagnosis(isExpanded ? null : d.id)}
              style={{
                flex: 1,
                background: isExpanded ? 'rgba(245,251,240,.7)' : 'transparent',
                borderRadius: 12,
                padding: isExpanded ? 12 : '0',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  padding: '2px 9px', borderRadius: 99,
                  background: statusBg, color: statusTextColor,
                  textTransform: 'capitalize'
                }}>
                  {(d.status || 'unknown').replace('_', ' ')}
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: ringColor }}>
                  {pct}%
                </span>
              </div>

              <p style={{ fontSize: 10, color: '#6a8a5a', marginBottom: isExpanded ? 0 : 6 }}>
                {new Date(d.created_at).toLocaleString()}
              </p>

              {/* Health bar (only when collapsed) */}
              {!isExpanded && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: 'rgba(45,90,27,.1)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: ringColor, borderRadius: 99,
                      transition: 'width 0.4s'
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: '#6a8a5a' }}>
                    {d.issues_found?.length || 0} issues
                  </span>
                  <span style={{ fontSize: 10, color: '#8aaa7a' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              )}

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ marginTop: 12 }}>

                  {/* Big photo */}
                  {d.photo_url && (
                    <div style={{
                      width: '100%',
                      height: 160,
                      borderRadius: 12,
                      overflow: 'hidden',
                      marginBottom: 12,
                      position: 'relative'
                    }}>
                      <img
                        src={d.photo_url}
                        alt="diagnosis full"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(transparent 60%, rgba(26,46,10,.6))'
                      }} />
                      <span style={{
                        position: 'absolute', bottom: 10, right: 12,
                        fontSize: 18, fontWeight: 800, color: 'white'
                      }}>
                        {pct}%
                      </span>
                    </div>
                  )}

                  {/* Issues */}
                  {d.issues_found?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: '#6a8a5a', letterSpacing: '.06em', marginBottom: 8 }}>
                        ISSUES FOUND
                      </p>
                      {d.issues_found.map((issue, i) => (
                        <div key={i} style={{ marginBottom: 8, padding: '8px 10px', background: 'white', borderRadius: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                            <div style={{
                              width: 7, height: 7, borderRadius: '50%',
                              background: issue.severity === 'severe' ? '#e04040'
                                : issue.severity === 'moderate' ? '#f0a020' : '#4a9e2a',
                              flexShrink: 0
                            }} />
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#1a2e0a', flex: 1 }}>
                              {issue.issue}
                            </p>
                            <span style={{
                              fontSize: 8, fontWeight: 700, padding: '1px 7px',
                              borderRadius: 99, background: '#f5fbf0', color: '#6a8a5a'
                            }}>
                              {issue.severity}
                            </span>
                          </div>
                          <p style={{ fontSize: 10, color: '#6a8a5a', lineHeight: 1.5, paddingLeft: 14 }}>
                            {issue.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {d.recommendations?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: '#6a8a5a', letterSpacing: '.06em', marginBottom: 8 }}>
                        RECOMMENDATIONS
                      </p>
                      {d.recommendations.map((rec, i) => (
                        <div key={i} style={{ marginBottom: 8, padding: '8px 10px', background: 'white', borderRadius: 8 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#1a2e0a', marginBottom: 2 }}>
                            {rec.action}
                          </p>
                          <p style={{ fontSize: 10, color: '#6a8a5a', lineHeight: 1.5 }}>
                            {rec.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Care tips */}
                  {d.care_tips?.length > 0 && (
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, color: '#6a8a5a', letterSpacing: '.06em', marginBottom: 8 }}>
                        CARE TIPS
                      </p>
                      <div style={{ background: 'white', borderRadius: 8, padding: '8px 10px' }}>
                        {d.care_tips.map((tip, i) => (
                          <div key={i} style={{ display: 'flex', gap: 7, marginBottom: i < d.care_tips.length - 1 ? 6 : 0 }}>
                            <span style={{ color: '#4a9e2a', flexShrink: 0, fontWeight: 800 }}>✓</span>
                            <p style={{ fontSize: 11, color: '#1a2e0a', lineHeight: 1.4 }}>{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  </div>
)}

{/* Care history / timeline */}
<div className="glass-card">
  <p style={{ fontSize: 11, fontWeight: 700, color: '#6a8a5a', letterSpacing: '.06em', marginBottom: 12 }}>
    CARE HISTORY
  </p>

  {careLogs.length === 0 ? (
    <p style={{ fontSize: 11, color: '#6a8a5a', textAlign: 'center', padding: 16 }}>
      No care logs yet. Start by watering or diagnosing this plant.
    </p>
  ) : (
    <div>
      {careLogs.map((log, i) => {
        // Find the diagnosis matching this care_log (by timestamp proximity)
        const matchedDiagnosis = log.action === 'diagnosed'
          ? diagnoses.find(d => {
              const logTime = new Date(log.created_at).getTime()
              const dTime = new Date(d.created_at).getTime()
              return Math.abs(logTime - dTime) < 60000   // within 1 minute
            })
          : null

        return (
          <div
            key={log.id}
            onClick={() => {
              if (matchedDiagnosis) {
                setExpandedDiagnosis(matchedDiagnosis.id)
                // Scroll into view
                document.getElementById(`diagnosis-${matchedDiagnosis.id}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }}
            style={{
              display: 'flex', gap: 10, marginBottom: 12,
              cursor: matchedDiagnosis ? 'pointer' : 'default',
              transition: 'opacity 0.15s'
            }}
            onMouseEnter={(e) => {
              if (matchedDiagnosis) e.currentTarget.style.opacity = '0.7'
            }}
            onMouseLeave={(e) => {
              if (matchedDiagnosis) e.currentTarget.style.opacity = '1'
            }}
          >
            {/* Line column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: '#e0f5d0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13
              }}>
                {iconForAction(log.action)}
              </div>
              {i < careLogs.length - 1 && (
                <div style={{ width: 1, flex: 1, background: 'rgba(45,90,27,.15)', marginTop: 3 }} />
              )}
            </div>

            {/* Card */}
            <div style={{ flex: 1, paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#1a2e0a', textTransform: 'capitalize' }}>
                  {log.action}
                </p>
                {matchedDiagnosis && (
                  <span style={{
                    fontSize: 8, fontWeight: 700,
                    padding: '1px 7px', borderRadius: 99,
                    background: '#e0f5d0', color: '#2d5a1b'
                  }}>
                    View details →
                  </span>
                )}
              </div>
              {log.notes && (
                <p style={{ fontSize: 10, color: '#6a8a5a', marginTop: 1 }}>
                  {log.notes}
                </p>
              )}
              <p style={{ fontSize: 9, color: '#8aaa7a', marginTop: 3 }}>
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )}
</div>

      <EditPlantModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        plant={plant}
        onUpdated={(updated) => setPlant(updated)}
      />

    </div>
  )
}