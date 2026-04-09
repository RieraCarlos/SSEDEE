import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { generateMatchReportPDF } from '@/utils/generateMatchReport';

import { useDisciplineConfig } from '@/hooks/useDisciplineConfig';

interface MatchResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  match: any; // El objeto partido del calendario
  disciplineId?: string;
}

const MatchResultDialog: React.FC<MatchResultDialogProps> = ({ isOpen, onClose, match, disciplineId = 'futbol' }) => {
  const { config } = useDisciplineConfig(disciplineId);
  
  if (!match || !match.reporte_final) return null;

  const report = match.reporte_final;

  const handleDownload = () => {
    generateMatchReportPDF({
      localName: report.local,
      visitaName: report.visita,
      scoreLocal: match.goles_local || 0,
      scoreVisita: match.goles_visitante || 0,
      events: (report.eventos || []).map((e: any) => ({
        id: e.id,
        type: e.type, // 'gol', 'amarilla', 'roja'
        minute: e.minute || 0,
        playerName: e.playerName,
        team: e.team,
        periodo: e.periodo || 1
      })),
      observations: report.observaciones,
      fecha: new Date(match.fecha_partido_raw || match.fecha_hora || new Date()).toLocaleDateString(),
      header_oficial: "Sistema de Seguimiento y Entretenimiento Deportivo en Ecuador",
      config: config
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#12141c] border-white/10 text-white max-w-2xl sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tighter text-center">
            RESULTADOS DEL ENCUENTRO
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 text-xs uppercase tracking-widest">
            Detalle oficial del partido finalizado
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Main Score Display */}
          <div className="flex items-center justify-around mb-10 bg-white/5 p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            
            <div className="text-center group">
              <div className="text-sm font-bold text-gray-500 mb-2 tracking-widest">LOCAL</div>
              <div className="text-xl font-bold uppercase">{report.local}</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-5xl font-black text-emerald-500 tabular-nums tracking-tighter">
                {match.goles_local} - {match.goles_visitante}
              </div>
              <div className="text-[10px] text-gray-500 mt-2 font-bold tracking-[0.2em]">FINALIZADO</div>
            </div>

            <div className="text-center">
               <div className="text-sm font-bold text-gray-500 mb-2 tracking-widest">VISITANTE</div>
               <div className="text-xl font-bold uppercase">{report.visita}</div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-gray-500 tracking-widest uppercase">Cronología de Eventos</h4>
            <div className="h-[200px] overflow-y-auto pr-4 custom-scrollbar">
              <div className="space-y-3">
                {report.eventos && report.eventos.length > 0 ? (
                  report.eventos.sort((a: any, b: any) => a.minute - b.minute).map((event: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-emerald-500 font-bold text-sm w-10">{event.minute}'</span>
                      <div className="flex-grow">
                        <div className="text-sm font-bold">{event.playerName}</div>
                        <div className="text-[10px] text-gray-500 uppercase flex items-center gap-2">
                           {event.type === 'gol' && <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>}
                           {event.type === 'amarilla' && <span className="w-2 h-2 bg-yellow-500 rounded-sm"></span>}
                           {event.type === 'roja' && <span className="w-2 h-2 bg-red-500 rounded-sm"></span>}
                           {event.type.toUpperCase()} - {event.team === 'local' ? report.local : report.visita}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm italic">
                    No se registraron sucesos en este encuentro.
                  </div>
                )}
              </div>
            </div>

            {report.observaciones && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
                 <h5 className="text-[10px] font-bold text-emerald-500/70 tracking-widest uppercase mb-1">Informe Arbitral</h5>
                 <p className="text-sm text-gray-300 leading-relaxed italic">
                    "{report.observaciones}"
                 </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all text-gray-400"
          >
            CERRAR
          </button>
          <button 
            onClick={handleDownload}
            className="flex-[2] py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            DESCARGAR ACTA (PDF)
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchResultDialog;
