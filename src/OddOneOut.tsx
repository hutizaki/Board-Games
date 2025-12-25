import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

type GameState = 'category' | 'setup' | 'lobby' | 'reveal' | 'voting' | 'results' | 'final';

interface Player {
  name: string;
  isImposter: boolean;
  hasRevealed: boolean;
  hasVoted: boolean;
  word?: string;
}

interface Category {
  name: string;
  words: string[];
  hint?: string;
}

const PRESET_CATEGORIES: Category[] = [
  { 
    name: 'Animals', 
    words: ['elephant', 'giraffe', 'penguin', 'dolphin', 'tiger', 'koala', 'zebra', 'kangaroo'],
    hint: 'A living creature'
  },
  { 
    name: 'Foods', 
    words: ['pizza', 'sushi', 'burger', 'pasta', 'tacos', 'salad', 'curry', 'sandwich'],
    hint: 'Something you eat'
  },
  { 
    name: 'Countries', 
    words: ['Japan', 'Brazil', 'Egypt', 'Canada', 'Australia', 'Italy', 'India', 'Mexico'],
    hint: 'A place on Earth'
  },
  { 
    name: 'Sports', 
    words: ['soccer', 'basketball', 'tennis', 'swimming', 'hockey', 'volleyball', 'baseball', 'golf'],
    hint: 'A physical activity'
  }
];

