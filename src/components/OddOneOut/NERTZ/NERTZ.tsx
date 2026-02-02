import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './NERTZ.css';

// Import background
import nertzBackground from '../../../assets/Nertz/nertzBackground.png';

// Import logo
import nertzLogo from '../../../assets/Nertz/buttons/nertzLogo.png';

// Import UI buttons
import arrowIcon from '../../../assets/Nertz/buttons/arrow.png';
import startGameButton from '../../../assets/Nertz/buttons/startGame.png';
import continueButton from '../../../assets/Nertz/buttons/continue.png';
import exitGameButton from '../../../assets/Nertz/buttons/exitGame.png';
import gameOverImage from '../../../assets/Nertz/gameOver.png';
import scorePlaque from '../../../assets/Nertz/scorePlaque.png';
import plaqueTop from '../../../assets/Nertz/plaqueSections/currentStanding/plaqueTop.png';
import plaqueMiddle from '../../../assets/Nertz/plaqueSections/currentStanding/plaqueMiddle.png';
import plaqueBottom from '../../../assets/Nertz/plaqueSections/currentStanding/plaqueBottom.png';
import leaderboardPlaqueTop from '../../../assets/Nertz/plaqueSections/leaderboard/leaderboardPlaqueTop.png';
import leaderboardPlaqueMiddle from '../../../assets/Nertz/plaqueSections/leaderboard/leaderboardPlaqueMiddle.png';
import leaderboardPlaqueBottom from '../../../assets/Nertz/plaqueSections/leaderboard/leaderboardPlaqueBottom.png';
import crest from '../../../assets/Nertz/plaqueSections/crest.png';
import aceBlack from '../../../assets/Nertz/aceBlack.png';
import aceRed from '../../../assets/Nertz/aceRed.png';

// Import banners
import deckBanner from '../../../assets/Nertz/banners/deckBanner.png';
import cardHandBanner from '../../../assets/Nertz/banners/cardHandBanner.png';
import cardMiddleBanner from '../../../assets/Nertz/banners/cardMiddleBanner.png';

// Import audio
import countdownAudio from '../../../assets/Nertz/audio/countdown.opus';
import nertzSoundEffect from '../../../assets/Nertz/audio/NERTZ.opus';
import gameMusic from '../../../assets/Nertz/audio/music.opus';
import gameEndAudio from '../../../assets/Nertz/audio/gameEnd.opus';
import buttonClickAudio from '../../../assets/Nertz/audio/buttonClick.opus';
import cardSelectionAudio from '../../../assets/Nertz/audio/cardSelection.opus';

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
import pink8 from '../../../assets/Nertz/8_Pack/cards/pink.png';
import orange8 from '../../../assets/Nertz/8_Pack/cards/orange.png';
import green8 from '../../../assets/Nertz/8_Pack/cards/green.png';
import yellow8 from '../../../assets/Nertz/8_Pack/cards/yellow.png';
import blue8 from '../../../assets/Nertz/8_Pack/cards/blue.png';
import purple8 from '../../../assets/Nertz/8_Pack/cards/purple.png';
import turquoise8 from '../../../assets/Nertz/8_Pack/cards/turquoise.png';
import grey8 from '../../../assets/Nertz/8_Pack/cards/grey.png';

// Import 8 pack team images
import pink8Team from '../../../assets/Nertz/8_Pack/teams/pink.png';
import orange8Team from '../../../assets/Nertz/8_Pack/teams/orange.png';
import green8Team from '../../../assets/Nertz/8_Pack/teams/green.png';
import yellow8Team from '../../../assets/Nertz/8_Pack/teams/yellow.png';
import blue8Team from '../../../assets/Nertz/8_Pack/teams/blue.png';
import magenta8Team from '../../../assets/Nertz/8_Pack/teams/magenta.png';
import turquoise8Team from '../../../assets/Nertz/8_Pack/teams/turquoise.png';
import grey8Team from '../../../assets/Nertz/8_Pack/teams/grey.png';

