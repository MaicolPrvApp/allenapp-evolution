// Segnali acustici del timer generati al volo (nessun file audio da scaricare).
let ac: AudioContext | null = null;

export function beep(freq = 880, dur = 0.12, when = 0, vol = 0.35) {
  try {
    ac ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
    o.type = "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch { /* audio non disponibile */ }
}
export const unlockAudio = () => beep(660, 0.05, 0, 0.01);
export const countSound = () => { beep(880, 0.1); navigator.vibrate?.(60); };
export const endSound = () => { beep(1320, 0.18); beep(1320, 0.18, 0.24); beep(1760, 0.4, 0.48); navigator.vibrate?.([200, 100, 200]); };
