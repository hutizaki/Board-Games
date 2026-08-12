/* eslint-disable react-refresh/only-export-components --
   waveTimerTheme and useCountdown are part of this component's public API and
   ship in the same file on purpose, so it stays drop-in portable with no CSS
   and no sibling imports. Cost is fast-refresh falling back to a full reload
   when this one file is edited. */
import {
  memo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useId,
  forwardRef,
  useImperativeHandle,
  type CSSProperties,
  type ReactNode,
} from 'react';

/* ============================================================================
   WaveTimer — a countdown rendered as a white tide draining off a purple field.

   THREE ways to drive it. Pick one.

   1. Its own clock (uncontrolled)
        <WaveTimer duration={10} autoStart onComplete={fn} />
        const t = useRef<WaveTimerHandle>(null);
        t.current.start() / .pause() / .toggle() / .reset() / .set(4.2)

   2. A deadline (RECOMMENDED when a host app owns the clock)
        <WaveTimer duration={60} endsAt={endTimeMs} paused={false} />

      endsAt is an absolute epoch ms timestamp. The component interpolates the
      water level itself at rAF, so the host can tick its own state as slowly
      as it likes (1 Hz is fine) without the wave going steppy.

   3. A value you push every frame (controlled)
        <WaveTimer progress={0.4} />
        <WaveTimer duration={10} remaining={6} />

      Only smooth if you update at rAF. If you're on setInterval, use endsAt.

   In modes 2 and 3 the internal clock is off and the built-in controls are
   hidden unless you pass showControls explicitly.

   No dependencies, no CSS file.
   ========================================================================== */

/* ---------------------------------------------------------------- defaults */

export const waveTimerTheme = {
  deep: '#1A0B2E', // top of the purple field
  violet: '#4C1D95', // bottom of the purple field
  glow: '#7C3AED', // ambient light behind the water
  foam: '#F6F2FC', // the overlay itself
  crest: '#FFFFFF', // the line where water meets air
  onDark: '#F6F2FC', // type above the waterline
  onLight: '#3B1178', // type below the waterline
};

export type WaveTimerTheme = Partial<typeof waveTimerTheme>;

const MONO =
  'ui-monospace, "SF Mono", SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace';

const SAMPLES = 56;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------------- clock */

