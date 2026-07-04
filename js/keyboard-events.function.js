/**
 * Returns true when the game screen is active and the loop is running.
 * @returns {boolean} Game input state.
 */
function isGameInputActive() {
    const gameScreen = document.getElementById("gameScreen");
    return !!gameScreen
        && !gameScreen.classList.contains("screen--hidden")
        && !!world?.isRunning;
}


/**
 * Clears all pressed keys on the global keyboard state.
 */
function resetKeyboardState() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.SPACE = false;
}


/**
 * Sets keyboard flag based on key event.
 * @param {KeyboardEvent} event - Keyboard event.
 * @param {boolean} isPressed - Pressed or released.
 */
function setKeyState(event, isPressed) {
    const action = resolveKeyboardAction(event);
    if (!action) return;
    if (isGameInputActive() && GAME_CONTROL_ACTIONS.has(action)) {
        event.preventDefault();
        event.stopPropagation();
    }
    keyboard[action] = isPressed;
}


/**
 * Binds keyboard events to global keyboard state.
 */
function bindKeyboardEvents() {
    document.addEventListener("keydown", (e) => setKeyState(e, true), true);
    document.addEventListener("keyup", (e) => setKeyState(e, false), true);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) resetKeyboardState();
    });
    document.getElementById("gameScreen")?.addEventListener("pointerdown", () => {
        if (world?.isRunning) document.getElementById("gameCanvas")?.focus();
    });
}
