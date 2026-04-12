import { useRef, useCallback } from 'react';

export function useWalleSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  const ctx = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
      return ctxRef.current;
    } catch { return null; }
  }, []);

  const tone = useCallback((freq: number, dur: number, t0: number, type: OscillatorType = 'sine', vol = 0.12) => {
    const ac = ctx();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ac.currentTime + t0);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t0 + dur);
    osc.start(ac.currentTime + t0);
    osc.stop(ac.currentTime + t0 + dur + 0.02);
  }, [ctx]);

  // Short rising chirp — played on click
  const playChirp = useCallback(() => {
    const ac = ctx();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ac.currentTime + 0.07);
    osc.frequency.exponentialRampToValueAtTime(950, ac.currentTime + 0.14);
    gain.gain.setValueAtTime(0.1, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.2);
  }, [ctx]);

  // Happy greeting — played on first interaction
  const playGreeting = useCallback(() => {
    tone(523, 0.09, 0.00);    // C5
    tone(659, 0.09, 0.11);    // E5
    tone(784, 0.12, 0.22);    // G5
    tone(1047, 0.18, 0.37);   // C6
  }, [tone]);

  // Subtle idle blip — played randomly
  const playBlip = useCallback(() => {
    tone(660, 0.05, 0, 'sine', 0.07);
  }, [tone]);

  // Curious questioning sound — played when "looking around"
  const playQuestion = useCallback(() => {
    tone(440, 0.07, 0.00);
    tone(523, 0.07, 0.09);
    tone(494, 0.12, 0.18);   // slight drop (questioning)
    tone(523, 0.10, 0.33);   // back up (curious)
  }, [tone]);

  return { playChirp, playGreeting, playBlip, playQuestion };
}