export interface UseCountdownOptions {
  duration?: number;
  autoStart?: boolean;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

export function useCountdown({
  duration = 10,
  autoStart = false,
  onComplete,
  onTick,
}: UseCountdownOptions = {}) {
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(autoStart);
  const remainingRef = useRef(duration);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  onCompleteRef.current = onComplete;
  onTickRef.current = onTick;

  const write = useCallback((v: number) => {
    remainingRef.current = v;
    setRemaining(v);
  }, []);

  useEffect(() => {
    write(duration);
    setRunning(autoStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  useEffect(() => {
    if (!running) return;
    if (remainingRef.current <= 0) {
      setRunning(false);
      return;
    }
    let raf: number;
    const end = performance.now() + remainingRef.current * 1000;
    const tick = () => {
      const left = Math.max(0, (end - performance.now()) / 1000);
      write(left);
      onTickRef.current?.(left);
      if (left <= 0) {
        setRunning(false);
        onCompleteRef.current?.();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, write]);

  const start = useCallback(() => {
    if (remainingRef.current <= 0) write(duration);
    setRunning(true);
  }, [duration, write]);

  const pause = useCallback(() => setRunning(false), []);
  const toggle = useCallback(() => (running ? pause() : start()), [running, pause, start]);
  const reset = useCallback(
    (next = duration) => {
      setRunning(false);
      write(next);
    },
    [duration, write]
  );
  const set = useCallback(
    (seconds: number) => write(clamp(seconds, 0, duration)),
    [duration, write]
  );

  return {
    remaining,
    running,
    finished: remaining <= 0,
    progress: duration > 0 ? clamp(1 - remaining / duration, 0, 1) : 1,
    start,
    pause,
    toggle,
    reset,
    set,
  };
}

/* ------------------------------------------------------------------ shapes */

/**
 * Surface points around y = 0. The caller translates the whole group down to
 * the waterline, so `d` only changes when the ripple changes — under reduced
 * motion `d` is fully static and the descent is a transform the compositor
 * can handle on its own.
 */
function surface(phase: number, amp: number) {
  const pts: string[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const x = i / SAMPLES;
    const y =
      amp *
      (0.62 * Math.sin(2 * Math.PI * 1.6 * x + phase) +
        0.38 * Math.sin(2 * Math.PI * 2.9 * x - phase * 1.37 + 1.1));
    pts.push(`${x.toFixed(4)},${y.toFixed(4)}`);
  }
  const body = pts.join(' L');
  return { fill: `M${body} L1,1.6 L0,1.6 Z`, crest: `M${body}` };
}

/** Same curve in absolute container space — only built when something needs clipping. */
function surfaceAt(level: number, phase: number, amp: number) {
  const pts: string[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const x = i / SAMPLES;
    const y =
      level +
      amp *
        (0.62 * Math.sin(2 * Math.PI * 1.6 * x + phase) +
          0.38 * Math.sin(2 * Math.PI * 2.9 * x - phase * 1.37 + 1.1));
    pts.push(`${x.toFixed(4)},${clamp(y, -0.25, 1.25).toFixed(4)}`);
  }
  return `M${pts.join(' L')} L1,1.25 L0,1.25 Z`;
}

/* --------------------------------------------------------------- component */

export interface WaveTimerHandle {
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: (next?: number) => void;
  set: (seconds: number) => void;
  readonly remaining: number;
  readonly running: boolean;
}

export interface WaveTimerProps {
  duration?: number;
  autoStart?: boolean;
  /** Absolute epoch ms when the timer expires. Interpolated at rAF. */
  endsAt?: number;
  /** Freeze the level while endsAt keeps sliding (e.g. host paused). */
  paused?: boolean;
  progress?: number;
  remaining?: number;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
  format?: (seconds: number) => string;
  label?: string;
  showControls?: boolean;
  showReadout?: boolean;
  /** Anything you want to sit in the water and invert as the crest passes. */
  children?: ReactNode;
  theme?: WaveTimerTheme;
  waveSpeed?: number;
  waveHeight?: number;
  /**
   * By default the surface calms as the glass fills or empties and is
   * choppiest mid-drain. Set false to hold one amplitude the whole way down,
   * so the sea never changes character with the clock.
   */
  easeWithTide?: boolean;
  rippleWhilePaused?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const WaveTimer = forwardRef<WaveTimerHandle, WaveTimerProps>(function WaveTimer(
  {
    duration = 10,
    autoStart = false,
    endsAt,
    paused = false,
    progress: progressProp,
    remaining: remainingProp,
    onComplete,
    onTick,
    format,
    label,
    showControls,
    showReadout = true,
    children,
    theme: themeProp,
    waveSpeed = 1,
    waveHeight = 0.028,
    easeWithTide = true,
    rippleWhilePaused = true,
    className,
    style,
  },
  ref
) {
  const theme = useMemo(() => ({ ...waveTimerTheme, ...themeProp }), [themeProp]);
  const reduced = usePrefersReducedMotion();

  // Unique per instance — two timers on one page must not share ids
  const uid = useId().replace(/:/g, '');
  const clipId = `wt-clip-${uid}`;
  const foamId = `wt-foam-${uid}`;

  const deadlineMode = typeof endsAt === 'number';
  const controlled =
    deadlineMode || typeof progressProp === 'number' || typeof remainingProp === 'number';

  const clock = useCountdown({
    duration,
    autoStart: controlled ? false : autoStart,
    onComplete,
    onTick,
  });

  /* ---- one rAF loop drives both the ripple and (in deadline mode) the level */

  const [tick, setTick] = useState(0);
  const phaseRef = useRef(0);
  const heldLevelRef = useRef(0);
  const firedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const rippleOn = !reduced;
  const loopOn = deadlineMode ? !paused || rippleOn : rippleOn && (clock.running || rippleWhilePaused);

  useEffect(() => {
    if (!loopOn) return;
    let raf: number;
    let last = performance.now();
    const frame = (t: number) => {
      if (rippleOn) phaseRef.current += ((t - last) / 1000) * waveSpeed * Math.PI;
      last = t;
      setTick((n) => n + 1);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [loopOn, rippleOn, waveSpeed]);

  /* ---------------------------------------------------------------- level */

  let progress: number;
  let secondsLeft: number;

  if (deadlineMode) {
    if (paused) {
      progress = heldLevelRef.current;
    } else {
      const left = Math.max(0, ((endsAt as number) - Date.now()) / 1000);
      progress = duration > 0 ? clamp(1 - left / duration, 0, 1) : 1;
      heldLevelRef.current = progress;
    }
    secondsLeft = duration * (1 - progress);
  } else if (typeof progressProp === 'number') {
    progress = clamp(progressProp, 0, 1);
    secondsLeft = duration * (1 - progress);
  } else if (typeof remainingProp === 'number') {
    secondsLeft = Math.max(0, remainingProp);
    progress = duration > 0 ? clamp(1 - secondsLeft / duration, 0, 1) : 1;
  } else {
    progress = clock.progress;
    secondsLeft = clock.remaining;
  }

  const finished = progress >= 1;

  // onComplete also fires in deadline mode, so the host can drop its own check
  useEffect(() => {
    if (!deadlineMode) return;
    if (finished && !firedRef.current) {
      firedRef.current = true;
      onCompleteRef.current?.();
    }
    if (!finished) firedRef.current = false;
  }, [deadlineMode, finished]);

  useImperativeHandle(
    ref,
    () => ({
      start: clock.start,
      pause: clock.pause,
      toggle: clock.toggle,
      reset: clock.reset,
      set: clock.set,
      get remaining() {
        return clock.remaining;
      },
      get running() {
        return clock.running;
      },
    }),
    [clock]
  );

  void tick; // the rAF counter exists purely to schedule a render

  /* the water is calm when the glass is full and when it's empty — unless the
     caller asked for one steady amplitude that never tracks the clock */
  const tide = easeWithTide ? Math.sqrt(Math.sin(Math.PI * clamp(progress, 0, 1))) : 1;
  const amp = reduced ? waveHeight * 0.35 : waveHeight * tide;

  const front = surface(phaseRef.current, amp);
  const back = surface(phaseRef.current + 2.1, amp * 0.8);

  const readout = format
    ? format(secondsLeft)
    : duration <= 60
      ? secondsLeft.toFixed(1)
      : `${Math.floor(secondsLeft / 60)}:${String(Math.floor(secondsLeft % 60)).padStart(2, '0')}`;

  const caption = label ?? (finished ? "Time's up" : duration <= 60 ? 'seconds left' : 'left');
  const controlsVisible = showControls ?? !controlled;
  const hasOverlay = showReadout || controlsVisible || !!children;

  /* Content renders twice: once in the air, once clipped to the water.
     Built by a plain function, not a nested component, so rAF renders update
     it instead of remounting the subtree 60 times a second. */
  const renderContent = (tone: string, interactive: boolean) => (
    <div
      aria-hidden={!interactive}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.75rem',
        color: tone,
        pointerEvents: interactive ? 'auto' : 'none',
      }}
    >
      {showReadout && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 'clamp(4rem, 18vw, 9rem)',
              fontWeight: 300,
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {readout}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: '0.6875rem',
              letterSpacing: '0.34em',
              textTransform: 'uppercase',
              opacity: 0.6,
              marginTop: '1.1rem',
            }}
          >
            {caption}
          </div>
        </div>
      )}

      {children}

      {controlsVisible && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Pill tone={tone} interactive={interactive} onClick={clock.toggle} solid={!clock.running}>
            {clock.running ? 'Pause' : clock.remaining <= 0 ? 'Again' : 'Start'}
          </Pill>
          <Pill tone={tone} interactive={interactive} onClick={() => clock.reset()}>
            Reset
          </Pill>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        isolation: 'isolate',
        contain: 'paint',
        background: `radial-gradient(120% 80% at 50% 108%, ${theme.glow}55 0%, transparent 62%), linear-gradient(180deg, ${theme.deep} 0%, ${theme.violet} 100%)`,
        ...style,
      }}
    >
      {hasOverlay && renderContent(theme.onDark, true)}

      {/* the water */}
      <svg
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id={foamId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.crest} />
            <stop offset="100%" stopColor={theme.foam} />
          </linearGradient>
          {hasOverlay && (
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d={surfaceAt(progress, phaseRef.current, amp)} />
            </clipPath>
          )}
        </defs>

        <g transform={`translate(0 ${progress.toFixed(5)})`}>
          <path d={back.fill} fill={theme.foam} opacity={0.4} />
          <path d={front.fill} fill={`url(#${foamId})`} />
          <path
            d={front.crest}
            fill="none"
            stroke={theme.crest}
            /* non-scaling-stroke means this is device px, not viewBox units */
            strokeWidth={1.6}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>

      {hasOverlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: `url(#${clipId})`,
            WebkitClipPath: `url(#${clipId})`,
            pointerEvents: 'none',
          }}
        >
          {renderContent(theme.onLight, false)}
        </div>
      )}
    </div>
  );
});

interface PillProps {
  children: ReactNode;
  onClick: () => void;
  tone: string;
  solid?: boolean;
  interactive: boolean;
}

function Pill({ children, onClick, tone, solid, interactive }: PillProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={interactive ? 0 : -1}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        font: `500 0.8125rem/1 ${MONO}`,
        letterSpacing: '0.08em',
        color: tone,
        background: hover ? `${tone}1F` : solid ? `${tone}14` : 'transparent',
        border: `1px solid ${tone}${solid ? '66' : '33'}`,
        borderRadius: 999,
        padding: '0.6rem 1.35rem',
        cursor: 'pointer',
        transition: 'background 160ms ease, border-color 160ms ease',
      }}
    >
      {children}
    </button>
  );
}

/**
 * Memoised: the host re-renders on every card change, and the wave's props are
 * fixed for the whole turn. Without this, each button press dragged a full
 * re-render of the wave through the same frame as the card swap. Its own rAF
 * loop still drives its animation.
 */
export default memo(WaveTimer);
