import { motion } from 'framer-motion';
import type { Player } from '../types';

interface Props {
  players: Player[];
  result: { voteCounts: Record<number, number>; accused: number; isImposter: boolean };
  onPlayAgain: () => void;
  onHome: () => void;
}

export default function FinalScreen({ players, result, onPlayAgain, onHome }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      <button
        onClick={onHome}
        className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="max-w-2xl w-full">
        <h1 className="text-5xl font-bold mb-12 text-center">Game Over!</h1>
        
        <div className="bg-[#1A1F3A] rounded-3xl p-12 mb-8 border border-white/10">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {players[result.accused].name} was...
          </h2>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className={`text-center ${
              result.isImposter ? 'text-red-400' : 'text-green-400'
            }`}
          >
            <div className="text-8xl mb-4">
              {result.isImposter ? '🎭' : '✨'}
            </div>
            <div className="text-4xl font-bold">
              {result.isImposter ? 'IMPOSTER!' : 'INNOCENT!'}
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full py-4 font-bold text-lg shadow-2xl"
          >
            Play Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onHome}
            className="w-full bg-white/10 hover:bg-white/20 rounded-full py-4 font-semibold text-lg"
          >
            Return to Home
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

