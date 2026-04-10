import React from 'react';
import { Activity, Zap, ShieldAlert, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Helpers for displaying periods
  const getPeriodLabel = (p?: number) => {
    if (!p) return 'En Progreso';
    if (p === 1) return '1er Tiempo';
    if (p === 2) return '2do Tiempo';
    if (p === 3) return 'Tiempo Extra';
    return `${p}º Periodo`;
  };

  return (
    <div 
      className="group relative bg-[#0f172a]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden transition-all duration-700 shadow-2xl hover:border-white/20"
      style={{ boxShadow: `0 30px 100px -20px ${accentColor}15` }}
    >
      {/* Premium Glass Top Highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* 1. Header: Meta Info & Status */}
      <div className="flex items-center justify-between px-6 md:px-10 py-5 bg-white/[0.04] border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500">Live Result</span>
          </div>
          <div className="hidden md:block h-3 w-px bg-white/10" />
          <div className="hidden md:flex items-center gap-2 text-slate-500 font-bold text-[9px] uppercase tracking-widest">
             <Timer size={10} />
             {getPeriodLabel(match.periodo)}
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
           <Zap size={12} style={{ color: accentColor }} className="animate-pulse" />
           <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-300">
             {match.discipline || 'Competencia'}
           </span>
        </div>
      </div>

      {/* 2. Main Scoreboard: The Duel */}
      <div className="relative p-8 md:p-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-0 relative z-10">
        
        {/* Mobile Period Indicator (Mobile Only) */}
        <div className="md:hidden flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-2">
            <Timer size={12} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {getPeriodLabel(match.periodo)}
            </span>
        </div>

        {/* --- LOCAL TEAM --- */}
        <div className="flex flex-col items-center flex-1 w-full md:w-auto order-1 md:order-1">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 md:w-32 md:h-32 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-[2rem] flex items-center justify-center p-5 shadow-2xl relative group/logo"
          >
             <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity" />
             <img 
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${match.local_name}&backgroundColor=0f172a`} 
                className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" 
                alt="Local" 
             />
          </motion.div>
          
          <div className="mt-6 text-center">
            <h3 className="text-lg md:text-2xl xl:text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
              {match.local_name}
            </h3>

            {/* Local Stats Breakdown */}
            <div className="flex items-center justify-center gap-3">
              {/* Tarjetas Amarillas */}
              {match.amarillas_local !== undefined && (
                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-lg">
                  <div className="w-2 h-3 bg-yellow-400 rounded-sm shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                  <span className="text-[10px] font-black text-yellow-400">{match.amarillas_local}</span>
                </div>
              )}
              {/* Tarjetas Rojas */}
              {match.rojas_local !== undefined && (
                <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg">
                  <div className="w-2 h-3 bg-rose-500 rounded-sm shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  <span className="text-[10px] font-black text-rose-400">{match.rojas_local}</span>
                </div>
              )}
              {/* Faltas */}
              {match.faltas_local !== undefined && (
                <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">
                  <ShieldAlert size={12} className="text-blue-400" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">F: {match.faltas_local}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- CENTRAL SCORE --- */}
        <div className="flex flex-col items-center px-4 md:px-16 order-2 md:order-2">
            <div className="flex items-center gap-6 md:gap-10">
                <AnimatePresence mode="popLayout">
                    <motion.span 
                      key={`local-${match.goles_local}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-6xl md:text-8xl font-black tabular-nums tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                    >
                        {match.goles_local}
                    </motion.span>
                </AnimatePresence>
                
                <span className="text-3xl md:text-6xl font-black text-white/10 animate-pulse">:</span>
                
                <AnimatePresence mode="popLayout">
                    <motion.span 
                      key={`visita-${match.goles_visitante}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-6xl md:text-8xl font-black tabular-nums tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                    >
                        {match.goles_visitante}
                    </motion.span>
                </AnimatePresence>
            </div>
            
            <div className="mt-4 md:mt-2 flex items-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-lg shadow-emerald-500/5">
                <Activity size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Match Action</span>
            </div>
        </div>

        {/* --- VISITOR TEAM --- */}
        <div className="flex flex-col items-center flex-1 w-full md:w-auto order-3 md:order-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 md:w-32 md:h-32 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-[2rem] flex items-center justify-center p-5 shadow-2xl relative group/logo"
          >
             <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity" />
             <img 
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${match.visita_name}&backgroundColor=0f172a`} 
                className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" 
                alt="Visita" 
             />
          </motion.div>
          
          <div className="mt-6 text-center">
            <h3 className="text-lg md:text-2xl xl:text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
              {match.visita_name}
            </h3>

            {/* Visitor Stats Breakdown */}
            <div className="flex items-center justify-center gap-3">
              {/* Tarjetas Amarillas */}
              {match.amarillas_visita !== undefined && (
                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-lg">
                  <div className="w-2 h-3 bg-yellow-400 rounded-sm shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                  <span className="text-[10px] font-black text-yellow-400">{match.amarillas_visita}</span>
                </div>
              )}
              {/* Tarjetas Rojas */}
              {match.rojas_visita !== undefined && (
                <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg">
                  <div className="w-2 h-3 bg-rose-500 rounded-sm shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  <span className="text-[10px] font-black text-rose-400">{match.rojas_visita}</span>
                </div>
              )}
              {/* Faltas */}
              {match.faltas_visita !== undefined && (
                <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">
                  <ShieldAlert size={12} className="text-blue-400" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">F: {match.faltas_visita}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        </div>

        {/* Ambient Activity Icon (Background Decoration) */}
        <Activity className="absolute bottom-[-10%] right-[-5%] w-64 h-64 text-white/[0.01] -rotate-12 pointer-events-none" />
      </div>

      {/* 3. Footer: Institutional Branding */}
      <div className="py-5 bg-white/[0.03] border-t border-white/5 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-white/10" />
            <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
              Suministro de Datos: <span className="text-slate-300">SSEDEE Monitor</span>
            </p>
            <div className="h-px w-8 bg-white/10" />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">
              Real-time Sync Active
            </p>
          </div>
      </div>
    </div>
  );
};

export default PublicScoreboard;
