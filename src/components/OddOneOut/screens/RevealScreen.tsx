import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../types';
import { Category } from '../categories';

interface Props {
  player: Player;
  category: Category | null;
  showHint: boolean;
  showCategory: boolean;
  revealActive: boolean;
  onRevealClick: () => void;
  onNext: () => void;
}

export default function RevealScreen({ player, category, showHint, showCategory, revealActive, onRevealClick, onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      <button
        onClick={onNext}
        className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="max-w-md w-full">
        <p className="text-center text-white/60 mb-2">The word for {player.name}</p>
        {showCategory && category && (
          <h2 className="text-center text-3xl font-bold mb-12">Category: {category.name}</h2>
        )}

        <div className="relative w-full aspect-square mb-8">
          <AnimatePresence>
            {!revealActive && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onRevealClick}
                className="absolute inset-0 rounded-3xl overflow-hidden"
              >
                {/* Animated starry background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                  {[...Array(50)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-3">👆</div>
                    <span className="text-xl font-bold text-cyan-400">Tap the box to reveal</span>
                  </div>
                </div>
              </motion.button>
            )}
          </AnimatePresence>

          {revealActive && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute inset-0 rounded-3xl p-8 flex flex-col items-center justify-center text-center ${
                player.isImposter
                  ? 'bg-gradient-to-br from-red-600 to-pink-600 border-4 border-red-400'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600 border-4 border-cyan-400'
              }`}
            >
              {player.isImposter ? (
                <>
                  <div className="text-6xl mb-6">🎭</div>
                  <h3 className="text-4xl font-bold mb-4">Imposter</h3>
                  {showHint && category?.hint && (
                    <p className="text-lg opacity-90">Hint: {category.hint}</p>
                  )}
                </>
              ) : (
                <>
                  <div className="text-6xl mb-6">✨</div>
                  <h3 className="text-5xl font-bold">{player.word}</h3>
                </>
              )}
            </motion.div>
          )}
        </div>

        {revealActive && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full py-4 font-bold text-lg"
          >
            Got it!
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

