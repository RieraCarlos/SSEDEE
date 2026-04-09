import React, { useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface EventMeta {
  name: string;
  description?: string;
  banner_url?: string;
  logo_url?: string;
}

const EventHero: React.FC<{ tournamentId?: string }> = ({ tournamentId }) => {
  const [meta, setMeta] = useState<EventMeta | null>(null);

  useEffect(() => {
    if (!tournamentId) return;
    const fetchMeta = async () => {
      const { data, error } = await supabase
        .from('torneos')
        .select('name')
        .eq('id', tournamentId)
        .single();

      if (!error && data) {
        setMeta(data as any);
      }
    };
    fetchMeta();
  }, [tournamentId]);

  const displayName = meta?.name || "Distrito de Lago Agrio";
  const displayDesc = meta?.description || "Vive la pasión del deporte en tiempo real con la tecnología y el respaldo de SSEDEE.";

  return (
    <div className="relative h-[500px] w-full flex items-center justify-center overflow-hidden ">
      {/* Background Layer with Depth */}
      <div className="absolute inset-0 z-0">
        {meta?.banner_url && meta.banner_url !== "" ? (
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 1.5 }}
            src={meta.banner_url}
            alt="Event Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-transparent to-transparent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#0f172a] to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,8,10,0.8)_100%)]" />
      </div>

      <div className="relative z-10 max-w-5xl px-4 text-center space-y-8">
        {/* Sponsorship & Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="flex items-center space-x-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-white text-[10px] font-black tracking-[0.3em] uppercase">
              Evento Oficial <span className="text-emerald-400">Distrito</span>
            </p>
          </div>
        </motion.div>

        {/* Corporate Image / Logo Slot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-125" />
          {meta?.logo_url ? (
            <img src={meta.logo_url} className="h-28 md:h-36 w-auto relative z-10 object-contain drop-shadow-2xl" alt="Logo Corporativo" />
          ) : (
            <div className="bg-slate-900 border-2 border-emerald-500/50 p-6 rounded-[2.5rem] relative z-10">
              <Trophy className="h-16 w-16 md:h-20 md:w-20 text-emerald-500" />
            </div>
          )}
        </motion.div>

        {/* Main Presentation Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.85]">
            {displayName}
          </h1>
          <p className="text-slate-300 text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed opacity-80 mt-4 px-8">
            {displayDesc}
          </p>
        </motion.div>

        {/* Sponsorship Signature */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5 }}
          className="pt-6"
        >
          <p className="text-[10px] font-black text-slate-500 tracking-[0.5em] uppercase flex items-center justify-center gap-4">
            Patrocinio oficial por
            <a href="https://ssedee.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-white transition-colors">ssedee.com</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EventHero;
