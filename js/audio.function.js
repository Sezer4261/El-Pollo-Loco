/**
 * Registers all sound effects on the audio manager.
 * @param {AudioManager} manager - Audio manager instance.
 * @returns {void}
 */
function registerSoundEffects(manager) {
    Object.entries(AUDIO_PATHS).forEach(([name, config]) => {
        if (name === "music") return;
        manager.sounds[name] = manager.createSound(config.path, config.volume);
    });
}

/**
 * Registers background music on the audio manager.
 * @param {AudioManager} manager - Audio manager instance.
 * @returns {void}
 */
function registerBackgroundMusic(manager) {
    const musicConfig = AUDIO_PATHS.music;
    manager.music = manager.createSound(musicConfig.path, musicConfig.volume);
    manager.music.preload = "auto";
    manager.music.loop = false;
}

/**
 * Plays a registered sound effect by cloning its audio node.
 * @param {AudioManager} manager - Audio manager instance.
 * @param {string} name - Sound identifier.
 * @returns {void}
 */
function playRegisteredEffect(manager, name) {
    if (!manager.sounds[name]) return;
    playClonedSound(manager.sounds[name]);
}

/**
 * Clones and plays an existing audio element.
 * @param {HTMLAudioElement|undefined} source - Source audio element.
 * @returns {void}
 */
function playClonedSound(source) {
    if (!source) return;
    const sound = source.cloneNode();
    sound.volume = source.volume;
    sound.play().catch(() => {});
}

/**
 * Updates mute button icons across home and game screens.
 * @param {boolean} muted - Whether audio is muted.
 * @returns {void}
 */
function updateMuteButtonIcons(muted) {
    const icon = muted ? "\u{1F507}" : "\u{1F50A}";
    document.querySelectorAll("#muteButton, #homeMuteButton").forEach((button) => {
        button.textContent = icon;
        button.setAttribute("aria-pressed", String(muted));
    });
}

/**
 * Restores mute button icons from local storage.
 * @returns {void}
 */
function applySavedMuteState() {
    updateMuteButtonIcons(localStorage.getItem("gameMuted") === "true");
}

/**
 * Starts menu music after the first user interaction if autoplay was blocked.
 * @returns {void}
 */
function bindMenuMusicUnlock() {
    const unlockMenuMusic = () => {
        if (world?.isRunning) return;
        audioManager.startMenuMusic();
    };
    const homeScreen = document.getElementById("homeScreen");
    homeScreen.addEventListener("pointerdown", unlockMenuMusic, { once: true, capture: true });
    document.addEventListener("keydown", unlockMenuMusic, { once: true });
}
