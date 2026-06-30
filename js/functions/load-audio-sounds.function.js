/**
 * Registers all sound effects on the audio manager.
 * @param {AudioManager} manager - Audio manager instance.
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
 */
function registerBackgroundMusic(manager) {
    const musicConfig = AUDIO_PATHS.music;
    manager.music = manager.createSound(musicConfig.path, musicConfig.volume);
    manager.music.preload = "auto";
    manager.music.loop = false;
}
