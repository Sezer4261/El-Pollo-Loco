/**
 * Updates mute button icons across home and game screens.
 * @param {boolean} muted - Whether audio is muted.
 */
function updateMuteButtonIcons(muted) {
    const icon = muted ? "🔇" : "🔊";
    document.querySelectorAll("#muteButton, #homeMuteButton").forEach((button) => {
        button.textContent = icon;
        button.setAttribute("aria-pressed", String(muted));
    });
}


/**
 * Restores mute button icon from local storage.
 */
function applySavedMuteState() {
    updateMuteButtonIcons(localStorage.getItem("gameMuted") === "true");
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
