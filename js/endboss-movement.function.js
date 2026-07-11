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
        if (!boss.isAttacking || boss.attackPhase !== "jump") boss.speedX = 0;
        return;
    }
    boss.speedY += GRAVITY;
    boss.y += boss.speedY;
    if (boss.y < boss.groundY) return;
    boss.y = boss.groundY;
    boss.speedY = 0;
    boss.isJumping = false;
}


/**
 * Returns the horizontal movement limits for the endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} [character] - Player character for chase-aware clamping.
 * @returns {{minX: number, maxX: number, chase: boolean}} Movement bounds.
 */
function getEndbossMovementBounds(boss, character) {
    const chase = character && (boss.isAttacking || isPlayerInBossArena(character, boss));
    let minX = boss.patrolLeft;
    let maxX = boss.patrolRight - boss.width;

    if (boss.isAttacking && character) {
        minX = LEVEL_MIN_X;
        maxX = LEVEL_WIDTH - boss.width;
        return { minX, maxX, chase };
    }

    if (chase && character) {
        const reachFloor = boss.patrolLeft - ENDBOSS_CHASE_REACH;
        minX = Math.max(reachFloor, Math.min(boss.patrolLeft, character.x - boss.width * 0.35));
    }

    return { minX, maxX, chase };
}


/**
 * Clamps the endboss inside its arena (ground and air movement).
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} [character] - Player character for chase-aware clamping.
 */
function clampEndbossLevelBounds(boss, character) {
    const { minX, maxX, chase } = getEndbossMovementBounds(boss, character);
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
    if (character.x >= boss.patrolLeft - 320) return true;
    return getEndbossPlayerDistance(boss, character) <= ENDBOSS_ENGAGE_DISTANCE;
}


/**
 * Updates patrol, chase and attack movement for the endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function updateEndbossMovement(boss, character, cameraX, canvasWidth) {
    if (boss.isHurt && !boss.isAttacking) return;
    ensureEndbossEngagement(boss, character, cameraX, canvasWidth);
    if (updateEndbossAttack(boss, character)) {
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
