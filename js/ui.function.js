/**
 * Binds a click handler to an element by id.
 * @param {string} id - Element id.
 * @param {Function} handler - Click callback.
 */
function bindClick(id, handler) {
    document.getElementById(id).addEventListener("click", handler);
}

/**
 * Focuses the game canvas when available.
 */
function focusGameCanvas() {
    document.getElementById("gameCanvas")?.focus();
}

/**
 * Updates win and loss classes on the end screen.
 * @param {HTMLElement} endScreen - End screen element.
 * @param {boolean} won - Whether the player won.
 */
function updateEndScreenState(endScreen, won) {
    endScreen.classList.toggle("end-screen--won", won);
    endScreen.classList.toggle("end-screen--lost", !won);
}

/**
 * Returns the end screen title and message.
 * @param {boolean} won - Whether the player won.
 * @returns {{title:string,message:string}} End screen copy.
 */
function getEndScreenCopy(won) {
    return won
        ? { title: "Spiel gewonnen!", message: "Pepe hat den Endboss besiegt!" }
        : { title: "Game Over", message: "Pepe wurde besiegt. Versuch es nochmal!" };
}

/**
 * Updates one fullscreen button label and icon.
 * @param {HTMLElement} button - Fullscreen button element.
 * @param {boolean} active - Whether fullscreen is active.
 */
function updateFullscreenButton(button, active) {
    const label = active ? "Vollbild beenden" : "Vollbild";
    button.textContent = active ? "\u{1F5D7}" : "\u26F6";
    button.setAttribute("aria-label", label);
    button.title = label;
}
