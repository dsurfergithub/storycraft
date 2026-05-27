import { Award, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { MilestoneResponse } from '../types';

interface MilestoneOverlayProps {
  milestone: MilestoneResponse;
  onClose: () => void;
}

export default function MilestoneOverlay({ milestone, onClose }: MilestoneOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-5">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-sm bg-[#1A1C23] rounded-3xl border-2 border-[#FF6B35]/40 px-6 py-8 text-center relative overflow-hidden shadow-2xl"
      >
        {/* Abstract background blobs */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#FF6B35]/5 rounded-full blur-3xl -ml-16 -mt-16" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#FFD166]/5 rounded-full blur-3xl -mr-16 -mb-16" />

        {/* Big Celebration icon */}
        <div className="w-16 h-16 rounded-full bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 mx-auto flex items-center justify-center mb-6 relative shadow-lg shadow-[#FF6B35]/5">
          <Award size={32} />
          <div className="absolute -top-1 -right-1 text-lg">{milestone.celebration || '🏆'}</div>
        </div>

        {/* Milestone badge */}
        <span className="px-3 py-1 bg-[#FFD166]/15 border border-[#FFD166]/30 text-[#FFD166] text-[10px] font-mono font-bold tracking-widest rounded-full uppercase">
          ¡NUEVO LOGRO ADQUIRIDO!
        </span>

        {/* Motivating message (strictly max 12 words) */}
        <h2 className="font-display font-black text-white text-xl md:text-2xl mt-4 mb-3 tracking-tight leading-snug">
          {milestone.message}
        </h2>

        {/* Unlocked reward */}
        <div className="p-3 bg-[#21242D] rounded-2xl border border-[#2D313D] text-xs text-[#E0E0E6] flex items-center gap-2 mb-6">
          <Zap size={14} className="text-[#FFD166] shrink-0" />
          <p className="text-left leading-normal font-mono">
            Desbloqueado: <span className="font-bold text-white uppercase text-[10px]">{milestone.unlock}</span>
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full py-4 bg-[#FF6B35] hover:brightness-110 active:scale-[0.98] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-[#FF6B35]/20 font-sans"
        >
          Impulsar mi talento
        </button>
      </motion.div>
    </div>
  );
}
