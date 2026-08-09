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
import TeamsScreen from './TeamsScreen';
import {
  loadRecents,
  saveRecents,
  loadTeamNames,
  saveTeamNames,
  type Player,
} from './tabooRoster';

// ============ Types ============

type Screen =
  | 'home'
  | 'settings'
  | 'teams'
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

/** What a buzz or a pass costs. Buzzing and passing are set separately —
 *  plenty of houses punish a slip-up but let people skip a hard card freely. */
type PenaltyRule = 'opponent' | 'minus' | 'none';

const PENALTY_RULES: { id: PenaltyRule; label: string }[] = [
  { id: 'opponent', label: 'Opponent +1' },
  { id: 'minus', label: 'Your team −1' },
  { id: 'none', label: 'No penalty' },
];

/** Which side takes the first turn. 'random' is decided when the game starts. */
type FirstTeam = 'random' | 'a' | 'b';
/** Whether clue givers follow the team list or a shuffled order. */
type ClueOrder = 'random' | 'list';

interface TabooSettings {
  turnSeconds: number;
  buzzPenalty: PenaltyRule;
  passPenalty: PenaltyRule;
  firstTeam: FirstTeam;
  clueOrder: ClueOrder;
}

const DEFAULT_SETTINGS: TabooSettings = {
  turnSeconds: 60,
  buzzPenalty: 'opponent',
  passPenalty: 'opponent',
  firstTeam: 'random',
  clueOrder: 'random',
};

const SETTINGS_KEY = 'taboo_settings';

/** Shown on the home screen only, so a phone can be checked at a glance. */
const APP_VERSION = 'v.1.2';

const PURPLE_BG = '#3d1a63';

