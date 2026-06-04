import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom"
import Layout from "./components/layout/Layout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import MyGarden from "./pages/MyGarden"
import PlantDetail from "./pages/PlantDetail"
import DoctorMode from "./pages/DoctorMode"
import Community from "./pages/Community"
import Profile from "./pages/Profile"
import PrivateRoute from "./components/PrivateRoute"

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
        errorElement={<h1>Not found!</h1>}
      >
        <Route index element={<Home />} />
        <Route path="/garden" element={<MyGarden />} />
        <Route path="/plant/:id" element={<PlantDetail />} />
        <Route path="/doctor" element={<DoctorMode />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:username" element={<Profile />} />
      </Route>
    </>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }
  }
)