export default function ImposterGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [customCategory, setCustomCategory] = useState({ name: '', words: '', hint: '' });
  const [players, setPlayers] = useState<Player[]>([]);
  const [numPlayers, setNumPlayers] = useState(4);
  const [numImposters, setNumImposters] = useState(1);
  const [showHint, setShowHint] = useState(true);
  const [imposterGoesFirst, setImposterGoesFirst] = useState(true);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const [revealActive, setRevealActive] = useState(false);
  const [currentVoter, setCurrentVoter] = useState<number | null>(null);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [currentRound, setCurrentRound] = useState(0);
  const [allRoundResults, setAllRoundResults] = useState<any[]>([]);

  const initializePlayers = () => {
    // Get player names from existing players array or create default names
    const newPlayers: Player[] = Array(numPlayers).fill(null).map((_, i) => ({
      name: players[i]?.name || `Player ${i + 1}`,
      isImposter: false,
      hasRevealed: false,
      hasVoted: false
    }));

    // Randomly select imposters
    const imposterIndices = new Set<number>();
    
    if (imposterGoesFirst) {
      // If "Let imposter go first" is enabled, guarantee at least one imposter in the first positions
      // First, add one random imposter from the first few positions
      const firstPositions = Math.min(3, numPlayers); // Check first 3 positions or fewer if less players
      const firstImposterIndex = Math.floor(Math.random() * firstPositions);
      imposterIndices.add(firstImposterIndex);
      
      // Then randomly select remaining imposters from all positions
      while (imposterIndices.size < numImposters) {
        imposterIndices.add(Math.floor(Math.random() * numPlayers));
      }
    } else {
      // Completely random imposter selection
      while (imposterIndices.size < numImposters) {
        imposterIndices.add(Math.floor(Math.random() * numPlayers));
      }
    }

    const assignedWord = selectedCategory!.words[Math.floor(Math.random() * selectedCategory!.words.length)];

    // Assign imposter status and words
    newPlayers.forEach((player, i) => {
      if (imposterIndices.has(i)) {
        player.isImposter = true;
      } else {
        player.word = assignedWord;
      }
    });

    // Players stay in their original order - NO SORTING
    setPlayers(newPlayers);
    setGameState('lobby');
  };

  const handleReveal = (index: number) => {
    setCurrentRevealIndex(index);
    setRevealActive(false);
    setGameState('reveal');
  };

  const markRevealed = () => {
    const updated = [...players];
    updated[currentRevealIndex].hasRevealed = true;
    setPlayers(updated);
    setGameState('lobby');
  };

  const startVoting = () => {
    setVotes({});
    setCurrentVoter(null);
    const updated = players.map(p => ({ ...p, hasVoted: false }));
    setPlayers(updated);
    setGameState('voting');
  };

  const castVote = (voterIndex: number, targetIndex: number) => {
    setVotes({ ...votes, [voterIndex]: targetIndex });
    const updated = [...players];
    updated[voterIndex].hasVoted = true;
    setPlayers(updated);
    setCurrentVoter(null);
  };

  const showResults = () => {
    const voteCounts: Record<number, number> = {};
    Object.values(votes).forEach(targetIndex => {
      voteCounts[targetIndex] = (voteCounts[targetIndex] || 0) + 1;
    });

    const maxVotes = Math.max(...Object.values(voteCounts));
    const accused = Object.keys(voteCounts).find(k => voteCounts[Number(k)] === maxVotes);

    setAllRoundResults([...allRoundResults, { voteCounts, accused: Number(accused), isImposter: players[Number(accused)].isImposter }]);
    setGameState('results');
  };

  const resetGame = () => {
    setGameState('category');
    setSelectedCategory(null);
    setPlayers([]);
    setCurrentRound(0);
    setAllRoundResults([]);
  };

  const allRevealed = players.every(p => p.hasRevealed);
  const allVoted = players.every(p => p.hasVoted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <AnimatePresence mode="wait">
        {gameState === 'category' && (
          <motion.div
            key="category"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-between mb-8 mt-8">
              <button
                onClick={() => navigate('/')}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition-all"
              >
                ← Home
              </button>
              <h1 className="text-5xl font-bold text-center flex-1">Imposter Game</h1>
              <div className="w-24"></div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Select Category</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {PRESET_CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setGameState('setup');
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-4 rounded-xl font-semibold transition-all transform hover:scale-105"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="border-t border-white/20 pt-6">
                <h3 className="text-xl font-bold mb-3">Create Custom Category</h3>
                <input
                  type="text"
                  placeholder="Category Name"
                  value={customCategory.name}
                  onChange={e => setCustomCategory({ ...customCategory, name: e.target.value })}
                  className="w-full bg-white/20 rounded-lg p-3 mb-3 placeholder-white/60"
                />
                <textarea
                  placeholder="Words (comma separated)"
                  value={customCategory.words}
                  onChange={e => setCustomCategory({ ...customCategory, words: e.target.value })}
                  className="w-full bg-white/20 rounded-lg p-3 mb-3 h-24 placeholder-white/60"
                />
                <input
                  type="text"
                  placeholder="Hint for imposters (optional)"
                  value={customCategory.hint}
                  onChange={e => setCustomCategory({ ...customCategory, hint: e.target.value })}
                  className="w-full bg-white/20 rounded-lg p-3 mb-3 placeholder-white/60"
                />
                <button
                  onClick={() => {
                    if (customCategory.name && customCategory.words) {
                      const words = customCategory.words.split(',').map(w => w.trim()).filter(w => w);
                      setSelectedCategory({
                        name: customCategory.name,
                        words,
                        hint: customCategory.hint
                      });
                      setGameState('setup');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 p-3 rounded-xl font-semibold transition-all"
                >
                  Create & Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between mb-4 mt-4">
              <button
                onClick={() => {
                  setGameState('category');
                  setSelectedCategory(null);
                }}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition-all"
              >
                ← Back
              </button>
              <h1 className="text-4xl font-bold text-center flex-1">Game Setup</h1>
              <button
                onClick={() => navigate('/')}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition-all"
              >
                Home
              </button>
            </div>
            <p className="text-center text-white/70 mb-6">Category: {selectedCategory?.name}</p>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label>Number of Players</label>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={numPlayers}
                    onChange={e => setNumPlayers(Number(e.target.value))}
                    className="bg-white/20 rounded-lg p-2 w-20 text-center"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label>Number of Imposters</label>
                  <input
                    type="number"
                    min="1"
                    max={Math.floor(numPlayers / 2)}
                    value={numImposters}
                    onChange={e => setNumImposters(Number(e.target.value))}
                    className="bg-white/20 rounded-lg p-2 w-20 text-center"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label>Show Hint to Imposter</label>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className={`w-14 h-8 rounded-full transition-colors ${showHint ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${showHint ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label>Let Imposter Go First</label>
                  <button
                    onClick={() => setImposterGoesFirst(!imposterGoesFirst)}
                    className={`w-14 h-8 rounded-full transition-colors ${imposterGoesFirst ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${imposterGoesFirst ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Player Names</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array(numPlayers).fill(null).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Player ${i + 1}`}
                    defaultValue={`Player ${i + 1}`}
                    onChange={e => {
                      const tempPlayers = Array(numPlayers).fill(null).map((_, idx) => ({
                        name: `Player ${idx + 1}`,
                        isImposter: false,
                        hasRevealed: false,
                        hasVoted: false
                      }));
                      tempPlayers[i].name = e.target.value || `Player ${i + 1}`;
                      setPlayers(tempPlayers);
                    }}
                    className="bg-white/20 rounded-lg p-3 placeholder-white/60 text-white"
                  />
                ))}
              </div>
            </div>

            <button
              onClick={initializePlayers}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 p-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              Start Game
            </button>
          </motion.div>
        )}

        {gameState === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between mb-2 mt-4">
              <button
                onClick={() => navigate('/')}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition-all"
              >
                ← Home
              </button>
              <h1 className="text-4xl font-bold text-center flex-1">Game Lobby</h1>
              <div className="w-24"></div>
            </div>
            <p className="text-center text-white/70 mb-6">Category: {selectedCategory?.name}</p>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span>Players: {players.length}</span>
                <span>Imposters: {numImposters}</span>
                <span>Hint: {showHint ? 'ON' : 'OFF'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-24">
              {players.map((player, i) => (
                <motion.button
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !player.hasRevealed && handleReveal(i)}
                  disabled={player.hasRevealed}
                  className={`p-6 rounded-xl font-bold text-xl transition-all ${
                    player.hasRevealed
                      ? 'bg-white/10 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105'
                  }`}
                >
                  {player.hasRevealed ? '✓ ' : ''}{player.name}
                </motion.button>
              ))}
            </div>

            {allRevealed && (
              <motion.button
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                onClick={startVoting}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-4 rounded-full font-bold text-xl shadow-2xl"
              >
                Start Voting Phase
              </motion.button>
            )}
          </motion.div>
        )}

        {gameState === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen"
          >
            <h2 className="text-3xl font-bold mb-8">{players[currentRevealIndex].name}, you are...</h2>
            
            <div className="relative w-full max-w-md aspect-square mb-8">
              <AnimatePresence>
                {!revealActive && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setRevealActive(true)}
                    className="absolute inset-0 rounded-3xl overflow-hidden"
                  >
                    <motion.div
                      animate={{
                        background: [
                          'radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.8), transparent 50%)',
                          'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.8), transparent 50%)',
                          'radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.8), transparent 50%)',
                          'radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.8), transparent 50%)'
                        ]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute inset-0"
                    />
                    <div className="absolute inset-0 backdrop-blur-3xl bg-black/30 flex items-center justify-center">
                      <span className="text-4xl font-bold">REVEAL</span>
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>

              {revealActive && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-8 flex flex-col items-center justify-center text-center"
                >
                  {players[currentRevealIndex].isImposter ? (
                    <>
                      <div className="text-6xl mb-4">🎭</div>
                      <h3 className="text-3xl font-bold mb-4">You are the IMPOSTER!</h3>
                      <p className="text-xl">Blend in with the others</p>
                      {showHint && selectedCategory?.hint && (
                        <p className="mt-4 text-lg opacity-80">Hint: {selectedCategory.hint}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">✨</div>
                      <h3 className="text-3xl font-bold mb-4">INNOCENT!</h3>
                      <p className="text-2xl">Your word is:</p>
                      <p className="text-5xl font-bold mt-2">{players[currentRevealIndex].word}</p>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {revealActive && (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={markRevealed}
                className="bg-white/20 hover:bg-white/30 px-8 py-4 rounded-full font-semibold transition-all"
              >
                Click here and hand to the next player →
              </motion.button>
            )}
          </motion.div>
        )}

        {gameState === 'voting' && (
          <motion.div
            key="voting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between mb-2 mt-4">
              <button
                onClick={() => navigate('/')}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition-all"
              >
                ← Home
              </button>
              <h1 className="text-4xl font-bold text-center flex-1">Voting Phase</h1>
              <div className="w-24"></div>
            </div>
            <p className="text-center text-white/70 mb-8">Round {currentRound + 1} of {numImposters}</p>

            {currentVoter === null ? (
              <div className="grid grid-cols-2 gap-4 mb-24">
                {players.map((player, i) => (
                  <motion.button
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => !player.hasVoted && setCurrentVoter(i)}
                    disabled={player.hasVoted}
                    className={`p-6 rounded-xl font-bold text-xl transition-all ${
                      player.hasVoted
                        ? 'bg-white/10 opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transform hover:scale-105'
                    }`}
                  >
                    {player.hasVoted ? '✓ ' : ''}{player.name}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-center mb-6">{players[currentVoter].name}, vote for the imposter:</h2>
                <div className="grid grid-cols-2 gap-4">
                  {players.map((player, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => castVote(currentVoter, i)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-6 rounded-xl font-bold text-xl transition-all"
                    >
                      {player.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {allVoted && (
              <motion.button
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                onClick={showResults}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-4 rounded-full font-bold text-xl shadow-2xl"
              >
                Show Results
              </motion.button>
            )}
          </motion.div>
        )}

        {gameState === 'results' && allRoundResults.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen"
          >
            <button
              onClick={() => navigate('/')}
              className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition-all"
            >
              ← Home
            </button>
            <h1 className="text-4xl font-bold mb-8">Voting Complete!</h1>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-6 w-full">
              <h2 className="text-2xl font-bold mb-4">Results</h2>
              {Object.entries(allRoundResults[currentRound].voteCounts).map(([index, count]) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span>{players[Number(index)].name}</span>
                    <span>{String(count)} votes</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(Number(count) / players.length) * 100}%` }}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-4 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGameState('final')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-12 py-4 rounded-full font-bold text-xl transition-all mb-4"
            >
              Reveal Result!
            </motion.button>
          </motion.div>
        )}

        {gameState === 'final' && allRoundResults.length > 0 && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen"
          >
            <button
              onClick={() => navigate('/')}
              className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition-all"
            >
              ← Home
            </button>
            <h1 className="text-5xl font-bold mb-8">Game Over!</h1>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-6 w-full">
              <h2 className="text-3xl font-bold mb-6 text-center">
                {players[allRoundResults[currentRound].accused].name} was...
              </h2>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`text-6xl text-center mb-4 ${
                  allRoundResults[currentRound].isImposter ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {allRoundResults[currentRound].isImposter ? '🎭 IMPOSTER!' : '✨ INNOCENT!'}
              </motion.div>
            </div>

            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-12 py-4 rounded-full font-bold text-xl transition-all transform hover:scale-105 mb-4"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-full font-semibold transition-all"
            >
              Return to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}