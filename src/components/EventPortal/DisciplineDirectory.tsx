import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Shield, Zap, Target } from 'lucide-react';

// Redux
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchSportTeams } from '@/store/thunks/tournamentsThunks';
import { selectTournamentTeams, selectTeamsLoading } from '@/store/slices/tournamentsSlice';

interface Team {
  id: string;
  name: string;
  logo_url?: string;
  discipline?: string;
}

const DisciplineDirectory: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<string>('');
  
  // Selectores de Redux
  const reduxTeams = useAppSelector(selectTournamentTeams);
  const loading = useAppSelector(selectTeamsLoading);

  const env = import.meta.env as Record<string, string>;
  const availableDisciplines = React.useMemo(
    () => [
      { id: 'futbol', name: 'Fútbol', icon: '⚽', envKey: 'VITE_ID_SPORT_FUTBOL', sportId: env.VITE_ID_SPORT_FUTBOL },
      { id: 'futsal', name: 'Fútbol Sala', icon: '👟', envKey: 'VITE_ID_SPORT_FUTSAL', sportId: env.VITE_ID_SPORT_FUTSAL },
      { id: 'basketball', name: 'Basketball', icon: '🏀', envKey: 'VITE_ID_SPORT_BASKETBALL', sportId: env.VITE_ID_SPORT_BASKETBALL },
      { id: 'voley', name: 'Voley', icon: '🏐', envKey: 'VITE_ID_SPORT_VOLEY', sportId: env.VITE_ID_SPORT_VOLEY },
      { id: 'natacion', name: 'Natación', icon: '🏊', envKey: 'VITE_ID_SPORT_NATACION', sportId: env.VITE_ID_SPORT_NATACION }
    ].filter(d => d.sportId && !d.sportId.includes('placeholder')),
    [
      env.VITE_ID_SPORT_FUTBOL,
      env.VITE_ID_SPORT_FUTSAL,
      env.VITE_ID_SPORT_BASKETBALL,
      env.VITE_ID_SPORT_VOLEY,
      env.VITE_ID_SPORT_NATACION
    ]
  );

  useEffect(() => {
    if (availableDisciplines.length === 0) return;
    if (!activeTab || !availableDisciplines.some(d => d.id === activeTab)) {
      setActiveTab(availableDisciplines[0].id);
    }
  }, [activeTab, availableDisciplines]);

  const selectedDiscipline = availableDisciplines.find(d => d.id === activeTab) || availableDisciplines[0];

  useEffect(() => {
    if (!selectedDiscipline?.sportId) return;
    dispatch(fetchSportTeams(selectedDiscipline.sportId));
  }, [selectedDiscipline, dispatch]);

  // Formatear los equipos obtenidos de Redux para la UI
  const teams: Team[] = reduxTeams.map((club: any) => ({
    id: club.id,
    name: club.name || 'Club Desconocido',
    discipline: selectedDiscipline?.name || activeTab.toUpperCase(),
    logo_url: club.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${club.id}&backgroundColor=0f172a`
  }));

  return (
    <div className="space-y-12">
      {/* 1. Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#0ae98a]/10 pb-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Disciplinas y <span className="text-[#0ae98a]">Equipos</span>
          </h2>
        </div>

        <div className="flex items-center space-x-2 p-1.5 bg-[#1d2029]/50 backdrop-blur-md rounded-2xl border border-[#0ae98a]/10 overflow-x-auto">
          {availableDisciplines.length > 0 ? availableDisciplines.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveTab(d.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${activeTab === d.id
                ? 'bg-[#0ae98a] text-[#13161c] shadow-lg shadow-[#0ae98a]/30'
                : 'text-white/60 hover:text-white hover:bg-[#0ae98a]/10'
                }`}
            >
              <span className="text-sm">{d.icon}</span>
              {d.name}
            </button>
          )) : (
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">No hay disciplinas habilitadas en el entorno.</span>
          )}
        </div>
      </div>

      {/* 2. Teams Gallery Grid */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-[#1d2029]/50 animate-pulse rounded-[2rem] border border-[#0ae98a]/10" />
              ))}
            </motion.div>
          ) : teams.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6 overflow-x-auto md:overflow-x-visible flex md:flex-none snap-x snap-mandatory scrollbar-hide"
            >
              {teams.map((team, idx) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-[#1d2029]/40 backdrop-blur-2xl border border-[#0ae98a]/10 rounded-[2.5rem] p-8 hover:border-[#0ae98a]/30 transition-all duration-500 overflow-hidden flex-shrink-0 w-full md:w-auto snap-center"
                >
                  {/* Decorative background glow */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#0ae98a]/5 blur-3xl rounded-full group-hover:bg-[#0ae98a]/10 transition-colors" />

                  <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#0ae98a]/20 blur-2xl rounded-full scale-0 group-hover:scale-110 transition-transform duration-700" />
                      <div className="w-24 h-24 bg-[#13161c] border border-[#0ae98a]/10 rounded-3xl flex items-center justify-center p-4 shadow-2xl relative z-10">
                        <Shield className="absolute w-12 h-12 text-white/5" />
                        <img src={team.logo_url} className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" alt={team.name} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white font-black uppercase italic tracking-tighter text-lg leading-tight group-hover:text-[#0ae98a] transition-colors">
                        {team.name}
                      </h4>
                      <div className="flex items-center justify-center gap-2">
                        <Zap size={10} className="text-[#0ae98a]" />
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">{team.discipline}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 space-y-4"
            >
              <Target size={48} className="text-white/40" />
              <p className="text-white/60 text-xs font-black uppercase tracking-[0.3em]">No hay equipos disponibles en esta disciplina</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Global Stats Indicator */}
      <div className="bg-[#0ae98a]/5 border border-[#0ae98a]/10 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#0ae98a]/20 rounded-2xl">
            <Trophy className="text-[#0ae98a]" size={32} />
          </div>
          <div>
            <h5 className="text-white font-black uppercase italic text-xl">Competencia de Élite</h5>
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Todos los equipos están validados por el sistema SSEDEE</p>
          </div>
        </div>
        <div className="flex -space-x-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#13161c] bg-[#1d2029] flex items-center justify-center overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=team${i}`} alt="Avatar" />
            </div>
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-[#13161c] bg-[#0ae98a] flex items-center justify-center text-[10px] font-black text-[#13161c]">
            +12
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisciplineDirectory;
