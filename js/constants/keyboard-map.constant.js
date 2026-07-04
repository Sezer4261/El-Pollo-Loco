const KEYBOARD_MAP = {
    ArrowLeft: "LEFT",
    ArrowRight: "RIGHT",
    ArrowUp: "UP",
    ArrowDown: "DOWN",
    a: "LEFT",
    A: "LEFT",
    d: "RIGHT",
    D: "RIGHT",
    w: "UP",
    W: "UP",
    s: "DOWN",
    S: "DOWN",
    " ": "SPACE"
};

const KEY_CODE_MAP = {
    ArrowLeft: "LEFT",
    ArrowRight: "RIGHT",
    ArrowUp: "UP",
    ArrowDown: "DOWN",
    KeyA: "LEFT",
    KeyD: "RIGHT",
    KeyW: "UP",
    KeyS: "DOWN",
    Space: "SPACE"
};

const GAME_CONTROL_ACTIONS = new Set(["LEFT", "RIGHT", "UP", "DOWN", "SPACE"]);


/**
 * Resolves a keyboard event to a game action name.
 * @param {KeyboardEvent} event - Keyboard event.
 * @returns {string|undefined} Action name or undefined.
 */
function resolveKeyboardAction(event) {
    return KEY_CODE_MAP[event.code] || KEYBOARD_MAP[event.key];
}
