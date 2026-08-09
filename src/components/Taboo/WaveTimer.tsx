/* eslint-disable react-refresh/only-export-components --
   waveTimerTheme and useCountdown are part of this component's public API and
   ship in the same file on purpose, so it stays drop-in portable with no CSS
   and no sibling imports. Cost is fast-refresh falling back to a full reload
   when this one file is edited. */
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useId,
  forwardRef,
  useImperativeHandle,
  type CSSProperties,
} from 'react';

/* ============================================================================
   WaveTimer — a countdown rendered as a white tide draining off a purple field.

   Two ways to use it:

   1. Let it run itself (uncontrolled)
        <WaveTimer duration={10} autoStart onComplete={fn} />

      Drive it from outside with a ref:
        const t = useRef<WaveTimerHandle>(null);
        t.current.start() / .pause() / .toggle() / .reset() / .set(4.2)
        t.current.remaining  // seconds left, live

   2. Drive it from your own clock (controlled) — pass either one:
        <WaveTimer progress={0.4} />            // 0 = full white, 1 = all purple
        <WaveTimer duration={10} remaining={6} />

      In controlled mode the internal clock is off and the built-in
      controls are hidden unless you pass showControls explicitly.

   The useCountdown hook is exported on its own if you only want the clock.
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

const SAMPLES = 72;

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
  const set = useCallback((seconds: number) => write(clamp(seconds, 0, duration)), [duration, write]);

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

function surface(level: number, phase: number, amp: number) {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const x = i / SAMPLES;
    const y =
      level +
      amp *
        (0.62 * Math.sin(2 * Math.PI * 1.6 * x + phase) +
          0.38 * Math.sin(2 * Math.PI * 2.9 * x - phase * 1.37 + 1.1));
    pts.push([x, clamp(y, -0.25, 1.25)]);
  }
  const body = pts.map(([x, y]) => `${x.toFixed(4)},${y.toFixed(4)}`).join(' L');
  return { fill: `M${body} L1,1.25 L0,1.25 Z`, crest: `M${body}` };
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
  progress?: number;
  remaining?: number;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
  format?: (seconds: number) => string;
  label?: string;
  showControls?: boolean;
  theme?: WaveTimerTheme;
  waveSpeed?: number;
  waveHeight?: number;
  rippleWhilePaused?: boolean;
  showReadout?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const WaveTimer = forwardRef<WaveTimerHandle, WaveTimerProps>(function WaveTimer(
  {
    duration = 10,
    autoStart = false,
    progress: progressProp,
    remaining: remainingProp,
    onComplete,
    onTick,
    format,
    label,
    showControls,
    theme: themeProp,
    waveSpeed = 1.1,
    waveHeight = 0.028,
    rippleWhilePaused = true,
    showReadout = true,
    className,
    style,
  },
  ref
) {
  const theme = useMemo(() => ({ ...waveTimerTheme, ...themeProp }), [themeProp]);
  const reduced = usePrefersReducedMotion();
  // Unique per instance so two timers on one page can't share clip/gradient ids
  const uid = useId().replace(/:/g, '');
  const clipId = `wt-clip-${uid}`;
  const foamId = `wt-foam-${uid}`;

  const controlled = typeof progressProp === 'number' || typeof remainingProp === 'number';

  const clock = useCountdown({
    duration,
    autoStart: controlled ? false : autoStart,
    onComplete,
    onTick,
  });

  const progress = controlled
    ? typeof progressProp === 'number'
      ? clamp(progressProp, 0, 1)
      : clamp(1 - (remainingProp as number) / duration, 0, 1)
    : clock.progress;

  const secondsLeft = controlled
    ? typeof remainingProp === 'number'
      ? Math.max(0, remainingProp)
      : duration * (1 - progress)
    : clock.remaining;

  const running = controlled ? progress > 0 && progress < 1 : clock.running;
  const finished = progress >= 1;

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

  /* wave phase */
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);
  const animating = !reduced && (running || rippleWhilePaused) && !finished;

  useEffect(() => {
    if (!animating) return;
    let raf: number;
    let last = performance.now();
    const tick = (t: number) => {
      phaseRef.current += ((t - last) / 1000) * waveSpeed * Math.PI;
      last = t;
      setPhase(phaseRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animating, waveSpeed]);

  /* the water is calm when the glass is full and when it's empty */
  const amp = reduced
    ? waveHeight * 0.25
    : waveHeight * Math.sqrt(Math.sin(Math.PI * clamp(progress, 0, 1)));

  const front = surface(progress, phase, amp);
  const back = surface(progress - amp * 0.55, phase + 2.1, amp * 0.8);

  const readout = format
    ? format(secondsLeft)
    : duration <= 60
      ? secondsLeft.toFixed(1)
      : `${Math.floor(secondsLeft / 60)}:${String(Math.floor(secondsLeft % 60)).padStart(2, '0')}`;

  const caption = label ?? (finished ? "Time's up" : duration <= 60 ? 'seconds left' : 'left');

  const controlsVisible = showControls ?? !controlled;

  /* Content is rendered twice: once for air, once clipped to the water.
     Built by a plain function, not a nested component, so the rAF phase
     updates re-render it instead of remounting the subtree every frame. */
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
        minHeight: 320,
        overflow: 'hidden',
        isolation: 'isolate',
        background: `radial-gradient(120% 80% at 50% 108%, ${theme.glow}55 0%, transparent 62%), linear-gradient(180deg, ${theme.deep} 0%, ${theme.violet} 100%)`,
        ...style,
      }}
    >
      {/* type in the air */}
      {renderContent(theme.onDark, true)}

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
          <linearGradient id={foamId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.crest} />
            <stop offset="100%" stopColor={theme.foam} />
          </linearGradient>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={front.fill} />
          </clipPath>
        </defs>
        <path d={back.fill} fill={theme.foam} opacity={0.4} />
        <path d={front.fill} fill={`url(#${foamId})`} />
        <path
          d={front.crest}
          fill="none"
          stroke={theme.crest}
          strokeWidth={0.0035}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* type under the water */}
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
    </div>
  );
});

interface PillProps {
  children: React.ReactNode;
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

export default WaveTimer;
