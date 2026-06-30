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
