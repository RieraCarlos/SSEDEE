import React, { useState, useCallback } from 'react';
import { MoreVertical, Users } from 'lucide-react';
import { UpdateNominaModal } from './UpdateNominaModal';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectAuthUser } from '@/store/slices/authSlice';
import { canEditClubRoster } from '@/utils/rosterPermissions';

interface Club {
  id: string;
  name: string;
  logo?: string;
  n_equipos?: number;
}

interface ClubRosterTableRowProps {
  club: Club;
  tournamentId: string;
  onRosterUpdated: () => void;
}

/**
 * Fila de la tabla de clubes con acción de actualización de nómina
 * Optimizada con React.memo para evitar re-renders innecesarios
 */
const ClubRosterTableRow = React.memo<ClubRosterTableRowProps>(
  ({ club, tournamentId, onRosterUpdated }) => {
    const user = useAppSelector(selectAuthUser);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Validación de permisos
    const canEditRoster = canEditClubRoster(user?.role);

    const handleOpenModal = useCallback(() => {
      setIsModalOpen(true);
      setShowMenu(false);
    }, []);

    const handleSuccess = useCallback(() => {
      setIsModalOpen(false);
      onRosterUpdated();
    }, [onRosterUpdated]);

    return (
      <>
        <tr className="border-b border-[#1d2029] hover:bg-[#1d2029]/50 transition-colors">
          {/* Logo y nombre */}
          <td className="px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              {club.logo && (
                <img
                  src={club.logo}
                  alt={club.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-white text-sm sm:text-base">
                  {club.name}
                </p>
              </div>
            </div>
          </td>

          {/* Número de equipos (hidden on mobile) */}
          <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-gray-400">
            {club.n_equipos || 0}
          </td>

          {/* Acciones */}
          <td className="px-4 sm:px-6 py-4 text-right">
            {canEditRoster ? (
              <div className="relative inline-block">
                {/* Desktop: Botón directo */}
                <button
                  onClick={handleOpenModal}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#0ae98a]/10 hover:bg-[#0ae98a]/20 text-[#0ae98a] rounded-lg transition-colors text-sm font-medium border border-[#0ae98a]/20"
                >
                  <Users size={16} />
                  Nómina
                </button>

                {/* Mobile: Menú de tres puntos */}
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="sm:hidden p-2 hover:bg-[#1d2029] rounded-lg transition-colors text-gray-400 hover:text-[#0ae98a]"
                >
                  <MoreVertical size={18} />
                </button>

                {/* Dropdown menu (mobile) */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-[#1d2029] border border-[#0ae98a]/20 rounded-lg shadow-lg z-20">
                    <button
                      onClick={handleOpenModal}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#0ae98a]/10 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <Users size={16} />
                      Actualizar Nómina
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </td>
        </tr>

        {/* Modal de actualización */}
        <UpdateNominaModal
          isOpen={isModalOpen}
          clubId={club.id}
          clubName={club.name}
          tournamentId={tournamentId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      </>
    );
  },
  (prevProps, nextProps) => {
    // Comparación personalizada para optimizar renders
    return (
      prevProps.club.id === nextProps.club.id &&
      prevProps.tournamentId === nextProps.tournamentId
    );
  }
);

ClubRosterTableRow.displayName = 'ClubRosterTableRow';

interface ClubRosterTableProps {
  clubs: Club[];
  tournamentId: string;
  onRosterUpdated: () => void;
  loading?: boolean;
}

/**
 * Tabla de clubes con columnas de información y acción de nómina
 * Usa React.memo en las filas para optimizar performance
 */
export const ClubRosterTable: React.FC<ClubRosterTableProps> = ({
  clubs,
  tournamentId,
  onRosterUpdated,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-[#1d2029] rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="text-center py-10 bg-[#1d2029]/40 rounded-xl border border-dashed border-[#0ae98a]/20">
        <p className="text-gray-400 text-sm">No hay clubes en este torneo</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#1d2029] rounded-xl border border-[#1d2029]">
      <table className="w-full">
        <thead className="bg-[#13161c]/50 border-b border-[#1d2029]">
          <tr>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Club
            </th>
            <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Equipos
            </th>
            <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {clubs.map((club) => (
            <ClubRosterTableRow
              key={club.id}
              club={club}
              tournamentId={tournamentId}
              onRosterUpdated={onRosterUpdated}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClubRosterTable;
