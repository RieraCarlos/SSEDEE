import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Trash2, Loader } from 'lucide-react';
import { useClubRoster } from '@/hooks/useClubRoster';
import CsvNominaUploaderModal from './CsvNominaUploaderModal';

interface UpdateNominaModalProps {
  isOpen: boolean;
  clubId: string;
  clubName: string;
  tournamentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal responsivo para actualizar la nómina de un club
 * Implementa Mobile-First design con Tailwind CSS
 * Mantiene consistencia visual con la paleta #13161c, #1d2029, #0ae98a
 */
export const UpdateNominaModal: React.FC<UpdateNominaModalProps> = ({
  isOpen,
  clubId,
  clubName,
  tournamentId,
  onClose,
  onSuccess,
}) => {
  const {
    clubPlayers,
    availableUsers,
    loading,
    updateLoading,
    error,
    loadClubPlayers,
    loadAvailableUsers,
    updateNomina,
    cleanup,
  } = useClubRoster(clubId, tournamentId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(
    new Set()
  );

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadClubPlayers();
      loadAvailableUsers();

      // Inicializar con jugadores actuales
      const currentPlayerIds = new Set<string>(
        clubPlayers.map((p: any) => p.id)
      );
      setSelectedPlayerIds(currentPlayerIds);
    }
  }, [isOpen, clubId, tournamentId, clubPlayers]);

  // Limpiar estado al cerrar
  const handleClose = useCallback(() => {
    cleanup();
    setSearchQuery('');
    setSelectedPlayerIds(new Set());
    onClose();
  }, [cleanup, onClose]);

  // Filtrar usuarios disponibles por búsqueda
  const filteredUsers = availableUsers.filter((user: any) =>
    user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Agregar/remover jugador
  const togglePlayerSelection = (userId: string) => {
    const newSelected = new Set(selectedPlayerIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedPlayerIds(newSelected);
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Guardar cambios
  const handleSave = async () => {
    try {
      await updateNomina(Array.from(selectedPlayerIds));
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error al actualizar nómina:', err);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay fullscreen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Modal - Responsive */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          >
            <div className="w-full h-screen md:h-auto md:max-w-2xl md:rounded-xl bg-[#13161c] border border-[#1d2029] md:shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-[#13161c]/95 backdrop-blur-xl border-b border-[#1d2029] px-4 sm:px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Actualizar Nómina
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    {clubName}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-[#1d2029] transition-colors text-gray-400 hover:text-white"
                  aria-label="Cerrar modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Búsqueda y Subida Masiva */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Buscar jugador..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#1d2029] border border-[#0ae98a]/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#0ae98a]/50 transition-colors text-sm"
                    />
                  </div>
                  <CsvNominaUploaderModal 
                    clubId={clubId} 
                    onSuccess={() => {
                        handleClose();
                        onSuccess();
                    }} 
                  />
                </div>

                {/* Lista de jugadores disponibles */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="animate-spin text-[#0ae98a]" size={24} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user: any) => (
                        <label
                          key={user.id}
                          className="flex items-center gap-3 p-3 bg-[#1d2029] rounded-lg cursor-pointer hover:bg-[#1d2029]/80 transition-colors border border-[#0ae98a]/10"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPlayerIds.has(user.id)}
                            onChange={() => togglePlayerSelection(user.id)}
                            className="w-4 h-4 accent-[#0ae98a] rounded cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {user.fullname}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        {searchQuery
                          ? 'No se encontraron jugadores'
                          : 'Todos los jugadores están asignados'}
                      </div>
                    )}
                  </div>
                )}

                {/* Jugadores seleccionados */}
                {selectedPlayerIds.size > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-300">
                      Seleccionados ({selectedPlayerIds.size})
                    </h3>
                    <div className="space-y-2">
                      {clubPlayers.map((player: any) => {
                        if (!selectedPlayerIds.has(player.id)) {
                          return null;
                        }
                        return (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-3 bg-[#0ae98a]/10 rounded-lg border border-[#0ae98a]/20"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {player.fullname || 'Jugador'}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {player.email}
                              </p>
                            </div>
                            <button
                              onClick={() => togglePlayerSelection(player.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                      {availableUsers
                        .filter((user: any) => selectedPlayerIds.has(user.id))
                        .map((user: any) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 bg-[#0ae98a]/10 rounded-lg border border-[#0ae98a]/20"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {user.fullname}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {user.email}
                              </p>
                            </div>
                            <button
                              onClick={() => togglePlayerSelection(user.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
              </div>

              {/* Footer - Acciones */}
              <div className="sticky bottom-0 bg-[#13161c]/95 backdrop-blur-xl border-t border-[#1d2029] px-4 sm:px-6 py-4 flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2 bg-[#1d2029] hover:bg-[#1d2029]/80 disabled:opacity-50 text-white font-semibold rounded-lg transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateLoading || selectedPlayerIds.size === 0}
                  className="flex-1 px-4 py-2 bg-[#0ae98a] hover:bg-[#0ae98a]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#13161c] font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  {updateLoading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default UpdateNominaModal;
