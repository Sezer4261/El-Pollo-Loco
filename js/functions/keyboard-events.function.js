/**
 * Sets keyboard flag based on key event.
 * @param {KeyboardEvent} event - Keyboard event.
 * @param {boolean} isPressed - Pressed or released.
 */
function setKeyState(event, isPressed) {
    const action = KEYBOARD_MAP[event.key];
    if (!action) return;
    keyboard[action] = isPressed;
    if (action === "SPACE") event.preventDefault();
}


/**
 * Binds keyboard events to global keyboard state.
 */
function bindKeyboardEvents() {
    window.addEventListener("keydown", (e) => setKeyState(e, true));
    window.addEventListener("keyup", (e) => setKeyState(e, false));
}
