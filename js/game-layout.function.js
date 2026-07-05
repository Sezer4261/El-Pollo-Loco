const GAME_LAYOUT_MAX_WIDTH = 720;
const GAME_LAYOUT_ASPECT = 3 / 2;

/**
 * Syncs the game stage to a uniform 3:2 size across browsers and devices.
 */
function syncGameStageLayout() {
    const gameScreen = document.getElementById("gameScreen");
    const touchControls = document.getElementById("touchControls");
    if (!gameScreen || gameScreen.classList.contains("screen--hidden")) return;

    const touchVisible = touchControls && getComputedStyle(touchControls).display !== "none";
    const touchHeight = touchVisible ? touchControls.offsetHeight : 0;
    const bounds = gameScreen.getBoundingClientRect();
    const availableWidth = bounds.width;
    const availableHeight = Math.max(0, bounds.height - touchHeight);
    if (availableWidth <= 0 || availableHeight <= 0) return;

    let width = Math.min(availableWidth, availableHeight * GAME_LAYOUT_ASPECT, GAME_LAYOUT_MAX_WIDTH);
    let height = Math.round(width * (2 / 3));
    if (height > availableHeight) {
        height = availableHeight;
        width = Math.round(height * GAME_LAYOUT_ASPECT);
    }
    width = Math.min(width, availableWidth);
    height = Math.round(width * (2 / 3));

    gameScreen.style.setProperty("--stage-width", `${width}px`);
    gameScreen.style.setProperty("--stage-height", `${height}px`);
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
    document.addEventListener("fullscreenchange", sync);
}
