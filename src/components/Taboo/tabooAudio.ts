import { useCallback, useEffect, useMemo, useRef } from 'react';

import dingSrc from '../../assets/audio/ding.mp3';
import buzzerSrc from '../../assets/audio/buzzer.mp3';
import boomSrc from '../../assets/audio/vine-boom.mp3';
import lobbyMusicSrc from '../../assets/audio/kahoot-lobby-music.mp3';

/**
 * Game audio.
 *
 * Every short effect is decoded once into an AudioBuffer and fired through an
 * AudioBufferSourceNode. The obvious approach — cloning an <audio> element per
 * press — costs a media-element pipeline spin-up on every tap, which is tens of
 * milliseconds on desktop and far worse on a phone. Buffer sources schedule
 * against the audio clock instead, so a press is inaudible-to-instant and stays
 * that way when a team rattles off answers.
 *
 * The lobby music deliberately stays an <audio> element: it is long, its start
 * is not latency-sensitive, and decoding it to PCM would cost megabytes of RAM.
 */

export type Clip = 'ding' | 'buzzer' | 'boom';

const CLIP_SOURCES: Record<Clip, string> = {
  ding: dingSrc,
  buzzer: buzzerSrc,
  boom: boomSrc,
};

const CLIP_GAIN: Record<Clip, number> = {
  ding: 0.6,
  buzzer: 0.6,
  boom: 0.55,
};

export type UiSound =
  | 'forward'
  | 'back'
  | 'select'
  | 'open'
  | 'close'
  | 'tick'
  | 'start'
  | 'fanfare'
  | 'endGame';

/** freq, duration, wave, volume, delay — a small note sequence per action. */
type Note = [number, number, OscillatorType, number, number];

const UI_NOTES: Record<UiSound, Note[]> = {
  forward: [
    [587, 0.08, 'sine', 0.18, 0],
    [880, 0.12, 'sine', 0.18, 0.06],
  ],
  back: [
    [587, 0.08, 'sine', 0.15, 0],
    [392, 0.12, 'sine', 0.15, 0.06],
  ],
  select: [[784, 0.05, 'square', 0.1, 0]],
  open: [
    [659, 0.07, 'triangle', 0.16, 0],
    [988, 0.1, 'triangle', 0.16, 0.05],
  ],
  close: [
    [784, 0.07, 'triangle', 0.14, 0],
    [523, 0.1, 'triangle', 0.14, 0.05],
  ],
  tick: [[1047, 0.04, 'square', 0.12, 0]],
  start: [
    [523, 0.1, 'sine', 0.2, 0],
    [659, 0.1, 'sine', 0.2, 0.09],
    [1047, 0.22, 'sine', 0.22, 0.18],
  ],
  fanfare: [
    [523, 0.12, 'sine', 0.22, 0],
    [659, 0.12, 'sine', 0.22, 0.12],
    [784, 0.12, 'sine', 0.22, 0.24],
    [1047, 0.45, 'sine', 0.25, 0.36],
  ],
  endGame: [
    [659, 0.14, 'sine', 0.18, 0],
    [523, 0.14, 'sine', 0.18, 0.13],
    [392, 0.3, 'sine', 0.18, 0.26],
  ],
};

/** The pass blip, kept here so every sound lives in one place. */
const PASS_NOTES: Note[] = [
  [520, 0.09, 'triangle', 0.18, 0],
  [390, 0.12, 'triangle', 0.18, 0.07],
];

export interface TabooAudio {
  /** Call inside a user gesture; safe to call repeatedly. */
  unlock: () => void;
  playClip: (clip: Clip) => void;
  playUi: (kind: UiSound) => void;
  playPass: () => void;
  startMusic: () => void;
  stopMusic: () => void;
}

export function useTabooAudio(): TabooAudio {
  const ctxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Partial<Record<Clip, AudioBuffer>>>({});
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      // 'interactive' asks for the smallest practical output buffer, which is
      // what keeps a button press feeling immediate.
      ctxRef.current = new Ctx({ latencyHint: 'interactive' });
    }
    return ctxRef.current;
  }, []);

  const unlock = useCallback(() => {
    const ctx = getCtx();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  }, [getCtx]);

  // Decode every effect up front so the first press pays no decode cost, and
  // keep the context awake across tab switches and screen locks.
  useEffect(() => {
    let cancelled = false;
    const ctx = getCtx();
    if (ctx) {
      for (const [name, url] of Object.entries(CLIP_SOURCES) as [Clip, string][]) {
        fetch(url)
          .then((res) => res.arrayBuffer())
          .then((data) => ctx.decodeAudioData(data))
          .then((buffer) => {
            if (!cancelled) buffersRef.current[name] = buffer;
          })
          .catch(() => {
            // Effect stays silent rather than falling back to a slow path
          });
      }
    }

    musicRef.current = new Audio(lobbyMusicSrc);
    musicRef.current.preload = 'auto';
    musicRef.current.volume = 0.5;

    // The very first gesture anywhere is enough to start the clock
    const onFirstGesture = () => unlock();
    window.addEventListener('pointerdown', onFirstGesture, { passive: true });
    const onVisible = () => {
      if (document.visibilityState === 'visible') unlock();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      window.removeEventListener('pointerdown', onFirstGesture);
      document.removeEventListener('visibilitychange', onVisible);
      musicRef.current?.pause();
      musicRef.current = null;
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, [getCtx, unlock]);

  const playClip = useCallback(
    (clip: Clip) => {
      const ctx = getCtx();
      const buffer = buffersRef.current[clip];
      if (!ctx || !buffer) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = CLIP_GAIN[clip];
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(); // overlapping presses layer instead of cutting each other off
    },
    [getCtx]
  );

  const playNotes = useCallback(
    (notes: Note[]) => {
      const ctx = getCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      for (const [freq, duration, type, volume, delay] of notes) {
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
      }
    },
    [getCtx]
  );

  const playUi = useCallback((kind: UiSound) => playNotes(UI_NOTES[kind]), [playNotes]);
  const playPass = useCallback(() => playNotes(PASS_NOTES), [playNotes]);

  const startMusic = useCallback(() => {
    const music = musicRef.current;
    if (!music) return;
    music.currentTime = 0;
    music.play().catch(() => {});
  }, []);

  const stopMusic = useCallback(() => {
    const music = musicRef.current;
    if (!music) return;
    music.pause();
    music.currentTime = 0;
  }, []);

  return useMemo(
    () => ({ unlock, playClip, playUi, playPass, startMusic, stopMusic }),
    [unlock, playClip, playUi, playPass, startMusic, stopMusic]
  );
}
