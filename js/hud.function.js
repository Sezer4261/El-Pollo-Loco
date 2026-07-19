/**
 * Returns the visible health bar percentage from current HP.
 * @param {number} current - Current health.
 * @param {number} max - Maximum health.
 * @returns {number} Bar fill percentage.
 */
function getHealthDisplayPercent(current, max) {
    if (current <= 0 || max <= 0) return 0;
    return Math.min(100, (current / max) * 100);
}

/**
 * Returns bar color based on fill percentage.
 * @param {number} percent - Fill percentage.
 * @returns {string} Bar color name.
 */
function getBarColor(percent) {
    if (percent > 60) return "green";
    if (percent > 30) return "orange";
    return "blue";
}

/**
 * Returns nearest bar level for percentage.
 * @param {number} percent - Fill percentage.
 * @returns {number} Bar level value.
 */
function getNearestBarLevel(percent) {
    let nearest = StatusBar.LEVELS[0];
    StatusBar.LEVELS.forEach((level) => {
        if (percent >= level - 10) nearest = level;
    });
    return nearest;
}

/**
 * Returns true when the endboss bar should be on screen.
 * @param {Endboss} endboss - Endboss instance.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 * @returns {boolean} True when visible on screen.
 */
function isEndbossBarOnScreen(endboss, cameraX, canvasWidth) {
    const screenX = endboss.x - cameraX;
    return screenX + endboss.width >= 0 && screenX <= canvasWidth;
}

/**
 * Positions the endboss health bar at the boss top-right corner.
 * @param {HTMLElement} container - Bar container element.
 * @param {Endboss} endboss - Endboss instance.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 * @param {number} canvasHeight - Canvas height.
 */
function positionEndbossBarAtBoss(container, endboss, cameraX, canvasWidth, canvasHeight) {
    const screenX = endboss.x - cameraX;
    const leftPx = screenX + endboss.width - 136;
    const topPx = endboss.y + 8;
    container.style.left = Math.max(0, (leftPx / canvasWidth) * 100) + "%";
    container.style.top = Math.max(0, (topPx / canvasHeight) * 100) + "%";
}

/**
 * Updates the fill image for a HUD bar.
 * @param {HTMLImageElement|null} fillImg - Fill image element.
 * @param {string} color - Fill color name.
 */
function updateBarFillImage(fillImg, color) {
    if (!fillImg) return;
    fillImg.style.width = "";
    fillImg.src = StatusBar.FILL_PATHS[color] || StatusBar.FILL_PATHS.green;
}