// Wave look. Both are fixed values — the sea must not change character as the
// clock runs down, so nothing here is derived from the timer.
const WAVE_SPEED = 1.85;
const WAVE_HEIGHT = 0.039;
// Amplitude is a fraction of container height, but the wavelength is a fraction
// of its width. On a phone that makes the same figure read as a much steeper
// swell, so narrow screens get half the height.
const NARROW_SCREEN = '(max-width: 639px)';

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
    // Pick fields explicitly so retired keys (the old game-length settings)
    // don't get carried forward and re-saved.
    return {
      turnSeconds: parsed.turnSeconds ?? DEFAULT_SETTINGS.turnSeconds,
      // Older saves had one combined rule; carry it onto both.
      buzzPenalty:
        parsed.buzzPenalty ??
        (parsed as { penaltyStyle?: PenaltyRule }).penaltyStyle ??
        DEFAULT_SETTINGS.buzzPenalty,
      passPenalty:
        parsed.passPenalty ??
        (parsed as { penaltyStyle?: PenaltyRule }).penaltyStyle ??
        DEFAULT_SETTINGS.passPenalty,
      firstTeam: parsed.firstTeam ?? DEFAULT_SETTINGS.firstTeam,
      clueOrder: parsed.clueOrder ?? DEFAULT_SETTINGS.clueOrder,
    };
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
  const [menuOpen, setMenuOpen] = useState(false);

  const [teamNames, setTeamNames] = useState<[string, string]>(loadTeamNames);
  // The line-up is per-session on purpose; only the pool of names persists.
  const [players, setPlayers] = useState<Player[]>([]);
  const [recents, setRecents] = useState<string[]>(loadRecents);
  const [scores, setScores] = useState<[number, number]>([0, 0]);

  const [narrowScreen, setNarrowScreen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(NARROW_SCREEN).matches
  );

  // Number of turns fully completed this game. Active team = turnsCompleted % 2.
  const [turnsCompleted, setTurnsCompleted] = useState(0);
  // Extra rounds added by sudden-death ties in fixed-rounds mode
  const [bonusRounds, setBonusRounds] = useState(0);
  // Decided at kick-off: which side takes turn one, and each team's running
  // order of clue givers (player ids).
  const [startingTeam, setStartingTeam] = useState<0 | 1>(0);
  const [clueOrders, setClueOrders] = useState<[number[], number[]]>([[], []]);
  /**
   * Everything the last Apply Scores changed, kept so the scoreboard can hand
   * the turn back for a correction. A miscount is usually only noticed once the
   * totals are on screen, and by then the turn has already been committed.
   */
  const [beforeApply, setBeforeApply] = useState<{
    scores: [number, number];
    turnsCompleted: number;
    bonusRounds: number;
  } | null>(null);

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

  // Turns alternate from whichever side won the toss, so both teams still get
  // an equal number and Math.floor(t / 2) is a team's own turn index either way.
  const activeTeam = (turnsCompleted + startingTeam) % 2;
  const currentRound = Math.floor(turnsCompleted / 2) + 1;
  // Game length comes from the line-up: play until everyone has given clues
  // once. The bigger team sets the count so both teams still get equal turns.
  const lineUp = (team: number) => players.filter((p) => p.team === team);
  const roundsPerTeam = Math.max(lineUp(0).length, lineUp(1).length, 1);
  const totalRounds = roundsPerTeam + bonusRounds;
  /**
   * Each team works through its own running order, one new clue giver per
   * round. The order is fixed when the game starts — shuffled, or the team list
   * as entered — so nobody gives clues twice before everyone has gone once.
   *
   * Returns null once the whole team has had a turn, which happens to the
   * smaller side of uneven teams and to both sides in sudden death. Rather than
   * naming someone a second time, the app steps back and lets the team appoint
   * whoever they want.
   */
  const clueGiver = (team: number): string | null => {
    const list = lineUp(team);
    if (list.length === 0) return null;
    const index = Math.floor(turnsCompleted / 2);
    if (index >= list.length) return null;
    const order = clueOrders[team];
    // Fall back to list order if the running order is missing or stale
    if (order.length === list.length) {
      const picked = players.find((p) => p.id === order[index]);
      if (picked) return picked.name;
    }
    return list[index].name;
  };

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
  // One shoe for the whole sitting: the position carries across games so a
  // group playing several in a row works through the whole deck before any
  // repeat. It only reshuffles once genuinely exhausted.
  const drawCard = useCallback((): TabooCard => {
    if (deckRef.current.length === 0 || deckPosRef.current >= deckRef.current.length) {
      deckRef.current = shuffledIndices(TABOO_CARDS.length);
      deckPosRef.current = 0;
    }
    const card = TABOO_CARDS[deckRef.current[deckPosRef.current]];
    deckPosRef.current += 1;
    return card;
  }, []);

  useEffect(() => {
    saveTeamNames(teamNames);
  }, [teamNames]);

  // The pool keeps every name we've seen, including the ones currently on a
  // team: the line-up isn't persisted, so a name held only by a player would
  // vanish with it at the end of the session.
  useEffect(() => {
    saveRecents([...recents, ...players.map((p) => p.name)]);
  }, [recents, players]);

  // ---- Game flow ----
  /**
   * Each team's running order for the game. Random by default so the first
   * name typed in isn't always the first to give clues; shuffling the order
   * (rather than drawing fresh each turn) keeps everyone going exactly once.
   */
  const buildClueOrders = (): [number[], number[]] => {
    const orderFor = (team: 0 | 1) => {
      const ids = players.filter((p) => p.team === team).map((p) => p.id);
      if (settings.clueOrder === 'list') return ids;
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      return ids;
    };
    return [orderFor(0), orderFor(1)];
  };

  const startNewGame = () => {
    playUi('forward');
    // The deck deliberately isn't reset here — see drawCard. Reshuffling every
    // game would deal a chunk of already-seen cards to the same people.
    setStartingTeam(
      settings.firstTeam === 'random'
        ? Math.random() < 0.5
          ? 0
          : 1
        : settings.firstTeam === 'a'
          ? 0
          : 1
    );
    setClueOrders(buildClueOrders());
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
    setBeforeApply(null); // the previous turn is closed for corrections now
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

  // Track the breakpoint live so rotating the phone rescales the swell
  useEffect(() => {
    const mq = window.matchMedia(NARROW_SCREEN);
    const update = () => setNarrowScreen(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

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
  const buzzCount = turnLog.filter((tc) => tc.outcome === 'buzzed').length;
  const passCount = turnLog.filter((tc) => tc.outcome === 'passed').length;
  const penaltyCount = buzzCount + passCount;

  /** Points this turn hands to the other team, per the two rules. */
  const pointsToOpponent =
    (settings.buzzPenalty === 'opponent' ? buzzCount : 0) +
    (settings.passPenalty === 'opponent' ? passCount : 0);
  /** Points this turn takes off the active team. */
  const pointsOffActive =
    (settings.buzzPenalty === 'minus' ? buzzCount : 0) +
    (settings.passPenalty === 'minus' ? passCount : 0);

  const confirmTurn = () => {
    // Snapshot first, so the scoreboard can undo this and come back for a fix
    setBeforeApply({ scores: [...scores], turnsCompleted, bonusRounds });
    const newScores: [number, number] = [...scores];
    newScores[activeTeam] += correctCount - pointsOffActive;
    newScores[1 - activeTeam] += pointsToOpponent;
    setScores(newScores);

    const completed = turnsCompleted + 1;
    setTurnsCompleted(completed);

    // Win conditions are only checked after a full round (both teams had equal turns)
    if (completed % 2 === 0) {
      const roundsDone = completed / 2;
      if (roundsDone >= totalRounds) {
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
    }
    playUi('forward');
    setScreen('scoreboard');
  };

  /**
   * Reopen the turn just scored. Rolls the applied points back off the board
   * and returns to the card list; the same Apply Scores button then commits the
   * corrected total, so the host never has to do the arithmetic themselves.
   */
  const revisitTurn = () => {
    if (!beforeApply) return;
    playUi('back');
    setScores(beforeApply.scores);
    setTurnsCompleted(beforeApply.turnsCompleted);
    setBonusRounds(beforeApply.bonusRounds);
    setBeforeApply(null);
    setScreen('review');
  };

  /** Back to the line-up with the teams intact, so players can be swapped. */
  const editTeams = () => {
    playUi('back');
    setMenuOpen(false);
    setScreen('teams');
  };

  const quitToMenu = () => {
    playUi('back');
    setMenuOpen(false);
    setWinner(null);
    setScreen('home');
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

  // The teams screen owns the whole viewport and brings its own layout grid, so
  // it renders outside the narrow scroll shell the other screens share. Every
  // hook above has already run, so this early return is safe.
  if (screen === 'teams') {
    return (
      <TeamsScreen
        players={players}
        setPlayers={setPlayers}
        recents={recents}
        setRecents={setRecents}
        teamNames={teamNames}
        setTeamNames={setTeamNames}
        roundsPerTeam={roundsPerTeam}
        onPlay={startNewGame}
        onBack={() => setScreen('settings')}
        onSound={playUi}
      />
    );
  }

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
            /* Constant sea: neither value tracks the clock, and easeWithTide
               switches off the component's own amplitude ramp so the swell
               stays identical from full to empty. */
            waveSpeed={WAVE_SPEED}
            waveHeight={narrowScreen ? WAVE_HEIGHT / 2 : WAVE_HEIGHT}
            easeWithTide={false}
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
                setScreen('settings');
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
            {/* Build marker: bump this when deploying, so it's obvious from the
                home screen whether a phone has the new version yet. */}
            <span className="taboo-version">{APP_VERSION}</span>
          </motion.div>
        )}

        {/* ---------- SETTINGS ---------- */}
        {screen === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="taboo-screen flex flex-col gap-5"
          >
            <h2 className="taboo-heading text-3xl text-center">Game Settings</h2>

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
              <label className="taboo-label">Who goes first</label>
              <div className="flex gap-2">
                {(
                  [
                    { id: 'random', label: 'Random' },
                    { id: 'a', label: teamNames[0] || 'Team A' },
                    { id: 'b', label: teamNames[1] || 'Team B' },
                  ] as { id: FirstTeam; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    className={`taboo-chip flex-1 truncate ${settings.firstTeam === opt.id ? 'taboo-chip-active' : ''}`}
                    onClick={() => {
                      playUi('select');
                      setSettings({ ...settings, firstTeam: opt.id });
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="taboo-panel">
              <label className="taboo-label">Clue giver order</label>
              <div className="flex gap-2">
                {(
                  [
                    { id: 'random', label: 'Shuffled' },
                    { id: 'list', label: 'Team list order' },
                  ] as { id: ClueOrder; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    className={`taboo-chip flex-1 ${settings.clueOrder === opt.id ? 'taboo-chip-active' : ''}`}
                    onClick={() => {
                      playUi('select');
                      setSettings({ ...settings, clueOrder: opt.id });
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/60 mt-2">
                Shuffled draws a fresh order each game, so the first name typed in isn't always
                first up. Either way everyone gives clues once before anyone repeats.
              </p>
            </div>

            <div className="taboo-panel">
              <label className="taboo-label">🚨 Buzz penalty</label>
              <div className="flex gap-2">
                {PENALTY_RULES.map((rule) => (
                  <button
                    key={rule.id}
                    className={`taboo-chip flex-1 ${settings.buzzPenalty === rule.id ? 'taboo-chip-active' : ''}`}
                    onClick={() => {
                      playUi('select');
                      setSettings({ ...settings, buzzPenalty: rule.id });
                    }}
                  >
                    {rule.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="taboo-panel">
              <label className="taboo-label">Pass penalty</label>
              <div className="flex gap-2">
                {PENALTY_RULES.map((rule) => (
                  <button
                    key={rule.id}
                    className={`taboo-chip flex-1 ${settings.passPenalty === rule.id ? 'taboo-chip-active' : ''}`}
                    onClick={() => {
                      playUi('select');
                      setSettings({ ...settings, passPenalty: rule.id });
                    }}
                  >
                    {rule.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/60 mt-2">
                Official Taboo penalises a pass the same as a buzz. Set it to no penalty if
                skipping a hard card should be free.
              </p>
            </div>

            <p className="text-center text-sm text-white/70 px-2">
              Game length comes from your line-up — every player gives clues once.
            </p>

            <div className="mt-auto flex flex-col gap-3 pb-2">
              <button
                className="taboo-btn taboo-btn-primary w-full"
                onClick={() => {
                  playUi('forward');
                  setScreen('teams');
                }}
              >
                Next: Players
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
              Round {currentRound} of {totalRounds}
            </div>
            <div className="taboo-heading text-lg opacity-80 -mb-3">
              {teamNames[activeTeam]}
            </div>
            <h2 className="taboo-logo-sm">
              {clueGiver(activeTeam) ?? `Anyone on ${teamNames[activeTeam]}`}
            </h2>
            <div className="taboo-panel text-left w-full">
              {clueGiver(activeTeam) ? (
                <p className="mb-2">
                  📱 Hand the device to <strong>{clueGiver(activeTeam)}</strong> — you're giving
                  clues this round.
                </p>
              ) : (
                <p className="mb-2">
                  📱 Everyone on <strong>{teamNames[activeTeam]}</strong> has given clues once, so
                  the team picks whoever they like for this one.
                </p>
              )}
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
            {/* Pressed Let's Play too early? Nothing has been scored yet, so
                stepping back to the line-up costs nothing. */}
            {turnsCompleted === 0 && (
              <button className="taboo-btn taboo-btn-ghost w-full" onClick={editTeams}>
                Back to Teams
              </button>
            )}
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
                <strong>{teamNames[activeTeam]}</strong>:{' '}
                {correctCount - pointsOffActive >= 0 ? '+' : ''}
                {correctCount - pointsOffActive}
              </div>
              <div className="text-sm text-white/80">
                {correctCount} correct
                {pointsOffActive > 0 && ` · −${pointsOffActive} penalty`}
              </div>
              {pointsToOpponent > 0 && (
                <div className="text-sm text-white/80">
                  {teamNames[1 - activeTeam]}: +{pointsToOpponent}
                </div>
              )}
              {penaltyCount > 0 && pointsToOpponent === 0 && pointsOffActive === 0 && (
                <div className="text-sm text-white/60">
                  {penaltyCount} buzz{penaltyCount === 1 ? '' : 'es'}/passes — no penalty
                </div>
              )}
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
              {`Round ${currentRound} of ${totalRounds}`}
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
            <button className="taboo-btn taboo-btn-ghost w-full" onClick={revisitTurn}>
              Back
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
            {/* Back to the line-up rather than straight into a turn: between
                games is exactly when people swap teams or tap out. */}
            <button
              className="taboo-btn taboo-btn-primary w-full"
              onClick={() => {
                playUi('forward');
                setWinner(null);
                setScreen('teams');
              }}
            >
              Play Again
            </button>
            <button className="taboo-btn taboo-btn-secondary w-full" onClick={startNewGame}>
              Rematch, Same Teams
            </button>
            <button className="taboo-btn taboo-btn-ghost w-full" onClick={quitToMenu}>
              Main Menu
            </button>
          </motion.div>
        )}
      </>

      {/* ---------- IN-GAME MENU ----------
          Offered at the natural pauses, never mid-turn: opening a menu while
          the clock is running would just cost the team seconds. */}
      {(screen === 'handoff' || screen === 'review' || screen === 'scoreboard') && (
        <button
          className="taboo-menu-btn"
          aria-label="Game menu"
          onClick={() => {
            playUi('open');
            setMenuOpen(true);
          }}
        >
          ☰
        </button>
      )}

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={() => {
              playUi('close');
              setMenuOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="taboo-panel w-full max-w-xs flex flex-col gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="taboo-heading text-2xl text-center mb-1">Game Menu</h3>
              <div className="text-center text-sm text-white/70 -mt-2 mb-1">
                {teamNames[0]} {scores[0]} — {scores[1]} {teamNames[1]} · Round {currentRound} of{' '}
                {totalRounds}
              </div>
              <button
                className="taboo-btn taboo-btn-primary w-full"
                onClick={() => {
                  playUi('close');
                  setMenuOpen(false);
                }}
              >
                Resume
              </button>
              <button
                className="taboo-btn taboo-btn-secondary w-full"
                onClick={() => {
                  setMenuOpen(false);
                  startNewGame();
                }}
              >
                Restart Game
              </button>
              <button className="taboo-btn taboo-btn-secondary w-full" onClick={editTeams}>
                Edit Teams
              </button>
              <button
                className="taboo-btn taboo-btn-ghost w-full"
                onClick={() => {
                  setMenuOpen(false);
                  endGameEarly();
                }}
              >
                End Game Now
              </button>
              <button className="taboo-btn taboo-btn-ghost w-full" onClick={quitToMenu}>
                Quit to Main Menu
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
