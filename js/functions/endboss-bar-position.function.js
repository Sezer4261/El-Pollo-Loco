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
    const barWidth = 136;
    const leftPx = screenX + endboss.width - barWidth;
    const topPx = endboss.y + 8;
    container.style.left = Math.max(0, (leftPx / canvasWidth) * 100) + "%";
    container.style.top = Math.max(0, (topPx / canvasHeight) * 100) + "%";
}
