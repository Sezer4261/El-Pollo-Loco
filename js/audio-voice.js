let cachedSpanishVoice = null;

/**
 * Preloads browser voices for Spanish speech output.
 */
function preloadSpeechVoices() {
    if (!window.speechSynthesis) return;
    const cacheVoices = () => {
        cachedSpanishVoice = findSpanishVoiceUncached();
    };
    cacheVoices();
    window.speechSynthesis.onvoiceschanged = cacheVoices;
}

/**
 * Plays Pepe's pain reaction: instant grunt plus spoken "Ay!".
 * @param {AudioManager} manager - Audio manager instance.
 */
function playHurtVoice(manager) {
    if (manager.isMuted) return;
    playHurtGrunt(manager);
    trySpeakPainWord();
}

/**
 * Speaks a short Mexican Spanish pain exclamation.
 */
function trySpeakPainWord() {
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }
    const utterance = new SpeechSynthesisUtterance("¡Ay!");
    utterance.lang = "es-MX";
    utterance.rate = 1.55;
    utterance.pitch = 1.15;
    utterance.volume = 0.9;
    const voice = findSpanishVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
}

/**
 * Returns the best available Spanish voice.
 * @returns {SpeechSynthesisVoice|undefined} Matching voice.
 */
function findSpanishVoice() {
    if (cachedSpanishVoice) return cachedSpanishVoice;
    cachedSpanishVoice = findSpanishVoiceUncached();
    return cachedSpanishVoice;
}

/**
 * Searches all loaded voices for a Spanish voice.
 * @returns {SpeechSynthesisVoice|undefined} Matching voice.
 */
function findSpanishVoiceUncached() {
    const voices = window.speechSynthesis?.getVoices() || [];
    return voices.find((voice) => voice.lang.startsWith("es-MX"))
        || voices.find((voice) => voice.lang.startsWith("es"));
}

/**
 * Plays a short grunt when speech synthesis is unavailable.
 * @param {AudioManager} manager - Audio manager instance.
 */
function playHurtGrunt(manager) {
    const ctx = manager.getAudioContext();
    if (!ctx) return playFallbackHurt(manager);
    const now = ctx.currentTime;
    manager.playTone(ctx, 520, now, 0.07);
    manager.playTone(ctx, 340, now + 0.05, 0.09);
}

/**
 * Fallback to the file-based hurt sound.
 * @param {AudioManager} manager - Audio manager instance.
 */
function playFallbackHurt(manager) {
    if (!manager.sounds.hurt) return;
    const sound = manager.sounds.hurt.cloneNode();
    sound.volume = manager.sounds.hurt.volume;
    sound.play().catch(() => {});
}
