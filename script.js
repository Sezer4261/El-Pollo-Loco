let keyboard = new Keyboard();
let audioManager = new AudioManager();
let world;
let screenManager;
let modalManager;

/**
 * Initializes the game application on page load.
 */
function init() {
    screenManager = new ScreenManager();
    modalManager = new ModalManager();
    screenManager.bindEvents();
    modalManager.bindEvents();
    bindKeyboardEvents();
    bindTouchEvents();
    applySavedMuteState();
}


/**
 * Restores mute button icon from local storage.
 */
function applySavedMuteState() {
    const muted = localStorage.getItem("gameMuted") === "true";
    document.getElementById("muteButton").textContent = muted ? "🔇" : "🔊";
}


/**
 * Binds keyboard events to global keyboard state.
 */
function bindKeyboardEvents() {
    window.addEventListener("keydown", (e) => setKeyState(e, true));
    window.addEventListener("keyup", (e) => setKeyState(e, false));
}


/**
 * Sets keyboard flag based on key event.
 * @param {KeyboardEvent} event - Keyboard event.
 * @param {boolean} isPressed - Pressed or released.
 */
function setKeyState(event, isPressed) {
    const keyMap = {
        ArrowLeft: "LEFT", ArrowRight: "RIGHT",
        ArrowUp: "UP", ArrowDown: "DOWN",
        a: "LEFT", d: "RIGHT", w: "UP", s: "DOWN",
        " ": "SPACE"
    };
    const action = keyMap[event.key];
    if (!action) return;
    keyboard[action] = isPressed;
    if (action === "SPACE") event.preventDefault();
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
