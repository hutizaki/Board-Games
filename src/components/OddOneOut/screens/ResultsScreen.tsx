import { motion } from 'framer-motion';
import { Player } from '../types';

interface Props {
  players: Player[];
  result: { voteCounts: Record<number, number>; accused: number; isImposter: boolean };
  onReveal: () => void;
  onHome: () => void;
}

export default function ResultsScreen({ players, result, onReveal, onHome }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
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
        <h1 className="text-4xl font-bold mb-12 text-center">Voting Complete!</h1>
        
        <div className="bg-[#1A1F3A] rounded-3xl p-8 mb-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-6">Results</h2>
          {Object.entries(result.voteCounts).map(([index, count]) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{players[Number(index)].name}</span>
                <span className="text-white/60">{String(count)} votes</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(Number(count) / players.length) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReveal}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full py-4 font-bold text-lg shadow-2xl"
        >
          Reveal Result!
        </motion.button>
      </div>
    </motion.div>
  );
}

