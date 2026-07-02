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
 */
function clampEndbossLevelBounds(boss) {
    const minX = boss.patrolLeft;
    const maxX = boss.patrolRight - boss.width;
    if (boss.x < minX) {
        boss.x = minX;
        if (boss.speedX < 0) boss.speedX = 0;
        boss.direction = 1;
    }
    if (boss.x > maxX) {
        boss.x = maxX;
        if (boss.speedX > 0) boss.speedX = 0;
        boss.direction = -1;
    }
}


/**
 * Updates patrol, hops and leap attacks for the endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function updateEndbossMovement(boss, character) {
    if (boss.isHurt) return;
    tryEndbossLeapOverPlayer(boss, character);
    updateEndbossPatrol(boss, character);
    clampEndbossLevelBounds(boss);
    updateEndbossFacing(boss);
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
    if (dist < 50 || dist > 550) return;
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
    const chase = Math.abs(character.x - boss.x) < 700;
    if (chase) boss.direction = character.x < boss.x ? -1 : 1;
    const speed = chase ? 2.6 : 1.8;
    boss.x += boss.direction * speed;
    if (boss.x <= boss.patrolLeft) boss.direction = 1;
    if (boss.x + boss.width >= boss.patrolRight) boss.direction = -1;
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
