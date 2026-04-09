import React from 'react';
import { Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LiveMatch } from '@/hooks/useLiveEvents';

interface PublicScoreboardProps {
  match: LiveMatch;
}

const PublicScoreboard: React.FC<PublicScoreboardProps> = ({ match }) => {
  const colors: Record<string, string> = {
    futbol: '#10b981',
    fútbol: '#10b981',
    basketball: '#f97316',
    baloncesto: '#f97316',
    voley: '#3b82f6',
    ecuavoley: '#3b82f6',
    futsal: '#f43f5e',
    'fútbol sala': '#f43f5e',
    natacion: '#06b6d4',
  };

  const disciplineKey = (match.discipline || 'futbol').toLowerCase();
  const accentColor = colors[disciplineKey] || '#10b981';

  return (
    <div 
      className="group relative bg-[#0f172a]/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-700 shadow-2xl"
      style={{ boxShadow: `0 30px 60px -20px ${accentColor}20` }}
    >
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Header Info: Scoreboard Style */}
      <div className="flex items-center justify-between px-8 py-4 bg-white/[0.03] border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">Live Result</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Match ID: {match.id.slice(0, 5)}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-emerald-400">
           <Zap size={14} className="animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest">{match.discipline || 'Competencia'}</span>
        </div>
      </div>

      {/* Main Scoreboard Action */}
      <div className="p-10 md:p-14 flex items-center justify-between relative overflow-hidden">
        {/* Background Decorative Activity */}
        <Activity className="absolute bottom-[-20%] right-[-5%] w-40 h-40 text-white/[0.02] -rotate-12" />

        {/* Local Team */}
        <div className="flex flex-col items-center flex-1 space-y-6">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center p-4 shadow-2xl relative"
          >
             <div className="absolute inset-0 bg-white/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
             <img 
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${match.local_name}&backgroundColor=0f172a`} 
                className="w-full h-full object-contain relative z-10" 
                alt="Local" 
             />
          </motion.div>
          <h3 className="text-sm md:text-base font-black text-white uppercase italic tracking-tighter text-center h-12 flex items-center">
            {match.local_name}
          </h3>
        </div>

        {/* Score Display (The Heart of the Shield) */}
        <div className="flex flex-col items-center px-6 md:px-12">
            <div className="flex items-center space-x-6">
                <motion.span 
                  key={`local-${match.goles_local}`}
                  initial={{ scale: 1.5, color: '#10b981' }}
                  animate={{ scale: 1, color: '#fff' }}
                  className="text-6xl md:text-8xl font-black tabular-nums tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    {match.goles_local}
                </motion.span>
                <span className="text-3xl md:text-5xl font-black text-slate-700 animate-pulse">:</span>
                <motion.span 
                  key={`visita-${match.goles_visitante}`}
                  initial={{ scale: 1.5, color: '#10b981' }}
                  animate={{ scale: 1, color: '#fff' }}
                  className="text-6xl md:text-8xl font-black tabular-nums tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    {match.goles_visitante}
                </motion.span>
            </div>
            <div className="mt-8 flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Activity size={12} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">En Progreso</span>
            </div>
        </div>

        {/* Visitor Team */}
        <div className="flex flex-col items-center flex-1 space-y-6">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center p-4 shadow-2xl relative"
          >
             <div className="absolute inset-0 bg-white/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
             <img 
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${match.visita_name}&backgroundColor=0f172a`} 
                className="w-full h-full object-contain relative z-10" 
                alt="Visita" 
             />
          </motion.div>
          <h3 className="text-sm md:text-base font-black text-white uppercase italic tracking-tighter text-center h-12 flex items-center">
            {match.visita_name}
          </h3>
        </div>
      </div>

      {/* Footer Branded Stats Only */}
      <div className="py-4 bg-white/[0.02] border-t border-white/5 flex justify-center items-center space-x-8">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
            DATOS SUMINISTRADOS POR <span className="text-slate-300">SSEDEE MONITOR</span>
          </p>
      </div>
    </div>
  );
};

export default PublicScoreboard;
