import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';

export default function BatScene() {
  // Pull current levels (1 through 5) from Zustand store
  const { empireLevel, machineLevel, bodyLevel } = useStore();

  return (
    <div className="relative w-full h-[400px] bg-black overflow-hidden rounded-xl border border-gray-800 shadow-2xl">
      
      {/* LAYER 1: THE EMPIRE (Background) */}
      <AnimatePresence mode="wait">
        <motion.img 
          key={`empire-${empireLevel}`}
          src={`/assets/empire/level-${empireLevel}.jpg`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      </AnimatePresence>

      {/* LAYER 2: THE MACHINE (Midground - Batmobile) */}
      <AnimatePresence mode="wait">
        <motion.img 
          key={`machine-${machineLevel}`}
          src={`/assets/machine/level-${machineLevel}.png`}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute bottom-4 left-10 w-2/3 object-contain z-10 drop-shadow-2xl"
        />
      </AnimatePresence>

      {/* LAYER 3: THE BODY (Foreground - Batman) */}
      <AnimatePresence mode="wait">
        <motion.img 
          key={`body-${bodyLevel}`}
          src={`/assets/body/level-${bodyLevel}.png`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute bottom-0 right-10 h-[90%] object-contain z-20 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
        />
      </AnimatePresence>

      {/* FOREGROUND OVERLAY: Fog / Rain effects for blending */}
      <div className="absolute inset-0 z-30 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none"></div>
    </div>
  );
}