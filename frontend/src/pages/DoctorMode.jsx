import { useState, useRef, useEffect } from 'react'
import { Camera, Image as ImageIcon, X, FileText, History, Check, Sparkles, Leaf, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useGlobalReducer from '../hooks/useGlobalReducer'
import api from '../services/api'
import { compressImage, stripBase64Prefix } from '../utils/imageHelper'
import AddPlantModal from '../components/AddPlantModal'

export default function DoctorMode() {
  const { store, dispatch } = useGlobalReducer()
  const fileInputRef = useRef(null)

  const navigate = useNavigate()
  const [savedDiagnosis, setSavedDiagnosis] = useState(null)
  const [showLinkSelector, setShowLinkSelector] = useState(false)
  const [linkPlantId, setLinkPlantId] = useState('')
  const [showAddPlantModal, setShowAddPlantModal] = useState(false)

  // States: 'idle' | 'analyzing' | 'result'
  const [state, setState] = useState('idle')
  const [imageData, setImageData] = useState(null)   // base64 for the API
  const [imagePreview, setImagePreview] = useState(null) // for showing
  const [result, setResult] = useState(null)
  const [remaining, setRemaining] = useState(null)
  const [selectedPlantId, setSelectedPlantId] = useState('')

  useEffect(() => {
  // Load remaining scans on mount
  if (!store.isPro) {
    api.get('/doctor/remaining').then(res => {
      setRemaining(res.data.remaining)
    }).catch(() => {})
  }
}, [])

  // When user picks a file
const handleFile = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    // Compress and resize before sending
    const compressed = await compressImage(file, 1200, 0.8)
    const base64 = stripBase64Prefix(compressed)
    
    setImageData(base64)
    setImagePreview(compressed)
    analyze(base64, compressed)
  } catch (err) {
    toast.error('Could not process image')
  }
}

  // Call the backend
  const analyze = async (base64, photoDataUrl) => {
    setState('analyzing')
    try {
      const res = await api.post('/doctor/analyze', {
        image_base64: base64,
        plant_name: 'plant',
        location: store.user?.location || null,
        plant_id: selectedPlantId || null,
        photo_url: photoDataUrl,
      })
      setResult(res.data.result)
      setSavedDiagnosis(res.data.diagnosis || null)
      setRemaining(res.data.remaining_uses)
      setState('result')
      toast.success('Diagnosis complete! 🌿')
        } catch (err) {
      if (err.response?.status === 429) {
        toast.error(err.response.data.message)
        setState('idle')
      } else if (err.response?.status === 503) {
        toast.error('AI service temporarily unavailable. Please try again later.')
        setState('idle')
      } else if (err.response?.status === 402) {
        toast.error('AI credits exhausted. Contact support.')
        setState('idle')
      } else {
        toast.error(err.response?.data?.error || 'Something went wrong analyzing the photo')
        setState('idle')
      }
  }
  }

  const reset = () => {
    setState('idle')
    setImageData(null)
    setImagePreview(null)
    setResult(null)
  }


  // Link the diagnosis to an existing plant
const handleLinkToExisting = async () => {
  if (!linkPlantId) {
    toast.error('Please select a plant')
    return
  }
  try {
    await api.post(`/doctor/diagnoses/${savedDiagnosis.id}/assign`, {
      plant_id: linkPlantId
    })
    toast.success('Diagnosis added to your plant! 🌿')
    navigate(`/plant/${linkPlantId}`)
  } catch (err) {
    toast.error('Could not assign diagnosis to plant')
  }
}

// Discard the unassigned diagnosis
const handleDiscard = async () => {
  if (!confirm('Are you sure you want to discard this scan?')) return
  try {
    await api.delete(`/doctor/diagnoses/${savedDiagnosis.id}`)
    toast.success('Scan discarded')
    reset()
  } catch (err) {
    toast.error('Could not discard scan')
  }
}

// When user clicks "Save as new plant", open the modal pre-filled
const handleSaveAsNew = () => {
  setShowAddPlantModal(true)
}

// After the new plant is created, assign the diagnosis to it
const handlePlantCreated = async (newPlant) => {
  setShowAddPlantModal(false)
  try {
    await api.post(`/doctor/diagnoses/$${savedDiagnosis.id}/assign`, {
      plant_id: newPlant.id
    })
    toast.success(`${newPlant.nickname || newPlant.name} added with diagnosis! 🌿`)
    navigate(`/plant/${newPlant.id}`)
  } catch (err) {
    toast.error('Could not link diagnosis to new plant')
  }
}


  const statusColor = (status) => {
    if (status === 'healthy') return '#4a9e2a'
    if (status === 'needs_attention') return '#f0a020'
    return '#e04040'
  }
  const statusLabel = (status) => {
    if (status === 'healthy') return '✓ Healthy'
    if (status === 'needs_attention') return '⚠ Needs Attention'
    return '⚠ Sick'
  }

