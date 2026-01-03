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
import gearIcon from '../../../assets/Nertz/gear.png';
import triangleIcon from '../../../assets/Nertz/triangle.png';
import startGameButton from '../../../assets/Nertz/startGame.png';

// Import audio
import countdownAudio from '../../../assets/Nertz/countdown.opus';
import nertzSoundEffect from '../../../assets/Nertz/NERTZ.opus';
import gameMusic from '../../../assets/Nertz/music.opus';

// Import number images
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

// Number images mapping
const NUMBER_IMAGES: Record<number, string> = {
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

export default function NertzScorekeeper() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('home');
  const [deckType, setDeckType] = useState<DeckType>('8 pack');
  const [showSettings, setShowSettings] = useState(false);
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamSetup, setCurrentTeamSetup] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [currentInputTeam, setCurrentInputTeam] = useState(0);
  const [inputPhase, setInputPhase] = useState<'hand' | 'pile'>('hand');
  const [tempInput, setTempInput] = useState('');
  const [countdownNumber, setCountdownNumber] = useState(3);
  
  // Music state
  const [volume, setVolume] = useState(70);
  const [previousVolume, setPreviousVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
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

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      // Unmute: restore previous volume
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      // Mute: save current volume and set to 0
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const usedColors = teams.map(t => t.color);
  const availableColors = DECK_COLORS[deckType].filter(c => !usedColors.includes(c.color));

  const initializeTeams = () => {
    setTeams([]);
    setCurrentTeamSetup(0);
    setGameState('teamSetup');
  };

  const selectColor = (cardColor: CardColor) => {
    const newTeam: Team = {
      name: `Team ${currentTeamSetup + 1}`,
      color: cardColor.color,
      colorImage: cardColor.image,
      score: 0,
      cardsInHand: 0,
      cardsInPile: 0
    };
    setTeams([...teams, newTeam]);
    
    if (currentTeamSetup + 1 < numTeams) {
      setCurrentTeamSetup(currentTeamSetup + 1);
    } else {
      setGameState('readyToStart');
    }
  };

  const handleStartGame = () => {
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
    setNumTeams(2);
    setTeams([]);
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
              {/* Top header with buttons and logo */}
              <div className="px-2 sm:px-4 md:px-6 lg:px-8 pt-3 sm:pt-4 md:pt-5 lg:pt-6 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
                {/* Buttons row (mobile/tablet only) */}
                <div className="flex justify-between items-center mb-6 sm:mb-8 lg:hidden">
                  <motion.button
                    onClick={() => navigate('/')}
                    whileHover={{ scale: 1.15, rotate: -5 }}
                    whileTap={{ scale: 0.85 }}
                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-28 md:h-28 bg-transparent p-0 border-0 outline-none focus:outline-none"
                    style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0 !important', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                  >
                    <img src={arrowIcon} alt="Back to Menu" className="w-full h-full object-contain" />
                  </motion.button>
                  <motion.button
                    onClick={() => setShowSettings(!showSettings)}
                    whileHover={{ scale: 1.15, rotate: 15 }}
                    whileTap={{ scale: 0.85, rotate: 15 }}
                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-28 md:h-28 bg-transparent p-0 border-0 outline-none focus:outline-none"
                    style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0 !important', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                  >
                    <img src={gearIcon} alt="Settings" className="w-full h-full object-cover" />
                  </motion.button>
                </div>

                {/* Logo row (mobile/tablet) or full row (desktop) */}
                <div className="flex justify-between items-center lg:items-start">
                  {/* Desktop back button (hidden on mobile/tablet) */}
                  <motion.button
                    onClick={() => navigate('/')}
                    whileHover={{ scale: 1.15, rotate: -5 }}
                    whileTap={{ scale: 0.85 }}
                    className="hidden lg:block w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-transparent p-0 border-0 outline-none focus:outline-none"
                    style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0 !important', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                  >
                    <img src={arrowIcon} alt="Back to Menu" className="w-full h-full object-contain" />
                  </motion.button>

                  {/* Logo (centered on mobile/tablet, centered on desktop) */}
                  <motion.img 
                    src={nertzLogo} 
                    alt="NERTZ" 
                    className="h-24 sm:h-32 md:h-60 lg:h-48 object-contain mx-auto lg:mx-0"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                    style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' }}
                  />

                  {/* Desktop settings button (hidden on mobile/tablet) */}
                  <motion.button
                    onClick={() => setShowSettings(!showSettings)}
                    whileHover={{ scale: 1.15, rotate: 15 }}
                    whileTap={{ scale: 0.85, rotate: 15 }}
                    className="hidden lg:block w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-transparent p-0 border-0 outline-none focus:outline-none"
                    style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0 !important', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                  >
                    <img src={gearIcon} alt="Settings" className="w-full h-full object-cover" />
                  </motion.button>
                </div>
              </div>

              {/* Main content centered */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-12 lg:px-16 gap-[30px]">

                <motion.h2 
                  className="nertz-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-12 sm:mb-16 md:mb-20 lg:mb-24"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: 'spring', bounce: 0.5 }}
                >
                  How many teams?
                </motion.h2>

                <div className="flex items-center justify-center gap-16 sm:gap-20 md:gap-24 lg:gap-32 mb-12 sm:mb-14 md:mb-16 lg:mb-20">
                <motion.button
                  onClick={() => numTeams > 2 && setNumTeams(numTeams - 1)}
                  disabled={numTeams <= 2}
                  whileHover={{ scale: 1.2, x: -5 }}
                  whileTap={{ scale: 0.85 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 disabled:opacity-20 bg-transparent p-0 border-0 outline-none focus:outline-none transition-opacity"
                  style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0 !important', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}
                >
                  <img 
                    src={triangleIcon} 
                    alt="Decrease" 
                    className="w-full h-full object-contain"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                </motion.button>
                
                <motion.div 
                  key={numTeams}
                  initial={{ scale: 0.8, rotate: Math.random() > 0.5 ? -15 : 15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative"
                >
                  <img 
                    src={NUMBER_IMAGES[numTeams]} 
                    alt={`${numTeams}`}
                    className="h-32 sm:h-40 md:h-48 lg:h-56 object-contain"
                    style={{ filter: 'drop-shadow(6px 6px 0px rgba(0,0,0,0.2))' }}
                  />
                </motion.div>

                <motion.button
                  onClick={() => numTeams < 12 && setNumTeams(numTeams + 1)}
                  disabled={numTeams >= 12}
                  whileHover={{ scale: 1.2, x: 5 }}
                  whileTap={{ scale: 0.85 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 disabled:opacity-20 bg-transparent p-0 border-0 outline-none focus:outline-none transition-opacity"
                  style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0 !important', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}
                >
                  <img 
                    src={triangleIcon} 
                    alt="Increase" 
                    className="w-full h-full object-contain"
                  />
                </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={initializeTeams}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5, type: 'spring', bounce: 0.6 }}
                  className="bg-transparent p-0"
                  style={{ 
                    background: 'transparent',
                    padding: 0,
                    border: 'none',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))'
                  }}
                >
                  <img 
                    src={startGameButton} 
                    alt="Start Game" 
                    className="h-20 sm:h-24 md:h-28 lg:h-36 object-contain"
                  />
                </motion.button>
              </div>

              {/* Settings Modal */}
              <AnimatePresence>
                {showSettings && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowSettings(false)}
                      className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    />
                    
                    {/* Modal */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 50 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 50 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      className="fixed inset-4 sm:inset-8 md:inset-16 lg:inset-24 bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
                      style={{ maxHeight: '90vh' }}
                    >
                      {/* Header */}
                      <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6 sm:p-8 md:p-10">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white text-center tracking-wide"
                            style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive", textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                          SETTINGS
                        </h2>
                      </div>

                      {/* Content */}
                      <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10">
                        {/* Deck Type */}
                        <div className="mb-8">
                          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4" 
                              style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive", color: '#2c3e50' }}>
                            Deck Type
                          </h3>
                          <div className="flex gap-4 justify-center">
                            <button
                              onClick={() => setDeckType('8 pack')}
                              className={`px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 rounded-2xl font-black text-xl sm:text-2xl md:text-3xl transition-all ${
                                deckType === '8 pack'
                                  ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white scale-105 shadow-lg'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}
                            >
                              8 PACK
                            </button>
                            <button
                              onClick={() => setDeckType('12 pack')}
                              className={`px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 rounded-2xl font-black text-xl sm:text-2xl md:text-3xl transition-all ${
                                deckType === '12 pack'
                                  ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white scale-105 shadow-lg'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}
                            >
                              12 PACK
                            </button>
                          </div>
                        </div>

                        {/* Volume Control */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black" 
                                style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive", color: '#2c3e50' }}>
                              Volume
                            </h3>
                            <span className="text-3xl sm:text-4xl md:text-5xl font-black"
                                  style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive", color: '#4a90e2' }}>
                              {volume}
                            </span>
                          </div>
                          
                          {/* Volume Slider */}
                          <div className="relative mb-6">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={volume}
                              onChange={(e) => handleVolumeChange(Number(e.target.value))}
                              className="w-full h-4 sm:h-5 md:h-6 rounded-full appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #4a90e2 0%, #4a90e2 ${volume}%, #cbd5e1 ${volume}%, #cbd5e1 100%)`
                              }}
                            />
                          </div>

                          {/* Mute Button */}
                          <div className="flex justify-center">
                            <motion.button
                              onClick={toggleMute}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-8 sm:px-12 md:px-16 py-3 sm:py-4 md:py-5 rounded-2xl font-black text-lg sm:text-xl md:text-2xl transition-all ${
                                isMuted
                                  ? 'bg-red-500 text-white shadow-lg'
                                  : 'bg-green-500 text-white shadow-lg'
                              }`}
                              style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}
                            >
                              {isMuted ? '🔇 UNMUTE' : '🔊 MUTE'}
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Back Button */}
                      <div className="p-6 sm:p-8 md:p-10 flex justify-center">
                        <motion.button
                          onClick={() => setShowSettings(false)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-16 sm:px-20 md:px-24 py-4 sm:py-5 md:py-6 rounded-full font-black text-2xl sm:text-3xl md:text-4xl text-white shadow-xl"
                          style={{ 
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                            fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                          }}
                        >
                          Back
                        </motion.button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {gameState === 'teamSetup' && (
            <motion.div
              key="teamSetup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center relative"
            >
              <motion.button
                onClick={() => {
                  setTeams([]);
                  setCurrentTeamSetup(0);
                  setGameState('home');
                }}
                whileHover={{ scale: 1.15, rotate: -5 }}
                whileTap={{ scale: 0.85 }}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 w-24 h-24 sm:w-28 sm:h-28 md:w-28 md:h-28 z-10 bg-transparent p-0 border-0 outline-none focus:outline-none"
                style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0 !important', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
              >
                <img src={arrowIcon} alt="Back" className="w-full h-full object-contain" />
              </motion.button>

              <h2 className="nertz-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-8 sm:mb-12 md:mb-16 px-4">
                Team {currentTeamSetup + 1}: Pick a color!
              </h2>

              <div className="grid grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10 max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-4">
                {DECK_COLORS[deckType].map((cardColor, i) => {
                  const isUsed = usedColors.includes(cardColor.color);
                  const delay = i * 0.08;
                  const isEven = i % 2 === 0;
                  const hoverRotate = isEven ? -5 : 5;
                  
                  return (
                    <motion.button
                      key={cardColor.id}
                      initial={{ 
                        opacity: 0,
                        scale: 0.8,
                        rotateZ: 0
                      }}
                      animate={{ 
                        opacity: 1,
                        scale: 1,
                        rotateZ: 0
                      }}
                      transition={{ 
                        delay,
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1],
                        opacity: { duration: 0.3 },
                        scale: { 
                          type: 'spring',
                          stiffness: 200,
                          damping: 15
                        }
                      }}
                      whileHover={{ 
                        scale: 1.1, 
                        rotateZ: hoverRotate,
                        z: 10,
                        transition: { duration: 0.2 }
                      }}
                      onClick={() => !isUsed && selectColor(cardColor)}
                      disabled={isUsed}
                      className="w-full transition-all active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed overflow-hidden relative"
                      style={{ 
                        aspectRatio: '730/1048',
                        minHeight: '80px',
                        border: isUsed ? '3px solid rgba(0,0,0,0.3)' : 'none',
                        padding: 0,
                        borderRadius: '10px',
                        boxShadow: '-4px 4px 12px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      <img 
                        src={cardColor.image} 
                        alt={cardColor.id}
                        className="w-full h-full object-cover"
                        style={{
                          opacity: isUsed ? 0.75 : 1
                        }}
                      />
                      {isUsed && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(64, 64, 64, 0.5)' }}>
                          <div className="text-5xl sm:text-6xl font-bold text-white drop-shadow-lg">✓</div>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {gameState === 'readyToStart' && (
            <motion.div
              key="readyToStart"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="min-h-screen flex flex-col items-center justify-center relative"
            >
              <motion.h2 
                className="nertz-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-12 sm:mb-16 md:mb-20 lg:mb-24"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
              >
                Ready to Start?
              </motion.h2>

              <motion.button
                onClick={handleStartGame}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="h-20 sm:h-24 md:h-28 lg:h-36 bg-transparent p-0 border-0 outline-none focus:outline-none"
                style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0 !important', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <img src={startGameButton} alt="Start Game" className="h-full object-contain" />
              </motion.button>
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

          {gameState === 'colorSelect' && (
            <motion.div
              key="colorSelect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-8">Select Team Color</h2>
              <div className="grid grid-cols-4 gap-4">
                {availableColors.map(cardColor => (
                  <button
                    key={cardColor.id}
                    onClick={() => selectColor(cardColor)}
                    className="rounded-xl overflow-hidden"
                    style={{ aspectRatio: '730/1048' }}
                  >
                    <img 
                      src={cardColor.image} 
                      alt={cardColor.id}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
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
              className="min-h-screen flex flex-col items-center justify-center text-center"
            >
              <div 
                className="w-24 h-32 mx-auto mb-6 rounded-2xl shadow-2xl"
                style={{ backgroundColor: teams[currentInputTeam].color }}
              />

              <h2 
                className="text-3xl font-bold mb-4"
                style={{ 
                  color: '#333',
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                }}
              >
                {teams[currentInputTeam].name}
              </h2>
              
              <p className="text-xl mb-6" style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}>
                Cards remaining in hand?
              </p>

              <input
                type="number"
                value={tempInput}
                onChange={e => setTempInput(e.target.value)}
                className="w-full max-w-xs px-6 py-4 text-4xl font-black text-center rounded-3xl shadow-xl mb-6 border-4"
                style={{ 
                  borderColor: teams[currentInputTeam].color,
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                }}
                placeholder="0"
                autoFocus
              />

              <p className="text-lg mb-6" style={{ color: '#666', fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}>
                Each card = -2 points
              </p>

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
            </motion.div>
          )}

          {gameState === 'roundEnd' && roundWinner !== null && inputPhase === 'pile' && (
            <motion.div
              key="pileInput"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center text-center"
            >
              <div 
                className="w-24 h-32 mx-auto mb-6 rounded-2xl shadow-2xl"
                style={{ backgroundColor: teams[currentInputTeam].color }}
              />

              <h2 
                className="text-3xl font-bold mb-4"
                style={{ 
                  color: '#333',
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                }}
              >
                {teams[currentInputTeam].name}
              </h2>
              
              <p className="text-xl mb-6" style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}>
                Cards in middle pile?
              </p>

              <input
                type="number"
                value={tempInput}
                onChange={e => setTempInput(e.target.value)}
                className="w-full max-w-xs px-6 py-4 text-4xl font-black text-center rounded-3xl shadow-xl mb-6 border-4"
                style={{ 
                  borderColor: teams[currentInputTeam].color,
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                }}
                placeholder="0"
                autoFocus
              />

              <p className="text-lg mb-6" style={{ color: '#666', fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}>
                Each card = +1 point
              </p>

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