/**
 * Procedural Mechanical Workshop Audio Synthesizer
 * Uses Web Audio API to create authentic industrial machine audio effects without external audio files.
 */

class WorkshopAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.motorOsc = null;
    this.motorGain = null;
    this.noiseNode = null;
    this.noiseGain = null;
    this.filterNode = null;
    this.isMuted = false;
    this.isPlaying = false;
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playOperationSound(machineId, operationId = 'facing', speed = 750) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopSound();

    try {
      const now = this.ctx.currentTime;

      // 1. Motor / Spindle Low-Frequency Hum
      this.motorOsc = this.ctx.createOscillator();
      this.motorGain = this.ctx.createGain();

      let baseFreq = 80;
      if (machineId === 'lathe') baseFreq = 70 + (speed / 1200) * 80;
      else if (machineId === 'milling') baseFreq = 120 + (speed / 2000) * 120;
      else if (machineId === 'shaper' || machineId === 'planer') baseFreq = 50;
      else if (machineId === 'welding') baseFreq = 100; // 100Hz mains arc hum

      this.motorOsc.type = machineId === 'welding' ? 'sawtooth' : 'sine';
      this.motorOsc.frequency.setValueAtTime(baseFreq, now);

      this.motorGain.gain.setValueAtTime(0.01, now);
      this.motorGain.gain.linearRampToValueAtTime(0.12, now + 0.3);

      this.motorOsc.connect(this.motorGain);
      this.motorGain.connect(this.ctx.destination);
      this.motorOsc.start(now);

      // 2. Cutting / Arc White Noise Generator for Metal Shaving or Arc Crackle
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      this.filterNode = this.ctx.createBiquadFilter();
      if (machineId === 'welding') {
        this.filterNode.type = 'bandpass';
        this.filterNode.frequency.setValueAtTime(1400, now);
        this.filterNode.Q.setValueAtTime(2.0, now);
      } else {
        this.filterNode.type = 'highpass';
        this.filterNode.frequency.setValueAtTime(2200, now);
      }

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(0.01, now);
      this.noiseGain.gain.linearRampToValueAtTime(machineId === 'welding' ? 0.15 : 0.08, now + 0.4);

      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(this.noiseGain);
      this.noiseGain.connect(this.ctx.destination);
      this.noiseNode.start(now);

      this.isPlaying = true;
    } catch (err) {
      console.warn('Procedural audio error:', err);
    }
  }

  stopSound() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.motorGain) {
        this.motorGain.gain.linearRampToValueAtTime(0.001, now + 0.2);
      }
      if (this.noiseGain) {
        this.noiseGain.gain.linearRampToValueAtTime(0.001, now + 0.2);
      }
      setTimeout(() => {
        if (this.motorOsc) {
          try { this.motorOsc.stop(); } catch (e) {}
          this.motorOsc.disconnect();
          this.motorOsc = null;
        }
        if (this.noiseNode) {
          try { this.noiseNode.stop(); } catch (e) {}
          this.noiseNode.disconnect();
          this.noiseNode = null;
        }
        this.isPlaying = false;
      }, 250);
    } catch (e) {
      this.isPlaying = false;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopSound();
    }
    return this.isMuted;
  }
}

export const workshopAudio = new WorkshopAudioSynthesizer();
