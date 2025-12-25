import { motion } from 'framer-motion';
import type { Player } from '../types';

interface Props {
  players: Player[];
  currentVoter: number | null;
  allVoted: boolean;
  currentRound: number;
  numImposters: number;
  onSelectVoter: (index: number) => void;
  onCastVote: (voterIndex: number, targetIndex: number) => void;
  onShowResults: () => void;
  onHome: () => void;
}

export default function VotingPhase({ players, currentVoter, allVoted, currentRound, numImposters, onSelectVoter, onCastVote, onShowResults, onHome }: Props) {
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

      <h1 className="text-4xl font-bold mb-2">Voting Phase</h1>
      <p className="text-white/60 mb-8">Round {currentRound + 1} of {numImposters}</p>

      {currentVoter === null ? (
        <div className="grid grid-cols-2 gap-4">
          {players.map((player, i) => (
            <motion.button
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !player.hasVoted && onSelectVoter(i)}
              disabled={player.hasVoted}
              className={`aspect-square rounded-3xl flex flex-col items-center justify-center gap-4 transition-all ${
                player.hasVoted
                  ? 'bg-[#1A1F3A] border border-white/10 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 border-2 border-orange-400'
              }`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold ${
                player.hasVoted ? 'bg-white/5' : 'bg-white/20'
              }`}>
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-lg">{player.name}</span>
            </motion.button>
          ))}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold text-center mb-8">{players[currentVoter].name}, vote for the imposter:</h2>
          <div className="grid grid-cols-2 gap-4">
            {players.map((player, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCastVote(currentVoter, i)}
                className="aspect-square rounded-3xl flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-2 border-purple-400"
              >
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-lg">{player.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {allVoted && (
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowResults}
          className="fixed bottom-6 left-6 right-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-full py-4 font-bold text-lg shadow-2xl"
        >
          Show Results
        </motion.button>
      )}
    </motion.div>
  );
}

