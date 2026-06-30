/**
 * Manages game audio with Web Audio fallback synthesis.
 */
class AudioManager {
    isMuted = false;
    audioContext = null;

    /**
     * Initializes audio and restores mute preference.
     */
    constructor() {
        this.isMuted = localStorage.getItem("gameMuted") === "true";
    }


    /**
     * Returns or creates the AudioContext.
     * @returns {AudioContext} Audio context instance.
     */
    getContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }


    /**
     * Plays a synthesized sound effect.
     * @param {string} name - Sound identifier.
     */
    playEffect(name) {
        if (this.isMuted) return;
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const presets = {
            throw: { freq: 400, dur: 0.1, type: "square" },
            hit: { freq: 200, dur: 0.15, type: "sawtooth" },
            coin: { freq: 880, dur: 0.12, type: "sine" },
            bottle: { freq: 660, dur: 0.1, type: "sine" },
            hurt: { freq: 150, dur: 0.2, type: "sawtooth" },
            bossHit: { freq: 120, dur: 0.25, type: "square" },
            win: { freq: 523, dur: 0.4, type: "sine" },
            gameOver: { freq: 100, dur: 0.5, type: "sawtooth" },
            snore: { freq: 80, dur: 0.3, type: "sine" }
        };
        const p = presets[name] || presets.hit;
        osc.type = p.type;
        osc.frequency.value = p.freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + p.dur);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + p.dur);
    }


    /**
     * Starts background music loop.
     */
    startMusic() {
        if (this.isMuted || this.musicOsc) return;
        const ctx = this.getContext();
        this.musicOsc = ctx.createOscillator();
        this.musicGain = ctx.createGain();
        this.musicOsc.connect(this.musicGain);
        this.musicGain.connect(ctx.destination);
        this.musicOsc.type = "sine";
        this.musicOsc.frequency.value = 220;
        this.musicGain.gain.value = 0.03;
        this.musicOsc.start();
    }


    /**
     * Stops all audio playback.
     */
    stopAll() {
        if (this.musicOsc) {
            this.musicOsc.stop();
            this.musicOsc = null;
        }
    }


    /**
     * Toggles mute and persists setting.
     * @returns {boolean} New mute state.
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem("gameMuted", String(this.isMuted));
        if (this.isMuted) this.stopAll();
        else if (typeof world !== "undefined" && world?.isRunning) this.startMusic();
        return this.isMuted;
    }

}
