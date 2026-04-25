import React, { memo } from 'react';
import { User } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectNominaVerificacion } from '@/store/slices/nominaVerificacionSlice';
import type { NominaMember, MatchEvent, DisciplineConfig } from '@/core/disciplines';

interface PlayerListProps {
  players: NominaMember[];
  events: MatchEvent[];
  teamName: string;
  teamType: 'local' | 'visita';
  isAdmin: boolean;
  onLogEvent: (player: NominaMember) => void;
  isLoading?: boolean;
  config: DisciplineConfig | null;
}

/**
 * Componente Reutilizable de Nómina de Jugadores (SOLID)
 * Optimizado con React.memo para rendimiento en vivo.
 */
const PlayerList: React.FC<PlayerListProps> = memo(({
  players,
  events,
  teamName,
  isAdmin,
  onLogEvent,
  isLoading,
  config
}) => {
  const { selections } = useAppSelector(selectNominaVerificacion);

  const getPlayerEvents = (playerId: string) => events.filter(e => e.playerId === playerId);

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#13161c]/50 rounded-2xl border border-gray-800/50 p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-800/20 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#13161c] rounded-2xl border border-gray-800 flex flex-col overflow-hidden shadow-2xl transition-all">
      {/* Header del Equipo */}
      <div
        className="py-4 px-6 border-b border-gray-800 flex justify-between items-center"
        style={{ backgroundColor: 'var(--discipline-color-alpha)' }}
      >
        <h3 className="text-sm md:text-base font-black italic tracking-tighter text-white uppercase">{teamName}</h3>
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--discipline-color)' }}
        >
          {players.length} Jugadores
        </span>
      </div>

      <div className="p-2 space-y-1 overflow-y-auto max-h-[600px] flex-1 scrollbar-thin scrollbar-thumb-gray-800">
        {players.length > 0 ? (
          players.map((p) => {
            const pEvents = getPlayerEvents(p.id);

            // Generic event counting based on config
            const eventIcons = (config?.stats || []).filter(s => pEvents.some(e => e.type === s.id)).map(s => {
              const count = pEvents.filter(e => e.type === s.id).length;
              return { ...s, count };
            });

            const hasRedCard = pEvents.some(e => e.type === 'roja');
            const isAbsent = selections[p.id] === 'inasistencia';

            return (
              <div
                key={p.id}
                onClick={() => {
                  if (isAdmin && !isAbsent) onLogEvent(p);
                }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all border border-transparent 
                   ${isAbsent ? 'opacity-30 cursor-not-allowed grayscale' : isAdmin ? 'cursor-pointer hover:bg-white/[0.03] group' : 'opacity-90'}`}
                style={{ borderLeft: isAdmin && !isAbsent ? '2px solid transparent' : 'none' }}
                onMouseEnter={(e) => isAdmin && !isAbsent && (e.currentTarget.style.borderLeftColor = 'var(--discipline-color)')}
                onMouseLeave={(e) => isAdmin && !isAbsent && (e.currentTarget.style.borderLeftColor = 'transparent')}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center font-black text-xs text-gray-400 group-hover:text-white transition-colors"
                      style={{ '--hover-color': 'var(--discipline-color)' } as any}
                    >
                      {p.alias?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                    {hasRedCard && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-3.5 bg-red-600 rounded-sm ring-2 ring-[#13161c]" title="Expulsado"></div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-200 font-bold text-sm tracking-tight group-hover:text-white transition-colors">{p.fullname}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-1.5 py-0.5 bg-gray-900 rounded border border-gray-800">
                        {p.posicion || 'Jugador'}
                      </span>
                      {p.role === 'dt' && (
                        <span
                          className="text-[9px] font-black uppercase italic"
                          style={{ color: 'var(--discipline-color)' }}
                        >
                          Director Técnico
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Marcadores en Vivo */}
                <div className="flex items-center gap-1.5 transition-all duration-300">
                  {eventIcons.map(ei => (
                    <React.Fragment key={ei.id}>
                      {ei.id === 'gol' || ei.id === 'canasta_1' || ei.id === 'canasta_2' || ei.id === 'canasta_3' || ei.id === 'punto' ? (
                        [...Array(ei.count)].map((_, i) => (
                          <div key={`${ei.id}-${i}`} className="w-6 h-6 flex items-center justify-center text-sm drop-shadow-md hover:scale-110 transition-transform" title={ei.label}>
                            {ei.id === 'gol' ? '⚽' : ei.id === 'punto' ? '🏐' : '🏀'}
                          </div>
                        ))
                      ) : (
                        <div className="flex gap-1 items-center">
                          {[...Array(ei.count)].map((_, i) => (
                            <div
                              key={`${ei.id}-${i}`}
                              className={`w-3 h-4 rounded-[1px] shadow-md border border-white/10 ${ei.id === 'amarilla' ? 'bg-yellow-400' :
                                ei.id === 'roja' ? 'bg-red-600' :
                                  'bg-[var(--discipline-color)]'
                                }`}
                              title={ei.label}
                            ></div>
                          ))}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-600 italic text-xs font-medium">
            No hay nómina registrada
          </div>
        )}
      </div>
    </div>
  );
});

export default PlayerList;
