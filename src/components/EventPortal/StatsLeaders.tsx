import React, { useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Shield, Zap, TrendingUp, ChevronRight, Target } from 'lucide-react';

interface LeaderStat {
  name: string;
  value: number;
  team: string;
  discipline: string;
}

const StatsLeaders: React.FC<{ tournamentId?: string }> = ({ tournamentId }) => {
  const [leaders, setLeaders] = useState<LeaderStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId) return;

    const fetchLeaders = async () => {
      setLoading(true);
      // Logic: Aggregate 'gol' events from partidos_sucesos linked to matches of this tournament
      const { data, error } = await supabase
        .from('partidos_sucesos')
        .select(`
          jugador_nombre,
          tipo,
          equipo,
          partido:partidos_calendario!inner(torneo_id)
        `)
        .eq('partido.torneo_id', tournamentId)
        .in('tipo', ['gol', 'punto_basket', 'punto_voley']);

      if (!error && data) {
        const counts: Record<string, { count: number; team: string; type: string }> = {};
        data.forEach((event: any) => {
          const name = event.jugador_nombre;
          if (!counts[name]) counts[name] = { count: 0, team: event.equipo, type: event.tipo };
          counts[name].count++;
        });

        const sorted = Object.entries(counts)
          .map(([name, info]) => ({
            name,
            value: info.count,
            team: info.team,
            discipline: info.type === 'gol' ? 'Fútbol' : 'General'
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);

        setLeaders(sorted);
      }
      setLoading(false);
    };

    fetchLeaders();
  }, [tournamentId]);

  return (
    <div className="bg-[#0f172a]/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-full">
      {/* 1. Leaderboard Header */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
        <div className="space-y-1">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Máximos <span className="text-emerald-500 tracking-normal italic lowercase font-medium">Líderes</span>
            </h3>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Top anotadores del evento</p>
        </div>
        <Zap className="text-emerald-500/20" size={24} />
      </div>

      {/* 2. Leaders List */}
      <div className="flex-1 p-8 space-y-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {loading ? (
             <motion.div 
                key="loading"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full space-y-4 py-20"
             >
                <div className="relative w-12 h-12">
                   <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
                   <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculando Hall of Fame</p>
             </motion.div>
          ) : leaders.length > 0 ? (
            <motion.div 
               key="leaders-list"
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="space-y-6"
            >
              {leaders.map((leader, idx) => (
                <motion.div
                  key={leader.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative flex items-center gap-6 p-4 rounded-3xl transition-all duration-500 group ${
                      idx < 3 ? 'bg-white/[0.03] border border-white/5' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Position Indicator */}
                  <div className="relative group-hover:scale-110 transition-transform duration-500">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-2xl overflow-hidden ${
                          idx === 0 ? 'bg-amber-500/10 border-amber-500/30' : 
                          idx === 1 ? 'bg-slate-300/10 border-slate-300/30' :
                          idx === 2 ? 'bg-amber-700/10 border-amber-700/30' : 'bg-slate-900 border-white/10'
                      }`}>
                          <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.name}`} 
                              className="w-full h-full object-cover" 
                              alt={leader.name} 
                          />
                      </div>
                      <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border-2 ${
                          idx === 0 ? 'bg-amber-500 text-black border-slate-900' : 
                          idx === 1 ? 'bg-slate-300 text-black border-slate-900' :
                          idx === 2 ? 'bg-amber-700 text-white border-slate-900' : 'bg-slate-800 text-slate-400 border-slate-900'
                      }`}>
                          {idx + 1}
                      </div>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                      <h4 className="text-base font-black text-white italic uppercase tracking-tight truncate group-hover:text-emerald-400 transition-colors">
                          {leader.name}
                      </h4>
                      <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                              <Shield size={10} className="text-slate-500" />
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[80px]">
                                  {leader.team}
                              </span>
                          </div>
                          <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-tighter">
                              {leader.discipline}
                          </span>
                      </div>
                  </div>

                  {/* Stat Visualization */}
                  <div className="text-right flex flex-col items-end">
                      <div className="flex items-end gap-1">
                          <span className="text-3xl font-black text-white tabular-nums drop-shadow-xl">{leader.value}</span>
                          <TrendingUp size={14} className="text-emerald-400 mb-1 animate-bounce" />
                      </div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">{leader.discipline === 'Fútbol' ? 'Goles' : 'Puntos'}</p>
                  </div>

                  {/* Highlight Glow for Top 3 */}
                  {idx < 1 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.03] to-transparent pointer-events-none rounded-3xl" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-4"
            >
              <Target size={48} className="text-slate-700" />
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">No hay líderes registrados</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Footer Call to Action */}
      <div className="p-6 bg-white/[0.02] border-t border-white/5">
          <button className="w-full py-4 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-2xl flex items-center justify-center gap-3 group transition-all">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] group-hover:tracking-[0.4em] transition-all">
                  Explorar Rankings Completos
              </span>
              <ChevronRight size={14} className="text-emerald-500" />
          </button>
      </div>
    </div>
  );
};

export default StatsLeaders;
