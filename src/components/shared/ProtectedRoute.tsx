import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAppSelector } from '../../hooks/useAppSelector'
import { getDefaultRouteForRole } from '../../utils/navigation'
import LoadingSpinner from '../LoadingSpinner'

type Props = {
  children: ReactNode
  role?: string | string[] // allowed role or list of allowed roles
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user, loading } = useAppSelector(state => state.auth)
  const location = useLocation()

  // 1. Muestra un spinner de carga profesional mientras se verifica la sesión.
  if (loading) {
    return <LoadingSpinner />
  }

  // 2. Si la carga terminó y no hay usuario, redirige a login
  //    pasando la ubicación original para poder volver después.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 3. Si hay un rol requerido y el usuario no lo cumple, redirige
  //    a la página por defecto de su rol (lógica externalizada).
  if (role) {
    const allowed = Array.isArray(role) ? role : [role]
    // Se añade una comprobación de seguridad para user.role
    if (!user.role || !allowed.includes(user.role)) {
      const target = getDefaultRouteForRole(user.role)
      return <Navigate to={target} replace />
    }
  }

  // Si todo está en orden, muestra el componente protegido.
  return <>{children}</>
}
