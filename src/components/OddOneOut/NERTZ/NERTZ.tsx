import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './NERTZ.css';

// Import background
import nertzBackground from '../../../assets/Nertz/nertzBackground.png';

// Import logo
import nertzLogo from '../../../assets/Nertz/nertzLogo.png';

// Import UI icons
import arrowIcon from '../../../assets/Nertz/arrow.png';
import startGameButton from '../../../assets/Nertz/startGame.png';
import aceBlack from '../../../assets/Nertz/aceBlack.png';
import aceRed from '../../../assets/Nertz/aceRed.png';

// Import banners
import deckBanner from '../../../assets/Nertz/numberPad/banners/deckBanner.png';
import cardHandBanner from '../../../assets/Nertz/numberPad/banners/cardHandBanner.png';
import cardMiddleBanner from '../../../assets/Nertz/numberPad/banners/cardMiddleBanner.png';

// Import audio
import countdownAudio from '../../../assets/Nertz/countdown.opus';
import nertzSoundEffect from '../../../assets/Nertz/NERTZ.opus';
import gameMusic from '../../../assets/Nertz/music.opus';

// Import number images (for countdown)
import number0 from '../../../assets/Nertz/numbers/0.png';
import number1 from '../../../assets/Nertz/numbers/1.png';
import number2 from '../../../assets/Nertz/numbers/2.png';
import number3 from '../../../assets/Nertz/numbers/3.png';
import number4 from '../../../assets/Nertz/numbers/4.png';
import number5 from '../../../assets/Nertz/numbers/5.png';
import number6 from '../../../assets/Nertz/numbers/6.png';
import number7 from '../../../assets/Nertz/numbers/7.png';
import number8 from '../../../assets/Nertz/numbers/8.png';
import number9 from '../../../assets/Nertz/numbers/9.png';
import number10 from '../../../assets/Nertz/numbers/10.png';
import number11 from '../../../assets/Nertz/numbers/11.png';
import number12 from '../../../assets/Nertz/numbers/12.png';

// Import numpad button images
import numpad0 from '../../../assets/Nertz/numberPad/numpad0.png';
import numpad1 from '../../../assets/Nertz/numberPad/numpad1.png';
import numpad2 from '../../../assets/Nertz/numberPad/numpad2.png';
import numpad3 from '../../../assets/Nertz/numberPad/numpad3.png';
import numpad4 from '../../../assets/Nertz/numberPad/numpad4.png';
import numpad5 from '../../../assets/Nertz/numberPad/numpad5.png';
import numpad6 from '../../../assets/Nertz/numberPad/numpad6.png';
import numpad7 from '../../../assets/Nertz/numberPad/numpad7.png';
import numpad8 from '../../../assets/Nertz/numberPad/numpad8.png';
import numpad9 from '../../../assets/Nertz/numberPad/numpad9.png';
import numpadBackspace from '../../../assets/Nertz/numberPad/numpadBackspace.png';
import numpadEnter from '../../../assets/Nertz/numberPad/numpadEnter.png';

// Import 8 pack cards
import pink8 from '../../../assets/Nertz/8_Pack/pink.png';
import orange8 from '../../../assets/Nertz/8_Pack/orange.png';
import green8 from '../../../assets/Nertz/8_Pack/green.png';
import yellow8 from '../../../assets/Nertz/8_Pack/yellow.png';
import blue8 from '../../../assets/Nertz/8_Pack/blue.png';
import purple8 from '../../../assets/Nertz/8_Pack/purple.png';
import turquoise8 from '../../../assets/Nertz/8_Pack/turquoise.png';
import grey8 from '../../../assets/Nertz/8_Pack/grey.png';

// Import 12 pack cards
import crimsonRed12 from '../../../assets/Nertz/12_Pack/crimson_red.png';
import lightBlue12 from '../../../assets/Nertz/12_Pack/light_blue.png';
import darkPurple12 from '../../../assets/Nertz/12_Pack/dark_purple.png';
import oxfordBlue12 from '../../../assets/Nertz/12_Pack/oxford_blue.png';
import burgundy12 from '../../../assets/Nertz/12_Pack/burgundy.png';
import yellow12 from '../../../assets/Nertz/12_Pack/yellow.png';
import deepTeal12 from '../../../assets/Nertz/12_Pack/deep_teal.png';
import hotPink12 from '../../../assets/Nertz/12_Pack/hot_pink.png';
import limeGreen12 from '../../../assets/Nertz/12_Pack/lime_green.png';
import orange12 from '../../../assets/Nertz/12_Pack/orange.png';
import magenta12 from '../../../assets/Nertz/12_Pack/magenta.png';
import sapphireBlue12 from '../../../assets/Nertz/12_Pack/sapphire_blue.png';

