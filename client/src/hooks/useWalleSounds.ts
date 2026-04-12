import { useRef, useCallback } from 'react';

export function useWalleSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  const ac = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
      return ctxRef.current;
    } catch { return null; }
  }, []);

  /** Play a single tone with attack/release */
  const tone = useCallback((
    freq: number, dur: number, t0: number,
    type: OscillatorType = 'sine', vol = 0.10,
    freqEnd?: number,
  ) => {
    const a = ac(); if (!a) return;
    const osc  = a.createOscillator();
    const gain = a.createGain();
    osc.connect(gain); gain.connect(a.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, a.currentTime + t0);
    if (freqEnd !== undefined)
      osc.frequency.exponentialRampToValueAtTime(freqEnd, a.currentTime + t0 + dur * 0.9);
    gain.gain.setValueAtTime(0, a.currentTime + t0);
    gain.gain.linearRampToValueAtTime(vol, a.currentTime + t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + t0 + dur);
    osc.start(a.currentTime + t0);
    osc.stop(a.currentTime + t0 + dur + 0.02);
  }, [ac]);

  /** Rising chirp — short tap/click response */
  const playChirp = useCallback(() => {
    tone(820, 0.07, 0.00, 'sine', 0.11, 1380);
    tone(1100, 0.05, 0.09, 'sine', 0.07, 880);
  }, [tone]);

  /** Happy 4-note greeting (C–E–G–C) */
  const playGreeting = useCallback(() => {
    tone(523, 0.10, 0.00, 'sine', 0.12);   // C5
    tone(659, 0.10, 0.12, 'sine', 0.12);   // E5
    tone(784, 0.12, 0.25, 'sine', 0.12);   // G5
    tone(1047, 0.22, 0.40, 'sine', 0.11);  // C6
  }, [tone]);

  /** Subtle idle blip — barely audible */
  const playBlip = useCallback(() => {
    tone(700, 0.045, 0, 'sine', 0.06);
  }, [tone]);

  /** Curious questioning melody — rises then dips */
  const playQuestion = useCallback(() => {
    tone(440, 0.07, 0.00, 'sine', 0.09);
    tone(554, 0.07, 0.09, 'sine', 0.09);
    tone(494, 0.11, 0.18, 'sine', 0.09, 440); // slides down questioningly
  }, [tone]);

  /** Sleepy murmur — very soft, low */
  const playSleepMurmur = useCallback(() => {
    tone(220, 0.18, 0, 'sine', 0.04, 200);
  }, [tone]);

  return { playChirp, playGreeting, playBlip, playQuestion, playSleepMurmur };
}
