import { useState, useEffect } from 'react'
import { X, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import useGlobalReducer from '../hooks/useGlobalReducer'
import api from '../services/api'

export default function EditPlantModal({ isOpen, onClose, plant, onUpdated }) {
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

  // Llenar el form cuando se abre el modal con los datos actuales de la planta
  useEffect(() => {
    if (plant) {
      setForm({
        name: plant.name || '',
        nickname: plant.nickname || '',
        species: plant.species || '',
        location: plant.location || '',
        watering_frequency: plant.watering_frequency || '',
        light_requirement: plant.light_requirement || '',
      })
    }
  }, [plant])

  if (!isOpen || !plant) return null

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) {
      toast.error('Plant name is required')
      return
    }
    setLoading(true)
    try {
      const res = await api.put(`/plants/${plant.id}`, form)
      dispatch({ type: 'update_plant', payload: res.data.plant })
      toast.success('Plant updated! 🌿')
      if (onUpdated) onUpdated(res.data.plant)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update plant')
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40,
              background: 'rgba(125,207,74,.2)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Edit2 size={18} color="#7dcf4a" />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Edit plant</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>
                Update {plant.nickname || plant.name}'s info
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px' }}>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Plant name *</label>
            <input
              className="input-field"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Nickname</label>
            <input
              className="input-field"
              name="nickname"
              placeholder="e.g. Monstie 🌿"
              value={form.nickname}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Species</label>
            <input
              className="input-field"
              name="species"
              placeholder="e.g. Monstera deliciosa"
              value={form.species}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Location at home</label>
            <input
              className="input-field"
              name="location"
              placeholder="e.g. Living room"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Watering</label>
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
              <label style={labelStyle}>Light</label>
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
              {loading ? 'Saving...' : 'Save changes 🌿'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

const labelStyle = {
  fontSize: 11, fontWeight: 700, color: '#6a8a5a',
  marginBottom: 5, display: 'block'
}