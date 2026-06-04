import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import MyGarden from './pages/MyGarden'
import PlantDetail from './pages/PlantDetail'
import DoctorMode from './pages/DoctorMode'
import Community from './pages/Community'
import Profile from './pages/Profile'

function ProtectedRoute({ children }) {
  const { store } = useAuth()
  if (store.loading) return <div className="loading-screen">Loading...</div>
  return store.token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { store } = useAuth()
  if (store.loading) return null
  return store.token ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="garden" element={<MyGarden />} />
            <Route path="plant/:id" element={<PlantDetail />} />
            <Route path="doctor" element={<DoctorMode />} />
            <Route path="community" element={<Community />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:username" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}