return (
  <div style={{ maxWidth: 600, margin: '0 auto' }}>

    {/* Hidden file input */}
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handleFile}
      style={{ display: 'none' }}
    />

    {/* ── STATE: IDLE ── */}
    {state === 'idle' && (
      <>
        <div style={{
          background: 'linear-gradient(135deg, #1a2e0a, #2d5a1b)',
          borderRadius: 18, padding: 24, textAlign: 'center',
          position: 'relative', overflow: 'hidden', marginBottom: 12
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'rgba(255,255,255,.05)', borderRadius: '50%' }} />
          <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Camera size={26} color="white" />
          </div>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 4 }}>Scan Your Plant</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginBottom: 16 }}>
            AI identifies 500+ species and detects health problems instantly
          </p>

          {/* Plant selector — only if user has plants */}
          {store.plants && store.plants.length > 0 && (
            <div style={{ marginBottom: 12, padding: '0 4px' }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.55)', letterSpacing: '.06em', marginBottom: 6, textAlign: 'left' }}>
                LINK TO A PLANT (OPTIONAL)
              </p>
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,.1)',
                  border: '1px solid rgba(255,255,255,.15)',
                  borderRadius: 99,
                  padding: '7px 14px',
                  fontSize: 11,
                  color: 'white',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              >
                <option value="" style={{ color: '#1a2e0a' }}>
                  Quick scan (don't save to a plant)
                </option>
                {store.plants.map(plant => (
                  <option key={plant.id} value={plant.id} style={{ color: '#1a2e0a' }}>
                    🌿 {plant.nickname || plant.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn-pill" onClick={() => fileInputRef.current?.click()}>
              <Camera size={12} /> Camera
            </button>
            <button
              className="btn-pill"
              style={{ background: 'rgba(255,255,255,.15)', color: 'white' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon size={12} /> Gallery
            </button>
          </div>
        </div>

        {/* Uses left */}
        {!store.isPro && remaining !== null && (
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e0a' }}>Free scans today</p>
            <span className={remaining === 0 ? 'badge-attention' : 'badge-healthy'}>
              {remaining} / 2 left
            </span>
          </div>
        )}
      </>
    )}

    {/* ── STATE: ANALYZING ── */}
    {state === 'analyzing' && (
      <div style={{
        background: '#0d1a0d', borderRadius: 18, overflow: 'hidden',
        minHeight: 360, display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>Analyzing...</p>
          <span className="badge-ai" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#7dcf4a', display: 'inline-block' }} />
            AI scanning
          </span>
        </div>

        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, overflow: 'hidden' }}>
          {imagePreview && (
            <img src={imagePreview} alt="scanning" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
          )}
          <div className="animate-pulse" style={{ position: 'absolute', width: 110, height: 110, border: '1.5px solid rgba(125,207,74,.5)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', width: '100%', height: 2, background: 'linear-gradient(90deg, transparent, rgba(125,207,74,.7), transparent)', animation: 'scanline 1.5s linear infinite' }} />
          {!imagePreview && <div style={{ fontSize: 70 }}>🌿</div>}
        </div>

        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>
            <span>Identifying species...</span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,.1)', borderRadius: 99, overflow: 'hidden' }}>
            <div className="animate-pulse" style={{ height: '100%', width: '65%', background: 'linear-gradient(90deg, #4a9e2a, #7dcf4a)', borderRadius: 99 }} />
          </div>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 6, textAlign: 'center' }}>
            Checking 500+ species database
          </p>
        </div>
      </div>
    )}

    {/* ── STATE: RESULT ── */}
    {state === 'result' && result && (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#1a2e0a' }}>Diagnosis Ready</p>
          <button className="btn-pill" style={{ background: '#1a2e0a', color: 'white', fontSize: 10 }} onClick={reset}>
            <Camera size={11} /> New scan
          </button>
        </div>

        <div style={{ height: 140, borderRadius: 14, overflow: 'hidden', position: 'relative', marginBottom: 12 }}>
          {imagePreview
            ? <img src={imagePreview} alt="result" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#b8d4a8,#8ab888)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>🌿</div>}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 40%, rgba(26,46,10,.7))' }} />
          <span style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 11, fontWeight: 700, background: 'rgba(200,230,160,.9)', color: '#1a2e0a', padding: '3px 10px', borderRadius: 99 }}>
            {statusLabel(result.status)}
          </span>
          <span style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 18, fontWeight: 800, color: 'white' }}>
            {result.health_score}%
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <div className="glass-card" style={{ flex: 1, textAlign: 'center', padding: '8px' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: statusColor(result.status) }}>{result.health_score}%</div>
            <div style={{ fontSize: 8, color: '#6a8a5a' }}>Health</div>
          </div>
          <div className="glass-card" style={{ flex: 1, textAlign: 'center', padding: '8px' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1a2e0a' }}>{result.issues_found?.length || 0}</div>
            <div style={{ fontSize: 8, color: '#6a8a5a' }}>Issues</div>
          </div>
          <div className="glass-card" style={{ flex: 1, textAlign: 'center', padding: '8px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#1a2e0a' }}>💧</div>
            <div style={{ fontSize: 8, color: '#6a8a5a' }}>{result.watering_frequency || 'Check soil'}</div>
          </div>
        </div>

        {result.issues_found?.length > 0 && (
          <div className="glass-card" style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#6a8a5a', letterSpacing: '.06em', marginBottom: 8 }}>ISSUES FOUND</p>
            {result.issues_found.map((issue, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: issue.severity === 'severe' ? '#e04040' : issue.severity === 'moderate' ? '#f0a020' : '#4a9e2a', flexShrink: 0 }} />
                <p style={{ fontSize: 11, color: '#1a2e0a', fontWeight: 600, flex: 1 }}>{issue.issue}</p>
                <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: '#f5fbf0', color: '#6a8a5a' }}>{issue.severity}</span>
              </div>
            ))}
          </div>
        )}

        {result.recommendations?.length > 0 && (
          <div className="glass-card" style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#6a8a5a', letterSpacing: '.06em', marginBottom: 8 }}>RECOMMENDATIONS</p>
            {result.recommendations.map((rec, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#1a2e0a' }}>{rec.action}</p>
                <p style={{ fontSize: 10, color: '#6a8a5a', marginTop: 1 }}>{rec.detail}</p>
              </div>
            ))}
          </div>
        )}

        {result.care_tips?.length > 0 && (
          <div className="glass-card">
            <p style={{ fontSize: 9, fontWeight: 700, color: '#6a8a5a', letterSpacing: '.06em', marginBottom: 8 }}>CARE TIPS</p>
            {result.care_tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 5 }}>
                <Check size={13} color="#4a9e2a" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 11, color: '#1a2e0a' }}>{tip}</p>
              </div>
            ))}
          </div>
        )}
        {/* Save scan options — only if it's a quick scan (no plant_id was linked initially) */}
{!selectedPlantId && savedDiagnosis?.id && (
  <div className="glass-card" style={{ marginTop: 10, background: 'linear-gradient(135deg, #1a2e0a, #2d5a1b)', border: 'none' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <Sparkles size={18} color="#7dcf4a" />
      <div>
        <p style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>Save this scan</p>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,.6)' }}>
          Keep track of this plant's health over time
        </p>
      </div>
    </div>

    {/* If not yet showing the selector */}
    {!showLinkSelector && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={handleSaveAsNew}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'white', border: 'none', borderRadius: 99,
            padding: '9px 14px', fontSize: 11, fontWeight: 700,
            color: '#1a2e0a', cursor: 'pointer', width: '100%'
          }}
        >
          <Leaf size={13} />
          Save as new plant
        </button>
        {store.plants && store.plants.length > 0 && (
          <button
            onClick={() => setShowLinkSelector(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)',
              borderRadius: 99, padding: '9px 14px', fontSize: 11, fontWeight: 700,
              color: 'white', cursor: 'pointer', width: '100%'
            }}
          >
            🪴 Add to existing plant
          </button>
        )}
        <button
          onClick={handleDiscard}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
            background: 'transparent', border: 'none',
            borderRadius: 99, padding: '7px 14px', fontSize: 10, fontWeight: 600,
            color: 'rgba(255,255,255,.5)', cursor: 'pointer', width: '100%'
          }}
        >
          <Trash2 size={11} />
          Discard scan
        </button>
      </div>
    )}

    {/* Selector for existing plant */}
    {showLinkSelector && (
      <div>
        <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: '.06em', marginBottom: 6 }}>
          SELECT A PLANT
        </p>
        <select
          value={linkPlantId}
          onChange={(e) => setLinkPlantId(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,.1)',
            border: '1px solid rgba(255,255,255,.15)',
            borderRadius: 99,
            padding: '8px 14px',
            fontSize: 11, color: 'white', cursor: 'pointer',
            fontFamily: 'inherit', outline: 'none', marginBottom: 8
          }}
        >
          <option value="" style={{ color: '#1a2e0a' }}>Choose a plant...</option>
          {store.plants.map(plant => (
            <option key={plant.id} value={plant.id} style={{ color: '#1a2e0a' }}>
              🌿 {plant.nickname || plant.name}
            </option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setShowLinkSelector(false)}
            style={{
              flex: 1, background: 'rgba(255,255,255,.1)', border: 'none',
              borderRadius: 99, padding: '8px 14px', fontSize: 10, fontWeight: 700,
              color: 'white', cursor: 'pointer'
            }}
          >
            Back
          </button>
          <button
            onClick={handleLinkToExisting}
            style={{
              flex: 2, background: 'white', border: 'none',
              borderRadius: 99, padding: '8px 14px', fontSize: 10, fontWeight: 700,
              color: '#1a2e0a', cursor: 'pointer'
            }}
          >
            Add to plant
          </button>
        </div>
      </div>
    )}
  </div>
)}
      </div>
    )}
        <AddPlantModal
        isOpen={showAddPlantModal}
        onClose={() => setShowAddPlantModal(false)}
        onCreated={handlePlantCreated}
        prefillFromScan={savedDiagnosis}
      />

  </div>
)
}
