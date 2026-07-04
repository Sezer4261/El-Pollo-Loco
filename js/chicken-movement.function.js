/**
 * Moves a chicken continuously through the level.
 * @param {Chicken} chicken - Chicken instance.
 */
function marchChicken(chicken) {
    chicken.x += chicken.direction * chicken.speed;
    chicken.otherDirection = chicken.direction < 0;
}


/**
 * Returns true when a chicken has left the level bounds.
 * @param {Chicken} chicken - Chicken instance.
 * @returns {boolean} True when off screen.
 */
function hasChickenLeftLevel(chicken) {
    if (chicken.isDead) return chicken.x < -200 || chicken.x > LEVEL_WIDTH + 200;
    if (chicken.direction < 0) return chicken.x < -chicken.width - 50;
    return chicken.x > LEVEL_WIDTH + 50;
}
