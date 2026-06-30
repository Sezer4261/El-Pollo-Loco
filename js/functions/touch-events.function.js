/**
 * Binds a touch button to a keyboard action.
 * @param {string} id - Button element id.
 * @param {string} action - Keyboard property name.
 */
function bindTouchButton(id, action) {
    const btn = document.getElementById(id);
    btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        keyboard[action] = true;
    });
    btn.addEventListener("touchend", (e) => {
        e.preventDefault();
        keyboard[action] = false;
    });
    btn.addEventListener("mousedown", () => { keyboard[action] = true; });
    btn.addEventListener("mouseup", () => { keyboard[action] = false; });
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
