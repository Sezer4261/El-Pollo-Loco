/**
 * Manages game audio playback and mute state.
 */
class AudioManager {
    isMuted = false;
    sounds = {};
    music = null;
    musicMode = "menu";
    gameLoopStart = 10;
    audioContext = null;

    /**
     * Initializes audio and restores mute preference.
     */
    constructor() {
        this.loadSounds();
        this.isMuted = localStorage.getItem("gameMuted") === "true";
        preloadSpeechVoices();
    }


    /**
     * Registers all game sound files.
     */
    loadSounds() {
        registerSoundEffects(this);
        registerBackgroundMusic(this);
        this.bindMusicEvents();
    }


    /**
     * Creates an audio element with volume.
     * @param {string} path - Audio file path.
     * @param {number} volume - Playback volume.
     * @returns {HTMLAudioElement} Configured audio element.
     */
    createSound(path, volume) {
        const audio = new Audio(path);
        audio.volume = volume;
        return audio;
    }


    /**
     * Binds loop handling for menu and in-game music playback.
     */
    bindMusicEvents() {
        this.music.addEventListener("timeupdate", () => this.handleMusicLoop());
        this.music.addEventListener("ended", () => this.handleMusicEnded());
    }


    /**
     * Loops in-game music from the gameplay start marker.
     */
    handleMusicLoop() {
        if (this.isMuted || this.musicMode !== "game" || !this.music.duration) return;
        if (this.music.currentTime >= this.music.duration - 0.15) {
            this.music.currentTime = this.gameLoopStart;
        }
    }


    /**
     * Restarts music when playback reaches the end.
     */
    handleMusicEnded() {
        if (this.isMuted) return;
        if (this.musicMode === "game") {
            this.playFrom(this.gameLoopStart);
            return;
        }
        this.playFrom(0);
    }


    /**
     * Plays music from a specific time if not muted.
     * @param {number} time - Start time in seconds.
     */
    playFrom(time) {
        if (this.isMuted || !this.music) return;
        this.music.currentTime = time;
        this.music.play().catch(() => {});
    }


    /**
     * Starts menu music from the beginning.
     * @param {boolean} [reset=false] - Restart from second 0.
     */
    startMenuMusic(reset = false) {
        if (this.isMuted || !this.music) return;
        const switchFromGame = this.musicMode === "game";
        this.musicMode = "menu";
        if (reset || switchFromGame) {
            this.playFrom(0);
            return;
        }
        this.resumeMenuMusic();
    }


    /**
     * Resumes paused menu music without resetting position.
     */
    resumeMenuMusic() {
        if (!this.music.paused) return;
        const time = this.music.currentTime >= this.gameLoopStart ? 0 : this.music.currentTime;
        this.playFrom(time);
    }


    /**
     * Starts in-game music from the gameplay loop marker.
     */
    startGameMusic() {
        if (this.isMuted || !this.music) return;
        this.musicMode = "game";
        this.playFrom(this.gameLoopStart);
    }


    /**
     * Plays a sound effect by name.
     * @param {string} name - Sound identifier.
     */
    playEffect(name) {
        if (this.isMuted) return;
        if (name === "coin") {
            this.playCoinChime();
            return;
        }
        if (name === "hurt") {
            playHurtVoice(this);
            return;
        }
        if (this.isMuted || !this.sounds[name]) return;
        const sound = this.sounds[name].cloneNode();
        sound.volume = this.sounds[name].volume;
        sound.play().catch(() => {});
    }


    /**
     * Plays a short "coin" chime (Mario-like) via WebAudio.
     */
    playCoinChime() {
        if (this.isMuted) return;
        const ctx = this.getAudioContext();
        if (!ctx) return this.playFallbackCoin();
        const now = ctx.currentTime;
        this.playTone(ctx, 988, now, 0.06);
        this.playTone(ctx, 1319, now + 0.06, 0.08);
    }


    /**
     * Returns an AudioContext instance when available.
     * @returns {AudioContext|null} Audio context or null.
     */
    getAudioContext() {
        if (this.audioContext) return this.audioContext;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        this.audioContext = new Ctx();
        if (this.audioContext.state === "suspended") this.audioContext.resume().catch(() => {});
        return this.audioContext;
    }


    /**
     * Plays a short sine tone with a quick envelope.
     * @param {AudioContext} ctx - Audio context.
     * @param {number} freq - Frequency in Hz.
     * @param {number} start - Start time.
     * @param {number} duration - Duration in seconds.
     */
    playTone(ctx, freq, start, duration) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.02);
    }


    /**
     * Fallback to an existing file-based coin sound.
     */
    playFallbackCoin() {
        if (!this.sounds.coin) return;
        const sound = this.sounds.coin.cloneNode();
        sound.volume = this.sounds.coin.volume;
        sound.play().catch(() => {});
    }


    /**
     * Stops sound effects without affecting background music.
     */
    stopEffects() {
        Object.values(this.sounds).forEach((sound) => {
            sound.pause();
            sound.currentTime = 0;
        });
    }


    /**
     * Pauses music and stops all sound effects.
     */
    stopAll() {
        this.stopEffects();
        if (this.music) this.music.pause();
    }


    /**
     * Toggles mute and persists the setting.
     * @returns {boolean} New mute state.
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem("gameMuted", String(this.isMuted));
        this.applyMuteState();
        return this.isMuted;
    }


    /**
     * Applies the current mute state to all audio.
     */
    applyMuteState() {
        if (this.isMuted) {
            this.stopAll();
            return;
        }
        if (this.musicMode === "game") {
            this.resumeGameMusic();
            return;
        }
        this.startMenuMusic(false);
    }


    /**
     * Resumes in-game music after unmuting.
     */
    resumeGameMusic() {
        const time = this.music.currentTime >= this.gameLoopStart
            ? this.music.currentTime
            : this.gameLoopStart;
        this.playFrom(time);
    }

}
