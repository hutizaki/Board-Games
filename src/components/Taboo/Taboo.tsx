import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Taboo.css';
import { TABOO_CARDS, type TabooCard } from './tabooCards';

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
  const [winner, setWinner] = useState<number | null>(null); // null during play; -1 = tie shown on gameOver

  // Deck: shuffled indices into TABOO_CARDS, advancing across the whole game
  const deckRef = useRef<number[]>([]);
  const deckPosRef = useRef(0);
  const endTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickSecondRef = useRef(-1);
  const audioCtxRef = useRef<AudioContext | null>(null);

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

  const playCorrect = useCallback(() => {
    playTone(660, 0.12, 'sine', 0.25);
    playTone(990, 0.18, 'sine', 0.25, 0.1);
  }, [playTone]);

  const playBuzz = useCallback(() => {
    playTone(130, 0.5, 'sawtooth', 0.3);
    playTone(97, 0.5, 'square', 0.2);
    if (navigator.vibrate) navigator.vibrate(300);
  }, [playTone]);

  const playPass = useCallback(() => {
    playTone(330, 0.15, 'triangle', 0.2);
  }, [playTone]);

  const playTimeUp = useCallback(() => {
    playTone(880, 0.2, 'square', 0.2);
    playTone(660, 0.2, 'square', 0.2, 0.22);
    playTone(440, 0.4, 'square', 0.2, 0.44);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }, [playTone]);

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
    setTurnLog([]);
    setCurrentCard(drawCard());
    endTimeRef.current = Date.now() + settings.turnSeconds * 1000;
    setTimeLeft(settings.turnSeconds);
    lastTickSecondRef.current = -1;
    setScreen('turn');
  };

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
      const remainingMs = endTimeRef.current - Date.now();
      const remaining = Math.max(0, Math.ceil(remainingMs / 1000));
      setTimeLeft(remaining);
      // Tick during the last 5 seconds, once per second
      if (remaining > 0 && remaining <= 5 && lastTickSecondRef.current !== remaining) {
        lastTickSecondRef.current = remaining;
        playTone(1000, 0.05, 'square', 0.15);
      }
      if (remainingMs <= 0) {
        // Time's up: the card in play counts for nothing (correctable on review)
        setTurnLog((log) =>
          currentCard ? [...log, { card: currentCard, outcome: 'expired' }] : log
        );
        setCurrentCard(null);
        playTimeUp();
        setScreen('review');
      }
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [screen, currentCard, playTone, playTimeUp]);

  // ---- Review / scoring ----
  const cycleOutcome = (index: number) => {
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
            setWinner(newScores[0] > newScores[1] ? 0 : 1);
            setScreen('gameOver');
            return;
          }
        }
      } else {
        const target = settings.targetScore;
        const reached = newScores[0] >= target || newScores[1] >= target;
        if (reached && newScores[0] !== newScores[1]) {
          setWinner(newScores[0] > newScores[1] ? 0 : 1);
          setScreen('gameOver');
          return;
        }
        // Tie at/above target: keep playing until a round ends with a leader
      }
    }
    setScreen('scoreboard');
  };

  const endGameEarly = () => {
    if (scores[0] === scores[1]) setWinner(-1);
    else setWinner(scores[0] > scores[1] ? 0 : 1);
    setScreen('gameOver');
  };

  // ============ Render helpers ============

  const renderTimer = () => {
    const pct = Math.max(0, Math.min(1, timeLeft / settings.turnSeconds));
    const urgent = timeLeft <= 10;
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="taboo-heading text-lg">{teamNames[activeTeam]}</span>
          <span
            className={`taboo-timer text-3xl font-bold ${urgent ? 'text-red-400 taboo-pulse' : 'text-white'}`}
          >
            {timeLeft}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-black/30 overflow-hidden">
          <div
            className={`h-full rounded-full ${urgent ? 'bg-red-500' : 'bg-[#fa7268]'}`}
            style={{ width: `${pct * 100}%`, transition: 'width 0.1s linear' }}
          />
        </div>
      </div>
    );
  };

  const renderCard = (card: TabooCard) => (
    <motion.div
      key={card.word}
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="taboo-card w-full max-w-sm mx-auto"
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
      className="min-h-screen w-full flex flex-col items-center px-4 py-6"
      style={{
        background: `radial-gradient(circle at 50% 20%, #5b2a86 0%, ${PURPLE_BG} 65%)`,
        minHeight: '100dvh',
      }}
    >
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
            className="flex flex-col items-center justify-center flex-1 w-full max-w-sm gap-6"
          >
            <h1 className="taboo-logo">Taboo</h1>
            <p className="taboo-heading text-center text-lg -mt-4">
              Say it… without saying it!
            </p>
            <button className="taboo-btn taboo-btn-primary w-full" onClick={() => setScreen('setup')}>
              Start Game
            </button>
            <button className="taboo-btn taboo-btn-secondary w-full" onClick={() => setShowRules(true)}>
              How to Play
            </button>
            <button className="taboo-btn taboo-btn-ghost w-full" onClick={() => navigate('/')}>
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
            className="flex flex-col w-full max-w-sm gap-5 flex-1"
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
                    onClick={() => setSettings({ ...settings, turnSeconds: s })}
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
                  onClick={() => setSettings({ ...settings, gameMode: 'rounds' })}
                >
                  Fixed rounds
                </button>
                <button
                  className={`taboo-chip flex-1 ${settings.gameMode === 'target' ? 'taboo-chip-active' : ''}`}
                  onClick={() => setSettings({ ...settings, gameMode: 'target' })}
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
                      onClick={() => setSettings({ ...settings, roundsPerTeam: r })}
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
                      onClick={() => setSettings({ ...settings, targetScore: t })}
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
                  onClick={() => setSettings({ ...settings, penaltyStyle: 'opponent' })}
                >
                  Opponent +1
                </button>
                <button
                  className={`taboo-chip flex-1 ${settings.penaltyStyle === 'minus' ? 'taboo-chip-active' : ''}`}
                  onClick={() => setSettings({ ...settings, penaltyStyle: 'minus' })}
                >
                  Your team −1
                </button>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3 pb-2">
              <button className="taboo-btn taboo-btn-primary w-full" onClick={startNewGame}>
                Let's Play!
              </button>
              <button className="taboo-btn taboo-btn-ghost w-full" onClick={() => setScreen('home')}>
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
            className="flex flex-col items-center justify-center flex-1 w-full max-w-sm gap-6 text-center"
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
            className="flex flex-col flex-1 w-full max-w-sm gap-4"
          >
            {renderTimer()}
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
            <div className="text-center text-sm text-white/70 pb-1">
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
            className="flex flex-col w-full max-w-sm gap-4 flex-1"
          >
            <h2 className="taboo-heading text-3xl text-center">Time's Up!</h2>
            <p className="text-center text-white/80 text-sm -mt-2">
              Made a mistake? Tap any card to change its result.
            </p>
            <div className="flex flex-col gap-2 overflow-y-auto flex-1">
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
            className="flex flex-col items-center justify-center flex-1 w-full max-w-sm gap-6"
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
            <button className="taboo-btn taboo-btn-primary w-full" onClick={() => setScreen('handoff')}>
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
            className="flex flex-col items-center justify-center flex-1 w-full max-w-sm gap-6 text-center"
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
            <button className="taboo-btn taboo-btn-ghost w-full" onClick={() => setScreen('home')}>
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
            onClick={() => setShowRules(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="taboo-panel max-w-sm w-full max-h-[80vh] overflow-y-auto"
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
                onClick={() => setShowRules(false)}
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
