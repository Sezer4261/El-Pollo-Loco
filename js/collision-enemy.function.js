/**
 * Defeats a chicken when Pepe stomps it from above.
 * Works even while hurt or briefly after taking damage.
 * @param {WorldCollisions} collisions - Collision handler.
 * @param {Character} character - Player character.
 * @param {Chicken} chicken - Target chicken.
 * @returns {boolean} True when the chicken was stomped.
 */
function resolveChickenStomp(collisions, character, chicken) {
    if (chicken.isDead || character.isDead) return false;
    if (!collisions.manager.isStomp(character, chicken)) return false;
    collisions.defeatChicken(chicken);
    character.speedY = -8;
    audioManager.playEffect("hit");
    return true;
}


/**
 * Resolves one chicken side collision with the character.
 * @param {WorldCollisions} collisions - Collision handler.
 * @param {Character} character - Player character.
 * @param {Chicken} chicken - Target chicken.
 * @param {number} now - Current timestamp.
 * @returns {boolean} True when damage was applied.
 */
function resolveChickenCharacterHit(collisions, character, chicken, now) {
    if (chicken.isDead || character.isDead || character.currentState === "hurt") return false;
    if (!collisions.manager.isSideHit(character, chicken)) return false;
    character.takeDamage(CHICKEN_CONTACT_DAMAGE);
    collisions.world.lastEnemyHit = now;
    return true;
}


/**
 * Pushes the endboss away and continues the retreat phase after a hit.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function separateBossFromPlayer(boss, character) {
    const bossCenter = boss.x + boss.width / 2;
    const playerCenter = character.x + character.width / 2;
    const dir = bossCenter < playerCenter ? -1 : 1;
    boss.x += dir * 35;
    boss.speedX = 0;
    boss.isJumping = false;
    boss.jumpAttackStarted = false;
    boss.retreatJumpStarted = false;
    clampEndbossLevelBounds(boss, character);
    if (boss.isAttacking) {
        setEndbossAttackPhase(boss, "chase");
        boss.nextAttackTime = performance.now();
        return;
    }
    boss.isAttacking = false;
    boss.attackPhase = null;
}


/**
 * Applies damage when the boss pecks the player during an attack.
 * @param {WorldCollisions} collisions - Collision handler.
 * @param {Character} character - Player character.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 */
function resolveBossBeakHit(collisions, character, boss, now) {
    if (!boss.isAttacking || boss.attackPhase !== "peck") return;
    if (boss.beakHitDealt) return;
    if (boss.frameIndex < 2 || boss.frameIndex > 7) return;
    if (boss.isDead || character.isDead || character.currentState === "hurt") return;
    if (!isPlayerInBeakRange(boss, character)) return;
    character.takeDamage(ENDBOSS_BEAK_DAMAGE);
    collisions.world.lastEnemyHit = now;
    boss.beakHitDealt = true;
    audioManager.playEffect("bossHit");
}


/**
 * Resolves endboss side collision with the character.
 * @param {WorldCollisions} collisions - Collision handler.
 * @param {Character} character - Player character.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 */
function resolveBossCharacterHit(collisions, character, boss, now) {
    if (boss.isDead || character.isDead || character.currentState === "hurt") return;
    if (boss.isAttacking && (boss.attackPhase === "peck" || boss.attackPhase === "retreat")) return;
    const bossNow = performance.now();
    if (boss.contactCooldownUntil && bossNow < boss.contactCooldownUntil) return;
    if (!collisions.manager.isBossSideHit(character, boss)) return;
    character.takeDamage(ENDBOSS_CONTACT_DAMAGE);
    collisions.world.lastEnemyHit = now;
    separateBossFromPlayer(boss, character);
    boss.contactCooldownUntil = bossNow + 450;
    boss.nextAttackTime = bossNow;
}