type GameState = 'home' | 'teamSetup' | 'colorSelect' | 'readyToStart' | 'countdown' | 'game' | 'roundEnd' | 'roundStandings' | 'results';
type DeckType = '8 pack' | '12 pack';

interface Team {
  name: string;
  color: string;
  colorImage: string;
  score: number;
  cardsInHand: number;
  cardsInPile: number;
}

interface CardColor {
  id: string;
  color: string;
  image: string;
}

const DECK_COLORS: Record<DeckType, CardColor[]> = {
  '8 pack': [
    { id: 'pink', color: '#f40372', image: pink8 },
    { id: 'orange', color: '#fc862e', image: orange8 },
    { id: 'green', color: '#00bb47', image: green8 },
    { id: 'yellow', color: '#fbc522', image: yellow8 },
    { id: 'blue', color: '#1495e3', image: blue8 },
    { id: 'purple', color: '#a11eb0', image: purple8 },
    { id: 'turquoise', color: '#00cecb', image: turquoise8 },
    { id: 'grey', color: '#4f5457', image: grey8 }
  ],
  '12 pack': [
    { id: 'crimson_red', color: '#ff0044', image: crimsonRed12 },
    { id: 'light_blue', color: '#008fd8', image: lightBlue12 },
    { id: 'dark_purple', color: '#4c0244', image: darkPurple12 },
    { id: 'oxford_blue', color: '#011355', image: oxfordBlue12 },
    { id: 'burgundy', color: '#87042b', image: burgundy12 },
    { id: 'yellow', color: '#fdc600', image: yellow12 },
    { id: 'deep_teal', color: '#00433a', image: deepTeal12 },
    { id: 'hot_pink', color: '#f25fdd', image: hotPink12 },
    { id: 'lime_green', color: '#afd509', image: limeGreen12 },
    { id: 'orange', color: '#f55607', image: orange12 },
    { id: 'magenta', color: '#e500cc', image: magenta12 },
    { id: 'sapphire_blue', color: '#005299', image: sapphireBlue12 }
  ]
};

const BICYCLE_ORANGE = '#f17821';

// Number images mapping (for countdown)
const NUMBER_IMAGES: Record<number, string> = {
  0: number0,
  1: number1,
  2: number2,
  3: number3,
  4: number4,
  5: number5,
  6: number6,
  7: number7,
  8: number8,
  9: number9,
  10: number10,
  11: number11,
  12: number12
};

// Numpad button images mapping
const NUMPAD_IMAGES: Record<number, string> = {
  0: numpad0,
  1: numpad1,
  2: numpad2,
  3: numpad3,
  4: numpad4,
  5: numpad5,
  6: numpad6,
  7: numpad7,
  8: numpad8,
  9: numpad9,
};

