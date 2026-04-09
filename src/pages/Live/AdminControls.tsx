import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, FastForward } from 'lucide-react';
import { useMatchLogic } from '@/hooks/useMatchLogic';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectLiveMatchState } from '@/store/slices/liveMatchSlice';

interface AdminControlsProps {
  localName: string;
  visitaName: string;
  onFinalize: () => void;
  loading: boolean;
}

const AdminControls: React.FC<AdminControlsProps> = ({ localName, visitaName, onFinalize, loading }) => {
  const { advancePeriod, currentPeriodName, currentPeriod } = useMatchLogic();
  const { config, events } = useAppSelector(selectLiveMatchState);

  const isLastPeriod = config ? currentPeriod >= config.periods.count : false;
  const hasEvents = events.length > 0;

  return (
    <div className="flex flex-col gap-6 w-full animate-in slide-in-from-bottom-5">
      {/* Control de Periodos / Fases - Color Distintivo (Violeta/Indigo) */}
      <div className="bg-[#1d2029] p-4 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <FastForward size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-500/70 uppercase tracking-[0.2em]">Fase de Juego</p>
            <h4 className="text-white text-lg font-black italic tracking-tighter uppercase leading-tight">{currentPeriodName}</h4>
          </div>
        </div>
        <Button
          onClick={isLastPeriod ? onFinalize : advancePeriod}
          disabled={loading}
          className={`w-full sm:w-auto font-black italic tracking-tighter uppercase px-8 py-4 h-auto rounded-xl transition-all flex items-center justify-center gap-3 group shadow-xl active:scale-95 ${isLastPeriod
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40 border-b-4 border-indigo-800 hover:border-b-2 hover:translate-y-[2px]'
            }`}
        >
          {isLastPeriod ? (
            'Finalizar Partido'
          ) : !hasEvents && currentPeriod === 1 ? (
            `Comenzar 1er ${config?.periods.name || 'Tiempo'}`
          ) : (
            `Siguiente ${config?.periods.name || 'Periodo'}`
          )}
          <FastForward size={20} className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default AdminControls;
