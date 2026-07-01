import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from "../components/Navbar"
import Hero from "../landing/Hero"
import Features from "../landing/Features"
import Footer from "../layout/Footer"

function Landing() {
  const { usuario, cargando } = useAuth()

  if (cargando) return <div className="text-center mt-5">Cargando...</div>
  if (usuario) return <Navigate to="/dashboard" replace />

  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </>
  )
}

export default Landing