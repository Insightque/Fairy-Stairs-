
export class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = localStorage.getItem('fairy_stairs_muted') === 'true';

  constructor() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("AudioContext not supported");
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    localStorage.setItem('fairy_stairs_muted', mute.toString());
  }

  getMuted() {
    return this.isMuted;
  }

  private resume() {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, gainVal: number) {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playStep() {
    this.playTone(440 + Math.random() * 100, 'triangle', 0.1, 0.1);
  }

  playTurn() {
    this.playTone(660, 'sine', 0.08, 0.08);
  }

  playCoin() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    // High pitched ting sound
    this.playTone(1200, 'sine', 0.1, 0.05);
    setTimeout(() => this.playTone(1800, 'sine', 0.2, 0.05), 50);
  }

  playFail() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  playStart() {
    [261, 329, 392, 523].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.3, 0.1), i * 100);
    });
  }
}

export const soundManager = new SoundManager();
