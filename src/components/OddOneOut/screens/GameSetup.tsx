import { useState } from 'react';
import { motion } from 'framer-motion';
import { Category } from '../categories';
import { GameSettings } from '../types';

interface Props {
  category: Category;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onStartGame: (playerNames: string[]) => void;
  onBack: () => void;
  onHome: () => void;
}

export default function GameSetup({ category, settings, onUpdateSettings, onStartGame, onBack, onHome }: Props) {
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array(settings.numPlayers).fill('').map((_, i) => `Player ${i + 1}`)
  );

  const updatePlayerCount = (count: number) => {
    const newSettings = { ...settings, numPlayers: count };
    if (newSettings.numImposters > Math.floor(count / 2)) {
      newSettings.numImposters = Math.floor(count / 2);
    }
    onUpdateSettings(newSettings);
    
    const newNames = Array(count).fill('').map((_, i) => 
      playerNames[i] || `Player ${i + 1}`
    );
    setPlayerNames(newNames);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-6 pb-32"
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onHome}
          className="text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-2">Game Settings</h1>

      {/* Player and Imposter Count */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1A1F3A] rounded-3xl p-6 border border-white/10">
          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <p className="text-white/60 text-sm mb-2">How many players?</p>
          <div className="text-4xl font-bold">{settings.numPlayers}</div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => updatePlayerCount(Math.max(3, settings.numPlayers - 1))}
              className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-2 transition-colors"
            >
              −
            </button>
            <button
              onClick={() => updatePlayerCount(Math.min(20, settings.numPlayers + 1))}
              className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-2 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-[#1A1F3A] rounded-3xl p-6 border border-white/10">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-white/60 text-sm mb-2">How many imposters?</p>
          <div className="text-4xl font-bold">{settings.numImposters}</div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onUpdateSettings({ ...settings, numImposters: Math.max(1, settings.numImposters - 1) })}
              className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-2 transition-colors"
            >
              −
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, numImposters: Math.min(Math.floor(settings.numPlayers / 2), settings.numImposters + 1) })}
              className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-2 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Game Mode - Always Word Game */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <h3 className="text-lg font-bold text-white/80">Game Mode</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500 rounded-3xl p-6">
            <div className="text-3xl mb-3">Tt</div>
            <h4 className="font-bold mb-1 text-purple-300">Word Game</h4>
            <p className="text-xs text-white/60">Find who doesn't know the secret word</p>
          </div>
          <div className="bg-[#1A1F3A] border border-white/10 rounded-3xl p-6 opacity-50">
            <div className="text-3xl mb-3">?</div>
            <h4 className="font-bold mb-1">Question Game</h4>
            <p className="text-xs text-white/60">Find who got a different question</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          <h3 className="text-lg font-bold text-white/80">Categories</h3>
        </div>
        
        <div className="bg-[#1A1F3A] rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{category.name}</span>
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Show Category to Imposter</span>
              </div>
              <button
                onClick={() => onUpdateSettings({ ...settings, showCategory: !settings.showCategory })}
                className={`w-12 h-7 rounded-full transition-colors ${settings.showCategory ? 'bg-purple-500' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.showCategory ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Show Hint to Imposter</span>
              </div>
              <button
                onClick={() => onUpdateSettings({ ...settings, showHint: !settings.showHint })}
                className={`w-12 h-7 rounded-full transition-colors ${settings.showHint ? 'bg-purple-500' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.showHint ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Start Game Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onStartGame(playerNames)}
        className="fixed bottom-6 left-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full py-4 font-bold text-lg shadow-2xl transition-all"
      >
        Start Game
      </motion.button>
    </motion.div>
  );
}

