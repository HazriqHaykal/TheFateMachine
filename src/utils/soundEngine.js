// Web Audio API sound engine — generates all sounds procedurally (no files needed)
class SoundEngine {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.muted = false
    this.noMercy = false
  }

  // Initialize AudioContext on first call (requires user gesture)
  init() {
    if (this.ctx) return
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.45
    this.masterGain.connect(this.ctx.destination)
  }

  resume() {
    if (this.ctx?.state === 'suspended') this.ctx.resume()
  }

  setMuted(val) {
    this.muted = val
    if (this.masterGain) this.masterGain.gain.value = val ? 0 : 0.45
  }

  setNoMercy(val) {
    this.noMercy = val
  }

  // Helper: create a simple oscillator that auto-stops
  _osc(type, freq, start, duration, gain = 0.3, freqEnd = null) {
    if (!this.ctx || this.muted) return
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, start + duration)
    }
    g.gain.setValueAtTime(gain, start)
    g.gain.exponentialRampToValueAtTime(0.001, start + duration)
    osc.connect(g)
    g.connect(this.masterGain)
    osc.start(start)
    osc.stop(start + duration + 0.01)
  }

  // Helper: white noise burst
  _noise(start, duration, gain = 0.3, filterFreq = 1000) {
    if (!this.ctx || this.muted) return
    const sampleRate = this.ctx.sampleRate
    const length = Math.ceil(sampleRate * duration)
    const buf = this.ctx.createBuffer(1, length, sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1)

    const src = this.ctx.createBufferSource()
    src.buffer = buf

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = filterFreq
    filter.Q.value = 1.5

    const g = this.ctx.createGain()
    g.gain.setValueAtTime(gain, start)
    g.gain.exponentialRampToValueAtTime(0.001, start + duration)

    src.connect(filter)
    filter.connect(g)
    g.connect(this.masterGain)
    src.start(start)
    src.stop(start + duration + 0.01)
  }

  // Short click/tick for rapid cycling
  playTick() {
    this.init(); this.resume()
    const t = this.ctx.currentTime
    this._osc('square', 900, t, 0.04, 0.08)
    this._noise(t, 0.03, 0.05, 2000)
  }

  // Bass thump heartbeat
  playHeartbeat() {
    this.init(); this.resume()
    const t = this.ctx.currentTime
    const intensity = this.noMercy ? 0.6 : 0.4
    this._osc('sine', 55, t, 0.18, intensity)
    this._osc('sine', 50, t + 0.18, 0.15, intensity * 0.8)
    // Add sub-bass kick
    this._osc('sine', 100, t, 0.1, 0.3, 40)
  }

  // Dramatic elimination sound
  playElimination() {
    this.init(); this.resume()
    const t = this.ctx.currentTime
    const intensity = this.noMercy ? 1.0 : 0.7

    // Noise burst
    this._noise(t, 0.25, intensity * 0.5, 800)
    // Descending sawtooth
    this._osc('sawtooth', 500, t, 0.5, intensity * 0.35, 30)
    // Low thud
    this._osc('sine', 80, t, 0.3, intensity * 0.4, 20)
    // High zap
    this._osc('square', 1200, t, 0.1, intensity * 0.2, 80)
  }

  // Countdown beep
  playCountdownBeep(isLast = false) {
    this.init(); this.resume()
    const t = this.ctx.currentTime
    const freq = isLast ? 1047 : 659
    this._osc('sine', freq, t, isLast ? 0.6 : 0.25, 0.5)
    this._osc('triangle', freq * 2, t, isLast ? 0.6 : 0.25, 0.15)
  }

  // Victory fanfare chord
  playVictory() {
    this.init(); this.resume()
    const t = this.ctx.currentTime
    // Ascending arpeggio in C major (C-E-G-C5)
    const notes = [523, 659, 784, 1047, 1319]
    notes.forEach((freq, i) => {
      this._osc('sine', freq, t + i * 0.12, 0.8 - i * 0.1, 0.3)
      this._osc('triangle', freq * 1.5, t + i * 0.12, 0.6 - i * 0.08, 0.1)
    })
    // Bass chord
    this._osc('sine', 130, t + 0.3, 1.0, 0.4)
    this._osc('sine', 164, t + 0.3, 1.0, 0.3)
  }

  // Rising suspense tone
  playSuspenseRise() {
    this.init(); this.resume()
    const t = this.ctx.currentTime
    this._osc('sawtooth', 80, t, 2.5, 0.25, 900)
    this._osc('sine', 60, t, 2.5, 0.3, 500)
    // Flutter effect
    this._noise(t + 1.5, 1.0, 0.1, 600)
  }

  // Final reveal sting
  playReveal() {
    this.init(); this.resume()
    const t = this.ctx.currentTime
    // Major chord stab
    const chord = [523, 659, 784, 1047]
    chord.forEach(freq => {
      this._osc('sine', freq, t, 1.2, 0.4)
      this._osc('sawtooth', freq, t, 0.3, 0.1)
    })
    this._noise(t, 0.2, 0.3, 2000)
  }

  // Lucky escape whoosh
  playLuckyEscape() {
    this.init(); this.resume()
    const t = this.ctx.currentTime
    this._osc('sine', 200, t, 0.4, 0.2, 800)
    this._osc('triangle', 300, t, 0.3, 0.1, 1200)
  }
}

export const soundEngine = new SoundEngine()
