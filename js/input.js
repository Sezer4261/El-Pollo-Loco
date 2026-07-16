/**
 * Handles keyboard input state for the game.
 */
class Keyboard {
    LEFT = false;
    RIGHT = false;
    UP = false;
    DOWN = false;
    SPACE = false;
}

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
    bindKeyboardListeners();
    bindKeyboardVisibilityReset();
    bindGameScreenFocus();
}


/**
 * Registers keydown and keyup listeners.
 */
function bindKeyboardListeners() {
    document.addEventListener("keydown", (e) => setKeyState(e, true), true);
    document.addEventListener("keyup", (e) => setKeyState(e, false), true);
}


/**
 * Resets input when the page becomes hidden.
 */
function bindKeyboardVisibilityReset() {
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) resetKeyboardState();
    });
}


/**
 * Focuses the canvas after interaction with the game screen.
 */
function bindGameScreenFocus() {
    document.getElementById("gameScreen")?.addEventListener("pointerdown", () => {
        if (world?.isRunning) document.getElementById("gameCanvas")?.focus();
    });
}


/**
 * Binds a touch button to a keyboard action.
 * @param {string} id - Button element id.
 * @param {string} action - Keyboard property name.
 */
function bindTouchButton(id, action) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("touchstart", (e) => handleTouchButtonPress(e, action, true));
    btn.addEventListener("touchend", (e) => handleTouchButtonPress(e, action, false));
    btn.addEventListener("mousedown", () => { keyboard[action] = true; });
    btn.addEventListener("mouseup", () => { keyboard[action] = false; });
}


/**
 * Updates keyboard state for touch button presses.
 * @param {Event} event - Touch event.
 * @param {string} action - Keyboard property name.
 * @param {boolean} isPressed - Pressed or released.
 */
function handleTouchButtonPress(event, action, isPressed) {
    event.preventDefault();
    keyboard[action] = isPressed;
}


/**
 * Disables context menu on mobile touch buttons.
 */
function disableTouchContextMenu() {
    document.querySelectorAll(".touch-btn").forEach((btn) => {
        btn.addEventListener("contextmenu", (e) => e.preventDefault());
    });
}


/**
 * Binds touch control buttons for mobile play.
 */
function bindTouchEvents() {
    bindTouchButton("touchLeft", "LEFT");
    bindTouchButton("touchRight", "RIGHT");
    bindTouchButton("touchJump", "UP");
    bindTouchButton("touchDuck", "DOWN");
    bindTouchButton("touchThrow", "SPACE");
    disableTouchContextMenu();
}
