import { motion } from 'framer-motion';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export default function VotingInstructions({ onContinue, onBack }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-6 flex flex-col"
    >
      <button
        onClick={onBack}
        className="self-start text-white/70 hover:text-white transition-colors mb-8"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-4">Voting Phase</h1>
        <p className="text-white/60 text-lg mb-12">Time to discuss and vote for the imposter!</p>

        <div className="space-y-4 mb-12">
          <div className="bg-[#1A1F3A] rounded-3xl p-6 border border-white/10">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Starting Player</h3>
                <p className="text-white/60 text-sm">Player 1 starts the round</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1F3A] rounded-3xl p-6 border border-white/10">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Group Discussion</h3>
                <p className="text-white/60 text-sm">Go clockwise</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1F3A] rounded-3xl p-6 border border-white/10">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Vote Time</h3>
                <p className="text-white/60 text-sm">Each player says a word related to the secret.</p>
                <p className="text-white/60 text-sm mt-1">Go around two or three times.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1F3A] rounded-3xl p-6 border border-white/10">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold">4</div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Reveal Phase</h3>
                <p className="text-white/60 text-sm">Vote for the player you think is the imposter, then tap to reveal the results.</p>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-full py-4 font-bold text-lg shadow-2xl"
        >
          Reveal Results
        </motion.button>
      </div>
    </motion.div>
  );
}

