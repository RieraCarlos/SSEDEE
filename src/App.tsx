import { Routes, Route } from 'react-router-dom'
import Home from './pages/Public/Home'
import Login from './pages/Public/Login'
import Jugador from './pages/Jugadores/Jugador'
import DT from './pages/Dt/DT'
import Eventos from './pages/Public/Eventos'
//import Admin from './pages/Admin/Admin'
//import { AuthProvider } from './hooks/useAuth'
import { ScheduleProvider } from './components/Copa/ScheduleContext'
import FormularioUsuario from './hooks/PruebaEnvioResult'
//import { LiveMatchProvider } from './hooks/LiveMatchContext';
import ProtectedRoute from './components/shared/ProtectedRoute'
import { initAuth } from './store/thunks/authThunks'
import { useEffect } from 'react'
import { useAppDispatch } from './hooks/useAppDispatch'
import { Toaster } from 'sonner';
import C_solicitudesClub from './components/Clubs/C_solicitudesClub'
import Admin from './pages/Admin/Admin'
import LiveMatch from './pages/Live/LiveMatch'
import MasterEventPortal from './pages/Public/MasterEventPortal'

import MainLayout from './components/shared/MainLayout'


function App() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    // Inicializar sesión sin pasar navigate (ya no redirige automáticamente)
    dispatch(initAuth() as any)
  }, [dispatch])

  return (
    <ScheduleProvider>
      <Toaster richColors />
      <Routes>
        {/* Rutas con Layout Principal (Nav y Footer persistentes) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/evento/:slug" element={<Eventos />} />
          
          <Route path="/jugador" element={
            <ProtectedRoute role="jugador"><Jugador /></ProtectedRoute>
          } />
          <Route path="/dt" element={
            <ProtectedRoute role="dt"><DT /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><Admin /></ProtectedRoute>
          } />
          <Route path='/nomina' element={
            <ProtectedRoute role='dt'>
              <C_solicitudesClub />
            </ProtectedRoute>
          } />
        </Route>

        {/* Rutas sin Layout Principal o con Layouts Propios */}
        <Route path="/login" element={<Login />} />
        <Route path='/form' element={<FormularioUsuario />} />
        <Route path="/live/match/:matchId" element={<LiveMatch />} />
        <Route path="/portal/:tournamentId" element={<MasterEventPortal />} />
      </Routes>
    </ScheduleProvider>

  )
}

export default App
