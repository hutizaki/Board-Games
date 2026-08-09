import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Taboo.css';
import { TABOO_CARDS, type TabooCard } from './tabooCards';
import lobbyMusicSrc from '../../assets/audio/kahoot-lobby-music.mp3';
import buzzerSrc from '../../assets/audio/buzzer.mp3';
import dingSrc from '../../assets/audio/ding.mp3';
import boomSrc from '../../assets/audio/vine-boom.mp3';
import tabooLogo from '../../assets/Taboo/tabooLogo.png';
import tabooFace from '../../assets/Taboo/tabooFace.png';
import WaveTimer from './WaveTimer';

// ============ Types ============

type Screen =
  | 'home'
  | 'setup'
  | 'handoff'
  | 'turn'
  | 'review'
  | 'scoreboard'
  | 'gameOver';

// 'expired' = card was in play when time ran out (counts for nothing unless corrected)
type Outcome = 'correct' | 'buzzed' | 'passed' | 'expired';

interface TurnCard {
  card: TabooCard;
  outcome: Outcome;
}

type UiSound =
  | 'forward'
  | 'back'
  | 'select'
  | 'open'
  | 'close'
  | 'tick'
  | 'start'
  | 'fanfare'
  | 'endGame';

type GameMode = 'rounds' | 'target';
type PenaltyStyle = 'opponent' | 'minus';

interface TabooSettings {
  turnSeconds: number;
  gameMode: GameMode;
  roundsPerTeam: number;
  targetScore: number;
  penaltyStyle: PenaltyStyle;
}

const DEFAULT_SETTINGS: TabooSettings = {
  turnSeconds: 60,
  gameMode: 'rounds',
  roundsPerTeam: 3,
  targetScore: 25,
  penaltyStyle: 'opponent',
};

const SETTINGS_KEY = 'taboo_settings';

const PURPLE_BG = '#3d1a63';

// Cycle order used by the review screen's tap-to-correct ("Oops") feature
const OUTCOME_CYCLE: Outcome[] = ['correct', 'buzzed', 'passed', 'expired'];

const OUTCOME_LABEL: Record<Outcome, string> = {
  correct: 'Correct',
  buzzed: 'Buzzed',
  passed: 'Passed',
  expired: 'Not counted',
};

// ============ Helpers ============

