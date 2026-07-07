const GAME_LAYOUT_MAX_WIDTH = 720;
const GAME_LAYOUT_ASPECT = 3 / 2;

/**
 * Returns the usable content box of the game screen (without padding).
 * @param {HTMLElement} gameScreen - Game screen container.
 * @returns {{width: number, height: number}} Content box size in pixels.
 */
function getGameScreenContentBox(gameScreen) {
    const styles = getComputedStyle(gameScreen);
    const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    return {
        width: Math.max(0, gameScreen.clientWidth - padX),
        height: Math.max(0, gameScreen.clientHeight - padY)
    };
}


/**
 * Fits a 3:2 stage inside the available box without overflowing either axis.
 * @param {number} availableWidth - Usable width in pixels.
 * @param {number} availableHeight - Usable height in pixels.
 * @returns {{width: number, height: number}} Stage size in pixels.
 */
function fitStageSize(availableWidth, availableHeight) {
    let width = Math.min(availableWidth, availableHeight * GAME_LAYOUT_ASPECT, GAME_LAYOUT_MAX_WIDTH);
    let height = width / GAME_LAYOUT_ASPECT;
    if (height > availableHeight) {
        height = availableHeight;
        width = height * GAME_LAYOUT_ASPECT;
    }
    width = Math.floor(Math.min(width, availableWidth));
    height = Math.floor(width / GAME_LAYOUT_ASPECT);
    return { width, height };
}


/**
 * Returns the vertical space the touch bar reserves in normal flow.
 * Overlay controls (absolute/fixed) reserve no space.
 * @param {HTMLElement|null} touchControls - Touch controls element.
 * @returns {number} Reserved height in pixels.
 */
function getReservedTouchHeight(touchControls) {
    if (!touchControls) return 0;
    const styles = getComputedStyle(touchControls);
    if (styles.display === "none") return 0;
    if (styles.position === "absolute" || styles.position === "fixed") return 0;
    return touchControls.offsetHeight;
}


/**
 * Syncs the game stage to a uniform 3:2 size across browsers and devices.
 */
function syncGameStageLayout() {
    const gameScreen = document.getElementById("gameScreen");
    const touchControls = document.getElementById("touchControls");
    if (!gameScreen || gameScreen.classList.contains("screen--hidden")) return;
    const touchHeight = getReservedTouchHeight(touchControls);
    const box = getGameScreenContentBox(gameScreen);
    const availableHeight = box.height - touchHeight;
    if (box.width <= 0 || availableHeight <= 0) return;
    const size = fitStageSize(box.width, availableHeight);
    gameScreen.style.setProperty("--stage-width", `${size.width}px`);
    gameScreen.style.setProperty("--stage-height", `${size.height}px`);
}


/**
 * Schedules a layout sync on the next animation frames.
 */
function scheduleGameStageLayoutSync() {
    requestAnimationFrame(() => {
        syncGameStageLayout();
        requestAnimationFrame(syncGameStageLayout);
    });
}


/**
 * Binds resize handlers so the game stage keeps its aspect ratio everywhere.
 */
function initGameLayoutSync() {
    const sync = () => scheduleGameStageLayoutSync();
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", () => {
        setTimeout(sync, 50);
        setTimeout(sync, 250);
    });
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);
    document.addEventListener("fullscreenchange", sync);
}
