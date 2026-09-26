/**
 * Advanced Procedural Mechanical Workshop Audio Synthesizer
 * Generates distinct, authentic, operation-specific acoustic profiles for all machines and operations
 * using the Web Audio API. Completely self-contained without external audio files.
 */

class WorkshopAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.activeNodes = [];
    this.activeIntervals = [];
    this.activeTimeouts = [];
    this.currentMachineId = null;
    this.currentOperationId = null;
    this.isMuted = false;
    this.isPlaying = false;
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Helper to create a looped noise buffer node
   */
  createNoiseBufferNode(type = 'white') {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'pink') {
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      } else if (type === 'brown') {
        data[i] = (lastOut + (0.05 * white)) / 1.05;
        lastOut = data[i];
        data[i] *= 2.5;
      } else {
        data[i] = white;
      }
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    return noiseSource;
  }

  /**
   * Play the unique audio assigned to the exact machine + operation
   * @param {string} machineId - lathe, welding, shaper, planer, milling, casting, moulding
   * @param {string} operationId - specific operation identifier
   * @param {number} speed - current RPM, Amps, or speed param
   */
  playOperationSound(machineId, operationId = 'facing', speed = 750) {
    if (this.isMuted) return;

    // If the exact same operation is already running, do not re-trigger
    if (this.isPlaying && this.currentMachineId === machineId && this.currentOperationId === operationId) {
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    // Completely stop previous audio before starting new operation sound
    this.stopSoundImmediate();

    this.currentMachineId = machineId;
    this.currentOperationId = operationId;

    try {
      const now = this.ctx.currentTime;
      const op = (operationId || '').toLowerCase();

      if (machineId === 'lathe') {
        this.playLatheOperation(op, speed, now);
      } else if (machineId === 'welding') {
        this.playWeldingOperation(op, speed, now);
      } else if (machineId === 'shaper') {
        this.playShaperOperation(op, speed, now);
      } else if (machineId === 'planer') {
        this.playPlanerOperation(op, speed, now);
      } else if (machineId === 'milling') {
        this.playMillingOperation(op, speed, now);
      } else if (machineId === 'casting') {
        this.playCastingOperation(op, speed, now);
      } else if (machineId === 'moulding') {
        this.playMouldingOperation(op, speed, now);
      } else {
        // Fallback dedicated machine cut
        this.playGenericMachiningSound(machineId, speed, now);
      }

      this.isPlaying = true;
    } catch (err) {
      console.warn('Audio synthesis error:', err);
    }
  }

  // ==========================================
  // 1. CENTRE LATHE OPERATIONS
  // ==========================================
  playLatheOperation(op, speed, now) {
    const rpmRatio = Math.max(0.4, Math.min(1.6, speed / 750));
    const spindleFreq = 65 * rpmRatio;

    // Motor / Spindle core tone
    const motorOsc = this.ctx.createOscillator();
    const motorGain = this.ctx.createGain();
    motorOsc.type = 'sine';
    motorOsc.frequency.setValueAtTime(spindleFreq, now);
    motorGain.gain.setValueAtTime(0.01, now);
    motorGain.gain.linearRampToValueAtTime(0.09, now + 0.2);
    motorOsc.connect(motorGain);
    motorGain.connect(this.masterGain);
    motorOsc.start(now);
    this.activeNodes.push(motorOsc, motorGain);

    if (op === 'facing') {
      // Facing: Radial cut across end face -> High-pitched continuous metallic shearing with subtle rotation modulation
      const noise = this.createNoiseBufferNode('white');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400 * rpmRatio, now);
      filter.Q.setValueAtTime(3.2, now);

      // 10Hz rotation flutter
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(spindleFreq / 6, now);
      lfoGain.gain.setValueAtTime(0.02, now);
      lfo.connect(lfoGain);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
      lfoGain.connect(gain.gain);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      lfo.start(now);
      this.activeNodes.push(noise, filter, gain, lfo, lfoGain);

    } else if (op === 'taper_turning' || op === 'contour_turning') {
      // Taper / Contour: Continuous longitudinal sweeping cut with harmonic bite
      const noise = this.createNoiseBufferNode('white');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800 * rpmRatio, now);
      filter.frequency.linearRampToValueAtTime(2600 * rpmRatio, now + 4.0);
      filter.Q.setValueAtTime(2.8, now);

      const biteOsc = this.ctx.createOscillator();
      const biteGain = this.ctx.createGain();
      biteOsc.type = 'triangle';
      biteOsc.frequency.setValueAtTime(420 * rpmRatio, now);
      biteGain.gain.setValueAtTime(0.03, now);
      biteOsc.connect(biteGain);
      biteGain.connect(this.masterGain);
      biteOsc.start(now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      this.activeNodes.push(noise, filter, gain, biteOsc, biteGain);

    } else if (op === 'boring') {
      // Boring: Internal hollow hole cutting -> Deep resonant tube cavity reverberation
      const noise = this.createNoiseBufferNode('pink');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);
      filter.Q.setValueAtTime(5.0, now);

      const cavityOsc = this.ctx.createOscillator();
      const cavityGain = this.ctx.createGain();
      cavityOsc.type = 'sine';
      cavityOsc.frequency.setValueAtTime(220, now);
      cavityGain.gain.setValueAtTime(0.06, now);
      cavityOsc.connect(cavityGain);
      cavityGain.connect(this.masterGain);
      cavityOsc.start(now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.13, now + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      this.activeNodes.push(noise, filter, gain, cavityOsc, cavityGain);

    } else if (op === 'drilling') {
      // Drilling on lathe: Axial thrust core drill squeal & chip evacuation
      const noise = this.createNoiseBufferNode('white');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2800, now);
      filter.Q.setValueAtTime(3.0, now);

      const drillThrust = this.ctx.createOscillator();
      const drillThrustGain = this.ctx.createGain();
      drillThrust.type = 'sawtooth';
      drillThrust.frequency.setValueAtTime(120, now);
      drillThrustGain.gain.setValueAtTime(0.05, now);
      drillThrust.connect(drillThrustGain);
      drillThrustGain.connect(this.masterGain);
      drillThrust.start(now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      this.activeNodes.push(noise, filter, gain, drillThrust, drillThrustGain);

    } else if (op === 'threading') {
      // Threading: Low-RPM synchronized intermittent helical thread bite
      const noise = this.createNoiseBufferNode('white');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(4.0, now);

      // 3Hz lead screw bite pulses
      const pulseOsc = this.ctx.createOscillator();
      const pulseGain = this.ctx.createGain();
      pulseOsc.type = 'triangle';
      pulseOsc.frequency.setValueAtTime(3.0, now);
      pulseGain.gain.setValueAtTime(0.05, now);
      pulseOsc.connect(pulseGain);

      gain.gain.setValueAtTime(0.02, now);
      pulseGain.connect(gain.gain);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      pulseOsc.start(now);
      this.activeNodes.push(noise, filter, gain, pulseOsc, pulseGain);

    } else if (op === 'knurling') {
      // Knurling: Cold rolling plastic deformation -> Heavy roller pressure thrum & diamond crunch (no chip squeal)
      const rollerOsc = this.ctx.createOscillator();
      const rollerGain = this.ctx.createGain();
      rollerOsc.type = 'triangle';
      rollerOsc.frequency.setValueAtTime(140, now);
      rollerGain.gain.setValueAtTime(0.09, now);

      const noise = this.createNoiseBufferNode('brown');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.10, now);

      rollerOsc.connect(rollerGain);
      rollerGain.connect(this.masterGain);
      rollerOsc.start(now);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      this.activeNodes.push(rollerOsc, rollerGain, noise, filter, gain);

    } else if (op === 'chamfering') {
      // Chamfering: Crisp high-frequency 45-degree edge bevel
      const noise = this.createNoiseBufferNode('white');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3600, now);
      gain.gain.setValueAtTime(0.08, now);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      this.activeNodes.push(noise, filter, gain);

    } else if (op === 'parting_off' || op === 'forming') {
      // Parting / Forming: Deep radial plunge grooving with high blade load
      const noise = this.createNoiseBufferNode('white');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.Q.setValueAtTime(4.0, now);

      const bladeWhine = this.ctx.createOscillator();
      const bladeGain = this.ctx.createGain();
      bladeWhine.type = 'sawtooth';
      bladeWhine.frequency.setValueAtTime(320, now);
      bladeGain.gain.setValueAtTime(0.04, now);
      bladeWhine.connect(bladeGain);
      bladeGain.connect(this.masterGain);
      bladeWhine.start(now);

      gain.gain.setValueAtTime(0.12, now);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      this.activeNodes.push(noise, filter, gain, bladeWhine, bladeGain);

    } else {
      // General lathe turning
      const noise = this.createNoiseBufferNode('white');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2100 * rpmRatio, now);
      gain.gain.setValueAtTime(0.10, now);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      this.activeNodes.push(noise, filter, gain);
    }
  }

  // ==========================================
  // 2. ARC WELDING OPERATIONS
  // ==========================================
  playWeldingOperation(op, currentAmps = 110, now) {
    const ampRatio = Math.max(0.6, Math.min(1.5, currentAmps / 110));

    // 100Hz / 120Hz rectified electrical arc discharge hum
    const arcOsc1 = this.ctx.createOscillator();
    const arcOsc2 = this.ctx.createOscillator();
    const arcGain = this.ctx.createGain();

    arcOsc1.type = 'sawtooth';
    arcOsc1.frequency.setValueAtTime(100 * ampRatio, now);
    arcOsc2.type = 'square';
    arcOsc2.frequency.setValueAtTime(200 * ampRatio, now);

    arcGain.gain.setValueAtTime(0.01, now);
    arcGain.gain.linearRampToValueAtTime(0.12, now + 0.2);

    arcOsc1.connect(arcGain);
    arcOsc2.connect(arcGain);
    arcGain.connect(this.masterGain);
    arcOsc1.start(now);
    arcOsc2.start(now);
    this.activeNodes.push(arcOsc1, arcOsc2, arcGain);

    // Sizzling molten weld pool + rapid crackling sparks
    const noise = this.createNoiseBufferNode('white');
    const filter = this.ctx.createBiquadFilter();
    const sizzleGain = this.ctx.createGain();

    if (op === 't_joint' || op === 'groove_weld') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.Q.setValueAtTime(2.5, now);
      sizzleGain.gain.setValueAtTime(0.18, now);
    } else {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.Q.setValueAtTime(2.0, now);
      sizzleGain.gain.setValueAtTime(0.15, now);
    }

    noise.connect(filter);
    filter.connect(sizzleGain);
    sizzleGain.connect(this.masterGain);
    noise.start(now);
    this.activeNodes.push(noise, filter, sizzleGain);

    // Randomized spark popping bursts
    const popInterval = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      try {
        const popTime = this.ctx.currentTime;
        const popOsc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        popOsc.type = 'square';
        popOsc.frequency.setValueAtTime(800 + Math.random() * 1200, popTime);
        popGain.gain.setValueAtTime(0.06 + Math.random() * 0.08, popTime);
        popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.04);
        popOsc.connect(popGain);
        popGain.connect(this.masterGain);
        popOsc.start(popTime);
        popOsc.stop(popTime + 0.05);
      } catch (e) {}
    }, 120);
    this.activeIntervals.push(popInterval);
  }

  // ==========================================
  // 3. SHAPING MACHINE OPERATIONS
  // ==========================================
  playShaperOperation(op, spm = 45, now) {
    // 2.0s reciprocating cadence: 1.3s cutting stroke + 0.7s return with clapper box click
    const strokeDuration = 2.0;

    const strokeCycle = () => {
      if (!this.isPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;

      // Forward Cutting Stroke: Linear metal shearing
      const cutNoise = this.createNoiseBufferNode('white');
      const cutFilter = this.ctx.createBiquadFilter();
      const cutGain = this.ctx.createGain();

      cutFilter.type = 'bandpass';
      cutFilter.frequency.setValueAtTime(op === 'slot_cutting' ? 950 : 1500, t);
      cutFilter.Q.setValueAtTime(3.0, t);

      cutGain.gain.setValueAtTime(0.01, t);
      cutGain.gain.linearRampToValueAtTime(0.15, t + 0.15);
      cutGain.gain.setValueAtTime(0.15, t + 1.1);
      cutGain.gain.linearRampToValueAtTime(0.001, t + 1.3);

      cutNoise.connect(cutFilter);
      cutFilter.connect(cutGain);
      cutGain.connect(this.masterGain);
      cutNoise.start(t);
      cutNoise.stop(t + 1.35);

      // Return Stroke Clapper Box Clack
      const clapperTimeout = setTimeout(() => {
        if (!this.isPlaying || !this.ctx) return;
        try {
          const clickTime = this.ctx.currentTime;
          const clapperOsc = this.ctx.createOscillator();
          const clapperGain = this.ctx.createGain();
          clapperOsc.type = 'triangle';
          clapperOsc.frequency.setValueAtTime(550, clickTime);
          clapperGain.gain.setValueAtTime(0.08, clickTime);
          clapperGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.08);
          clapperOsc.connect(clapperGain);
          clapperGain.connect(this.masterGain);
          clapperOsc.start(clickTime);
          clapperOsc.stop(clickTime + 0.09);
        } catch (e) {}
      }, 1350);
      this.activeTimeouts.push(clapperTimeout);
    };

    strokeCycle();
    const interval = setInterval(strokeCycle, strokeDuration * 1000);
    this.activeIntervals.push(interval);

    // Continuous low-frequency drive gearbox hum
    const motorOsc = this.ctx.createOscillator();
    const motorGain = this.ctx.createGain();
    motorOsc.type = 'sine';
    motorOsc.frequency.setValueAtTime(50, now);
    motorGain.gain.setValueAtTime(0.06, now);
    motorOsc.connect(motorGain);
    motorGain.connect(this.masterGain);
    motorOsc.start(now);
    this.activeNodes.push(motorOsc, motorGain);
  }

  // ==========================================
  // 4. PLANING MACHINE OPERATIONS
  // ==========================================
  playPlanerOperation(op, speed = 25, now) {
    // 3.5s long table reciprocation: 2.4s heavy guideway cut + 1.1s return
    const strokeDuration = 3.5;

    const strokeCycle = () => {
      if (!this.isPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;

      // Heavy Guideway Table Rumble
      const bedRumble = this.ctx.createOscillator();
      const bedGain = this.ctx.createGain();
      bedRumble.type = 'sawtooth';
      bedRumble.frequency.setValueAtTime(42, t);
      bedGain.gain.setValueAtTime(0.01, t);
      bedGain.gain.linearRampToValueAtTime(0.12, t + 0.3);
      bedGain.gain.setValueAtTime(0.12, t + 2.1);
      bedGain.gain.linearRampToValueAtTime(0.001, t + 2.4);

      bedRumble.connect(bedGain);
      bedGain.connect(this.masterGain);
      bedRumble.start(t);
      bedRumble.stop(t + 2.45);

      // Heavy planar metal shaving
      const noise = this.createNoiseBufferNode('pink');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, t);
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.2);
      gain.gain.setValueAtTime(0.14, t + 2.1);
      gain.gain.linearRampToValueAtTime(0.001, t + 2.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(t);
      noise.stop(t + 2.45);
    };

    strokeCycle();
    const interval = setInterval(strokeCycle, strokeDuration * 1000);
    this.activeIntervals.push(interval);
  }

  // ==========================================
  // 5. MILLING MACHINE OPERATIONS
  // ==========================================
  playMillingOperation(op, rpm = 1200, now) {
    const rpmRatio = Math.max(0.5, Math.min(1.8, rpm / 1200));

    // Spindle Drive Whine
    const spindleOsc = this.ctx.createOscillator();
    const spindleGain = this.ctx.createGain();
    spindleOsc.type = 'sawtooth';
    spindleOsc.frequency.setValueAtTime(160 * rpmRatio, now);
    spindleGain.gain.setValueAtTime(0.07, now);
    spindleOsc.connect(spindleGain);
    spindleGain.connect(this.masterGain);
    spindleOsc.start(now);
    this.activeNodes.push(spindleOsc, spindleGain);

    if (op === 'face_milling') {
      // Multi-tooth face cutter rapid chopping cadence (6-tooth flutter)
      const noise = this.createNoiseBufferNode('white');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1900, now);
      filter.Q.setValueAtTime(2.0, now);

      const chopLfo = this.ctx.createOscillator();
      const chopGain = this.ctx.createGain();
      chopLfo.frequency.setValueAtTime(24 * rpmRatio, now);
      chopGain.gain.setValueAtTime(0.04, now);
      chopLfo.connect(chopGain);

      gain.gain.setValueAtTime(0.12, now);
      chopGain.connect(gain.gain);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      chopLfo.start(now);
      this.activeNodes.push(noise, filter, gain, chopLfo, chopGain);

    } else if (op === 'pocket_milling' || op === 'slot_milling' || op === 'end_milling') {
      // High-speed 4-flute end mill whine & chip ejection
      const noise = this.createNoiseBufferNode('white');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2600, now);
      filter.Q.setValueAtTime(3.0, now);

      const fluteWhine = this.ctx.createOscillator();
      const fluteGain = this.ctx.createGain();
      fluteWhine.type = 'sine';
      fluteWhine.frequency.setValueAtTime(680 * rpmRatio, now);
      fluteGain.gain.setValueAtTime(0.04, now);
      fluteWhine.connect(fluteGain);
      fluteGain.connect(this.masterGain);
      fluteWhine.start(now);

      gain.gain.setValueAtTime(0.13, now);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      this.activeNodes.push(noise, filter, gain, fluteWhine, fluteGain);
    }
  }

  // ==========================================
  // 6. METAL CASTING OPERATIONS
  // ==========================================
  playCastingOperation(op, param = 720, now) {
    if (op === 'pouring' || op === 'filling') {
      // 720°C Liquid aluminum pour & bubbling flow
      const noise = this.createNoiseBufferNode('pink');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.15, now);

      // Thermal stream sizzle
      const sizzle = this.createNoiseBufferNode('white');
      const sizzleFilter = this.ctx.createBiquadFilter();
      const sizzleGain = this.ctx.createGain();
      sizzleFilter.type = 'highpass';
      sizzleFilter.frequency.setValueAtTime(3000, now);
      sizzleGain.gain.setValueAtTime(0.06, now);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);

      sizzle.connect(sizzleFilter);
      sizzleFilter.connect(sizzleGain);
      sizzleGain.connect(this.masterGain);
      sizzle.start(now);

      this.activeNodes.push(noise, filter, gain, sizzle, sizzleFilter, sizzleGain);

    } else if (op === 'solidification') {
      // Soft cooling convection breeze & subtle crystallization pings
      const noise = this.createNoiseBufferNode('pink');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.07, now);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      this.activeNodes.push(noise, filter, gain);

    } else if (op === 'casting_removal') {
      // Shakeout vibrator thumping & crumbling sand rattle
      const shakeOsc = this.ctx.createOscillator();
      const shakeGain = this.ctx.createGain();
      shakeOsc.type = 'triangle';
      shakeOsc.frequency.setValueAtTime(35, now);
      shakeGain.gain.setValueAtTime(0.14, now);
      shakeOsc.connect(shakeGain);
      shakeGain.connect(this.masterGain);
      shakeOsc.start(now);

      const noise = this.createNoiseBufferNode('brown');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.12, now);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);

      this.activeNodes.push(shakeOsc, shakeGain, noise, filter, gain);
    }
  }

  // ==========================================
  // 7. SAND MOULDING OPERATIONS
  // ==========================================
  playMouldingOperation(op, param = 0, now) {
    if (op === 'ramming') {
      // Rhythmic pneumatic compaction thuds
      const ramInterval = setInterval(() => {
        if (!this.isPlaying || !this.ctx) return;
        try {
          const t = this.ctx.currentTime;
          const thud = this.ctx.createOscillator();
          const thudGain = this.ctx.createGain();
          thud.type = 'triangle';
          thud.frequency.setValueAtTime(80, t);
          thud.frequency.exponentialRampToValueAtTime(30, t + 0.15);
          thudGain.gain.setValueAtTime(0.22, t);
          thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          thud.connect(thudGain);
          thudGain.connect(this.masterGain);
          thud.start(t);
          thud.stop(t + 0.22);
        } catch (e) {}
      }, 400);
      this.activeIntervals.push(ramInterval);

    } else if (op === 'sand_filling' || op === 'green_sand_preparation') {
      // Granular moist sand tumbling & settling
      const noise = this.createNoiseBufferNode('brown');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      gain.gain.setValueAtTime(0.12, now);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      this.activeNodes.push(noise, filter, gain);

    } else if (op === 'venting') {
      // Vent wire insertion & soft granular friction
      const noise = this.createNoiseBufferNode('pink');
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3.0, now);
      gain.gain.setValueAtTime(0.09, now);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      this.activeNodes.push(noise, filter, gain);
    }
  }

  playGenericMachiningSound(machineId, speed, now) {
    const motorOsc = this.ctx.createOscillator();
    const motorGain = this.ctx.createGain();
    motorOsc.type = 'sine';
    motorOsc.frequency.setValueAtTime(80, now);
    motorGain.gain.setValueAtTime(0.08, now);
    motorOsc.connect(motorGain);
    motorGain.connect(this.masterGain);
    motorOsc.start(now);

    const noise = this.createNoiseBufferNode('white');
    const filter = this.ctx.createBiquadFilter();
    const noiseGain = this.ctx.createGain();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    noiseGain.gain.setValueAtTime(0.08, now);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);

    this.activeNodes.push(motorOsc, motorGain, noise, filter, noiseGain);
  }

  /**
   * Smoothly stops the currently running operation sound
   */
  stopSound() {
    this.currentMachineId = null;
    this.currentOperationId = null;
    this.isPlaying = false;

    // Clear active pulsing timers
    this.activeIntervals.forEach(id => clearInterval(id));
    this.activeIntervals = [];
    this.activeTimeouts.forEach(id => clearTimeout(id));
    this.activeTimeouts = [];

    if (!this.ctx || this.activeNodes.length === 0) return;

    try {
      const now = this.ctx.currentTime;
      const nodesToCleanup = [...this.activeNodes];
      this.activeNodes = [];

      nodesToCleanup.forEach(node => {
        if (node instanceof GainNode) {
          try {
            node.gain.cancelScheduledValues(now);
            node.gain.setValueAtTime(node.gain.value, now);
            node.gain.linearRampToValueAtTime(0.001, now + 0.15);
          } catch (e) {}
        }
      });

      setTimeout(() => {
        nodesToCleanup.forEach(node => {
          try {
            if (node.stop) node.stop();
            if (node.disconnect) node.disconnect();
          } catch (e) {}
        });
      }, 180);
    } catch (e) {}
  }

  /**
   * Immediately stops all sound nodes without delay (used when switching operations)
   */
  stopSoundImmediate() {
    this.currentMachineId = null;
    this.currentOperationId = null;
    this.isPlaying = false;

    this.activeIntervals.forEach(id => clearInterval(id));
    this.activeIntervals = [];
    this.activeTimeouts.forEach(id => clearTimeout(id));
    this.activeTimeouts = [];

    if (!this.ctx || this.activeNodes.length === 0) return;

    const nodesToCleanup = [...this.activeNodes];
    this.activeNodes = [];

    nodesToCleanup.forEach(node => {
      try {
        if (node instanceof GainNode) {
          node.gain.cancelScheduledValues(this.ctx.currentTime);
          node.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        }
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopSoundImmediate();
    }
    return this.isMuted;
  }
}

export const workshopAudio = new WorkshopAudioSynthesizer();
