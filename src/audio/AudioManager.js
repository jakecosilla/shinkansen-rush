class AudioManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    
    // Volumes
    this.masterGain.gain.value = 0.8;
    
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.4;
    this.bgmGain.connect(this.masterGain);
    
    this.drivingGain = this.ctx.createGain();
    this.drivingGain.gain.value = 0.5;
    this.drivingGain.connect(this.masterGain);
    
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.8;
    this.sfxGain.connect(this.masterGain);

    this.isBirthdayPlaying = false;
    this.bgmInterval = null;
    this.bgmOscillators = [];
    this.drivingNodes = [];

    this.unlocked = false;
    const unlock = () => {
      if (this.unlocked) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if ('speechSynthesis' in window && !this.ttsUnlocked) {
        const silent = new SpeechSynthesisUtterance('a');
        silent.volume = 0;
        silent.rate = 10;
        window.speechSynthesis.speak(silent);
        this.ttsUnlocked = true;
      }
      this.unlocked = true;
      
      // If BGM was requested but suspended, starting it again might help
      if (this.bgmRequested && !this.bgmInterval) {
        this.playMenuBGM();
      }
    };

    document.addEventListener('click', unlock, { once: false });
    document.addEventListener('touchstart', unlock, { once: false });
    document.addEventListener('keydown', unlock, { once: false });

    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.ctx.state === 'running') this.ctx.suspend();
      } else {
        if (this.ctx.state === 'suspended') this.ctx.resume();
      }
    });
  }

  playNote(freq, type, startTime, duration, vol, destination) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    
    // Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(gain);
    gain.connect(destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
    return osc; // In case we need to keep track
  }

  playLaneChange() {
    const now = this.ctx.currentTime;
    // Synthy sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playCrash() {
    this.stopDrivingSound();
    this.stopBGM();

    const now = this.ctx.currentTime;
    
    // Noise burst
    const bufferSize = this.ctx.sampleRate * 1.5; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    // High impact filter
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(2000, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 1);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 1.2);
    
    // Low frequency boom
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.8);
    
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 1);
    
    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1);
  }

  playGameOver() {
    if (this.isBirthdayPlaying) return;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 1.5);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 1.5);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.5);
  }

  playMenuBGM() {
    this.bgmRequested = true;
    this.stopBGM();
    this.stopDrivingSound();

    // A nice relaxing arpeggio loop for the main menu background
    // Notes: C4, E4, G4, B4, C5, B4, G4, E4
    const notes = [261.63, 329.63, 392.00, 493.88, 523.25, 493.88, 392.00, 329.63];
    let step = 0;
    
    // Play the loop every 200ms
    this.bgmInterval = setInterval(() => {
      if (this.ctx.state === 'suspended') return;
      const freq = notes[step % notes.length];
      const now = this.ctx.currentTime;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4); // soft release
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.3);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);
      
      osc.start(now);
      osc.stop(now + 0.5);
      
      this.bgmOscillators.push(osc);
      if (this.bgmOscillators.length > 20) {
        this.bgmOscillators.shift(); // keep array small
      }
      
      step++;
    }, 200);
  }

  stopBGM() {
    this.bgmRequested = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  startDrivingSound() {
    this.stopDrivingSound();
    this.stopBGM();
    
    const now = this.ctx.currentTime;
    
    // Shinkansen is smooth. We need a steady low motor hum and wind noise.
    // 1. Motor Hum
    const motor = this.ctx.createOscillator();
    motor.type = 'triangle';
    motor.frequency.value = 350; // High pitch electrical whine
    const motorGain = this.ctx.createGain();
    motorGain.gain.value = 0.05;
    motor.connect(motorGain);
    
    const motorBass = this.ctx.createOscillator();
    motorBass.type = 'sine';
    motorBass.frequency.value = 60; // Deep rumble
    const motorBassGain = this.ctx.createGain();
    motorBassGain.gain.value = 0.4;
    motorBass.connect(motorBassGain);

    // 2. Smooth Wind (Pink/White noise with heavy low pass)
    const bufferSize = this.ctx.sampleRate * 2; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Rough pink noise approximation for smoother sound
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; 
        b6 = white * 0.115926;
    }
    const wind = this.ctx.createBufferSource();
    wind.buffer = buffer;
    wind.loop = true;
    
    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 500; // Heavily muffled wind
    
    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.8;
    
    wind.connect(windFilter);
    windFilter.connect(windGain);

    const driveGain = this.ctx.createGain();
    driveGain.gain.setValueAtTime(0, now);
    driveGain.gain.linearRampToValueAtTime(1, now + 1); // Fade in

    motorGain.connect(driveGain);
    motorBassGain.connect(driveGain);
    windGain.connect(driveGain);
    
    driveGain.connect(this.drivingGain);

    motor.start(now);
    motorBass.start(now);
    wind.start(now);
    
    this.drivingNodes = [motor, motorBass, wind, driveGain];
  }

  stopDrivingSound() {
    if (this.drivingNodes.length > 0) {
      const driveGain = this.drivingNodes[3]; 
      const now = this.ctx.currentTime;
      driveGain.gain.cancelScheduledValues(now);
      driveGain.gain.linearRampToValueAtTime(0, now + 0.3);
      
      const nodesToStop = [...this.drivingNodes];
      setTimeout(() => {
        nodesToStop.forEach(n => {
          if (n.stop) {
            try { n.stop(); } catch { /* ignore */ }
          }
        });
      }, 350);
      this.drivingNodes = [];
    }
  }

  playBirthdayEvent(playerName) {
    this.isBirthdayPlaying = true;
    this.stopDrivingSound();
    this.stopBGM();
    
    const now = this.ctx.currentTime;

    // Full Happy Birthday Song Note Frequencies
    // HBD TO YOU / HBD TO YOU / HBD DEAR [NAME] / HBD TO YOU
    // G4 G4 A4 G4 C5 B4 / G4 G4 A4 G4 D5 C5 / G4 G4 G5 E5 C5 B4 A4 / F5 F5 E5 C5 D5 C5
    const G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25;
    const D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
    
    const melody = [
      { f: G4, d: 0.3, t: 0, text: "Hap" }, { f: G4, d: 0.1, t: 0.35, text: "py" },
      { f: A4, d: 0.4, t: 0.5, text: "birth" }, { f: G4, d: 0.4, t: 1.0, text: "day" },
      { f: C5, d: 0.4, t: 1.5, text: "to" }, { f: B4, d: 0.8, t: 2.0, text: "you" },
      
      { f: G4, d: 0.3, t: 3.0, text: "Hap" }, { f: G4, d: 0.1, t: 3.35, text: "py" },
      { f: A4, d: 0.4, t: 3.5, text: "birth" }, { f: G4, d: 0.4, t: 4.0, text: "day" },
      { f: D5, d: 0.4, t: 4.5, text: "to" }, { f: C5, d: 0.8, t: 5.0, text: "you" },
      
      { f: G4, d: 0.3, t: 6.0, text: "Hap" }, { f: G4, d: 0.1, t: 6.35, text: "py" },
      { f: G5, d: 0.4, t: 6.5, text: "birth" }, { f: E5, d: 0.4, t: 7.0, text: "day" },
      { f: C5, d: 0.4, t: 7.5, text: "dear" }, { f: B4, d: 0.4, t: 8.0, text: playerName || "player" }, 
      { f: A4, d: 0.8, t: 8.5, text: "" },
      
      { f: F5, d: 0.3, t: 9.5, text: "Hap" }, { f: F5, d: 0.1, t: 9.85, text: "py" },
      { f: E5, d: 0.4, t: 10.0, text: "birth" }, { f: C5, d: 0.4, t: 10.5, text: "day" },
      { f: D5, d: 0.4, t: 11.0, text: "to" }, { f: C5, d: 1.2, t: 11.5, text: "you" }
    ];

    melody.forEach(note => {
      // Play synth tone
      this.playNote(note.f, 'triangle', now + note.t, note.d, 0.4, this.sfxGain);
    });

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        let voices = window.speechSynthesis.getVoices();
        let englishVoice = voices.find(v => v.lang.includes('en-US')) || voices.find(v => v.lang.includes('en'));

        const message = new SpeechSynthesisUtterance(`Happy Birthday, ${playerName || 'player'}!`);
        if (englishVoice) message.voice = englishVoice;
        message.lang = 'en-US';
        message.volume = 1;
        message.rate = 1.0;
        
        window._ttsRefs = window._ttsRefs || [];
        window._ttsRefs.push(message);
        message.onend = () => { window._ttsRefs = window._ttsRefs.filter(m => m !== message); };
        
        window.speechSynthesis.speak(message);
      }, 7000); // 7 seconds syncs with the melody "Dear Name" section
    }
    
    // Reset flag after song finishes (approx 13 seconds)
    setTimeout(() => {
      this.isBirthdayPlaying = false;
    }, 13000);
  }

  reset() {
    this.isBirthdayPlaying = false;
  }
}

export const audioManager = new AudioManager();
