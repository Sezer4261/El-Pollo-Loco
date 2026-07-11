/**
 * Returns true when a chicken should actively move toward the player.
 * @param {Chicken} chicken - Chicken instance.
 * @returns {boolean} Seek-player state.
 */
function shouldChickenSeekPlayer(chicken) {
    return chicken.marchMaxX !== undefined && chicken.x >= chicken.marchMaxX - 800;
}


/**
 * Turns chickens in the final stretch toward the player.
 * @param {Chicken} chicken - Chicken instance.
 */
function alignChickenTowardPlayer(chicken) {
    const player = world?.character;
    if (!player || chicken.isDead || !shouldChickenSeekPlayer(chicken)) return;
    const playerCenter = player.x + player.width / 2;
    const chickenCenter = chicken.x + chicken.width / 2;
    if (playerCenter > chickenCenter + 10) chicken.direction = 1;
    else if (playerCenter < chickenCenter - 10) chicken.direction = -1;
}


/**
 * Moves a chicken continuously through the level.
 * @param {Chicken} chicken - Chicken instance.
 */
function marchChicken(chicken) {
    alignChickenTowardPlayer(chicken);
    const nextX = chicken.x + chicken.direction * chicken.speed;
    const zoneStart = chicken.marchMaxX;
    if (zoneStart !== undefined && chicken.direction > 0 && nextX + chicken.width >= zoneStart) {
        chicken.reachedEndbossGate = true;
        return;
    }
    chicken.x = nextX;
    chicken.otherDirection = chicken.direction < 0;
}


/**
 * Returns true when regular enemies should be cleared for the boss fight.
 * @param {Character} character - Player character.
 * @param {Endboss} endboss - Endboss instance.
 * @returns {boolean} Clear-chickens state.
 */
function shouldClearChickensForBoss(character, endboss) {
    return endboss && !endboss.isDead && isPlayerInBossArena(character, endboss);
}


/**
 * Returns true when a chicken has reached the endboss zone.
 * @param {Chicken} chicken - Chicken instance.
 * @param {number} zoneStartX - Left edge of the endboss arena.
 * @returns {boolean} True when inside the boss zone.
 */
function hasChickenEnteredEndbossZone(chicken, zoneStartX) {
    if (zoneStartX === undefined) return false;
    return chicken.x + chicken.width >= zoneStartX;
}


/**
 * Returns true when a chicken should be removed before the endboss fight.
 * @param {Chicken} chicken - Chicken instance.
 * @param {number} zoneStartX - Left edge of the endboss arena.
 * @param {boolean} bossAlive - Whether the endboss is still alive.
 * @returns {boolean} True when the chicken should be removed.
 */
function shouldRemoveChickenBeforeBoss(chicken, zoneStartX, bossAlive) {
    if (!bossAlive) return false;
    if (chicken.reachedEndbossGate) return true;
    return hasChickenEnteredEndbossZone(chicken, zoneStartX);
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
