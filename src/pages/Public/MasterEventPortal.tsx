import React from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveEvents } from '@/hooks/useLiveEvents';
import EventHero from '@/components/EventPortal/EventHero';
import LiveMonitor from '@/components/EventPortal/LiveMonitor';
import DisciplineDirectory from '@/components/EventPortal/DisciplineDirectory';
import MatchTimeline from '@/components/EventPortal/MatchTimeline';
import StatsLeaders from '@/components/EventPortal/StatsLeaders';

/**
 * MasterEventPortal (Senior Architecture)
 * The public-facing information hub for a sports event.
 */
const MasterEventPortal: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { activeMatches, loading } = useLiveEvents(tournamentId);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full" />
      </div>

      <main className="relative z-10">
        {/* 1. BRANDING & HERO */}
        <EventHero tournamentId={tournamentId} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
          
          {/* 2. LIVE MONITOR (Dynamic Visibility) */}
          <AnimatePresence>
            {activeMatches.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-white uppercase letter">En Vivo Ahora</h2>
                </div>
                <LiveMonitor matches={activeMatches} />
              </motion.section>
            )}
          </AnimatePresence>

          {/* 3. DISCIPLINE DIRECTORY & STATS */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <DisciplineDirectory tournamentId={tournamentId} />
            </div>
            <div className="space-y-8">
              <StatsLeaders tournamentId={tournamentId} />
            </div>
          </section>

          {/* 4. SCHEDULE & TIMELINE */}
          <section>
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white italic">CRONOGRAMA DE EVENTOS</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-emerald-400 mt-2 rounded-full" />
            </div>
            <MatchTimeline tournamentId={tournamentId} />
          </section>
        </div>
      </main>

      {/* 5. WHITE LABEL FOOTER */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-900/50 backdrop-blur-md py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex flex-col items-center space-y-4">
                <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
                    POWERED BY <span className="text-emerald-400">SSEDEE.COM</span>
                </p>
                <p className="text-slate-500 text-xs">
                    © {new Date().getFullYear()} Sistema de Seguimiento y Entretenimiento Deportivo en Ecuador.
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default MasterEventPortal;