// Import 12 pack cards
import crimsonRed12 from '../../../assets/Nertz/12_Pack/cards/crimson_red.png';
import lightBlue12 from '../../../assets/Nertz/12_Pack/cards/light_blue.png';
import darkPurple12 from '../../../assets/Nertz/12_Pack/cards/dark_purple.png';
import oxfordBlue12 from '../../../assets/Nertz/12_Pack/cards/oxford_blue.png';
import burgundy12 from '../../../assets/Nertz/12_Pack/cards/burgundy.png';
import yellow12 from '../../../assets/Nertz/12_Pack/cards/yellow.png';
import deepTeal12 from '../../../assets/Nertz/12_Pack/cards/deep_teal.png';
import hotPink12 from '../../../assets/Nertz/12_Pack/cards/hot_pink.png';
import limeGreen12 from '../../../assets/Nertz/12_Pack/cards/lime_green.png';
import orange12 from '../../../assets/Nertz/12_Pack/cards/orange.png';
import magenta12 from '../../../assets/Nertz/12_Pack/cards/magenta.png';
import sapphireBlue12 from '../../../assets/Nertz/12_Pack/cards/sapphire_blue.png';

// Import 12 pack team images
import crimsonRed12Team from '../../../assets/Nertz/12_Pack/teams/crimson_red.png';
import lightBlue12Team from '../../../assets/Nertz/12_Pack/teams/light_blue.png';
import darkPurple12Team from '../../../assets/Nertz/12_Pack/teams/dark_purple.png';
import oxfordBlue12Team from '../../../assets/Nertz/12_Pack/teams/oxford_blue.png';
import burgundy12Team from '../../../assets/Nertz/12_Pack/teams/burgundy.png';
import yellow12Team from '../../../assets/Nertz/12_Pack/teams/yellow.png';
import deepTeal12Team from '../../../assets/Nertz/12_Pack/teams/deep_teal.png';
import hotPink12Team from '../../../assets/Nertz/12_Pack/teams/hot_pink.png';
import limeGreen12Team from '../../../assets/Nertz/12_Pack/teams/lime_green.png';
import orange12Team from '../../../assets/Nertz/12_Pack/teams/orange.png';
import magenta12Team from '../../../assets/Nertz/12_Pack/teams/magenta.png';
import sapphireBlue12Team from '../../../assets/Nertz/12_Pack/teams/sapphire_blue.png';

type GameState = 'home' | 'teamSetup' | 'colorSelect' | 'readyToStart' | 'countdown' | 'game' | 'roundEnd' | 'roundStandings' | 'results';
type DeckType = '8 pack' | '12 pack';

interface Team {
  name: string;
  color: string;
  colorImage: string;
  teamImage: string;
  score: number;
  cardsInHand: number;
  cardsInPile: number;
}

interface CardColor {
  id: string;
  color: string;
  image: string;
  teamImage: string;
}

