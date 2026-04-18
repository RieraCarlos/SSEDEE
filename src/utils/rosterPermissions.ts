/**
 * Utilidad de validación de permisos para operaciones de nómina
 * Centraliza la lógica de autorización siguiendo el principio DRY
 */

export type UserRole = 'admin' | 'dt' | 'jugador' | 'guest' | string | null | undefined;

/**
 * Valida si el usuario puede editar la nómina de un club
 * Solo admins y directores técnicos (dt) pueden hacerlo
 */
export const canEditClubRoster = (userRole: UserRole): boolean => {
  return userRole === 'admin' || userRole === 'dt';
};

/**
 * Valida si el usuario puede ver los jugadores de un club
 * Admins y dts pueden ver; los jugadores solo su propio club
 */
export const canViewClubPlayers = (userRole: UserRole): boolean => {
  return userRole === 'admin' || userRole === 'dt' || userRole === 'jugador';
};

/**
 * Valida si el usuario puede eliminar un jugador de la nómina
 */
export const canDeletePlayer = (
  userRole: UserRole,
  isOwnerOfClub: boolean
): boolean => {
  if (userRole === 'admin') return true;
  if (userRole === 'dt' && isOwnerOfClub) return true;
  return false;
};

/**
 * Obtiene el nivel de permisos del usuario para operaciones de nómina
 */
export const getRosterPermissionLevel = (userRole: UserRole) => {
  if (userRole === 'admin') {
    return 'full'; // Control total
  }
  if (userRole === 'dt') {
    return 'limited'; // Solo su club
  }
  return 'none'; // Sin permisos
};
