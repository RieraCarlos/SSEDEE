import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Trophy, Globe, Shield, Zap, Sparkles } from 'lucide-react';
// Portal Components
import { useLiveEvents } from '@/hooks/useLiveEvents';
import EventHero from '@/components/EventPortal/EventHero';
import LiveMonitor from '@/components/EventPortal/LiveMonitor';
import DisciplineDirectory from '@/components/EventPortal/DisciplineDirectory';
import MatchTimeline from '@/components/EventPortal/MatchTimeline';
import StatsLeaders from '@/components/EventPortal/StatsLeaders';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Animation Variants (Premium Tech Aesthetic)
 */
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: { duration: 0.4, ease: "easeIn" }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

import { useParams, useNavigate } from 'react-router-dom';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, Calendar } from 'lucide-react';

// Reusable Collapsible Section for the Portal
const PortalSection: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, subtitle, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-4"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            {icon}
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
              {title.split(' ')[0]} <span className="text-emerald-500">{title.split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{subtitle}</p>
          </div>
        </div>

        <Collapsible.Trigger asChild>
          <Button
            variant="ghost"
            className="group flex items-center gap-3 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-2xl px-6 py-8 transition-all duration-500"
          >
            <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-400 uppercase tracking-widest">
              {isOpen ? 'Contraer' : 'Expandir'}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <ChevronDown className="w-5 h-5 text-emerald-500" />
            </motion.div>
          </Button>
        </Collapsible.Trigger>
      </div>

      <Collapsible.Content className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-500">
        <motion.div
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
          className="pt-12"
        >
          {children}
        </motion.div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

// Mapeo dinámico de eventos por slug (Mantenido fuera para estabilidad de referencias)
const EVENT_CONFIGS: Record<string, string[]> = {
  distrito: [
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_1,
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_2,
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_3,
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_4,
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_Anos_Dorados,
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_1F,
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_2F,
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_3F,
    import.meta.env.VITE_ID_TOURNAMENT_Prueba_1
  ].filter(id => id && !id.includes('placeholder')),
  futsal: [
    import.meta.env.VITE_ID_SPORT_FUTSAL
  ]
};

export default function Eventos() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();



  // El modo portada se activa si existe un slug válido
  const activeSlug = slug?.toLowerCase();
  const isPortadaOpen = !!activeSlug && !!EVENT_CONFIGS[activeSlug];

  // IDs para el contenido del portal (fallback a distrito)
  const DISTRITO_IDS = EVENT_CONFIGS[activeSlug || 'distrito'] || EVENT_CONFIGS['distrito'];
  const DISTRITO_ID = DISTRITO_IDS[0];


  const { activeMatches } = useLiveEvents(DISTRITO_IDS);


  return (
    <div className="min-h-screen bg-[#07080a] text-white flex flex-col font-sans selection:bg-emerald-500/30">
      <main className="flex-1 relative">
        {/* Ambient Global Glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-[10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[140px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
        </div>

        <AnimatePresence mode="wait">
          {!isPortadaOpen ? (
            // --- VISTA 1: SELECTOR DE ACCESO PREMIUM ---
            <motion.div
              key="selector"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="min-h-[80vh] flex items-center justify-center p-4 md:p-8"
            >
              <div className="w-full max-w-5xl relative">
                {/* Exterior Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

                <Card className="bg-[#0f172a]/40 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl relative rounded-[2.5rem]">
                  {/* Glass Top Border Highlight */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center">

                      {/* Left Visual Section */}
                      <motion.div
                        variants={itemVariants}
                        className="md:col-span-5  p-12 flex items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-white/5"
                      >
                        <div className="relative group">
                          <div className="absolute inset-0 blur-3xl rounded-full scale-150 animate-pulse" />
                          <div className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/40 p-10 rounded-[2.5rem] rotate-12 group-hover:rotate-0 transition-all duration-700 relative z-10 shadow-2xl">
                            <Trophy className="w-20 h-20 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                          </div>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-6 -right-6 text-emerald-400/30"
                          >
                            <Sparkles size={48} />
                          </motion.div>
                        </div>
                      </motion.div>

                      {/* Right Content Section */}
                      <div className="md:col-span-7 p-10 md:p-16 space-y-8 text-left">
                        {/* Text Hierarchy */}
                        <motion.div variants={itemVariants} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-px w-8 bg-emerald-500/50" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Portal Oficial</span>
                          </div>
                          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.85]">
                            Distrito <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
                              Partidos
                            </span>
                          </h1>
                          <p className="text-slate-400 font-medium text-sm md:text-lg max-w-md leading-relaxed">
                            Explora la información de la portada, cronogramas oficiales y estadísticas del gran evento institucional.
                          </p>
                        </motion.div>

                        {/* Interactive Badges & Action */}
                        <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center gap-6 pt-4">
                          <Button
                            onClick={() => navigate('/evento/distrito')}
                            className="group relative px-10 py-7 bg-white hover:bg-emerald-500 text-black font-black uppercase tracking-[0.2em] italic text-xs rounded-2xl transition-all duration-500 shadow-xl hover:shadow-emerald-500/40 overflow-hidden"
                          >
                            <span className="relative z-10 flex items-center">
                              <Globe className="mr-3 w-4 h-4 group-hover:rotate-180 transition-transform duration-1000" />
                              Ingresar a la Portada
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Button>

                          <div className="flex gap-2">
                            <div className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-4 py-2.5 rounded-xl border border-emerald-500/10">
                              <Zap size={12} /> Live Sync
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/5 px-4 py-2.5 rounded-xl border border-blue-500/10">
                              <Shield size={12} /> Global
                            </div>
                          </div>
                        </motion.div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            // --- VISTA 2: PORTADA INTEGRADA REFINADA ---
            <motion.div
              key="portada"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="min-h-screen"
            >


              <main>
                {/* 1. BRANDING & HERO */}
                <EventHero tournamentId={DISTRITO_ID} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-32">

                  {/* 2. LIVE MONITOR */}
                  <AnimatePresence>
                    {activeMatches.length > 0 && (
                      <PortalSection
                        title="En Vivo"
                        subtitle="Monitor de encuentros actuales"
                        icon={<Zap size={32} className="animate-pulse" />}
                      >
                        <LiveMonitor matches={activeMatches} />
                      </PortalSection>
                    )}
                  </AnimatePresence>

                  {/* 3. DIRECTORY (Teams Gallery) */}
                  <PortalSection
                    title="Directorio Deportivo"
                    subtitle="Explora los clubes por disciplina"
                    icon={<Globe size={32} />}
                  >
                    <DisciplineDirectory />
                  </PortalSection>

                  {/* 4. SCHEDULE / TIMELINE */}
                  <PortalSection
                    title="Cronograma Oficial"
                    subtitle="Calendario unificado por deportes"
                    icon={<Calendar size={32} />}
                  >
                    <MatchTimeline tournamentId={DISTRITO_IDS} />
                  </PortalSection>

                  {/* 5. STATS & LEADERS */}
                  <PortalSection
                    title="Líderes de Estadísticas"
                    subtitle="Máximos anotadores del evento"
                    icon={<Trophy size={32} />}
                  >
                    <StatsLeaders tournamentId={DISTRITO_ID} />
                  </PortalSection>

                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