const DECK_COLORS: Record<DeckType, CardColor[]> = {
  '8 pack': [
    { id: 'pink', color: '#f40372', image: pink8, teamImage: pink8Team },
    { id: 'orange', color: '#fc862e', image: orange8, teamImage: orange8Team },
    { id: 'green', color: '#00bb47', image: green8, teamImage: green8Team },
    { id: 'yellow', color: '#fbc522', image: yellow8, teamImage: yellow8Team },
    { id: 'blue', color: '#1495e3', image: blue8, teamImage: blue8Team },
    { id: 'magenta', color: '#a11eb0', image: purple8, teamImage: magenta8Team },
    { id: 'turquoise', color: '#00cecb', image: turquoise8, teamImage: turquoise8Team },
    { id: 'grey', color: '#4f5457', image: grey8, teamImage: grey8Team }
  ],
  '12 pack': [
    { id: 'crimson_red', color: '#ff0044', image: crimsonRed12, teamImage: crimsonRed12Team },
    { id: 'light_blue', color: '#008fd8', image: lightBlue12, teamImage: lightBlue12Team },
    { id: 'dark_purple', color: '#4c0244', image: darkPurple12, teamImage: darkPurple12Team },
    { id: 'oxford_blue', color: '#011355', image: oxfordBlue12, teamImage: oxfordBlue12Team },
    { id: 'burgundy', color: '#87042b', image: burgundy12, teamImage: burgundy12Team },
    { id: 'yellow', color: '#fdc600', image: yellow12, teamImage: yellow12Team },
    { id: 'deep_teal', color: '#00433a', image: deepTeal12, teamImage: deepTeal12Team },
    { id: 'hot_pink', color: '#f25fdd', image: hotPink12, teamImage: hotPink12Team },
    { id: 'lime_green', color: '#afd509', image: limeGreen12, teamImage: limeGreen12Team },
    { id: 'orange', color: '#f55607', image: orange12, teamImage: orange12Team },
    { id: 'magenta', color: '#e500cc', image: magenta12, teamImage: magenta12Team },
    { id: 'sapphire_blue', color: '#005299', image: sapphireBlue12, teamImage: sapphireBlue12Team }
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
  const [handScoresTemp, setHandScoresTemp] = useState<number[]>([]);
  const [pileScoresTemp, setPileScoresTemp] = useState<number[]>([]);
  const [countdownNumber, setCountdownNumber] = useState(3);
  
  // Audio refs
  const gameMusicRef = useRef<HTMLAudioElement | null>(null);
  const nertzSoundRef = useRef<HTMLAudioElement | null>(null);

  // Exit button state
  const [exitHoldProgress, setExitHoldProgress] = useState(0);
  const exitHoldTimerRef = useRef<number | null>(null);
  const exitHoldStartTimeRef = useRef<number | null>(null);

  // Preload NERTZ sound effect for instant playback
  useEffect(() => {
    nertzSoundRef.current = new Audio(nertzSoundEffect);
    nertzSoundRef.current.preload = 'auto';
    nertzSoundRef.current.volume = 0.4;
    // Load the audio file
    nertzSoundRef.current.load();
  }, []);

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
        gameMusicRef.current.volume = 0.3;
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
  }, [gameState]);

  // Play game end audio when results screen appears
  useEffect(() => {
    if (gameState === 'results') {
      const endAudio = new Audio(gameEndAudio);
      endAudio.volume = 0.4;
      endAudio.play().catch(err => console.log('Game end audio play prevented:', err));
    }
  }, [gameState]);

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
        teamImage: cardColor.teamImage,
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
    audio.volume = 0.4;
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
    // First hand team skips winner; with 1 team use 0 so we don't index out of bounds
    const firstHandTeam = teams.length > 1 && index === 0 ? 1 : 0;
    setCurrentInputTeam(firstHandTeam);
    setHandScoresTemp(Array(teams.length).fill(0));
    setGameState('roundEnd');
  };

  const submitHandCards = () => {
    const raw = parseInt(tempInput, 10);
    const value = Number.isNaN(raw) ? 0 : Math.max(0, raw);
    setHandScoresTemp(prev => {
      const next = [...prev];
      next[currentInputTeam] = value;
      return next;
    });
    setTempInput('');

    let nextTeam = currentInputTeam + 1;
    while (nextTeam < teams.length && nextTeam === roundWinner) {
      nextTeam++;
    }

    if (nextTeam >= teams.length) {
      setInputPhase('pile');
      setPileScoresTemp(Array(teams.length).fill(0));
      setCurrentInputTeam(0);
    } else {
      setCurrentInputTeam(nextTeam);
    }
  };

  const submitPileCards = () => {
    const raw = parseInt(tempInput, 10);
    const value = Number.isNaN(raw) ? 0 : Math.max(0, raw);
    const nextPileTemp = [...pileScoresTemp];
    nextPileTemp[currentInputTeam] = value;
    setPileScoresTemp(nextPileTemp);
    setTempInput('');

    const nextTeam = currentInputTeam + 1;
    if (nextTeam >= teams.length) {
      // Apply this round's hand + pile to teams, then go to standings or results
      const roundDelta = (i: number) => -2 * handScoresTemp[i] + nextPileTemp[i];
      setTeams(prev => prev.map((t, i) => ({
        ...t,
        score: t.score + roundDelta(i),
        cardsInHand: handScoresTemp[i],
        cardsInPile: nextPileTemp[i]
      })));
      const previewScores = teams.map((t, i) => t.score + roundDelta(i));
      const hasWinner = previewScores.some(s => s >= 50);
      if (hasWinner) {
        setGameState('results');
      } else {
        setGameState('roundStandings');
      }
    } else {
      setCurrentInputTeam(nextTeam);
    }
  };

  const startNextRound = () => {
    setCurrentRound(c => c + 1);
    startRound();
    setCountdownNumber(3);
    setGameState('countdown');
    
    // Play countdown audio
    const audio = new Audio(countdownAudio);
    audio.volume = 0.4;
    audio.play().catch(err => console.log('Countdown audio play prevented:', err));
  };

  const resetGame = () => {
    setGameState('home');
    setTeams([]);
    setSelectedColors([]);
    setCurrentRound(1);
    setRoundWinner(null);
    setCurrentInputTeam(0);
    setInputPhase('hand');
    setTempInput('');
    setHandScoresTemp([]);
    setPileScoresTemp([]);
  };

  const handleReturnFromHandInput = () => {
    playButtonClick();
    setRoundWinner(null);
    setHandScoresTemp([]);
    setPileScoresTemp([]);
    setTempInput('');
  };

  const handleReturnFromPileInput = () => {
    playButtonClick();
    const firstHandTeam = Math.min(roundWinner === 0 ? 1 : 0, teams.length - 1);
    setInputPhase('hand');
    setCurrentInputTeam(firstHandTeam);
    setTempInput(String(handScoresTemp[firstHandTeam] ?? ''));
  };

  const handleReturnFromRoundStandings = () => {
    playButtonClick();
    const hand = (i: number) => handScoresTemp[i] ?? 0;
    const pile = (i: number) => pileScoresTemp[i] ?? 0;
    setTeams(prev => prev.map((t, i) => ({
      ...t,
      score: t.score - (-2 * hand(i) + pile(i)),
      cardsInHand: 0,
      cardsInPile: 0
    })));
    setGameState('roundEnd');
    setInputPhase('pile');
    setCurrentInputTeam(0);
    setTempInput(String(pile(0)));
  };

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  // Play button click sound
  const playButtonClick = () => {
    const clickSound = new Audio(buttonClickAudio);
    clickSound.volume = 0.3;
    clickSound.play().catch(err => console.log('Button click sound prevented:', err));
  };

  // Play card selection sound
  const playCardSelection = () => {
    const cardSound = new Audio(cardSelectionAudio);
    cardSound.volume = 0.3;
    cardSound.play().catch(err => console.log('Card selection sound prevented:', err));
  };

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
    playButtonClick();
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
      className="flex flex-col relative"
      style={{
        backgroundImage: `url(${nertzBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        height: '100dvh',
        width: '100vw',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Hidden images to force browser caching */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
        {Object.values(NUMBER_IMAGES).map((src, idx) => (
          <img key={idx} src={src} alt="" />
        ))}
      </div>
      
      <div className="w-full h-full flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {gameState === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-full flex flex-col overflow-y-auto overflow-x-hidden"
            >
              {/* Top header with back button and logo */}
              <div className="px-4 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  {/* Back button */}
                  <motion.button
                    onClick={() => {
                      playButtonClick();
                      navigate('/');
                    }}
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
                    onClick={() => {
                      playButtonClick();
                      setDeckType('8 pack');
                    }}
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
                    onClick={() => {
                      playButtonClick();
                      setDeckType('12 pack');
                    }}
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
                        onClick={() => {
                          playCardSelection();
                          toggleColorSelection(cardColor);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.03, type: 'spring', stiffness: 300 }}
                        className="relative rounded-lg overflow-hidden"
                        style={{
                          aspectRatio: '730/1048',
                          border: isSelected ? '5px solid #22c55e' : '2px solid transparent',
                          boxShadow: isSelected 
                            ? '0 0 20px rgba(34, 197, 94, 0.7), 0 4px 8px rgba(0,0,0,0.3)' 
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
                            className={`absolute ${deckType === '8 pack' ? 'top-1.5 right-1.5 w-12 h-12' : 'top-1 right-1 w-10 h-10'} bg-green-500 rounded-full flex items-center justify-center shadow-lg`}
                          >
                            <span className={`text-white ${deckType === '8 pack' ? 'text-2xl' : 'text-xl'} font-black`}>✓</span>
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
                  onClick={() => {
                    playButtonClick();
                    startGameWithSelectedColors();
                  }}
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
              className="h-full flex items-center justify-center overflow-hidden"
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
              className="h-full w-full flex items-center justify-center overflow-hidden relative"
            >
              {/* Full screen clickable button */}
              <button
                onClick={() => {
                  // Play NERTZ sound effect immediately
                  if (nertzSoundRef.current) {
                    // Reset to start if already playing
                    nertzSoundRef.current.currentTime = 0;
                    nertzSoundRef.current.volume = 0.4;
                    // Play immediately - this is preloaded so it should be instant
                    nertzSoundRef.current.play().catch(err => console.log('NERTZ sound effect play prevented:', err));
                  }
                  
                  // Stop game music immediately when NERTZ is clicked
                  if (gameMusicRef.current) {
                    gameMusicRef.current.pause();
                  }
                  
                  // Initialize round state and end the round
                  startRound();
                  setGameState('roundEnd');
                }}
                className="absolute inset-0 w-full h-full bg-transparent border-0 outline-none focus:outline-none cursor-pointer"
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  outline: 'none', 
                  padding: 0,
                  zIndex: 1
                }}
                aria-label="Click anywhere to call NERTZ and end the round"
              />
              
              {/* Logo centered (non-interactive, just visual) */}
              <motion.img 
                src={nertzLogo} 
                alt="NERTZ - End Round" 
                className="h-48 sm:h-64 md:h-80 lg:h-96 object-contain pointer-events-none"
                style={{ 
                  filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.5))',
                  zIndex: 2,
                  position: 'relative'
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                />
            </motion.div>
          )}

          {gameState === 'roundEnd' && roundWinner === null && (
            <motion.div
              key="roundEndWinner"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center px-4 overflow-hidden"
            >
              <h2 
                className="text-7xl sm:text-8xl font-black mb-8"
                style={{ 
                  color: '#ffffff',
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
                  textShadow: `
                    0 2px 0 rgba(0,0,0,0.3),
                    0 4px 0 rgba(0,0,0,0.25),
                    0 6px 0 rgba(0,0,0,0.2),
                    0 8px 0 rgba(0,0,0,0.15),
                    0 10px 20px rgba(0,0,0,0.4),
                    0 0 40px rgba(255,255,255,0.3)
                  `
                }}
              >
                Who won this round?
              </h2>

              <div className="grid grid-cols-2 gap-6 max-w-2xl">
                {teams.map((team, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playButtonClick();
                      selectWinner(i);
                    }}
                    className="p-0 m-0 border-0 bg-transparent"
                  >
                    <img 
                      src={team.teamImage} 
                      alt={team.name}
                      className="w-full h-auto object-contain rounded-2xl shadow-2xl"
                      style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }}
                    />
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
              className="h-full flex flex-col items-center justify-center text-center px-4 relative overflow-y-auto overflow-x-hidden"
            >
              {/* Exit Button */}
              <motion.button
                onMouseDown={handleExitMouseDown}
                onMouseUp={handleExitMouseUp}
                onMouseLeave={handleExitMouseUp}
                onTouchStart={handleExitMouseDown}
                onTouchEnd={handleExitMouseUp}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.5)',
                  border: '3px solid rgba(255,255,255,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {/* X icon (visible when not holding) */}
                {exitHoldProgress === 0 && (
                  <div style={{ 
                    position: 'absolute',
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: 'white',
                    zIndex: 2
                  }}>
                    ✕
                  </div>
                )}
                
                {/* Progress pie slice */}
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                  <path
                    d={`M 40 40 L 40 0 A 40 40 0 ${exitHoldProgress > 0.5 ? 1 : 0} 1 ${
                      40 + 40 * Math.sin((exitHoldProgress * 2 * Math.PI))
                    } ${
                      40 - 40 * Math.cos((exitHoldProgress * 2 * Math.PI))
                    } Z`}
                    fill="rgba(255,255,255,0.8)"
                  />
                </svg>
              </motion.button>

              {/* Return button - go back to round winner selection */}
              <motion.button
                onClick={handleReturnFromHandInput}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center justify-center rounded-full bg-white/90 border-2 border-gray-300 shadow-lg"
                style={{ width: 56, height: 56 }}
                aria-label="Back to change winner"
              >
                <img src={arrowIcon} alt="Back" className="w-8 h-8 object-contain" />
              </motion.button>

              <h2 
                className="text-5xl font-black"
                style={{ 
                  color: '#ffffff',
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                {teams[currentInputTeam].name}
              </h2>

              <div 
                className="w-32 h-auto mx-auto py-6"
              >
                <img
                  src={teams[currentInputTeam].teamImage}
                  alt={teams[currentInputTeam].name}
                  className="w-full h-auto object-contain rounded-2xl shadow-2xl"
                  style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }}
                />
              </div>
              
              <img 
                src={cardHandBanner} 
                alt="Cards remaining in hand?"
                className="w-full max-w-xl h-auto mb-4"
              />

              {/* Input Display - iOS Calculator style */}
              <div
                className="w-full max-w-md px-8 text-7xl sm:text-8xl font-black text-center rounded-3xl mb-4 relative overflow-hidden"
                style={{ 
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
                  color: '#000000',
                  minHeight: '140px',
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: `url(${scorePlaque})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  boxShadow: `0 8px 20px rgba(0,0,0,0.3)`,
                  lineHeight: '1'
                }}
              >
                {/* Inner border with offset */}
                <div
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '12px',
                    bottom: '15px',
                    left: '11px',
                    border: `6px solid ${teams[currentInputTeam].color}`,
                    borderRadius: '14px',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
                {/* Text content */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  {tempInput || '0'}
                </div>
              </div>

              <p className="text-2xl font-black" style={{ color: '#666', fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}>
                Each card = -2 points
              </p>

              {/* Desktop: Show input and button */}
              <div className="hidden xl:flex flex-col items-center gap-4">
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
                  onClick={() => {
                    playButtonClick();
                    submitHandCards();
                  }}
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
              <div className="xl:hidden grid grid-cols-3 gap-2 w-full max-w-sm mt-4">
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
              className="h-full flex flex-col items-center justify-center text-center px-4 relative overflow-y-auto overflow-x-hidden"
            >
              {/* Exit Button */}
              <motion.button
                onMouseDown={handleExitMouseDown}
                onMouseUp={handleExitMouseUp}
                onMouseLeave={handleExitMouseUp}
                onTouchStart={handleExitMouseDown}
                onTouchEnd={handleExitMouseUp}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.5)',
                  border: '3px solid rgba(255,255,255,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {/* X icon (visible when not holding) */}
                {exitHoldProgress === 0 && (
                  <div style={{ 
                    position: 'absolute',
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: 'white',
                    zIndex: 2
                  }}>
                    ✕
                  </div>
                )}
                
                {/* Progress pie slice */}
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                  <path
                    d={`M 40 40 L 40 0 A 40 40 0 ${exitHoldProgress > 0.5 ? 1 : 0} 1 ${
                      40 + 40 * Math.sin((exitHoldProgress * 2 * Math.PI))
                    } ${
                      40 - 40 * Math.cos((exitHoldProgress * 2 * Math.PI))
                    } Z`}
                    fill="rgba(255,255,255,0.8)"
                  />
                </svg>
              </motion.button>

              {/* Return button - go back to hand input */}
              <motion.button
                onClick={handleReturnFromPileInput}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center justify-center rounded-full bg-white/90 border-2 border-gray-300 shadow-lg"
                style={{ width: 56, height: 56 }}
                aria-label="Back to hand scores"
              >
                <img src={arrowIcon} alt="Back" className="w-8 h-8 object-contain" />
              </motion.button>

              <h2 
                className="text-5xl font-black"
                style={{ 
                  color: '#ffffff',
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                {teams[currentInputTeam].name}
              </h2>

              <div 
                className="w-32 h-auto mx-auto py-6"
              >
                <img
                  src={teams[currentInputTeam].teamImage}
                  alt={teams[currentInputTeam].name}
                  className="w-full h-auto object-contain rounded-2xl shadow-2xl"
                  style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }}
                />
              </div>
              
              <img 
                src={cardMiddleBanner} 
                alt="Cards in middle pile?"
                className="w-full max-w-xl h-auto mb-4"
              />

              {/* Input Display - iOS Calculator style */}
              <div
                className="w-full max-w-md px-8 text-7xl sm:text-8xl font-black text-center rounded-3xl mb-4 relative overflow-hidden"
                style={{ 
                  fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
                  color: '#000000',
                  minHeight: '140px',
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: `url(${scorePlaque})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  boxShadow: `0 8px 20px rgba(0,0,0,0.3)`,
                  lineHeight: '1'
                }}
              >
                {/* Inner border with offset */}
                <div
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '12px',
                    bottom: '15px',
                    left: '11px',
                    border: `6px solid ${teams[currentInputTeam].color}`,
                    borderRadius: '14px',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
                {/* Text content */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  {tempInput || '0'}
                </div>
              </div>

              <p className="text-2xl font-black" style={{ color: '#666', fontFamily: "'Comic Neue', 'Comic Sans MS', cursive" }}>
                Each card = +1 point
              </p>

              {/* Desktop: Show input and button */}
              <div className="hidden xl:flex flex-col items-center gap-4">
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
                  onClick={() => {
                    playButtonClick();
                    submitPileCards();
                  }}
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
              <div className="xl:hidden grid grid-cols-3 gap-2 w-full max-w-sm mt-4">
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
              className="h-full flex flex-col items-center justify-center text-center px-4 relative overflow-y-auto overflow-x-hidden"
            >
              {/* Exit Button */}
              <motion.button
                onMouseDown={handleExitMouseDown}
                onMouseUp={handleExitMouseUp}
                onMouseLeave={handleExitMouseUp}
                onTouchStart={handleExitMouseDown}
                onTouchEnd={handleExitMouseUp}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.5)',
                  border: '3px solid rgba(255,255,255,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {/* X icon (visible when not holding) */}
                {exitHoldProgress === 0 && (
                  <div style={{ 
                    position: 'absolute',
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: 'white',
                    zIndex: 2
                  }}>
                    ✕
                  </div>
                )}
                
                {/* Progress pie slice */}
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                  <path
                    d={`M 40 40 L 40 0 A 40 40 0 ${exitHoldProgress > 0.5 ? 1 : 0} 1 ${
                      40 + 40 * Math.sin((exitHoldProgress * 2 * Math.PI))
                    } ${
                      40 - 40 * Math.cos((exitHoldProgress * 2 * Math.PI))
                    } Z`}
                    fill="rgba(255,255,255,0.8)"
                  />
                </svg>
              </motion.button>

              {/* Return button - go back to pile input to re-enter scores */}
              <motion.button
                onClick={handleReturnFromRoundStandings}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center justify-center rounded-full bg-white/90 border-2 border-gray-300 shadow-lg"
                style={{ width: 56, height: 56 }}
                aria-label="Back to re-enter scores"
              >
                <img src={arrowIcon} alt="Back" className="w-8 h-8 object-contain" />
              </motion.button>

              <motion.h2 
                className="nertz-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-8 sm:mb-12"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
              >
                Round {currentRound} Complete!
              </motion.h2>

              {/* Modular Plaque System */}
              <div className="relative max-w-2xl w-full mb-8 sm:mb-12">
                {/* Top Plaque with "Current Standings" Banner */}
                <img 
                  src={plaqueTop} 
                  alt="Current Standings" 
                  className="w-full"
                  style={{ display: 'block', marginBottom: '-2px' }}
                />
                
                {/* Middle Section - One per team */}
                <div className="relative" style={{ marginTop: '-2px', marginBottom: '-2px' }}>
                  {[...teams].sort((a, b) => b.score - a.score).map((team, i) => (
                    <div key={team.name} className="relative" style={{ height: '100px' }}>
                      {/* Background Middle Plaque */}
                      <img 
                        src={plaqueMiddle} 
                        alt="Plaque Middle" 
                        className="w-full h-full"
                        style={{ display: 'block', objectFit: 'fill' }}
                      />
                      
                      {/* Team Content Overlay */}
                      <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="absolute inset-0 flex items-center justify-between px-8 sm:px-12 md:px-16"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span 
                            className="text-2xl sm:text-3xl md:text-4xl font-black"
                            style={{ 
                              color: '#666',
                              fontFamily: "'Comic Neue', 'Comic Sans MS', cursive"
                            }}
                          >
                            #{i + 1}
                          </span>
                          <img 
                            src={team.teamImage} 
                            alt={team.name}
                            className="h-12 sm:h-14 md:h-16 w-auto"
                          />
                        </div>
                        <span 
                          className="text-2xl sm:text-3xl md:text-4xl font-black"
                          style={{ 
                            color: team.color,
                            fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                          }}
                        >
                          {team.score}
                        </span>
                      </motion.div>
                    </div>
                  ))}
                </div>
                
                {/* Bottom Plaque with Continue Button */}
                <div className="relative" style={{ marginTop: '-2px' }}>
                  <img 
                    src={plaqueBottom} 
                    alt="Plaque Bottom" 
                    className="w-full"
                    style={{ display: 'block' }}
                  />
                  
                  {/* Content Overlay for Bottom Section */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* Crest Separator */}
                    <img 
                      src={crest} 
                      alt="Crest" 
                      className="w-full max-w-sm mb-4"
                      style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                    />
                    
                    {/* Continue Button */}
                    <motion.button
                      onClick={() => {
                        playButtonClick();
                        startNextRound();
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-transparent p-0 border-0 outline-none focus:outline-none"
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        outline: 'none', 
                        padding: '0 !important',
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
                      }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <img 
                        src={continueButton} 
                        alt="Continue"
                        className="h-16 sm:h-20 md:h-24 w-auto object-contain"
                      />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center px-4 overflow-y-auto overflow-x-hidden"
            >
              <motion.img
                src={gameOverImage}
                alt="Game Over"
                className="h-32 sm:h-40 md:h-48 w-auto object-contain mb-8"
                style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
              />

              {/* Modular Leaderboard Plaque System for Final Results */}
              <div className="relative max-w-2xl w-full mb-8 sm:mb-12">
                {/* Top Leaderboard Plaque */}
                <img 
                  src={leaderboardPlaqueTop} 
                  alt="Leaderboard Top" 
                  className="w-full"
                  style={{ display: 'block', marginBottom: '-2px' }}
                />
                
                {/* Middle Section - One per team */}
                <div className="relative" style={{ marginTop: '-2px', marginBottom: '-2px' }}>
                  {sortedTeams.map((team, i) => (
                    <div key={team.name} className="relative" style={{ height: '100px' }}>
                      {/* Background Middle Leaderboard Plaque */}
                      <img 
                        src={leaderboardPlaqueMiddle} 
                        alt="Leaderboard Middle" 
                        className="w-full h-full"
                        style={{ display: 'block', objectFit: 'fill' }}
                      />
                      
                      {/* Team Content Overlay with Color Background */}
                      <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="absolute inset-0 flex items-center justify-between px-6 sm:px-8 md:px-10 mx-6 sm:mx-8 md:mx-10 my-2 rounded-2xl"
                        style={{ 
                          background: `linear-gradient(to bottom, ${team.color} 0%, ${team.color}dd 100%)`,
                          boxShadow: `
                            inset 0 2px 4px rgba(255,255,255,0.3),
                            inset 0 -2px 3px rgba(0,0,0,0.2),
                            0 2px 0 rgba(0,0,0,0.3),
                            0 4px 0 rgba(0,0,0,0.25),
                            0 6px 0 rgba(0,0,0,0.2),
                            0 8px 15px rgba(0,0,0,0.4)
                          `
                        }}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span 
                            className="text-3xl sm:text-4xl md:text-5xl font-black"
                            style={{ 
                              color: '#fff',
                              fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
                              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                            }}
                          >
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                          </span>
                          <span 
                            className="text-xl sm:text-2xl font-bold"
                            style={{ 
                              color: '#fff',
                              fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
                              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                            }}
                          >
                            {team.name}
                          </span>
                        </div>
                        <span 
                          className="text-3xl sm:text-4xl md:text-5xl font-black"
                          style={{ 
                            color: '#fff',
                            fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                          }}
                        >
                          {team.score}
                        </span>
                      </motion.div>
                    </div>
                  ))}
                </div>
                
                {/* Bottom Leaderboard Plaque with Exit Game Button */}
                <div className="relative" style={{ marginTop: '-2px' }}>
                  <img 
                    src={leaderboardPlaqueBottom} 
                    alt="Leaderboard Bottom" 
                    className="w-full"
                    style={{ display: 'block' }}
                  />
                  
                  {/* Content Overlay for Bottom Section */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* Crest Separator */}
                    <img 
                      src={crest} 
                      alt="Crest" 
                      className="w-full max-w-sm mb-4"
                      style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                    />
                    
                    {/* Exit Game Button */}
                    <motion.button
                      onClick={() => {
                        playButtonClick();
                        resetGame();
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-transparent p-0 border-0 outline-none focus:outline-none"
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        outline: 'none', 
                        padding: '0 !important',
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
                      }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <img 
                        src={exitGameButton} 
                        alt="Exit Game"
                        className="h-16 sm:h-20 md:h-24 w-auto object-contain"
                      />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}