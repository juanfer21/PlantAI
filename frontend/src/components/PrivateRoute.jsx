import { Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer"

export default function PrivateRoute({ children }) {
  const { store } = useGlobalReducer()

  if (store.loading) return <div className="loading-screen">Loading...</div>

  return store.token ? children : <Navigate to="/login" replace />
}