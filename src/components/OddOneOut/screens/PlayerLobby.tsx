import { motion } from 'framer-motion';
import { Player, GameSettings } from '../types';
import { Category } from '../categories';

interface Props {
  players: Player[];
  category: Category | null;
  settings: GameSettings;
  allRevealed: boolean;
  onReveal: (index: number) => void;
  onStartVoting: () => void;
  onHome: () => void;
}

export default function PlayerLobby({ players, category, settings, allRevealed, onReveal, onStartVoting, onHome }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-6 pb-32"
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onHome}
          className="text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-2">Players</h1>
      <p className="text-white/60 mb-8">Tap your name to reveal your word, then pass the device to the next player.</p>

      <div className="grid grid-cols-2 gap-4">
        {players.map((player, i) => (
          <motion.button
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => !player.hasRevealed && onReveal(i)}
            disabled={player.hasRevealed}
            className={`aspect-square rounded-3xl flex flex-col items-center justify-center gap-4 transition-all ${
              player.hasRevealed
                ? 'bg-[#1A1F3A] border border-white/10 opacity-50 cursor-not-allowed'
                : 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-2 border-cyan-400'
            }`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold ${
              player.hasRevealed ? 'bg-white/5' : 'bg-white/20'
            }`}>
              {player.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-lg">{player.name}</span>
          </motion.button>
        ))}
      </div>

      {allRevealed && (
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartVoting}
          className="fixed bottom-6 left-6 right-6 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-full py-4 font-bold text-lg shadow-2xl"
        >
          Start Voting
        </motion.button>
      )}
    </motion.div>
  );
}

