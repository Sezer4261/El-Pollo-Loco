/**
 * Starts the jump attack loop when the player is in the boss arena.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function tryStartEndbossAttack(boss, character) {
    if (boss.isAttacking || boss.isHurt || boss.isDead || boss.isAlert) return;
    const now = performance.now();
    if (now < boss.nextAttackTime) return;
    if (!isPlayerInBossArena(character, boss)) return;
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
 * Switches the boss into a new attack phase.
 * @param {Endboss} boss - Endboss instance.
 * @param {string} phase - Attack phase name.
 */
function setEndbossAttackPhase(boss, phase) {
    boss.attackPhase = phase;
    boss.attackPhaseStart = performance.now();
    boss.jumpAttackStarted = false;
    boss.jumpHitDealt = false;
    boss.setState("walk");
}


/**
 * Launches the boss toward the player in a jump attack.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function launchEndbossJumpAtPlayer(boss, character) {
    const toward = getEndbossTowardPlayer(boss, character);
    const dist = getEndbossPlayerDistance(boss, character);
    boss.speedY = -26 - Math.min(10, dist / 70);
    boss.speedX = toward * (11 + Math.min(7, dist / 55));
    boss.isJumping = true;
    boss.jumpAttackStarted = true;
    boss.jumpHitDealt = false;
    boss.direction = toward;
}


/**
 * Runs chase ? jump ? retreat in a repeating loop.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {boolean} True when attack logic handled movement.
 */
function updateEndbossAttack(boss, character) {
    if (!boss.isAttacking) return false;
    const now = performance.now();
    const dist = getEndbossPlayerDistance(boss, character);
    const toward = getEndbossTowardPlayer(boss, character);
    switch (boss.attackPhase) {
        case "chase":
            boss.direction = toward;
            boss.x += toward * 5;
            if (dist < 420 || now - boss.attackPhaseStart > 900) {
                setEndbossAttackPhase(boss, "jump");
            }
            break;
        case "jump":
            if (!boss.jumpAttackStarted && isEndbossOnGround(boss) && !boss.isJumping) {
                launchEndbossJumpAtPlayer(boss, character);
            } else if (boss.jumpAttackStarted && isEndbossOnGround(boss) && !boss.isJumping) {
                setEndbossAttackPhase(boss, "retreat");
            }
            break;
        case "retreat":
            boss.direction = -toward;
            boss.x += boss.direction * 6;
            if (now - boss.attackPhaseStart > 650 || dist > 320) {
                setEndbossAttackPhase(boss, "chase");
            }
            break;
        default:
            setEndbossAttackPhase(boss, "chase");
            break;
    }
    updateEndbossFacing(boss);
    return true;
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