function loadSettings(): TabooSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<TabooSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function shuffledIndices(count: number): number[] {
  const arr = Array.from({ length: count }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ============ Component ============

function Taboo() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState<Screen>('home');
  const [settings, setSettings] = useState<TabooSettings>(loadSettings);
  const [showRules, setShowRules] = useState(false);

  const [teamNames, setTeamNames] = useState<[string, string]>(['Team A', 'Team B']);
  const [scores, setScores] = useState<[number, number]>([0, 0]);

  // Number of turns fully completed this game. Active team = turnsCompleted % 2.
  const [turnsCompleted, setTurnsCompleted] = useState(0);
  // Extra rounds added by sudden-death ties in fixed-rounds mode
  const [bonusRounds, setBonusRounds] = useState(0);

  const [currentCard, setCurrentCard] = useState<TabooCard | null>(null);
  const [turnLog, setTurnLog] = useState<TurnCard[]>([]);
  const [timeLeft, setTimeLeft] = useState(settings.turnSeconds);
  // Absolute epoch ms the turn ends. State, not a ref: the wave reads it during
  // render to interpolate its own level, so a stale value would freeze the tide.
  const [turnEndsAt, setTurnEndsAt] = useState(0);
  const [winner, setWinner] = useState<number | null>(null); // null during play; -1 = tie shown on gameOver

  // Deck: shuffled indices into TABOO_CARDS, advancing across the whole game
  const deckRef = useRef<number[]>([]);
  const deckPosRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Card in a ref so drawing the next one doesn't tear down and restart the
  // timer interval on every button press.
  const currentCardRef = useRef<TabooCard | null>(null);
  // Last whole-second value pushed to state, so the header repaints at 1 Hz.
  const lastShownRef = useRef(-1);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const buzzerRef = useRef<HTMLAudioElement | null>(null);
  const dingRef = useRef<HTMLAudioElement | null>(null);
  const boomRef = useRef<HTMLAudioElement | null>(null);
  const musicStartedRef = useRef(false);

  const activeTeam = turnsCompleted % 2;
  const currentRound = Math.floor(turnsCompleted / 2) + 1;
  const totalRounds = settings.gameMode === 'rounds' ? settings.roundsPerTeam + bonusRounds : null;

  // ---- Page background while mounted (matches NERTZ pattern for iOS safe areas) ----
  useEffect(() => {
    const prevBody = document.body.style.backgroundColor;
    const prevHtml = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = PURPLE_BG;
    document.documentElement.style.backgroundColor = PURPLE_BG;
    return () => {
      document.body.style.backgroundColor = prevBody;
      document.documentElement.style.backgroundColor = prevHtml;
    };
  }, []);

  // ---- Preload turn audio; stop music if the game unmounts mid-countdown ----
  useEffect(() => {
    musicRef.current = new Audio(lobbyMusicSrc);
    musicRef.current.preload = 'auto';
    musicRef.current.volume = 0.5;
    buzzerRef.current = new Audio(buzzerSrc);
    buzzerRef.current.preload = 'auto';
    buzzerRef.current.volume = 0.6;
    dingRef.current = new Audio(dingSrc);
    dingRef.current.preload = 'auto';
    dingRef.current.volume = 0.6;
    boomRef.current = new Audio(boomSrc);
    boomRef.current.preload = 'auto';
    boomRef.current.volume = 0.55;
    return () => {
      musicRef.current?.pause();
      musicRef.current = null;
      buzzerRef.current = null;
      dingRef.current = null;
      boomRef.current = null;
    };
  }, []);

  // ---- Persist settings ----
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // storage unavailable; setting just won't persist
    }
  }, [settings]);

  // ---- Sounds (WebAudio, no assets needed) ----
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (Ctx) audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.2, delay = 0) => {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const start = ctx.currentTime + delay;
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    },
    [getAudioCtx]
  );

  /**
   * Play a one-shot clip. Each press gets its own cloned element so rapid
   * repeats layer over each other instead of the new press cutting off the
   * previous one. Clones share the already-fetched media, so no extra network.
   */
  const playClip = useCallback((base: HTMLAudioElement | null) => {
    if (!base) return;
    const node = base.cloneNode() as HTMLAudioElement;
    node.volume = base.volume;
    node.play().catch(() => {});
  }, []);

  const playCorrect = useCallback(() => {
    playClip(dingRef.current);
  }, [playClip]);

  const playBuzz = useCallback(() => {
    playClip(boomRef.current);
    if (navigator.vibrate) navigator.vibrate(300);
  }, [playClip]);

  const playPass = useCallback(() => {
    // Quick downward "swipe it away" blip
    playTone(520, 0.09, 'triangle', 0.18);
    playTone(390, 0.12, 'triangle', 0.18, 0.07);
  }, [playTone]);

  /**
   * UI button palette — short, bright game-show blips that share a family with
   * the ding/buzzer effects. Each kind is a small note sequence so every button
   * reads as its own action by ear.
   */
  const playUi = useCallback(
    (kind: UiSound) => {
      switch (kind) {
        case 'forward': // advance: setup, next turn, apply scores
          playTone(587, 0.08, 'sine', 0.18);
          playTone(880, 0.12, 'sine', 0.18, 0.06);
          break;
        case 'back': // retreat: back buttons, main menu
          playTone(587, 0.08, 'sine', 0.15);
          playTone(392, 0.12, 'sine', 0.15, 0.06);
          break;
        case 'select': // chips / settings toggles
          playTone(784, 0.05, 'square', 0.1);
          break;
        case 'open': // modal opens
          playTone(659, 0.07, 'triangle', 0.16);
          playTone(988, 0.1, 'triangle', 0.16, 0.05);
          break;
        case 'close': // modal dismiss
          playTone(784, 0.07, 'triangle', 0.14);
          playTone(523, 0.1, 'triangle', 0.14, 0.05);
          break;
        case 'tick': // review row correction
          playTone(1047, 0.04, 'square', 0.12);
          break;
        case 'start': // kicking off a turn — bright three-note call
          playTone(523, 0.1, 'sine', 0.2);
          playTone(659, 0.1, 'sine', 0.2, 0.09);
          playTone(1047, 0.22, 'sine', 0.22, 0.18);
          break;
        case 'fanfare': // winner screen
          playTone(523, 0.12, 'sine', 0.22);
          playTone(659, 0.12, 'sine', 0.22, 0.12);
          playTone(784, 0.12, 'sine', 0.22, 0.24);
          playTone(1047, 0.45, 'sine', 0.25, 0.36);
          break;
        case 'endGame': // bowing out early — settling descent
          playTone(659, 0.14, 'sine', 0.18);
          playTone(523, 0.14, 'sine', 0.18, 0.13);
          playTone(392, 0.3, 'sine', 0.18, 0.26);
          break;
      }
    },
    [playTone]
  );


  // ---- Deck ----
  const drawCard = useCallback((): TabooCard => {
    if (deckRef.current.length === 0 || deckPosRef.current >= deckRef.current.length) {
      deckRef.current = shuffledIndices(TABOO_CARDS.length);
      deckPosRef.current = 0;
    }
    const card = TABOO_CARDS[deckRef.current[deckPosRef.current]];
    deckPosRef.current += 1;
    return card;
  }, []);

  // ---- Game flow ----
  const startNewGame = () => {
    playUi('forward');
    deckRef.current = shuffledIndices(TABOO_CARDS.length);
    deckPosRef.current = 0;
    setScores([0, 0]);
    setTurnsCompleted(0);
    setBonusRounds(0);
    setWinner(null);
    setTurnLog([]);
    setCurrentCard(null);
    setScreen('handoff');
  };

  const startTurn = () => {
    getAudioCtx(); // unlock audio on user gesture
    playUi('start');
    setTurnLog([]);
    setCurrentCard(drawCard());
    setTurnEndsAt(Date.now() + settings.turnSeconds * 1000);
    setTimeLeft(settings.turnSeconds);
    lastShownRef.current = settings.turnSeconds;
    musicStartedRef.current = false;
    setScreen('turn');
  };

  useEffect(() => {
    currentCardRef.current = currentCard;
  }, [currentCard]);

  const markOutcome = (outcome: Outcome) => {
    if (!currentCard) return;
    if (outcome === 'correct') playCorrect();
    else if (outcome === 'buzzed') playBuzz();
    else playPass();
    setTurnLog((log) => [...log, { card: currentCard, outcome }]);
    setCurrentCard(drawCard());
  };

  // Timer loop while in a turn
  useEffect(() => {
    if (screen !== 'turn') return;
    timerRef.current = setInterval(() => {
      const remainingMs = turnEndsAt - Date.now();
      const remaining = Math.max(0, remainingMs / 1000);
      // The wave interpolates its own level from endsAt at rAF, so state only
      // has to carry the whole-second readout — one render a second, not 20.
      const shown = Math.ceil(remaining);
      if (shown !== lastShownRef.current) {
        lastShownRef.current = shown;
        setTimeLeft(shown);
      }
      // Final 15 seconds: lobby music kicks in (once per turn)
      if (remaining > 0 && remaining <= 15 && !musicStartedRef.current) {
        musicStartedRef.current = true;
        const music = musicRef.current;
        if (music) {
          music.currentTime = 0;
          music.play().catch(() => {});
        }
      }
      if (remainingMs <= 0) {
        // Time's up: the card in play counts for nothing (correctable on review)
        const inPlay = currentCardRef.current;
        setTurnLog((log) => (inPlay ? [...log, { card: inPlay, outcome: 'expired' }] : log));
        setCurrentCard(null);
        const music = musicRef.current;
        if (music) {
          music.pause();
          music.currentTime = 0;
        }
        playClip(buzzerRef.current);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        setScreen('review');
      }
    }, 50);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [screen, turnEndsAt, playClip]);

  // ---- Review / scoring ----
  const cycleOutcome = (index: number) => {
    playUi('tick');
    setTurnLog((log) =>
      log.map((tc, i) => {
        if (i !== index) return tc;
        const next =
          OUTCOME_CYCLE[(OUTCOME_CYCLE.indexOf(tc.outcome) + 1) % OUTCOME_CYCLE.length];
        return { ...tc, outcome: next };
      })
    );
  };

  const correctCount = turnLog.filter((tc) => tc.outcome === 'correct').length;
  const penaltyCount = turnLog.filter(
    (tc) => tc.outcome === 'buzzed' || tc.outcome === 'passed'
  ).length;

  const confirmTurn = () => {
    const newScores: [number, number] = [...scores];
    newScores[activeTeam] += correctCount;
    if (settings.penaltyStyle === 'opponent') {
      newScores[1 - activeTeam] += penaltyCount;
    } else {
      newScores[activeTeam] -= penaltyCount;
    }
    setScores(newScores);

    const completed = turnsCompleted + 1;
    setTurnsCompleted(completed);

    // Win conditions are only checked after a full round (both teams had equal turns)
    if (completed % 2 === 0) {
      const roundsDone = completed / 2;
      if (settings.gameMode === 'rounds') {
        if (roundsDone >= settings.roundsPerTeam + bonusRounds) {
          if (newScores[0] === newScores[1]) {
            // Tie: sudden-death extra round
            setBonusRounds((b) => b + 1);
          } else {
            playUi('fanfare');
            setWinner(newScores[0] > newScores[1] ? 0 : 1);
            setScreen('gameOver');
            return;
          }
        }
      } else {
        const target = settings.targetScore;
        const reached = newScores[0] >= target || newScores[1] >= target;
        if (reached && newScores[0] !== newScores[1]) {
          playUi('fanfare');
          setWinner(newScores[0] > newScores[1] ? 0 : 1);
          setScreen('gameOver');
          return;
        }
        // Tie at/above target: keep playing until a round ends with a leader
      }
    }
    playUi('forward');
    setScreen('scoreboard');
  };

  const endGameEarly = () => {
    playUi('endGame');
    if (scores[0] === scores[1]) setWinner(-1);
    else setWinner(scores[0] > scores[1] ? 0 : 1);
    setScreen('gameOver');
  };

  // ============ Render helpers ============

  const renderCard = (card: TabooCard) => (
    <motion.div
      key={card.word}
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="taboo-card w-full max-w-[15rem] mx-auto"
    >
      <div className="taboo-card-header">{card.word}</div>
      <ul className="taboo-card-words">
        {card.taboo.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </motion.div>
  );

  const outcomeBadgeClass = (o: Outcome) =>
    o === 'correct'
      ? 'bg-green-600'
      : o === 'buzzed'
        ? 'bg-red-600'
        : o === 'passed'
          ? 'bg-amber-600'
          : 'bg-gray-600';

  // ============ Screens ============

  return (
    <div
      className="taboo-root w-full flex flex-col items-center"
      style={{
        background: `radial-gradient(circle at 50% 20%, #5b2a86 0%, ${PURPLE_BG} 65%)`,
      }}
    >
      {/* Home screen backdrop: the "shh" face sits behind all content */}
      {screen === 'home' && <img src={tabooFace} alt="" className="taboo-face-bg" />}

      {/* Turn backdrop: the countdown as a tide draining off the screen. Driven
          by the game's own clock (controlled), so it can't drift from scoring. */}
      {screen === 'turn' && (
        <div className="taboo-wave-bg">
          <WaveTimer
            duration={settings.turnSeconds}
            /* Deadline mode: the wave interpolates at rAF off the same clock
               the scoring uses, so it stays smooth however slowly we tick. We
               keep our own expiry handling and pass no onComplete, since the
               interval also logs the dead card, stops the music, and buzzes. */
            endsAt={turnEndsAt}
            showReadout={false}
            /* Constant sea. Stepping these at the 15s mark read as chaotic, so
               both sit midway between the old calm and choppy values. The
               component still eases amplitude with the tide on its own. */
            waveSpeed={1.85}
            waveHeight={0.039}
            theme={{
              deep: '#2a1145',
              violet: '#5b2a86',
              glow: '#fa7268',
              foam: '#f2e3dc',
              crest: '#ffffff',
            }}
          />
        </div>
      )}

      {/* Screens swap instantly with entry animations only — AnimatePresence
          mode="wait" exit transitions hang under React StrictMode in dev. */}
      <>
        {/* ---------- HOME ---------- */}
        {screen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 taboo-screen flex flex-col items-center justify-center gap-6"
          >
            <img src={tabooLogo} alt="Taboo" className="w-full max-w-xs" />
            <p className="taboo-heading text-center text-lg -mt-2">
              Say it… without saying it!
            </p>
            <button
              className="taboo-btn taboo-btn-primary w-full"
              onClick={() => {
                getAudioCtx(); // first gesture: unlock audio for the rest of the game
                playUi('forward');
                setScreen('setup');
              }}
            >
              Start Game
            </button>
            <button
              className="taboo-btn taboo-btn-secondary w-full"
              onClick={() => {
                getAudioCtx();
                playUi('open');
                setShowRules(true);
              }}
            >
              How to Play
            </button>
            <button
              className="taboo-btn taboo-btn-ghost w-full"
              onClick={() => {
                playUi('back');
                navigate('/');
              }}
            >
              Back to Games
            </button>
          </motion.div>
        )}

        {/* ---------- SETUP ---------- */}
        {screen === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="taboo-screen flex flex-col gap-5"
          >
            <h2 className="taboo-heading text-3xl text-center">Game Setup</h2>

            <div className="taboo-panel">
              <label className="taboo-label">Teams</label>
              {[0, 1].map((i) => (
                <input
                  key={i}
                  className="taboo-input mb-2"
                  value={teamNames[i]}
                  maxLength={18}
                  onChange={(e) => {
                    const next: [string, string] = [...teamNames];
                    next[i] = e.target.value;
                    setTeamNames(next);
                  }}
                  placeholder={`Team ${i === 0 ? 'A' : 'B'}`}
                />
              ))}
            </div>

            <div className="taboo-panel">
              <label className="taboo-label">Turn timer</label>
              <div className="flex gap-2">
                {[30, 60, 90, 120].map((s) => (
                  <button
                    key={s}
                    className={`taboo-chip ${settings.turnSeconds === s ? 'taboo-chip-active' : ''}`}
                    onClick={() => {
                      playUi('select');
                      setSettings({ ...settings, turnSeconds: s });
                    }}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            <div className="taboo-panel">
              <label className="taboo-label">Game length</label>
              <div className="flex gap-2 mb-3">
                <button
                  className={`taboo-chip flex-1 ${settings.gameMode === 'rounds' ? 'taboo-chip-active' : ''}`}
                  onClick={() => {
                    playUi('select');
                    setSettings({ ...settings, gameMode: 'rounds' });
                  }}
                >
                  Fixed rounds
                </button>
                <button
                  className={`taboo-chip flex-1 ${settings.gameMode === 'target' ? 'taboo-chip-active' : ''}`}
                  onClick={() => {
                    playUi('select');
                    setSettings({ ...settings, gameMode: 'target' });
                  }}
                >
                  Target score
                </button>
              </div>
              {settings.gameMode === 'rounds' ? (
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      className={`taboo-chip ${settings.roundsPerTeam === r ? 'taboo-chip-active' : ''}`}
                      onClick={() => {
                        playUi('select');
                        setSettings({ ...settings, roundsPerTeam: r });
                      }}
                    >
                      {r} each
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2">
                  {[15, 25, 35, 50].map((t) => (
                    <button
                      key={t}
                      className={`taboo-chip ${settings.targetScore === t ? 'taboo-chip-active' : ''}`}
                      onClick={() => {
                        playUi('select');
                        setSettings({ ...settings, targetScore: t });
                      }}
                    >
                      {t} pts
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="taboo-panel">
              <label className="taboo-label">Buzz / pass penalty</label>
              <div className="flex gap-2">
                <button
                  className={`taboo-chip flex-1 ${settings.penaltyStyle === 'opponent' ? 'taboo-chip-active' : ''}`}
                  onClick={() => {
                    playUi('select');
                    setSettings({ ...settings, penaltyStyle: 'opponent' });
                  }}
                >
                  Opponent +1
                </button>
                <button
                  className={`taboo-chip flex-1 ${settings.penaltyStyle === 'minus' ? 'taboo-chip-active' : ''}`}
                  onClick={() => {
                    playUi('select');
                    setSettings({ ...settings, penaltyStyle: 'minus' });
                  }}
                >
                  Your team −1
                </button>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3 pb-2">
              <button className="taboo-btn taboo-btn-primary w-full" onClick={startNewGame}>
                Let's Play!
              </button>
              <button
                className="taboo-btn taboo-btn-ghost w-full"
                onClick={() => {
                  playUi('back');
                  setScreen('home');
                }}
              >
                Back
              </button>
            </div>
          </motion.div>
        )}

        {/* ---------- HANDOFF ---------- */}
        {screen === 'handoff' && (
          <motion.div
            key={`handoff-${turnsCompleted}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="taboo-screen flex flex-col items-center justify-center gap-6 text-center"
          >
            <div className="taboo-heading text-xl opacity-80">
              Round {currentRound}
              {totalRounds ? ` of ${totalRounds}` : ''}
            </div>
            <h2 className="taboo-logo-sm">{teamNames[activeTeam]}</h2>
            <div className="taboo-panel text-left w-full">
              <p className="mb-2">
                📱 Hand the device to <strong>{teamNames[activeTeam]}</strong>'s clue giver.
              </p>
              <p className="mb-2">
                👀 A player from <strong>{teamNames[1 - activeTeam]}</strong> watches the screen
                over their shoulder and presses <strong>BUZZ</strong> on any slip-up.
              </p>
              <p>
                🗣️ Everyone else on {teamNames[activeTeam]} guesses — don't peek!
              </p>
            </div>
            <div className="taboo-heading text-lg">
              {teamNames[0]} {scores[0]} — {scores[1]} {teamNames[1]}
            </div>
            <button className="taboo-btn taboo-btn-primary w-full" onClick={startTurn}>
              Start Turn ({settings.turnSeconds}s)
            </button>
          </motion.div>
        )}

        {/* ---------- TURN ---------- */}
        {screen === 'turn' && (
          <motion.div
            key="turn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 taboo-screen flex flex-col gap-4"
          >
            <div className="taboo-turn-header flex items-baseline justify-between gap-3">
              <span className="taboo-heading text-lg">{teamNames[activeTeam]}</span>
              <span
                className={`taboo-timer text-4xl ${timeLeft <= 10 ? 'text-red-400 taboo-pulse' : 'text-white'}`}
              >
                {timeLeft}
              </span>
            </div>
            <div className="flex-1 flex items-center w-full">
              {currentCard && renderCard(currentCard)}
            </div>
            <div className="grid grid-cols-2 gap-3 w-full pb-2">
              <button
                className="taboo-btn taboo-btn-correct col-span-2"
                onClick={() => markOutcome('correct')}
              >
                ✓ Correct
              </button>
              <button className="taboo-btn taboo-btn-pass" onClick={() => markOutcome('passed')}>
                Pass →
              </button>
              <button className="taboo-btn taboo-btn-buzz" onClick={() => markOutcome('buzzed')}>
                🚨 BUZZ!
              </button>
            </div>
            <div className="taboo-turn-tally text-center text-sm">
              {correctCount} correct · {penaltyCount} penalties
            </div>
          </motion.div>
        )}

        {/* ---------- REVIEW ---------- */}
        {screen === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="taboo-screen flex flex-col gap-4"
          >
            <h2 className="taboo-heading text-3xl text-center">Time's Up!</h2>
            <p className="text-center text-white/80 text-sm -mt-2">
              Made a mistake? Tap any card to change its result.
            </p>
            <div className="flex flex-col gap-2">
              {turnLog.length === 0 && (
                <p className="text-center text-white/60 py-8">No cards played this turn.</p>
              )}
              {turnLog.map((tc, i) => (
                <button
                  key={`${tc.card.word}-${i}`}
                  className="taboo-review-row"
                  onClick={() => cycleOutcome(i)}
                >
                  <span className="font-semibold">{tc.card.word}</span>
                  <span className={`taboo-badge ${outcomeBadgeClass(tc.outcome)}`}>
                    {OUTCOME_LABEL[tc.outcome]}
                  </span>
                </button>
              ))}
            </div>
            <div className="taboo-panel text-center">
              <div className="text-lg">
                <strong>{teamNames[activeTeam]}</strong>: +{correctCount}
              </div>
              <div className="text-sm text-white/80">
                {settings.penaltyStyle === 'opponent'
                  ? `${teamNames[1 - activeTeam]}: +${penaltyCount} from penalties`
                  : `Penalties: −${penaltyCount}`}
              </div>
            </div>
            <button className="taboo-btn taboo-btn-primary w-full mb-2" onClick={confirmTurn}>
              Apply Scores
            </button>
          </motion.div>
        )}

        {/* ---------- SCOREBOARD ---------- */}
        {screen === 'scoreboard' && (
          <motion.div
            key="scoreboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="taboo-screen flex flex-col items-center justify-center gap-6"
          >
            <h2 className="taboo-heading text-3xl">Scoreboard</h2>
            <div className="w-full flex flex-col gap-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`taboo-score-row ${scores[i] >= scores[1 - i] && scores[0] !== scores[1] ? 'taboo-score-leader' : ''}`}
                >
                  <span className="text-xl font-semibold truncate">{teamNames[i]}</span>
                  <span className="text-3xl font-bold">{scores[i]}</span>
                </div>
              ))}
            </div>
            <div className="taboo-heading text-lg opacity-80">
              {settings.gameMode === 'rounds'
                ? `Round ${currentRound} of ${totalRounds}`
                : `First to ${settings.targetScore} (equal turns)`}
            </div>
            <button
              className="taboo-btn taboo-btn-primary w-full"
              onClick={() => {
                playUi('forward');
                setScreen('handoff');
              }}
            >
              Next: {teamNames[activeTeam]}
            </button>
            <button className="taboo-btn taboo-btn-ghost w-full" onClick={endGameEarly}>
              End Game
            </button>
          </motion.div>
        )}

        {/* ---------- GAME OVER ---------- */}
        {screen === 'gameOver' && (
          <motion.div
            key="gameOver"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="taboo-screen flex flex-col items-center justify-center gap-6 text-center"
          >
            <h2 className="taboo-logo-sm">
              {winner === -1 ? "It's a Tie!" : `${teamNames[winner ?? 0]} Wins! 🎉`}
            </h2>
            <div className="w-full flex flex-col gap-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`taboo-score-row ${winner === i ? 'taboo-score-leader' : ''}`}
                >
                  <span className="text-xl font-semibold truncate">{teamNames[i]}</span>
                  <span className="text-3xl font-bold">{scores[i]}</span>
                </div>
              ))}
            </div>
            <button className="taboo-btn taboo-btn-primary w-full" onClick={startNewGame}>
              Play Again
            </button>
            <button
              className="taboo-btn taboo-btn-ghost w-full"
              onClick={() => {
                playUi('back');
                setScreen('home');
              }}
            >
              Main Menu
            </button>
          </motion.div>
        )}
      </>

      {/* ---------- RULES MODAL ---------- */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={() => {
              playUi('close');
              setShowRules(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="taboo-panel max-w-sm w-full max-h-[80dvh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="taboo-heading text-2xl mb-3 text-center">How to Play</h3>
              <ul className="flex flex-col gap-2 text-sm list-disc pl-5">
                <li>Split into two teams. Teams take turns; one player is the <strong>clue giver</strong>.</li>
                <li>The clue giver describes the big word <strong>without saying any of the 5 taboo words</strong> — or any form of them.</li>
                <li>No gestures, sound effects, spelling, initials, "rhymes with", "sounds like", abbreviations, or translations.</li>
                <li>A player from the <strong>other team</strong> watches the screen and hits <strong>BUZZ</strong> on any violation.</li>
                <li><strong>Correct guess</strong>: +1 point, next card. <strong>Buzz or Pass</strong>: penalty — the other team gets the point (or you lose one, per settings).</li>
                <li>When the timer ends, review the cards — tap any card to fix a mis-press before applying scores.</li>
                <li>Both teams always get an equal number of turns. Highest score wins!</li>
              </ul>
              <button
                className="taboo-btn taboo-btn-primary w-full mt-4"
                onClick={() => {
              playUi('close');
              setShowRules(false);
            }}
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Taboo;
