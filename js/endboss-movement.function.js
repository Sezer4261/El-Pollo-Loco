/**
 * Returns true when the endboss is standing on the ground.
 * @param {Endboss} boss - Endboss instance.
 * @returns {boolean} Ground contact state.
 */
function isEndbossOnGround(boss) {
    return boss.y >= boss.groundY && boss.speedY >= 0;
}


/**
 * Applies gravity and landing physics for the endboss.
 * @param {Endboss} boss - Endboss instance.
 */
function applyEndbossGravity(boss) {
    if (isEndbossOnGround(boss) && !boss.isJumping) {
        boss.y = boss.groundY;
        boss.speedY = 0;
        if (!boss.isAttacking || boss.attackPhase !== "retreat") boss.speedX = 0;
        boss.isLeapAttack = false;
        return;
    }
    boss.speedY += GRAVITY;
    boss.y += boss.speedY;
    if (boss.y < boss.groundY) return;
    boss.y = boss.groundY;
    boss.speedY = 0;
    boss.isJumping = false;
    boss.isLeapAttack = false;
}


/**
 * Clamps the endboss inside its arena (ground and air movement).
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} [character] - Player character for chase-aware clamping.
 */
function clampEndbossLevelBounds(boss, character) {
    const minX = boss.patrolLeft;
    const maxX = boss.patrolRight - boss.width;
    const chase = character && isPlayerInBossArena(character, boss);
    if (boss.x < minX) {
        boss.x = minX;
        if (boss.speedX < 0) boss.speedX = 0;
        if (!chase) boss.direction = 1;
    }
    if (boss.x > maxX) {
        boss.x = maxX;
        if (boss.speedX > 0) boss.speedX = 0;
        if (!chase) boss.direction = -1;
    }
}


/**
 * Returns true when the player has entered the boss arena.
 * @param {Character} character - Player character.
 * @param {Endboss} boss - Endboss instance.
 * @returns {boolean} Arena entry state.
 */
function isPlayerInBossArena(character, boss) {
    return character.x >= boss.patrolLeft - 320;
}


/**
 * Updates patrol, chase and attack movement for the endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function updateEndbossMovement(boss, character) {
    if (boss.isHurt) return;
    if (updateEndbossAttack(boss, character)) {
        if (!isEndbossOnGround(boss) || boss.isJumping) boss.x += boss.speedX;
        clampEndbossLevelBounds(boss, character);
        updateEndbossFacing(boss);
        return;
    }
    tryStartEndbossAttack(boss, character);
    updateEndbossPatrol(boss, character);
    clampEndbossLevelBounds(boss, character);
    updateEndbossFacing(boss);
}


/**
 * Moves the boss on the ground and chases the player in the arena.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function updateEndbossPatrol(boss, character) {
    if (!isEndbossOnGround(boss)) {
        boss.x += boss.speedX;
        return;
    }
    if (boss.isJumping || boss.isAlert) return;
    const dist = getEndbossPlayerDistance(boss, character);
    const chase = isPlayerInBossArena(character, boss);
    if (chase) {
        boss.direction = getEndbossTowardPlayer(boss, character);
        boss.x += boss.direction * ENDBOSS_PATROL_CHASE_SPEED;
        tryStartEndbossAttack(boss, character);
        return;
    }
    boss.x += boss.direction * 1.4;
    if (boss.x <= boss.patrolLeft) boss.direction = 1;
    if (boss.x + boss.width >= boss.patrolRight) boss.direction = -1;
}


/**
 * Turns the endboss to face its movement direction.
 * @param {Endboss} boss - Endboss instance.
 */
function updateEndbossFacing(boss) {
    const moveX = boss.isJumping && boss.speedX !== 0 ? boss.speedX : boss.direction;
    if (moveX === 0) return;
    boss.otherDirection = moveX > 0;
}
