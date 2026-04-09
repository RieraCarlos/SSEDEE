import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Nav from '@/components/Landing/Nav';
import Footer from '@/components/Landing/Footer';
import Scoreboard from './Scoreboard';
import LiveRosters from './LiveRosters';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import { useFutsalRules } from '@/hooks/useFutsalRules';
import TiroLibreModal from '@/components/Live/TiroLibreModal';
import { useDisciplineConfig } from '@/hooks/useDisciplineConfig';
import { generateMatchReportPDF } from '@/utils/generateMatchReport';
import { selectAuthUser } from '@/store/slices/authSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { Loader2, FileText, CheckCircle2, ChevronRight, AlertCircle, Waves, Trophy, Settings, FastForward } from 'lucide-react';
import { useMatchLogic } from '@/hooks/useMatchLogic';
import SportIcon from '@/components/common/SportIcon';

/**
 * Página Principal del Partido en Vivo
 * Utiliza el hook useLiveMatch para sincronización reactiva.
 */
export default function LiveMatch() {
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const {
    events,
    localName,
    visitaName,
    localRoster,
    visitaRoster,
    scoreLocal,
    scoreVisita,
    isLoading,
    isValidMatchId,
    logEvent,
    finalizeMatch,
    disciplineId,
    config: currentConfig,
    error // Ensure error is extracted
  } = useLiveMatch();
  const { config } = useDisciplineConfig(disciplineId);
  const activeConfig = config || currentConfig;
  const { advancePeriod, currentPeriodName, currentPeriod, willMatchEndOnAdvance } = useMatchLogic();
  const { isFutsal, foulState, confirmTiroLibre } = useFutsalRules(logEvent);

  const isLastPeriod = willMatchEndOnAdvance;
  const hasEvents = events.length > 0;

  const [observations, setObservations] = useState("");
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [isFinalizedState, setIsFinalizedState] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isConfirmingFoul, setIsConfirmingFoul] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Determinamos si debemos mostrar el modal de Tiro Libre (Solo para Admin)
  const showTiroLibreLocal = isAdmin && foulState?.local.atLimit;
  const showTiroLibreVisita = isAdmin && foulState?.visita.atLimit;

  const handleConfirmFoulCycle = async (team: 'local' | 'visita') => {
    setIsConfirmingFoul(true);
    try {
      await confirmTiroLibre(team);
    } finally {
      setIsConfirmingFoul(false);
    }
  };

  if (!isValidMatchId || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 italic uppercase">PARTIDO NO ENCONTRADO</h2>
        <p className="text-gray-400 mb-8 max-w-xs">{error || 'El ID del partido no es válido o no existe en el sistema.'}</p>
        <button onClick={() => navigate('/admin')} className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all">
          VOLVER AL PANEL
        </button>
      </div>
    );
  }

  const themeStyles = {
    '--discipline-color': activeConfig?.color || '#10b981',
    '--discipline-color-alpha': `${activeConfig?.color || '#10b981'}22`,
  } as React.CSSProperties;

  const handleLogEventAction = async (type: string, team: 'local' | 'visita', player: any) => {
    await logEvent(type, team, player.id, player.fullname, { periodo: currentPeriod });
  };

  const handleConfirmFinalize = async () => {
    setIsFinalizing(true);
    try {
      const result = await finalizeMatch(observations);
      if (result && result.success) {
        setShowFinalizeModal(false);
        setIsFinalizedState(true);
      }
    } catch (error) {
      // Error manejado en thunk
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleDownloadPDF = () => {
    generateMatchReportPDF({
      localName,
      visitaName,
      scoreLocal,
      scoreVisita,
      events,
      localRoster,
      visitaRoster,
      observations,
      header_oficial: "Sistema de Seguimiento y Entretenimiento Deportivo en Ecuador",
      config: activeConfig
    });
  };

  return (
    <div className="text-white min-h-screen flex flex-col bg-[#07080a]" style={themeStyles}>
      <Nav />
      {/* Dynamic Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[var(--discipline-color)] opacity-[0.03] blur-[120px] rounded-full -z-0 pointer-events-none"></div>

      <div className="px-4 md:px-10 lg:px-20 mb-20 flex-grow flex flex-col items-center justify-start py-10 relative z-10">

        {/* Header con Deporte */}
        <div className="w-full max-w-5xl flex justify-between items-center mb-10 px-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[var(--discipline-color)]/20 shrink-0"
              style={{ backgroundColor: 'var(--discipline-color)' }}
            >
              <SportIcon disciplineId={disciplineId} size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-black text-white italic leading-none tracking-tighter">
                  {activeConfig?.name.toUpperCase() || 'COMPETICIÓN'}
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--discipline-color)' }}></div>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                  {activeConfig?.layoutMode === 'versus' ? 'MODO ENFRENTAMIENTO' : 'MODO PARTICIPANTES'}
                </span>
              </div>
            </div>
          </div>

          {isAdmin && !isFinalizedState ? (
            <button
              onClick={isLastPeriod ? () => setShowFinalizeModal(true) : advancePeriod}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all group border border-white/5 shadow-xl active:scale-95 ${isLastPeriod
                  ? 'bg-red-600/20 border-red-500/30 hover:bg-red-600 text-red-500 hover:text-white'
                  : 'bg-indigo-600/20 border-indigo-500/30 hover:bg-indigo-600 text-indigo-400 hover:text-white'
                }`}
              title={isLastPeriod ? 'Finalizar Partido' : 'Siguiente Fase'}
            >
              <FastForward className={`w-5 h-5 transition-transform group-hover:translate-x-1`} />
              <span className="text-[10px] font-black italic tracking-tighter uppercase whitespace-nowrap">
                {isLastPeriod ? 'Finalizar' : (!hasEvents && currentPeriod === 1 ? 'Comenzar' : currentPeriodName)}
              </span>
            </button>
          ) : (
            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group border border-white/5">
              <Settings className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:rotate-45 transition-all" />
            </button>
          )}
        </div>

        {/* Marcador Principal */}
        <div className="w-full max-w-5xl relative">
          <Scoreboard />
        </div>

        {/* Modales de Reglas de Futsal */}
        {isFutsal && (
          <>
            <TiroLibreModal
              isOpen={!!showTiroLibreLocal}
              teamName={localName}
              onConfirm={() => handleConfirmFoulCycle('local')}
              isLoading={isConfirmingFoul}
            />
            <TiroLibreModal
              isOpen={!!showTiroLibreVisita}
              teamName={visitaName}
              onConfirm={() => handleConfirmFoulCycle('visita')}
              isLoading={isConfirmingFoul}
            />
          </>
        )}

        {isFinalizedState ? (
          <div className="w-full max-w-2xl mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ... finalized state content ... */}
            <div className="bg-[#12141c] border border-[var(--discipline-color)]/20 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-[var(--discipline-color)]/10 blur-3xl rounded-full"></div>
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[var(--discipline-color)]/10 blur-3xl rounded-full"></div>

              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-[var(--discipline-color)]/20"
                style={{ color: 'var(--discipline-color)' }}
              >
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h2 className="text-3xl font-black text-white mb-2 italic tracking-tighter">REGISTRO COMPLETADO</h2>
              <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
                Los datos de la competencia han sido guardados oficialmente.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-3 group"
                >
                  <FileText
                    className="w-5 h-5 group-hover:scale-110 transition-transform"
                    style={{ color: 'var(--discipline-color)' }}
                  />
                  DESCARGAR REPORTE
                </button>
                <button
                  onClick={() => navigate('/admin')}
                  className="flex-1 px-8 py-4 rounded-2xl text-white font-bold shadow-lg shadow-black/40 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: 'var(--discipline-color)' }}
                >
                  REGRESAR AL INICIO
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl mt-12">
            <div className="flex items-center gap-3 mb-8 px-4">
              {activeConfig?.layoutMode === 'participants' ? <Waves className="text-[var(--discipline-color)]" /> : <Trophy className="text-[var(--discipline-color)]" />}
              <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">
                {activeConfig?.layoutMode === 'participants' ? 'Control de Participantes' : 'Seguimiento de Plantillas'}
              </h2>
            </div>
            <LiveRosters
              localPlayers={localRoster}
              visitaPlayers={visitaRoster}
              localName={localName}
              visitaName={visitaName}
              matchEvents={events}
              isAdmin={isAdmin}
              onLogEvent={handleLogEventAction}
              isLoading={isLoading}
              config={activeConfig}
            />
          </div>
        )}

      </div>

      {/* Modal de Finalización de Partido */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#12141c] border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Finalizar Partido</h3>
            <p className="text-gray-400 text-sm mb-6">
              Se guardará el reporte detallado con el marcador final de
              <span className="text-white font-bold mx-1">{scoreLocal} - {scoreVisita}</span>
              y todos los sucesos registrados.
            </p>

            <div className="space-y-4 mb-8">
              <label className="block text-xs font-uppercase tracking-wider text-gray-500 font-bold">
                OBSERVACIONES / REPORTE ARBITRAL
              </label>
              <textarea
                className="w-full bg-[#0a0b0f] border border-white/5 rounded-xl p-4 text-sm text-gray-200 focus:outline-none transition-all h-32 resize-none"
                style={{ '--focus-color': 'var(--discipline-color)' } as any}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--discipline-color)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
                placeholder="Escribe aquí las observaciones finales del encuentro..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFinalizeModal(false)}
                className="flex-1 py-3 rounded-xl border border-white/5 text-gray-500 text-[10px] font-black tracking-widest hover:bg-white/5 transition-all"
              >
                CANCELAR
              </button>
              <button
                onClick={handleConfirmFinalize}
                disabled={isFinalizing}
                className="flex-1 py-4 rounded-xl text-white text-xs font-black italic tracking-tighter shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--discipline-color)' }}
              >
                {isFinalizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    GUARDANDO...
                  </>
                ) : 'GUARDAR Y FINALIZAR ACTA'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
