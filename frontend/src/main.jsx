import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router-dom"
import { Toaster } from 'react-hot-toast'
import { router } from "./routes"
import { StoreProvider } from './hooks/useGlobalReducer'

const Main = () => {
  return (
    <React.StrictMode>
      <StoreProvider>
        <Toaster position="top-right" />
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </StoreProvider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />)