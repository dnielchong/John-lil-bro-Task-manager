/**
 * Web Audio API Sound Synthesizer
 * Generates clean, crisp, sustained audio alarms without requiring external asset downloads.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentAlarmInterval: number | null = null;
  private alarmAutoStopTimer: number | null = null;
  private isAlarmPlaying = false;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play a short completion chime (happy triad chord)
   */
  playSuccess(volume = 0.5) {
    try {
      const ctx = this.getAudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
        gain.gain.linearRampToValueAtTime(volume * 0.4, ctx.currentTime + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.36);
      });
    } catch {
      // Audio might be blocked before first user interaction
    }
  }

  /**
   * Play workout rep click / tick sound
   */
  playTick(volume = 0.4) {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // ignore
    }
  }

  /**
   * Play single cycle of an alarm sound
   */
  playSoundPattern(soundName: string, volume = 0.7) {
    try {
      const ctx = this.getAudioContext();

      if (soundName === 'boxing-bell') {
        // Sustained boxing / gym bell gong with double strike
        [0, 0.28].forEach((offset) => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(440, ctx.currentTime + offset);
          osc2.frequency.setValueAtTime(659.25, ctx.currentTime + offset);

          gain.gain.setValueAtTime(volume * 0.7, ctx.currentTime + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 1.1);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(ctx.currentTime + offset);
          osc2.start(ctx.currentTime + offset);
          osc1.stop(ctx.currentTime + offset + 1.15);
          osc2.stop(ctx.currentTime + offset + 1.15);
        });
      } else if (soundName === 'zen-chime') {
        // Melodic resonant chime series
        const freqs = [587.33, 739.99, 880.0, 1174.66];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.14);
          gain.gain.setValueAtTime(volume * 0.45, ctx.currentTime + i * 0.14);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.14 + 1.0);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.14);
          osc.stop(ctx.currentTime + i * 0.14 + 1.05);
        });
      } else if (soundName === 'fanfare') {
        // Energetic wake-up fanfare
        const melody = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        melody.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
          gain.gain.setValueAtTime(volume * 0.35, ctx.currentTime + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.09);
          osc.stop(ctx.currentTime + idx * 0.09 + 0.37);
        });
      } else {
        // Default: 'digital-beep' (rhythmic 4-beep pulse)
        const beeps = [0, 0.14, 0.28, 0.42];
        beeps.forEach(delay => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1046.5, ctx.currentTime + delay); // C6 high alert
          gain.gain.setValueAtTime(volume * 0.35, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.09);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.1);
        });
      }
    } catch {
      // Audio context may not be unlocked yet
    }
  }

  /**
   * Start looping an alarm for a long sustained time (default 30 seconds minimum, or until dismissed)
   */
  startAlarmLoop(soundName = 'digital-beep', volume = 0.7, maxDurationSeconds = 35) {
    this.stopAlarmLoop();
    this.isAlarmPlaying = true;
    this.playSoundPattern(soundName, volume);

    // Sustained loop that fires every 1.4s
    this.currentAlarmInterval = window.setInterval(() => {
      if (this.isAlarmPlaying) {
        this.playSoundPattern(soundName, volume);
      }
    }, 1400);

    // Plays for at least maxDurationSeconds (e.g. 35 seconds) if unhandled
    this.alarmAutoStopTimer = window.setTimeout(() => {
      this.stopAlarmLoop();
    }, maxDurationSeconds * 1000);
  }

  /**
   * Stop active alarm sound immediately
   */
  stopAlarmLoop() {
    this.isAlarmPlaying = false;
    if (this.currentAlarmInterval !== null) {
      clearInterval(this.currentAlarmInterval);
      this.currentAlarmInterval = null;
    }
    if (this.alarmAutoStopTimer !== null) {
      clearTimeout(this.alarmAutoStopTimer);
      this.alarmAutoStopTimer = null;
    }
  }

  isLooping() {
    return this.isAlarmPlaying;
  }
}

export const soundEngine = new SoundEngine();
