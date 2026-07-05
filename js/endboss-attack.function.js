/**
 * Returns true when the endboss is visible on the canvas.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 * @returns {boolean} On-screen state.
 */
function isEndbossOnScreen(boss, cameraX, canvasWidth) {
    const screenX = boss.x - cameraX;
    return screenX + boss.width >= 0 && screenX <= canvasWidth;
}


/**
 * Returns true when the boss should actively fight the player.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 * @returns {boolean} Engagement state.
 */
function shouldEndbossEngage(boss, character, cameraX, canvasWidth) {
    if (boss.isDead) return false;
    return isEndbossOnScreen(boss, cameraX, canvasWidth);
}


/**
 * Forces the boss into the chase when visible on screen.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 */
function ensureEndbossEngagement(boss, character, cameraX, canvasWidth) {
    if (boss.isDead || boss.isHurt) return;
    if (!shouldEndbossEngage(boss, character, cameraX, canvasWidth)) return;
    boss.isAlert = false;
    boss.nextAttackTime = 0;
    if (boss.isAttacking) return;
    boss.isAttacking = true;
    setEndbossAttackPhase(boss, "chase");
}


/**
 * Starts the attack loop when the player enters the boss arena.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function tryStartEndbossAttack(boss, character) {
    if (boss.isAttacking || boss.isHurt || boss.isDead) return;
    if (!isPlayerInBossArena(character, boss)) return;
    boss.isAlert = false;
    boss.nextAttackTime = 0;
    boss.isAttacking = true;
    setEndbossAttackPhase(boss, "chase");
}


/**
 * Returns horizontal distance between boss and player centers.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {number} Distance in pixels.
 */
function getEndbossPlayerDistance(boss, character) {
    const playerCenter = character.x + character.width / 2;
    const bossCenter = boss.x + boss.width / 2;
    return Math.abs(playerCenter - bossCenter);
}


/**
 * Returns the horizontal gap between boss and player hitboxes.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {number} Edge gap in pixels, 0 when overlapping.
 */
function getEndbossEdgeDistance(boss, character) {
    const bossBox = boss.getHitBox();
    const playerBox = character.getHitBox();
    if (playerBox.x + playerBox.w <= bossBox.x) {
        return bossBox.x - (playerBox.x + playerBox.w);
    }
    if (playerBox.x >= bossBox.x + bossBox.w) {
        return playerBox.x - (bossBox.x + bossBox.w);
    }
    return 0;
}


/**
 * Switches the boss into chase mode on the ground.
 * @param {Endboss} boss - Endboss instance.
 * @param {string} phase - Attack phase name.
 */
function setEndbossAttackPhase(boss, phase) {
    boss.attackPhase = phase;
    boss.attackPhaseStart = performance.now();
    boss.jumpAttackStarted = false;
    boss.jumpHitDealt = false;
    boss.isJumping = false;
    boss.isLeapAttack = false;
    boss.speedX = 0;
    boss.speedY = 0;
    if (boss.y > boss.groundY) boss.y = boss.groundY;
    boss.setState("walk");
}


/**
 * Returns movement direction toward the player (-1 or 1).
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {number} Direction multiplier.
 */
function getEndbossTowardPlayer(boss, character) {
    const playerCenter = character.x + character.width / 2;
    const bossCenter = boss.x + boss.width / 2;
    return playerCenter < bossCenter ? -1 : 1;
}


/**
 * Runs toward the player and deals contact damage on touch.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {boolean} True when attack logic handled movement.
 */
function updateEndbossAttack(boss, character) {
    if (!boss.isAttacking) return false;
    const toward = getEndbossTowardPlayer(boss, character);
    boss.direction = toward;
    if (isEndbossOnGround(boss) && !boss.isJumping) {
        boss.x += toward * ENDBOSS_CHASE_SPEED;
    }
    updateEndbossFacing(boss);
    return true;
}
