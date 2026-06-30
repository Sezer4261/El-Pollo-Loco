/**
 * Restores mute button icon from local storage.
 */
function applySavedMuteState() {
    const muted = localStorage.getItem("gameMuted") === "true";
    document.getElementById("muteButton").textContent = muted ? "🔇" : "🔊";
}


/**
 * Starts menu music after the first user interaction if autoplay was blocked.
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
