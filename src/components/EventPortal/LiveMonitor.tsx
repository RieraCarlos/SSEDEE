import React from 'react';
import { motion } from 'framer-motion';
import PublicScoreboard from './PublicScoreboard';
import type { LiveMatch } from '@/hooks/useLiveEvents';

interface LiveMonitorProps {
  matches: LiveMatch[];
}

const LiveMonitor: React.FC<LiveMonitorProps> = ({ matches }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {matches.map((match) => (
        <motion.div
          key={match.id}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <PublicScoreboard match={match} />
        </motion.div>
      ))}
    </div>
  );
};

export default LiveMonitor;
