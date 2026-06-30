/**
 * Manages game audio playback and mute state.
 */
class AudioManager {
    isMuted = false;
    sounds = {};
    music = null;
    musicMode = "menu";
    gameLoopStart = 10;

    /**
     * Initializes audio and restores mute preference.
     */
    constructor() {
        this.loadSounds();
        this.isMuted = localStorage.getItem("gameMuted") === "true";
    }


    /**
     * Registers all game sound files.
     */
    loadSounds() {
        this.sounds.throw = this.createSound("Audio/shoot.wav", 0.35);
        this.sounds.hit = this.createSound("Audio/hit.wav", 0.4);
        this.sounds.bossHit = this.createSound("Audio/hit.wav", 0.45);
        this.sounds.coin = this.createSound("Audio/win.wav", 0.3);
        this.sounds.bottle = this.createSound("Audio/shoot.wav", 0.25);
        this.sounds.hurt = this.createSound("Audio/hit.wav", 0.35);
        this.sounds.gameOver = this.createSound("Audio/game-over.wav", 0.5);
        this.sounds.win = this.createSound("Audio/win.wav", 0.5);
        this.music = this.createSound("Audio/background.mp3", 0.25);
        this.music.preload = "auto";
        this.music.loop = false;
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
        if (this.isMuted || !this.sounds[name]) return;
        const sound = this.sounds[name].cloneNode();
        sound.volume = this.sounds[name].volume;
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
            const time = this.music.currentTime >= this.gameLoopStart
                ? this.music.currentTime
                : this.gameLoopStart;
            this.playFrom(time);
            return;
        }
        this.startMenuMusic(false);
    }

}
