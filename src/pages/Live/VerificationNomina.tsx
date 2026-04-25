import { useState } from 'react';
import { useNominaValidation } from '@/hooks/useNominaValidation';
import { Check, Clock, X, Save, Edit3, ShieldAlert, Loader2 } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { unlockEditMode } from '@/store/slices/nominaVerificacionSlice';
import { toast } from 'sonner';

interface VerificationNominaProps {
  matchId: string;
  localRoster: any[];
  visitaRoster: any[];
  localName: string;
  visitaName: string;
  color: string;
  onComplete?: () => void;
}

export default function VerificationNomina({
  matchId,
  localRoster,
  visitaRoster,
  localName,
  visitaName,
  color,
  onComplete
}: VerificationNominaProps) {
  const dispatch = useAppDispatch();
  const allPlayers = [...(localRoster || []), ...(visitaRoster || [])];
  
  const {
    selections,
    isLoading,
    readOnly,
    progress,
    verifiedCount,
    totalCount,
    isComplete,
    handleSelect,
    saveNomina
  } = useNominaValidation(matchId, allPlayers);

  const [activeTab, setActiveTab] = useState<'local' | 'visita'>('local');
  const [isSaving, setIsSaving] = useState(false);

  const onSave = async () => {
    setIsSaving(true);
    try {
      await saveNomina();
      toast.success("Nómina verificada y guardada exitosamente.");
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      toast.error(error.message || "Error al guardar nómina.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    dispatch(unlockEditMode());
  };

  const renderPlayerList = (players: any[], teamName: string) => {
    if (!players || players.length === 0) {
      return <div className="text-gray-500 italic p-4 text-center">No hay jugadores registrados en {teamName}</div>;
    }

    return (
      <div className="flex flex-col gap-3 mt-4 overflow-y-auto max-h-[50vh] xl:max-h-[60vh] custom-scrollbar pr-2 pb-2">
        {players.map(player => {
          const status = selections[player.id];
          return (
            <div key={player.id} className="bg-[#1d2029] p-3 md:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-sm font-bold border border-white/5 shrink-0" style={{ color }}>
                  {player.dorsal || '-'}
                </div>
                <div>
                  <div className="font-bold text-white text-sm md:text-base leading-tight">{player.fullname}</div>
                </div>
              </div>

              {/* Segmented Control / Grid on Mobile */}
              <div className={`grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-xl w-full sm:w-auto shrink-0 ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}>
                <button
                  onClick={() => handleSelect(player.id, 'presente')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${status === 'presente' ? 'bg-[#0ae98a] text-black shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Check className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span>Presente</span>
                </button>
                <button
                  onClick={() => handleSelect(player.id, 'atrasado')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${status === 'atrasado' ? 'bg-yellow-500 text-black shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Clock className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span>Atrasado</span>
                </button>
                <button
                  onClick={() => handleSelect(player.id, 'inasistencia')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${status === 'inasistencia' ? 'bg-red-500 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <X className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span>Falta</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col bg-[#13161c] rounded-3xl p-4 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden max-h-[90vh] md:max-h-[95vh]">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] opacity-[0.05] blur-[100px] rounded-full pointer-events-none" style={{ backgroundColor: color }}></div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-6 h-6" style={{ color }} />
            <h2 className="text-2xl font-black italic tracking-tighter text-white">CONTROL DE ASISTENCIA</h2>
          </div>
          <p className="text-gray-400 text-sm">Validación obligatoria de nómina previo al inicio del encuentro.</p>
        </div>
        
        {/* Progress Display */}
        <div className="flex flex-col items-end shrink-0">
          <div className="text-xs font-bold text-gray-500 tracking-widest mb-1.5">PROGRESO</div>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-black/60 h-2.5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full transition-all duration-500 ease-out rounded-full" 
                style={{ width: `${progress}%`, backgroundColor: progress === 100 ? color : '#3b82f6' }}
              />
            </div>
            <div className={`text-sm font-black w-12 text-right ${progress === 100 ? 'text-[#0ae98a]' : 'text-white'}`}>
              {verifiedCount}/{totalCount}
            </div>
          </div>
        </div>
      </div>

      {readOnly && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-between text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-bold">Nómina verificada y bloqueada. El marcador en vivo está habilitado.</span>
          </div>
          <button onClick={handleEdit} className="text-xs font-bold underline hover:text-white transition-colors flex items-center gap-1 focus:outline-none">
            <Edit3 className="w-4 h-4" /> Editar
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1 bg-black/40 rounded-xl mb-6 relative z-10">
        <button
          onClick={() => setActiveTab('local')}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'local' ? 'bg-[#1d2029] text-white shadow border border-white/5' : 'text-gray-400 hover:text-white'}`}
        >
          {localName || 'Equipo Local'}
        </button>
        <button
          onClick={() => setActiveTab('visita')}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'visita' ? 'bg-[#1d2029] text-white shadow border border-white/5' : 'text-gray-400 hover:text-white'}`}
        >
          {visitaName || 'Equipo Visitante'}
        </button>
      </div>

      <div className="relative z-10 flex-grow min-h-0">
        {activeTab === 'local' ? renderPlayerList(localRoster, localName) : renderPlayerList(visitaRoster, visitaName)}
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-white/5 flex justify-end relative z-10">
        <button
          onClick={onSave}
          disabled={!isComplete || isLoading || readOnly || isSaving}
          className="px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          style={{ 
            backgroundColor: isComplete ? color : '#374151', 
            color: isComplete ? '#000' : '#9ca3af'
          }}
        >
          {(isLoading || isSaving) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {readOnly ? 'GUARDADO' : 'CONFIRMAR Y HABILITAR MARCADOR'}
        </button>
      </div>

    </div>
  );
}
