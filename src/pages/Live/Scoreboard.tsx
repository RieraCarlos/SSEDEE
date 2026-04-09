import React from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectLiveMatchState, selectLiveScores } from '@/store/slices/liveMatchSlice';
import { Skeleton } from '@/components/ui/Skeleton';
import { Shield, AlertTriangle } from 'lucide-react';
import { useMatchLogic } from '@/hooks/useMatchLogic';
import { useFutsalRules } from '@/hooks/useFutsalRules';

const Scoreboard: React.FC = () => {
  const { localName, localLogoUrl, visitaName, visitaLogoUrl, isLoading, config } = useAppSelector(selectLiveMatchState);
  const { scoreLocal, scoreVisita } = useAppSelector(selectLiveScores);
  const { currentPeriodName, cardSummary } = useMatchLogic();
  const { foulState, isFutsal } = useFutsalRules(async () => {}); // Solo vista

  const isVersus = config?.layoutMode === 'versus' || !config;
  const labels = config?.labels || { score: 'Goles', period: 'Tiempo', local: 'Local', visita: 'Visitante' };

  return (
    <div className="bg-[#13161c] rounded-2xl border-2 border-gray-700 shadow-2xl overflow-hidden shadow-[var(--discipline-color)]/5 animate-in zoom-in-95 duration-500">
      <div
        className="py-2 text-center border-b border-gray-700"
        style={{ backgroundColor: 'var(--discipline-color-alpha)' }}
      >
        <h2
          className="font-bold uppercase tracking-widest text-[9px] md:text-sm flex items-center justify-center gap-2"
          style={{ color: 'var(--discipline-color)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          EN VIVO • {currentPeriodName.toUpperCase()}
        </h2>
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
                <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-sm transition-all duration-300 ${
                  foulState.local.atLimit ? 'bg-red-500/20 border-red-500/40 text-red-500 animate-pulse' :
                  foulState.local.count >= 4 ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500' :
                    'bg-black/40 border-white/5 text-gray-400'
                  }`}>
                  <span className="text-[9px] font-black uppercase tracking-tight">Faltas:</span>
                  <span className="text-sm font-black italic">{foulState.local.count}</span>
                  {foulState.local.atLimit && <AlertTriangle size={12} className="ml-1" />}
                </div>
              )}

              {/* Futsal Foul Alert Message */}
              {isFutsal && foulState?.local.atLimit && (
                <div className="mt-1 text-red-500 flex items-center gap-1 animate-bounce">
                  <span className="text-xs font-black italic tracking-tighter uppercase whitespace-nowrap">Límite: Otorgar Tiro Libre</span>
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
                <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-sm transition-all duration-300 ${
                  foulState.visita.atLimit ? 'bg-red-500/20 border-red-500/40 text-red-500 animate-pulse' :
                  foulState.visita.count >= 4 ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500' :
                    'bg-black/40 border-white/5 text-gray-400'
                  }`}>
                  <span className="text-[9px] font-black uppercase tracking-tight">Faltas:</span>
                  <span className="text-sm font-black italic">{foulState.visita.count}</span>
                  {foulState.visita.atLimit && <AlertTriangle size={12} className="ml-1" />}
                </div>
              )}

              {/* Futsal Foul Alert Message */}
              {isFutsal && foulState?.visita.atLimit && (
                <div className="mt-1 text-red-500 flex items-center gap-1 animate-bounce">
                  <span className="text-xs font-black italic tracking-tighter uppercase whitespace-nowrap">Límite: Otorgar Tiro Libre</span>
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
    </div>
  );
};

export default Scoreboard;
