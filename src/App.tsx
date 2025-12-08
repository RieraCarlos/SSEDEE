import { Routes, Route } from 'react-router-dom'
import Home from './pages/Public/Home'
import Login from './pages/Public/Login'
import Jugador from './pages/Jugadores/Jugador'
import DT from './pages/Dt/DT'
import Admin from './pages/Admin/Admin'
import { AuthProvider } from './hooks/useAuth'
import { ScheduleProvider } from './components/Copa/ScheduleContext'
import FormularioUsuario from './hooks/PruebaEnvioResult'
import { LiveMatchProvider } from './hooks/LiveMatchContext';
import RegisterForm from './components/auth/register-form'
import ProtectedRoute from './components/shared/ProtectedRoute'
import { initAuth } from './store/thunks/authThunks'
import { useEffect } from 'react'
import { useAppDispatch } from './hooks/useAppDispatch'
import { Toaster } from 'sonner';
import C_solicitudesClub from './components/Clubs/C_solicitudesClub'

function App() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    // Inicializar sesión sin pasar navigate (ya no redirige automáticamente)
    dispatch(initAuth() as any)
  }, [dispatch])
  return (
    <ScheduleProvider>
      <AuthProvider>
        <LiveMatchProvider>
          <Toaster richColors />
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/jugador" element={
              <ProtectedRoute role="jugador"><Jugador /></ProtectedRoute> 
            }/>
            <Route path="/dt" element={
              <ProtectedRoute role="dt"><DT /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute role="admin"><Admin /></ProtectedRoute>
            } />
            <Route path='/nomina' element={
              <ProtectedRoute role='dt'>
                <C_solicitudesClub/>
              </ProtectedRoute>
            }/>
            <Route path='/form' element={<FormularioUsuario/>}/>
            <Route path='/registrar' element={<RegisterForm/>}/>
          </Routes>
        </LiveMatchProvider>
      </AuthProvider>
    </ScheduleProvider>
  )
}

export default App
