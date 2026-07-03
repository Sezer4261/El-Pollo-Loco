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
        boss.speedX = 0;
        boss.isLeapAttack = false;
        return;
    }
    boss.speedY += GRAVITY;
    boss.y += boss.speedY;
    if (boss.y < boss.groundY) return;
    boss.y = boss.groundY;
    boss.speedY = 0;
    boss.speedX = 0;
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
 * Updates patrol, hops and leap attacks for the endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function updateEndbossMovement(boss, character) {
    if (boss.isHurt) return;
    tryEndbossScheduledAttack(boss, character);
    tryEndbossLeapOverPlayer(boss, character);
    updateEndbossPatrol(boss, character);
    clampEndbossLevelBounds(boss, character);
    updateEndbossFacing(boss);
}


/**
 * Triggers a timed attack toward the player.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function tryEndbossScheduledAttack(boss, character) {
    const now = performance.now();
    if (boss.contactCooldownUntil && Date.now() < boss.contactCooldownUntil) return;
    if (!boss.nextAttackTime) boss.nextAttackTime = now + 1200;
    if (now < boss.nextAttackTime) return;
    if (!isPlayerInBossArena(character, boss)) return;
    const dist = Math.abs(character.x - boss.x);
    if (dist > 420) return;
    boss.nextAttackTime = now + 1800 + Math.random() * 2200;
    executeEndbossLunge(boss, character);
}


/**
 * Launches a direct lunge attack toward the player.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function executeEndbossLunge(boss, character) {
    const now = performance.now();
    if (!isEndbossOnGround(boss) || boss.isJumping || now < boss.nextJumpTime) return;
    const dir = character.x < boss.x ? -1 : 1;
    boss.speedY = -16;
    boss.speedX = dir * 13;
    boss.isJumping = true;
    boss.isLeapAttack = true;
    boss.direction = dir;
    boss.nextJumpTime = now + 1200;
}


/**
 * Makes the boss jump over the player to switch sides.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function tryEndbossLeapOverPlayer(boss, character) {
    const now = performance.now();
    if (!isEndbossOnGround(boss) || now < boss.nextJumpTime) return;
    const dist = Math.abs(character.x - boss.x);
    if (dist < 120 || dist > 480) return;
    const playerCenter = character.x + character.width / 2;
    const bossCenter = boss.x + boss.width / 2;
    const leapDir = playerCenter < bossCenter ? 1 : -1;
    const minX = boss.patrolLeft;
    const maxX = boss.patrolRight - boss.width;
    if (leapDir > 0 && boss.x > maxX - 60) return;
    if (leapDir < 0 && boss.x < minX + 60) return;
    boss.speedY = -26;
    boss.speedX = leapDir * 9;
    boss.isJumping = true;
    boss.isLeapAttack = true;
    boss.direction = leapDir;
    boss.nextJumpTime = now + 1100 + Math.random() * 800;
}


/**
 * Moves the boss on the ground and applies small hops.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function updateEndbossPatrol(boss, character) {
    if (!isEndbossOnGround(boss)) {
        boss.x += boss.speedX;
        return;
    }
    tryEndbossHop(boss, character);
    if (boss.isJumping) return;
    const now = Date.now();
    if (boss.contactCooldownUntil && now < boss.contactCooldownUntil) {
        boss.direction = character.x < boss.x ? 1 : -1;
        boss.x += boss.direction * 2.2;
        return;
    }
    const dist = Math.abs(character.x - boss.x);
    const chase = isPlayerInBossArena(character, boss) && dist < 900;
    if (chase) boss.direction = character.x < boss.x ? -1 : 1;
    if (chase && dist < 160) return;
    const speed = chase ? (dist < 220 ? 3.4 : 3.0) : 1.2;
    boss.x += boss.direction * speed;
    if (!chase && boss.x <= boss.patrolLeft) boss.direction = 1;
    if (!chase && boss.x + boss.width >= boss.patrolRight) boss.direction = -1;
}


/**
 * Triggers a small jump while the player is nearby.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function tryEndbossHop(boss, character) {
    const now = performance.now();
    if (!isEndbossOnGround(boss) || now < boss.nextJumpTime) return;
    if (Math.abs(character.x - boss.x) > 520 || Math.random() > 0.028) return;
    boss.speedY = -18;
    boss.isJumping = true;
    boss.nextJumpTime = now + 900;
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
