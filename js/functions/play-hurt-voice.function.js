/**
 * Preloads browser voices for Spanish speech output.
 */
function preloadSpeechVoices() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}


/**
 * Plays Pepe's pain reaction as spoken "¡Ay!".
 * @param {AudioManager} manager - Audio manager instance.
 */
function playHurtVoice(manager) {
    if (manager.isMuted) return;
    if (trySpeakPainWord()) return;
    playHurtGrunt(manager);
}


/**
 * Speaks a short Mexican Spanish pain exclamation.
 * @returns {boolean} True when speech synthesis is available.
 */
function trySpeakPainWord() {
    if (!window.speechSynthesis) return false;
    const utterance = new SpeechSynthesisUtterance("¡Ay!");
    utterance.lang = "es-MX";
    utterance.rate = 1.35;
    utterance.pitch = 1.15;
    utterance.volume = 0.85;
    const voice = findSpanishVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return true;
}


/**
 * Returns the best available Spanish voice.
 * @returns {SpeechSynthesisVoice|undefined} Matching voice.
 */
function findSpanishVoice() {
    const voices = window.speechSynthesis.getVoices();
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
    manager.playTone(ctx, 420, now, 0.08);
    manager.playTone(ctx, 280, now + 0.07, 0.1);
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
