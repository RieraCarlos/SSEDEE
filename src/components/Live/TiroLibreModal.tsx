import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TiroLibreModalProps {
  isOpen: boolean;
  teamName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

const TiroLibreModal: React.FC<TiroLibreModalProps> = ({ 
  isOpen, 
  teamName, 
  onConfirm, 
  isLoading 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-[#1d2029] border-2 border-amber-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20">
                <AlertTriangle className="w-10 h-10 text-amber-500 animate-pulse" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase mb-4">
                ⚠️ Límite de Faltas
              </h2>
              
              <p className="text-gray-400 text-sm md:text-md mb-8 leading-relaxed">
                El equipo <span className="text-amber-400 font-bold">{teamName}</span> ha alcanzado su <span className="text-white font-black underline">6ta falta acumulada</span> en este tiempo.
                <br /><br />
                Por favor, otorga el <span className="text-amber-400 font-bold uppercase">Tiro Libre Directo</span> antes de continuar.
              </p>
              
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-2xl bg-amber-500 px-8 py-4 font-black italic tracking-tighter text-black transition-all hover:bg-amber-400 active:scale-95 disabled:opacity-50"
              >
                <div className="relative z-10 flex items-center justify-center gap-2 uppercase">
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Confirmar Tiro Libre
                    </>
                  )}
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TiroLibreModal;
