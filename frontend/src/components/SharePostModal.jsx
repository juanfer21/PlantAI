import { useState, useRef } from 'react'
import { X, Camera, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import useGlobalReducer from '../hooks/useGlobalReducer'
import api from '../services/api'

export default function SharePostModal({ isOpen, onClose }) {
  const { store, dispatch } = useGlobalReducer()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [form, setForm] = useState({
    caption: '',
    plant_id: '',
  })

  if (!isOpen) return null

const handleFile = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    // Compress before showing preview
    const compressed = await compressImage(file, 1200, 0.8)
    setPhotoPreview(compressed)
  } catch (err) {
    toast.error('Could not process image')
  }
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.caption.trim()) {
      toast.error('Add a caption to share')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/community/post', {
        caption: form.caption,
        plant_id: form.plant_id || null,
        photo_url: photoPreview,
      })
      dispatch({ type: 'add_community_post', payload: res.data.post })
      toast.success('Post shared with the community! 🌿')
      onClose()
      setForm({ caption: '', plant_id: '' })
      setPhotoPreview(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not share post')
    } finally {
      setLoading(false)
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
          width: '100%', maxWidth: 460,
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
          <p style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 2 }}>
            Share with community 🌍
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>
            Inspire other plant lovers
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px' }}>

          {/* Photo upload */}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

          {!photoPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '1.5px dashed rgba(45,90,27,.25)',
                borderRadius: 14, padding: 24,
                textAlign: 'center', cursor: 'pointer',
                marginBottom: 14, background: '#f5fbf0'
              }}
            >
              <Camera size={28} color="#4a9e2a" style={{ marginBottom: 6 }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e0a' }}>Add a photo</p>
              <p style={{ fontSize: 10, color: '#6a8a5a', marginTop: 2 }}>
                Show off your plant
              </p>
            </div>
          ) : (
            <div style={{ position: 'relative', marginBottom: 14, borderRadius: 14, overflow: 'hidden' }}>
              <img src={photoPreview} alt="preview" style={{ width: '100%', maxHeight: 240, objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(0,0,0,.6)', border: 'none',
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={14} color="white" />
              </button>
            </div>
          )}

          {/* Caption */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6a8a5a', marginBottom: 5, display: 'block' }}>
              Caption *
            </label>
            <textarea
              className="input-field"
              placeholder="What's growing? Share your story..."
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              rows={3}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Plant selector */}
          {store.plants && store.plants.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6a8a5a', marginBottom: 5, display: 'block' }}>
                Tag a plant (optional)
              </label>
              <select
                className="input-field"
                value={form.plant_id}
                onChange={(e) => setForm({ ...form, plant_id: e.target.value })}
                style={{ cursor: 'pointer' }}
              >
                <option value="">No plant</option>
                {store.plants.map(plant => (
                  <option key={plant.id} value={plant.id}>
                    🌿 {plant.nickname || plant.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ flex: 2, justifyContent: 'center', opacity: loading ? .7 : 1 }}
            >
              {loading ? 'Sharing...' : 'Share post 🌿'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}