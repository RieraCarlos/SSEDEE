import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicScoreboard from './PublicScoreboard';
import type { LiveMatch } from '@/hooks/useLiveEvents';

interface LiveMonitorProps {
  matches: LiveMatch[];
}

const LiveMonitor: React.FC<LiveMonitorProps> = ({ matches }) => {
  // Siempre en una sola columna según solicitud del usuario
  const gridCols = "grid-cols-1";

  return (
    <div className={`grid ${gridCols} gap-8 lg:gap-16 transition-all duration-500`}>
      <AnimatePresence mode="popLayout">
        {matches.map((match) => (
          <motion.div
            key={match.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 30,
              mass: 1
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <PublicScoreboard match={match} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LiveMonitor;
