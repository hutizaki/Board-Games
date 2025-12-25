import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PRESET_CATEGORIES, Category } from './categories';
import { GameState, Player, GameSettings } from './types';
import CategorySelection from './screens/CategorySelection';
import GameSetup from './screens/GameSetup';
import PlayerLobby from './screens/PlayerLobby';
import RevealScreen from './screens/RevealScreen';
import VotingInstructions from './screens/VotingInstructions';
import VotingPhase from './screens/VotingPhase';
import ResultsScreen from './screens/ResultsScreen';
import FinalScreen from './screens/FinalScreen';

export default function OddOneOut() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<GameSettings>({
    numPlayers: 3,
    numImposters: 1,
    showHint: false,
    showCategory: true,
    imposterGoesFirst: true
  });
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const [revealActive, setRevealActive] = useState(false);
  const [currentVoter, setCurrentVoter] = useState<number | null>(null);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [currentRound, setCurrentRound] = useState(0);
  const [allRoundResults, setAllRoundResults] = useState<any[]>([]);

  const initializePlayers = (playerNames: string[]) => {
    const newPlayers: Player[] = playerNames.map(name => ({
      name,
      isImposter: false,
      hasRevealed: false,
      hasVoted: false
    }));

    // Randomly select imposters
    const imposterIndices = new Set<number>();
    
    if (settings.imposterGoesFirst) {
      const firstPositions = Math.min(3, settings.numPlayers);
      const firstImposterIndex = Math.floor(Math.random() * firstPositions);
      imposterIndices.add(firstImposterIndex);
      
      while (imposterIndices.size < settings.numImposters) {
        imposterIndices.add(Math.floor(Math.random() * settings.numPlayers));
      }
    } else {
      while (imposterIndices.size < settings.numImposters) {
        imposterIndices.add(Math.floor(Math.random() * settings.numPlayers));
      }
    }

    const assignedWord = selectedCategory!.words[Math.floor(Math.random() * selectedCategory!.words.length)];

    newPlayers.forEach((player, i) => {
      if (imposterIndices.has(i)) {
        player.isImposter = true;
      } else {
        player.word = assignedWord;
      }
    });

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
    setGameState('votingInstructions');
  };

  const beginVotingPhase = () => {
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
    <div className="min-h-screen bg-[#0A0E27] text-white">
      <AnimatePresence mode="wait">
        {gameState === 'category' && (
          <CategorySelection
            key="category"
            categories={PRESET_CATEGORIES}
            onSelectCategory={(category) => {
              setSelectedCategory(category);
              setGameState('setup');
            }}
            onBack={() => navigate('/')}
          />
        )}

        {gameState === 'setup' && selectedCategory && (
          <GameSetup
            key="setup"
            category={selectedCategory}
            settings={settings}
            onUpdateSettings={setSettings}
            onStartGame={initializePlayers}
            onBack={() => {
              setGameState('category');
              setSelectedCategory(null);
            }}
            onHome={() => navigate('/')}
          />
        )}

        {gameState === 'lobby' && (
          <PlayerLobby
            key="lobby"
            players={players}
            category={selectedCategory}
            settings={settings}
            allRevealed={allRevealed}
            onReveal={handleReveal}
            onStartVoting={startVoting}
            onHome={() => navigate('/')}
          />
        )}

        {gameState === 'reveal' && (
          <RevealScreen
            key="reveal"
            player={players[currentRevealIndex]}
            category={selectedCategory}
            showHint={settings.showHint}
            showCategory={settings.showCategory}
            revealActive={revealActive}
            onRevealClick={() => setRevealActive(true)}
            onNext={markRevealed}
          />
        )}

        {gameState === 'votingInstructions' && (
          <VotingInstructions
            key="votingInstructions"
            onContinue={beginVotingPhase}
            onBack={() => setGameState('lobby')}
          />
        )}

        {gameState === 'voting' && (
          <VotingPhase
            key="voting"
            players={players}
            currentVoter={currentVoter}
            allVoted={allVoted}
            currentRound={currentRound}
            numImposters={settings.numImposters}
            onSelectVoter={setCurrentVoter}
            onCastVote={castVote}
            onShowResults={showResults}
            onHome={() => navigate('/')}
          />
        )}

        {gameState === 'results' && allRoundResults.length > 0 && (
          <ResultsScreen
            key="results"
            players={players}
            result={allRoundResults[currentRound]}
            onReveal={() => setGameState('final')}
            onHome={() => navigate('/')}
          />
        )}

        {gameState === 'final' && allRoundResults.length > 0 && (
          <FinalScreen
            key="final"
            players={players}
            result={allRoundResults[currentRound]}
            onPlayAgain={resetGame}
            onHome={() => navigate('/')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