export default function NertzScorekeeper() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('home');
  const [deckType, setDeckType] = useState<DeckType>('8 pack');
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]); // Track selected color IDs
  const [currentRound, setCurrentRound] = useState(1);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [currentInputTeam, setCurrentInputTeam] = useState(0);
  const [inputPhase, setInputPhase] = useState<'hand' | 'pile'>('hand');
  const [tempInput, setTempInput] = useState('');
  const [countdownNumber, setCountdownNumber] = useState(3);
  
  // Music state
  const [volume] = useState(70); // Fixed volume, no UI controls
  const gameMusicRef = useRef<HTMLAudioElement | null>(null);

  // Exit button state
  const [exitHoldProgress, setExitHoldProgress] = useState(0);
  const exitHoldTimerRef = useRef<number | null>(null);
  const exitHoldStartTimeRef = useRef<number | null>(null);

  // Preload number images aggressively
  useEffect(() => {
    const imagesToLoad = Object.values(NUMBER_IMAGES);

    imagesToLoad.forEach(imageSrc => {
      const img = new Image();
      img.src = imageSrc;
    });
  }, []);

  // Game music control - plays during active game, stops when NERTZ is clicked
  useEffect(() => {
    if (gameState === 'game') {
      // Create and play game music
      if (!gameMusicRef.current) {
        gameMusicRef.current = new Audio(gameMusic);
        gameMusicRef.current.loop = true;
        gameMusicRef.current.volume = volume / 100;
      }
      
      // Play music (handle mobile autoplay restrictions)
      gameMusicRef.current.play().catch(err => {
        console.log('Game music autoplay prevented:', err);
        // On mobile, user interaction (clicking start) should allow playback
      });
    } else {
      // Stop and cleanup music when leaving game state
      if (gameMusicRef.current) {
        gameMusicRef.current.pause();
        gameMusicRef.current.currentTime = 0;
      }
    }

    // Cleanup on unmount
    return () => {
      if (gameMusicRef.current) {
        gameMusicRef.current.pause();
        gameMusicRef.current.currentTime = 0;
      }
    };
  }, [gameState, volume]);

  // Update game music volume when it changes
  useEffect(() => {
    if (gameMusicRef.current) {
      gameMusicRef.current.volume = volume / 100;
    }
  }, [volume]);

  const availableColors = DECK_COLORS[deckType];
  const maxTeams = deckType === '8 pack' ? 8 : 12;

  const toggleColorSelection = (cardColor: CardColor) => {
    if (selectedColors.includes(cardColor.id)) {
      // Deselect color
      setSelectedColors(selectedColors.filter(id => id !== cardColor.id));
    } else {
      // Select color (only if under max limit)
      if (selectedColors.length < maxTeams) {
        setSelectedColors([...selectedColors, cardColor.id]);
      }
    }
  };

  const startGameWithSelectedColors = () => {
    // Create teams from selected colors
    const newTeams: Team[] = selectedColors.map((colorId) => {
      const cardColor = availableColors.find(c => c.id === colorId)!;
      return {
        name: cardColor.id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        color: cardColor.color,
        colorImage: cardColor.image,
        score: 0,
        cardsInHand: 0,
        cardsInPile: 0
      };
    });
    setTeams(newTeams);
    setCountdownNumber(3);
    setGameState('countdown');
    
    // Play countdown audio
    const audio = new Audio(countdownAudio);
    audio.volume = volume / 100;
    audio.play().catch(err => console.log('Countdown audio play prevented:', err));
  };

  // Countdown effect (2.7 seconds total = 0.9 seconds per number)
  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdownNumber > 0) {
        const timer = setTimeout(() => {
          setCountdownNumber(countdownNumber - 1);
        }, 900); // 0.9 seconds per number
        return () => clearTimeout(timer);
      } else {
        setGameState('game');
      }
    }
  }, [gameState, countdownNumber]);

  const startRound = () => {
    setRoundWinner(null);
    setCurrentInputTeam(0);
    setInputPhase('hand');
    setTempInput('');
  };

  const selectWinner = (index: number) => {
    setRoundWinner(index);
    setCurrentInputTeam(index === 0 ? 1 : 0);
    setGameState('roundEnd');
  };

  const submitHandCards = () => {
    const value = parseInt(tempInput) || 0;
    const updated = [...teams];
    updated[currentInputTeam].cardsInHand = value;
    updated[currentInputTeam].score -= value * 2;
    setTeams(updated);
    setTempInput('');

    let nextTeam = currentInputTeam + 1;
    while (nextTeam < teams.length && nextTeam === roundWinner) {
      nextTeam++;
    }

    if (nextTeam >= teams.length) {
      setInputPhase('pile');
      setCurrentInputTeam(0);
    } else {
      setCurrentInputTeam(nextTeam);
    }
  };

  const submitPileCards = () => {
    const value = parseInt(tempInput) || 0;
    const updated = [...teams];
    updated[currentInputTeam].cardsInPile = value;
    updated[currentInputTeam].score += value;
    setTeams(updated);
    setTempInput('');

    const nextTeam = currentInputTeam + 1;
    if (nextTeam >= teams.length) {
      const hasWinner = teams.some(t => t.score >= 50);
      if (hasWinner) {
        setGameState('results');
      } else {
        setCurrentRound(currentRound + 1);
        setGameState('roundStandings');
      }
    } else {
      setCurrentInputTeam(nextTeam);
    }
  };

  const startNextRound = () => {
    startRound();
    setCountdownNumber(3);
    setGameState('countdown');
    
    // Play countdown audio
    const audio = new Audio(countdownAudio);
    audio.volume = volume / 100;
    audio.play().catch(err => console.log('Countdown audio play prevented:', err));
  };

  const resetGame = () => {
    setGameState('home');
    setTeams([]);
    setSelectedColors([]);
    setCurrentRound(1);
  };

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  // Exit button handlers
  const handleExitMouseDown = () => {
    exitHoldStartTimeRef.current = Date.now();
    exitHoldTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - (exitHoldStartTimeRef.current || 0);
      const progress = Math.min(elapsed / 2000, 1); // 2 seconds to fill
      setExitHoldProgress(progress);
      
      if (progress >= 1) {
        handleExitComplete();
      }
    }, 16); // ~60fps
  };

  const handleExitMouseUp = () => {
    if (exitHoldTimerRef.current) {
      clearInterval(exitHoldTimerRef.current);
      exitHoldTimerRef.current = null;
    }
    exitHoldStartTimeRef.current = null;
    setExitHoldProgress(0);
  };

  const handleExitComplete = () => {
    if (exitHoldTimerRef.current) {
      clearInterval(exitHoldTimerRef.current);
      exitHoldTimerRef.current = null;
    }
    exitHoldStartTimeRef.current = null;
    setExitHoldProgress(0);
    resetGame();
  };

  // Numpad handlers
  const handleNumpadPress = (value: string) => {
    if (value === 'backspace') {
      setTempInput(tempInput.slice(0, -1));
    } else if (value === 'enter') {
      // Submit based on current phase
      if (inputPhase === 'hand') {
        submitHandCards();
      } else {
        submitPileCards();
      }
    } else {
      // Append number
      setTempInput(tempInput + value);
    }
  };

  // Cleanup exit timer on unmount
  useEffect(() => {
    return () => {
      if (exitHoldTimerRef.current) {
        clearInterval(exitHoldTimerRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url(${nertzBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Hidden images to force browser caching */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
        {Object.values(NUMBER_IMAGES).map((src, idx) => (
          <img key={idx} src={src} alt="" />
        ))}
      </div>
      
      <div className="w-full flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {gameState === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col"
            >
              {/* Top header with back button and logo */}
              <div className="px-4 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  {/* Back button */}
                  <motion.button
                    onClick={() => navigate('/')}
                    whileHover={{ scale: 1.15, rotate: -5 }}
                    whileTap={{ scale: 0.85 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-transparent p-0 border-0 outline-none focus:outline-none"
                    style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0 !important', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                  >
                    <img src={arrowIcon} alt="Back to Menu" className="w-full h-full object-contain" />
                  </motion.button>

                  {/* Logo */}
                  <motion.img 
                    src={nertzLogo} 
                    alt="NERTZ" 
                    className="h-20 sm:h-24 md:h-28 object-contain"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                    style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' }}
                  />

                  {/* Spacer for symmetry */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20"></div>
                </div>
              </div>

              {/* Main content centered */}
              <div className="flex-1 flex flex-col items-center justify-top text-center px-4 gap-4 relative">

                <motion.img
                  src={deckBanner}
                  alt="Choose Deck Type"
                  className="w-full max-w-xl h-auto -mb-10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: 'spring', bounce: 0.5 }}
                />

                {/* Deck Type Selection */}
                <motion.div 
                  className="flex gap-4 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.button
                    onClick={() => setDeckType('8 pack')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-8 py-2.5 rounded-2xl font-bold text-2xl transition-all ${
                      deckType === '8 pack'
                        ? 'bg-gradient-to-b from-orange-400 to-red-500 text-white scale-105'
                        : 'bg-gradient-to-b from-white to-gray-100 text-gray-700'
                    }`}
                    style={{ 
                      fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
                      boxShadow: deckType === '8 pack' 
                        ? '0 4px 0 0 #b91c1c, 0 5px 8px rgba(0,0,0,0.3)'
                        : '0 4px 0 0 #9ca3af, 0 5px 8px rgba(0,0,0,0.2)',
                      borderTop: '2px solid rgba(255,255,255,0.3)',
                      transform: 'translateY(0)',
                      transition: 'all 0.1s'
                    }}
                  >
                    8 PACK
                  </motion.button>
                  <motion.button
                    onClick={() => setDeckType('12 pack')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-8 py-2.5 rounded-2xl font-bold text-2xl transition-all ${
                      deckType === '12 pack'
                        ? 'bg-gradient-to-b from-orange-400 to-red-500 text-white scale-105'
                        : 'bg-gradient-to-b from-white to-gray-100 text-gray-700'
                    }`}
                    style={{ 
                      fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
                      boxShadow: deckType === '12 pack' 
                        ? '0 4px 0 0 #b91c1c, 0 5px 8px rgba(0,0,0,0.3)'
                        : '0 4px 0 0 #9ca3af, 0 5px 8px rgba(0,0,0,0.2)',
                      borderTop: '2px solid rgba(255,255,255,0.3)',
                      transform: 'translateY(0)',
                      transition: 'all 0.1s'
                    }}
                  >
                    12 PACK
                  </motion.button>
                </motion.div>

                {/* Color Grid */}
                <motion.div
                  key={deckType}
                  className={`grid grid-cols-4 ${deckType === '8 pack' ? 'gap-2.5 max-w-3xl' : 'gap-1 max-w-xl'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  {availableColors.map((cardColor, index) => {
                    const isSelected = selectedColors.includes(cardColor.id);
                    return (
                      <motion.button
                        key={cardColor.id}
                        onClick={() => toggleColorSelection(cardColor)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.03, type: 'spring', stiffness: 300 }}
                        className="relative rounded-lg overflow-hidden"
                        style={{
                          aspectRatio: '730/1048',
                          border: isSelected ? '3px solid #FFD700' : '2px solid transparent',
                          boxShadow: isSelected 
                            ? '0 0 15px rgba(255, 215, 0, 0.6), 0 4px 8px rgba(0,0,0,0.3)' 
                            : '0 2px 4px rgba(0,0,0,0.2)',
                          opacity: isSelected ? 1 : 0.7,
                          transform: isSelected ? 'scale(1)' : 'scale(0.95)'
                        }}
                      >
                        <img 
                          src={cardColor.image} 
                          alt={cardColor.id}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`absolute ${deckType === '8 pack' ? 'top-1.5 right-1.5 w-6 h-6' : 'top-1 right-1 w-5 h-5'} bg-yellow-400 rounded-full flex items-center justify-center shadow-lg`}
                          >
                            <span className={`text-black ${deckType === '8 pack' ? 'text-sm' : 'text-xs'} font-black`}>✓</span>
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>

                {/* Start Game Button */}
                <motion.button
                  whileHover={selectedColors.length >= 2 ? { scale: 1.1, y: -5 } : {}}
                  whileTap={selectedColors.length >= 2 ? { scale: 0.95 } : {}}
                  onClick={startGameWithSelectedColors}
                  disabled={selectedColors.length < 2}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5, type: 'spring', bounce: 0.6 }}
                  className="bg-transparent p-0 disabled:opacity-30 transition-opacity relative z-20"
                  style={{ 
                    background: 'transparent',
                    padding: 0,
                    border: 'none',
                    filter: selectedColors.length >= 2 
                      ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))' 
                      : 'drop-shadow(0 4px 8px rgba(0,0,0,0.2)) grayscale(1)'
                  }}
                >
                  <img 
                    src={startGameButton} 
                    alt="Start Game" 
                    className="h-16 sm:h-20 md:h-24 object-contain"
                  />
                </motion.button>

                {/* Ace of Spades - Bottom Left (Fixed to screen) */}
                <motion.img
                  src={aceBlack}
                  alt="Ace of Spades"
                  className="fixed left-0 bottom-0 h-[30vh] w-auto object-contain pointer-events-none z-10"
                  initial={{ x: -123, y: 282, opacity: 0, rotate: -15 }}
                  animate={{ x: -82, y: 188, opacity: 1, rotate: -15 }}
                  transition={{ delay: 0.6, duration: 0.6, type: 'spring', bounce: 0.4 }}
                  style={{ 
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
                    transformOrigin: 'bottom left'
                  }}
                />

                {/* Ace of Hearts - Bottom Right (Fixed to screen) */}
                <motion.img
                  src={aceRed}
                  alt="Ace of Hearts"
                  className="fixed right-0 bottom-0 h-[30vh] w-auto object-contain pointer-events-none z-10"
                  initial={{ x: 53, y: 262.5, opacity: 0, rotate: 15 }}
                  animate={{ x: 12, y: 175, opacity: 1, rotate: 15 }}
                  transition={{ delay: 0.6, duration: 0.6, type: 'spring', bounce: 0.4 }}
                  style={{ 
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
                    transformOrigin: 'bottom right'
                  }}
                />
              </div>
            </motion.div>
          )}

          {gameState === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="min-h-screen flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                {countdownNumber > 0 ? (
                  <motion.img
                    key={countdownNumber}
                    src={NUMBER_IMAGES[countdownNumber]}
                    alt={`${countdownNumber}`}
                    className="h-64 sm:h-80 md:h-96 lg:h-[32rem] object-contain"
                    initial={{ scale: 0.3, opacity: 0, rotateZ: -30, z: 0 }}
                    animate={{ scale: 1, opacity: 1, rotateZ: 0, z: 0 }}
                    exit={{ scale: 0.3, opacity: 0, rotateZ: 30, z: 0 }}
                    transition={{ 
                      duration: 0.2,
                      ease: [0.34, 1.56, 0.64, 1]
                    }}
                    style={{ 
                      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))'
                    }}
                  />
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}

          {gameState === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex items-center justify-center"
            >
              <motion.button
                onClick={() => {
                  // Play NERTZ sound effect
                  const nertzSound = new Audio(nertzSoundEffect);
                  nertzSound.volume = volume / 100;
                  nertzSound.play().catch(err => console.log('NERTZ sound effect play prevented:', err));
                  
                  // End the round
                  setGameState('roundEnd');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent p-0 border-0 outline-none focus:outline-none"
                style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0 !important' }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
              >
                <img 
                  src={nertzLogo} 
                  alt="NERTZ - End Round" 
                  className="h-48 sm:h-64 md:h-80 lg:h-96 object-contain"
                  style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.5))' }}
                />
              </motion.button>
            </motion.div>
          )}

          {gameState === 'roundEnd' && roundWinner === null && (
            <motion.div
              key="roundEndWinner"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center text-center"
            >
              <h2 
                className="text-4xl font-bold mb-8"
                style={{ 
                  color: '#333',
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                }}
              >
                Who won this round?
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {teams.map((team, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectWinner(i)}
                    className="p-8 rounded-3xl shadow-xl text-white text-2xl font-black"
                    style={{ 
                      backgroundColor: team.color,
                      fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                    }}
                  >
                    {team.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'roundEnd' && roundWinner !== null && inputPhase === 'hand' && (
            <motion.div
              key="handInput"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center text-center px-4"
            >
              <div 
                className="w-24 h-32 mx-auto mb-6 rounded-2xl shadow-2xl overflow-hidden"
              >
                <img
                  src={teams[currentInputTeam].colorImage}
                  alt={teams[currentInputTeam].name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 
                className="text-3xl font-bold mb-4"
                style={{ 
                  color: '#333',
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                }}
              >
                {teams[currentInputTeam].name}
              </h2>
              
              <img 
                src={cardHandBanner} 
                alt="Cards remaining in hand?"
                className="w-full max-w-xl h-auto mb-4"
              />

              {/* Input Display - iOS Calculator style */}
              <div
                className="w-full max-w-md px-8 py-6 text-6xl sm:text-7xl font-black text-center rounded-3xl shadow-2xl mb-4 border-4 bg-white"
                style={{ 
                  borderColor: teams[currentInputTeam].color,
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
                  color: '#000000',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {tempInput || '0'}
              </div>

              <p className="text-lg mb-6 font-bold" style={{ color: '#666', fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}>
                Each card = -2 points
              </p>

              {/* Desktop: Show input and button */}
              <div className="hidden lg:flex flex-col items-center gap-4">
                <input
                  type="number"
                  value={tempInput}
                  onChange={e => setTempInput(e.target.value)}
                  className="w-full max-w-xs px-6 py-4 text-4xl font-black text-center rounded-3xl shadow-xl border-4"
                  style={{ 
                    borderColor: teams[currentInputTeam].color,
                    fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                  }}
                  placeholder="0"
                  autoFocus
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={submitHandCards}
                  className="px-12 py-4 rounded-full text-2xl font-black text-white shadow-2xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${BICYCLE_ORANGE} 0%, #d65a0f 100%)`,
                    fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                  }}
                >
                  NEXT
                </motion.button>
              </div>

              {/* Mobile/Tablet/iPad: Show numpad */}
              <div className="lg:hidden grid grid-cols-3 gap-2 w-full max-w-sm mt-4">
                {/* Numbers 1-9 */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNumpadPress(num.toString())}
                    className="p-0 m-0 border-0 bg-transparent"
                  >
                    <img 
                      src={NUMPAD_IMAGES[num]} 
                      alt={num.toString()}
                      className="w-full h-full object-contain"
                    />
                  </motion.button>
                ))}
                
                {/* Bottom row: Backspace, 0, Enter */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumpadPress('backspace')}
                  className="p-0 m-0 border-0 bg-transparent"
                >
                  <img 
                    src={numpadBackspace} 
                    alt="Backspace"
                    className="w-full h-full object-contain"
                  />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumpadPress('0')}
                  className="p-0 m-0 border-0 bg-transparent"
                >
                  <img 
                    src={NUMPAD_IMAGES[0]} 
                    alt="0"
                    className="w-full h-full object-contain"
                  />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumpadPress('enter')}
                  className="p-0 m-0 border-0 bg-transparent"
                >
                  <img 
                    src={numpadEnter} 
                    alt="Enter"
                    className="w-full h-full object-contain"
                  />
                </motion.button>
              </div>
            </motion.div>
          )}

          {gameState === 'roundEnd' && roundWinner !== null && inputPhase === 'pile' && (
            <motion.div
              key="pileInput"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center text-center px-4"
            >
              <div 
                className="w-24 h-32 mx-auto mb-6 rounded-2xl shadow-2xl overflow-hidden"
              >
                <img
                  src={teams[currentInputTeam].colorImage}
                  alt={teams[currentInputTeam].name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 
                className="text-3xl font-bold mb-4"
                style={{ 
                  color: '#333',
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                }}
              >
                {teams[currentInputTeam].name}
              </h2>
              
              <img 
                src={cardMiddleBanner} 
                alt="Cards in middle pile?"
                className="w-full max-w-xl h-auto mb-4"
              />

              {/* Input Display - iOS Calculator style */}
              <div
                className="w-full max-w-md px-8 py-6 text-6xl sm:text-7xl font-black text-center rounded-3xl shadow-2xl mb-4 border-4 bg-white"
                style={{ 
                  borderColor: teams[currentInputTeam].color,
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
                  color: '#000000',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {tempInput || '0'}
              </div>

              <p className="text-lg mb-6 font-bold" style={{ color: '#666', fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}>
                Each card = +1 point
              </p>

              {/* Desktop: Show input and button */}
              <div className="hidden lg:flex flex-col items-center gap-4">
                <input
                  type="number"
                  value={tempInput}
                  onChange={e => setTempInput(e.target.value)}
                  className="w-full max-w-xs px-6 py-4 text-4xl font-black text-center rounded-3xl shadow-xl border-4"
                  style={{ 
                    borderColor: teams[currentInputTeam].color,
                    fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                  }}
                  placeholder="0"
                  autoFocus
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={submitPileCards}
                  className="px-12 py-4 rounded-full text-2xl font-black text-white shadow-2xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${BICYCLE_ORANGE} 0%, #d65a0f 100%)`,
                    fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                  }}
                >
                  NEXT
                </motion.button>
              </div>

              {/* Mobile/Tablet/iPad: Show numpad */}
              <div className="lg:hidden grid grid-cols-3 gap-2 w-full max-w-sm mt-4">
                {/* Numbers 1-9 */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNumpadPress(num.toString())}
                    className="p-0 m-0 border-0 bg-transparent"
                  >
                    <img 
                      src={NUMPAD_IMAGES[num]} 
                      alt={num.toString()}
                      className="w-full h-full object-contain"
                    />
                  </motion.button>
                ))}
                
                {/* Bottom row: Backspace, 0, Enter */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumpadPress('backspace')}
                  className="p-0 m-0 border-0 bg-transparent"
                >
                  <img 
                    src={numpadBackspace} 
                    alt="Backspace"
                    className="w-full h-full object-contain"
                  />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumpadPress('0')}
                  className="p-0 m-0 border-0 bg-transparent"
                >
                  <img 
                    src={NUMPAD_IMAGES[0]} 
                    alt="0"
                    className="w-full h-full object-contain"
                  />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumpadPress('enter')}
                  className="p-0 m-0 border-0 bg-transparent"
                >
                  <img 
                    src={numpadEnter} 
                    alt="Enter"
                    className="w-full h-full object-contain"
                  />
                </motion.button>
              </div>
            </motion.div>
          )}

          {gameState === 'roundStandings' && (
            <motion.div
              key="roundStandings"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative"
            >
              {/* Exit Button - Top Left */}
              <motion.button
                onMouseDown={handleExitMouseDown}
                onMouseUp={handleExitMouseUp}
                onMouseLeave={handleExitMouseUp}
                onTouchStart={handleExitMouseDown}
                onTouchEnd={handleExitMouseUp}
                onTouchCancel={handleExitMouseUp}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10"
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderRadius: '50%'
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <svg width="80" height="80" viewBox="0 0 80 80">
                  {/* Background circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r="38"
                    fill="rgba(255, 255, 255, 0.9)"
                    stroke="rgba(255, 255, 255, 0.5)"
                    strokeWidth="2"
                  />
                  
                  {/* Progress pie slice - uses path for true pie shape */}
                  {exitHoldProgress > 0 && (
                    <path
                      d={`M 40 40 L 40 2 A 38 38 0 ${exitHoldProgress > 0.5 ? 1 : 0} 1 ${
                        40 + 38 * Math.sin(exitHoldProgress * 2 * Math.PI)
                      } ${
                        40 - 38 * Math.cos(exitHoldProgress * 2 * Math.PI)
                      } Z`}
                      fill="rgba(241, 120, 33, 0.8)"
                      style={{
                        transition: exitHoldProgress === 0 ? 'opacity 0.2s ease-out' : 'none'
                      }}
                    />
                  )}
                  
                  {/* X icon - only show when not holding */}
                  {exitHoldProgress === 0 && (
                    <g transform="translate(40, 40)">
                      <line
                        x1="-14"
                        y1="-14"
                        x2="14"
                        y2="14"
                        stroke="#333333"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <line
                        x1="-14"
                        y1="14"
                        x2="14"
                        y2="-14"
                        stroke="#333333"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </g>
                  )}
                </svg>
              </motion.button>

              <motion.h2 
                className="nertz-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-8 sm:mb-12"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
              >
                Round {currentRound - 1} Complete!
              </motion.h2>

              <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 mb-8 sm:mb-12 max-w-2xl w-full">
                <h3 
                  className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8"
                  style={{ 
                    color: '#666',
                    fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                  }}
                >
                  Current Standings
                </h3>
                
                <div className="space-y-4">
                  {[...teams].sort((a, b) => b.score - a.score).map((team, i) => (
                    <motion.div
                      key={team.name}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-2xl shadow-lg"
                      style={{ backgroundColor: team.color }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="text-3xl sm:text-4xl font-black text-white"
                          style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}
                        >
                          #{i + 1}
                        </div>
                        <div 
                          className="text-xl sm:text-2xl font-bold text-white"
                          style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}
                        >
                          {team.name}
                        </div>
                      </div>
                      <div 
                        className="text-4xl sm:text-5xl font-black text-white"
                        style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}
                      >
                        {team.score}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={startNextRound}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="h-20 sm:h-24 md:h-28 lg:h-36 bg-transparent p-0 border-0 outline-none focus:outline-none"
                style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0 !important', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <img src={startGameButton} alt="Start Next Round" className="h-full object-contain" />
              </motion.button>
            </motion.div>
          )}

          {gameState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <h1 
                className="text-5xl sm:text-6xl font-black mb-8"
                style={{ 
                  color: BICYCLE_ORANGE,
                  textShadow: '4px 4px 0px rgba(0,0,0,0.1)',
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                }}
              >
                GAME OVER!
              </h1>

              <div className="space-y-4 mb-8">
                {sortedTeams.map((team, i) => (
                  <motion.div
                    key={team.name}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-3xl p-6 shadow-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="text-4xl font-black w-16"
                        style={{ 
                          color: BICYCLE_ORANGE,
                          fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                        }}
                      >
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                      </div>
                      <div 
                        className="w-16 h-20 rounded-xl shadow-lg"
                        style={{ backgroundColor: team.color }}
                      />
                      <div 
                        className="text-2xl font-bold"
                        style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}
                      >
                        {team.name}
                      </div>
                    </div>
                    <div 
                      className="text-5xl font-black"
                      style={{ 
                        color: BICYCLE_ORANGE,
                        fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                      }}
                    >
                      {team.score}
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="px-12 py-4 rounded-full text-2xl font-black text-white shadow-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${BICYCLE_ORANGE} 0%, #d65a0f 100%)`,
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                }}
              >
                HOME
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}