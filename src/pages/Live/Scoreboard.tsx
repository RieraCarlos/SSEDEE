import React from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectLiveMatchState, selectLiveScores } from '@/store/slices/liveMatchSlice';
import { Skeleton } from '@/components/ui/Skeleton';
import { Shield, AlertTriangle, Users, Trash2 } from 'lucide-react';
import { useMatchLogic } from '@/hooks/useMatchLogic';
import { useMatchEvents } from '@/hooks/useMatchEvents';
import { useFutsalRules } from '@/hooks/useFutsalRules';

interface ScoreboardProps {
  onUpdateNomina?: () => void;
  isAdmin?: boolean;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ onUpdateNomina, isAdmin }) => {
  const matchState = useAppSelector(selectLiveMatchState);
  const { localName, localLogoUrl, visitaName, visitaLogoUrl, isLoading, config, events, activeMatchId, currentPeriod } = matchState;
  const { scoreLocal, scoreVisita } = useAppSelector(selectLiveScores);
  const { currentPeriodName, cardSummary } = useMatchLogic();
  const { foulState, isFutsal } = useFutsalRules(async () => { }); // Solo vista
  const { deleteEvent } = useMatchEvents(
    activeMatchId || '',
    { scoreLocal, scoreVisita },
    currentPeriod,
    config?.scoreRules || []
  );

  const isVersus = config?.layoutMode === 'versus' || !config;
  const labels = config?.labels || { score: 'Goles', period: 'Tiempo', local: 'Local', visita: 'Visitante' };

  const recentEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="bg-[#13161c] rounded-2xl border-2 border-gray-700 shadow-2xl overflow-hidden shadow-[var(--discipline-color)]/5 animate-in zoom-in-95 duration-500">
      <div
        className="py-2 text-center border-b border-gray-700 flex"
        style={{ backgroundColor: 'var(--discipline-color-alpha)' }}
      >
        <h2
          className="font-bold uppercase tracking-widest text-[9px] md:text-sm flex items-center justify-center gap-2"
          style={{ color: 'var(--discipline-color)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          EN VIVO • {currentPeriodName.toUpperCase()}
        </h2>

        {isAdmin && (
          <button
            onClick={onUpdateNomina}
            className="absolute top-1.5 right-4 flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#0ae98a] hover:text-white transition-colors"
          >
            <Users className="w-3 h-3" />
            Actualizar Nómina
          </button>
        )}
      </div>

      <div className="flex justify-between items-center p-4 md:p-10">

        {isVersus ? (
          <>
            {/* Equipo Local */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-16 h-16 md:w-32 md:h-32 mb-4 bg-gray-900 rounded-2xl flex items-center justify-center p-2 border-2 border-gray-800 shadow-inner relative overflow-hidden group">
                {isLoading ? (
                  <Skeleton className="w-full h-full rounded-2xl" />
                ) : localLogoUrl ? (
                  <img src={localLogoUrl} alt={localName} className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <Shield className="w-8 h-8 md:w-16 md:h-16 text-gray-800" />
                )}
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-24 md:h-8 md:w-40" />
              ) : (
                <h3 className="text-sm md:text-2xl font-black text-white text-center truncate w-full max-w-[120px] md:max-w-xs italic tracking-tighter uppercase">
                  {localName || "Equipo Local"}
                </h3>
              )}
              <span
                className="text-[10px] font-bold uppercase mt-1 tracking-[0.2em] opacity-80"
                style={{ color: 'var(--discipline-color)' }}
              >
                {labels.local}
              </span>

              {/* Foul Counter and Alerts (Ciclo Inteligente) */}
              {isFutsal && foulState && (
                <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-sm transition-all duration-300 ${foulState.local.atLimit ? 'bg-red-500/20 border-red-500/40 text-red-500 animate-pulse' :
                    foulState.local.isAutoFreeThrow ? 'bg-orange-500/20 border-orange-500/40 text-orange-500' :
                      foulState.local.count >= 4 ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500' :
                        'bg-black/40 border-white/5 text-gray-400'
                  }`}>
                  <span className="text-[9px] font-black uppercase tracking-tight">Faltas:</span>
                  <span className="text-sm font-black italic">{foulState.local.count}</span>
                  {foulState.local.atLimit && <AlertTriangle size={12} className="ml-1" />}
                  {foulState.local.isAutoFreeThrow && <span className="text-[8px] font-bold">AUTO</span>}
                </div>
              )}

              {/* Futsal Foul Alert - Límite (count === 6) */}
              {isFutsal && foulState?.local.atLimit && (
                <div className="mt-1 text-red-500 flex items-center gap-1 animate-bounce">
                  <span className="text-xs font-black italic tracking-tighter uppercase whitespace-nowrap">Límite: Otorgar Tiro Libre</span>
                </div>
              )}

              {/* Futsal Auto-Tiro Libre (count > 6) */}
              {isFutsal && foulState?.local.isAutoFreeThrow && (
                <div className="mt-1 text-orange-500 flex items-center gap-1 animate-pulse">
                  <span className="text-xs font-black italic tracking-tighter uppercase whitespace-nowrap">⚡ Auto Tiro Libre Activo</span>
                </div>
              )}

              {/* Cards Summary */}
              <div className="flex gap-2 mt-3">
                {Array.from({ length: cardSummary.local.yellow }).map((_, i) => (
                  <div key={`ly-${i}`} className="w-2 h-3 bg-yellow-400 rounded-xs shadow-sm" />
                ))}
                {Array.from({ length: cardSummary.local.red }).map((_, i) => (
                  <div key={`lr-${i}`} className="w-2 h-3 bg-red-600 rounded-xs shadow-sm" />
                ))}
              </div>
            </div>

            {/* Marcador Central */}
            <div className="flex flex-col items-center px-4 md:px-12">
              <div
                className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50"
                style={{ color: 'var(--discipline-color)' }}
              >
                {labels.score}
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-2 md:space-x-8">
                  <div className="text-4xl md:text-8xl font-black text-white tabular-nums drop-shadow-xl">{scoreLocal}</div>
                  <div className="text-xl md:text-4xl font-bold text-gray-700">-</div>
                  <div className="text-4xl md:text-8xl font-black text-white tabular-nums drop-shadow-xl">{scoreVisita}</div>
                </div>
              </div>
            </div>

            {/* Equipo Visita */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-16 h-16 md:w-32 md:h-32 mb-4 bg-gray-900 rounded-2xl flex items-center justify-center p-2 border-2 border-gray-800 shadow-inner relative overflow-hidden group">
                {isLoading ? (
                  <Skeleton className="w-full h-full rounded-2xl" />
                ) : visitaLogoUrl ? (
                  <img src={visitaLogoUrl} alt={visitaName} className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <Shield className="w-8 h-8 md:w-16 md:h-16 text-gray-800" />
                )}
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-24 md:h-8 md:w-40" />
              ) : (
                <h3 className="text-sm md:text-2xl font-black text-white text-center truncate w-full max-w-[120px] md:max-w-xs italic tracking-tighter uppercase">
                  {visitaName || "Equipo Visita"}
                </h3>
              )}
              <span
                className="text-[10px] font-bold uppercase mt-1 tracking-[0.2em] opacity-80"
                style={{ color: 'var(--discipline-color)' }}
              >
                {labels.visita}
              </span>

              {/* Foul Counter and Alerts (Ciclo Inteligente) */}
              {isFutsal && foulState && (
                <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-sm transition-all duration-300 ${foulState.visita.atLimit ? 'bg-red-500/20 border-red-500/40 text-red-500 animate-pulse' :
                    foulState.visita.isAutoFreeThrow ? 'bg-orange-500/20 border-orange-500/40 text-orange-500' :
                      foulState.visita.count >= 4 ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500' :
                        'bg-black/40 border-white/5 text-gray-400'
                  }`}>
                  <span className="text-[9px] font-black uppercase tracking-tight">Faltas:</span>
                  <span className="text-sm font-black italic">{foulState.visita.count}</span>
                  {foulState.visita.atLimit && <AlertTriangle size={12} className="ml-1" />}
                  {foulState.visita.isAutoFreeThrow && <span className="text-[8px] font-bold">AUTO</span>}
                </div>
              )}

              {/* Futsal Foul Alert - Límite (count === 6) */}
              {isFutsal && foulState?.visita.atLimit && (
                <div className="mt-1 text-red-500 flex items-center gap-1 animate-bounce">
                  <span className="text-xs font-black italic tracking-tighter uppercase whitespace-nowrap">Límite: Otorgar Tiro Libre</span>
                </div>
              )}

              {/* Futsal Auto-Tiro Libre (count > 6) */}
              {isFutsal && foulState?.visita.isAutoFreeThrow && (
                <div className="mt-1 text-orange-500 flex items-center gap-1 animate-pulse">
                  <span className="text-xs font-black italic tracking-tighter uppercase whitespace-nowrap">⚡ Auto Tiro Libre Activo</span>
                </div>
              )}

              {/* Cards Summary */}
              <div className="flex gap-2 mt-3">
                {Array.from({ length: cardSummary.visita.yellow }).map((_, i) => (
                  <div key={`vy-${i}`} className="w-2 h-3 bg-yellow-400 rounded-xs shadow-sm" />
                ))}
                {Array.from({ length: cardSummary.visita.red }).map((_, i) => (
                  <div key={`vr-${i}`} className="w-2 h-3 bg-red-600 rounded-xs shadow-sm" />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full flex flex-col items-center py-6">
            <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase mb-2">
              {config?.name}
            </h3>
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-12" style={{ backgroundColor: 'var(--discipline-color)', opacity: 0.5 }}></div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Lista de Participantes</span>
              <div className="h-[2px] w-12" style={{ backgroundColor: 'var(--discipline-color)', opacity: 0.5 }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Historial Corto de Sucesos y Rollback */}
      {isAdmin && recentEvents.length > 0 && (
        <div className="border-t border-gray-800 bg-[#0a0b0f] p-4 text-[#13161c]">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Sucesos Recientes</h4>
          <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 pb-2">
            {recentEvents.map(evt => (
              <div key={evt.id} className="flex items-center justify-between bg-white/5 border border-white/5 p-2 rounded-lg group">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400 bg-black/40 px-2 py-0.5 rounded uppercase">
                    P{evt.periodo} • {evt.minute}'
                  </span>
                  <div>
                    <div className="text-sm font-bold text-gray-200">
                      {evt.playerName} <span className="text-gray-500 font-normal">({evt.team})</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--discipline-color)' }}>
                      {(config?.scoreRules || []).find(r => r.id === evt.type)?.label || evt.type}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("¿Seguro que deseas anular esta acción?")) {
                      deleteEvent(evt);
                    }
                  }}
                  className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-colors shadow-sm"
                  title="Anular / Deshacer Acción"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase hidden sm:inline tracking-widest">Anular</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
