/**
 * Returns the visible health bar percentage from current HP.
 * Uses linear scaling so the first hit is visible immediately.
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
