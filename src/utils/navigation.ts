// src/utils/navigation.ts

/**
 * Devuelve la ruta por defecto para un rol de usuario específico.
 * @param role El rol del usuario ('dt', 'admin', 'jugador').
 * @returns La ruta a la que el usuario debe ser redirigido.
 */
export function getDefaultRouteForRole(role?: string): string {
  if (!role) return '/'

  switch (role) {
    case 'dt':
      return '/dt'
    case 'admin':
      return '/admin'
    case 'jugador':
      return '/jugador'
    default:
      return '/'
  }
}
