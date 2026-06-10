import { useState, useEffect } from 'react'
import { X, Leaf } from 'lucide-react'
import toast from 'react-hot-toast'
import useGlobalReducer from '../hooks/useGlobalReducer'
import api from '../services/api'

export default function AddPlantModal({ isOpen, onClose, onCreated, prefillFromScan }) {
  const { dispatch } = useGlobalReducer()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    species: '',
    location: '',
    watering_frequency: '',
    light_requirement: '',
  })

  // Pre-fill form when a scan is passed as prop
useEffect(() => {
  if (prefillFromScan && isOpen) {
    setForm({
      name: prefillFromScan.common_name || '',
      nickname: '',
      species: prefillFromScan.scientific_name || '',
      location: '',
      watering_frequency: prefillFromScan.watering_frequency || '',
      light_requirement: prefillFromScan.light_requirement || '',
    })
  }
}, [prefillFromScan, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) {
      toast.error('Please give your plant a name')
      return
    }
    setLoading(true)
    try {
    const res = await api.post('/plants', form)
    dispatch({ type: 'add_plant', payload: res.data.plant })
    if (onCreated) {
      onCreated(res.data.plant)
    } else {
      toast.success(`${form.nickname || form.name} added to your garden! 🌿`)
      onClose()
    }
      setForm({ name: '', nickname: '', species: '', location: '', watering_frequency: '', light_requirement: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not add plant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(13, 26, 13, 0.6)', backdropFilter: 'blur(8px)',
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
          padding: '20px 22px',
          borderRadius: '20px 20px 0 0',
          position: 'relative'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40,
              background: 'rgba(125,207,74,.2)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Leaf size={20} color="#7dcf4a" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>
                {prefillFromScan ? 'Save scanned plant 🌿' : 'Add new plant 🌱'}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>
                {prefillFromScan
                  ? `Identified as ${prefillFromScan.common_name || 'a plant'} — review and save`
                  : "Track your plant's health journey"}
              </p>
              {prefillFromScan && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'rgba(125,207,74,.15)', color: '#7dcf4a',
                  fontSize: 9, fontWeight: 700,
                  padding: '3px 9px', borderRadius: 99,
                  marginTop: 5
                }}>
                  ✨ AI-identified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px' }}>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6a8a5a', marginBottom: 5, display: 'block' }}>
              Plant name *
            </label>
            <input
              className="input-field"
              name="name"
              placeholder="e.g. Monstera"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6a8a5a', marginBottom: 5, display: 'block' }}>
              Nickname (optional)
            </label>
            <input
              className="input-field"
              name="nickname"
              placeholder="e.g. Monstie 🌿"
              value={form.nickname}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6a8a5a', marginBottom: 5, display: 'block' }}>
              Species
            </label>
            <input
              className="input-field"
              name="species"
              placeholder="e.g. Monstera deliciosa"
              value={form.species}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6a8a5a', marginBottom: 5, display: 'block' }}>
              Location in your home
            </label>
            <input
              className="input-field"
              name="location"
              placeholder="e.g. Living room, kitchen window"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6a8a5a', marginBottom: 5, display: 'block' }}>
                Watering
              </label>
              <select
                className="input-field"
                name="watering_frequency"
                value={form.watering_frequency}
                onChange={handleChange}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Select...</option>
                <option value="Every 2-3 days">Every 2-3 days</option>
                <option value="Once a week">Once a week</option>
                <option value="Every 2 weeks">Every 2 weeks</option>
                <option value="Once a month">Once a month</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6a8a5a', marginBottom: 5, display: 'block' }}>
                Light
              </label>
              <select
                className="input-field"
                name="light_requirement"
                value={form.light_requirement}
                onChange={handleChange}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Select...</option>
                <option value="Direct sunlight">Direct sunlight</option>
                <option value="Bright indirect">Bright indirect</option>
                <option value="Low light">Low light</option>
                <option value="Shade">Shade</option>
              </select>
            </div>
          </div>

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
              {loading ? 'Adding...' : 'Add to garden 🌿'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}