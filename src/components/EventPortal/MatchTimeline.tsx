import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Zap, Trophy, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import * as Collapsible from '@radix-ui/react-collapsible';

// Redux
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchTournamentMatches } from '@/store/thunks/tournamentsThunks';
import { selectPortalMatches, selectTimelineLoading } from '@/store/slices/tournamentsSlice';

interface TimelineMatch {
  id: string;
  local_name: string;
  visita_name: string;
  fecha: string;
  hora: string;
  status: 'pending' | 'active' | 'finished';
  score_local: number;
  score_visita: number;
  discipline?: string;
  field?: string;
  tournament_name: string;
}

const MatchTimeline: React.FC<{ tournamentId?: string | string[] }> = ({ tournamentId }) => {
  const dispatch = useAppDispatch();
  
  // Selectores de Redux
  const reduxMatches = useAppSelector(selectPortalMatches);
  const loading = useAppSelector(selectTimelineLoading);

  useEffect(() => {
    if (!tournamentId || (Array.isArray(tournamentId) && tournamentId.length === 0)) return;
    dispatch(fetchTournamentMatches(tournamentId));
  }, [tournamentId, dispatch]);

  // Formatear los partidos obtenidos de Redux para la UI
  const matches: TimelineMatch[] = reduxMatches.map((m: any) => ({
    id: m.id,
    local_name: m.local?.name || 'Por definir',
    visita_name: m.visita?.name || 'Por definir',
    fecha: m.fecha_partido,
    hora: m.hora_inicio,
    tournament_name: m.torneos?.name || 'Torneo General',
    status: (m.is_active ? 'active' : (m.reporte_final ? 'finished' : 'pending')) as 'pending' | 'active' | 'finished',
    score_local: m.goles_local || 0,
    score_visita: m.goles_visitante || 0,
    discipline: m.discipline || 'Fútbol',
    field: m.field || 'Campo Central'
  }));

  // Hierarchical Grouping: Tournament (Sport) -> Date
  const groupedByTournament = matches.reduce((acc: Record<string, Record<string, TimelineMatch[]>>, match) => {
    const tName = match.tournament_name;
    if (!acc[tName]) acc[tName] = {};
    if (!acc[tName][match.fecha]) acc[tName][match.fecha] = [];
    acc[tName][match.fecha].push(match);
    return acc;
  }, {});

  const tournaments = Object.keys(groupedByTournament);
  const [openTournaments, setOpenTournaments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (tournaments.length > 0 && Object.keys(openTournaments).length === 0) {
      setOpenTournaments({ [tournaments[0]]: true });
    }
  }, [tournaments]);

  const toggleTour = (name: string) => {
    setOpenTournaments(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="space-y-16">
      <AnimatePresence mode="wait">
        {loading ? (
           <motion.div 
             key="loading"
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="py-20 text-center space-y-4"
           >
              <Zap className="mx-auto text-emerald-500 animate-pulse" size={40} />
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">Sincronizando Calendario Oficial</p>
           </motion.div>
        ) : tournaments.length > 0 ? (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
          >
            {tournaments.map((tName) => (
              <Collapsible.Root 
                key={tName}
                open={openTournaments[tName]}
                onOpenChange={() => toggleTour(tName)}
                className="group/tour space-y-6"
              >
                {/* Tournament Section Header */}
                <Collapsible.Trigger asChild>
                  <button className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-[2rem] transition-all duration-500 group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                        <Trophy size={20} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">
                          {tName}
                        </h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {Object.keys(groupedByTournament[tName]).length} fechas programadas
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: openTournaments[tName] ? 180 : 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <ChevronDown className="text-emerald-500" />
                    </motion.div>
                  </button>
                </Collapsible.Trigger>

                <Collapsible.Content className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-500">
                  <div className="pl-6 space-y-16 border-l-2 border-white/5 pt-4">
                    {Object.keys(groupedByTournament[tName]).map((date, dIdx) => (
                      <motion.div 
                        key={date}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: dIdx * 0.1 }}
                        className="space-y-8 relative"
                      >
                        {/* Connecting Line Circle */}
                        <div className="absolute -left-[33px] top-6 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />

                        {/* Date Header */}
                        <div className="flex items-center gap-6">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl flex flex-col items-center justify-center">
                              <span className="text-emerald-400 font-black text-2xl leading-none italic">{date.split('-')[2]}</span>
                              <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">{new Date(date).toLocaleString('es-ES', { month: 'short' })}</span>
                          </div>
                          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{groupedByTournament[tName][date].length} Partidos</span>
                          </div>
                        </div>

                        {/* Day's Matches List */}
                        <div className="grid grid-cols-1 gap-4 pr-2">
                          {groupedByTournament[tName][date].map((match) => (
                            <motion.div
                              key={match.id}
                              whileHover={{ x: 10 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              className="group relative bg-[#0f172a]/40 backdrop-blur-2xl border border-white/5 hover:border-emerald-500/30 rounded-[2rem] p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 transition-all duration-500 overflow-hidden"
                            >
                              {/* Time & Venue */}
                              <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-2 w-full lg:w-40 shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 pb-4 lg:pb-0">
                                  <div className="flex items-center gap-2 text-white">
                                      <Clock size={16} className="text-emerald-500" />
                                      <span className="text-lg font-black italic tracking-tighter">{match.hora}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-500">
                                      <MapPin size={14} />
                                      <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[120px]">{match.field}</span>
                                  </div>
                              </div>

                              {/* Teams */}
                              <div className="flex-1 flex items-center justify-center gap-6 md:gap-12 w-full">
                                  <div className="flex-1 flex flex-col md:flex-row items-center md:justify-end gap-4 text-center md:text-right">
                                      <span className="order-2 md:order-1 text-sm md:text-lg font-black text-white uppercase italic tracking-tighter line-clamp-1">{match.local_name}</span>
                                      <div className="order-1 md:order-2 w-14 h-14 md:w-16 md:h-16 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center p-3">
                                          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${match.local_name}&backgroundColor=0f172a`} alt="Logo" className="w-full h-full object-contain" />
                                      </div>
                                  </div>

                                  <div className="flex flex-col items-center">
                                      {match.status === 'pending' ? (
                                          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                              <span className="text-xs font-black text-slate-500 italic">VS</span>
                                          </div>
                                      ) : (
                                          <div className="flex items-center gap-4">
                                              <span className={`text-3xl md:text-5xl font-black tabular-nums transition-colors ${match.status === 'active' ? 'text-emerald-400' : 'text-white'}`}>{match.score_local}</span>
                                              <div className="h-8 w-px bg-white/10" />
                                              <span className={`text-3xl md:text-5xl font-black tabular-nums transition-colors ${match.status === 'active' ? 'text-emerald-400' : 'text-white'}`}>{match.score_visita}</span>
                                          </div>
                                      )}
                                  </div>

                                  <div className="flex-1 flex flex-col md:flex-row items-center md:justify-start gap-4 text-center md:text-left">
                                      <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center p-3">
                                          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${match.visita_name}&backgroundColor=0f172a`} alt="Logo" className="w-full h-full object-contain" />
                                      </div>
                                      <span className="text-sm md:text-lg font-black text-white uppercase italic tracking-tighter line-clamp-1">{match.visita_name}</span>
                                  </div>
                              </div>

                              {/* Status */}
                              <div className="w-full lg:w-40 flex justify-center lg:justify-end">
                                  <div className={`px-6 py-2 rounded-2xl flex items-center gap-2 border ${
                                      match.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'
                                  }`}>
                                      <div className={`w-1.5 h-1.5 rounded-full ${match.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-current opacity-50'}`} />
                                      <span className="text-[10px] font-black uppercase tracking-widest">{match.status === 'active' ? 'En Vivo' : match.status === 'finished' ? 'Final' : 'Próximo'}</span>
                                  </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Collapsible.Content>
              </Collapsible.Root>
            ))}
          </motion.div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
              <CalendarIcon className="mx-auto text-slate-800 mb-4" size={48} />
              <p className="text-slate-600 text-xs font-black uppercase tracking-[0.3em]">No hay encuentros programados aún.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchTimeline;
