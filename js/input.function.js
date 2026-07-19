/**
 * Resolves a keyboard event to a game action name.
 * @param {KeyboardEvent} event - Keyboard event.
 * @returns {string|undefined} Action name or undefined.
 */
function resolveKeyboardAction(event) {
    return KEY_CODE_MAP[event.code] || KEYBOARD_MAP[event.key];
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
 * Sets keyboard flag based on a key event.
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
 * Binds keyboard events to the global keyboard state.
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
    document.addEventListener("keydown", (event) => setKeyState(event, true), true);
    document.addEventListener("keyup", (event) => setKeyState(event, false), true);
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
    const button = document.getElementById(id);
    if (!button) return;
    button.addEventListener("touchstart", (event) => handleTouchButtonPress(event, action, true));
    button.addEventListener("touchend", (event) => handleTouchButtonPress(event, action, false));
    button.addEventListener("mousedown", () => { keyboard[action] = true; });
    button.addEventListener("mouseup", () => { keyboard[action] = false; });
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
 * Disables the context menu on mobile touch buttons.
 */
function disableTouchContextMenu() {
    document.querySelectorAll(".touch-btn").forEach((button) => {
        button.addEventListener("contextmenu", (event) => event.preventDefault());
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
