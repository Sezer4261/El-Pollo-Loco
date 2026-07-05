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
 * Pushes the endboss away and keeps the attack loop running in the arena.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function separateBossFromPlayer(boss, character) {
    if (boss.isAttacking) {
        setEndbossAttackPhase(boss, "chase");
        return;
    }
    const bossCenter = boss.x + boss.width / 2;
    const playerCenter = character.x + character.width / 2;
    const dir = bossCenter < playerCenter ? -1 : 1;
    boss.x += dir * 20;
    boss.speedX = 0;
    boss.isJumping = false;
    clampEndbossLevelBounds(boss, character);
    if (isPlayerInBossArena(character, boss)) {
        boss.isAttacking = true;
        setEndbossAttackPhase(boss, "chase");
        boss.nextAttackTime = 0;
        return;
    }
    boss.isAttacking = false;
    boss.attackPhase = null;
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
    const bossNow = performance.now();
    if (boss.contactCooldownUntil && bossNow < boss.contactCooldownUntil) return;
    if (!character.isColliding(boss)) return;
    character.takeDamage(ENDBOSS_CONTACT_DAMAGE);
    collisions.world.lastEnemyHit = now;
    audioManager.playEffect("bossHit");
    boss.contactCooldownUntil = bossNow + ENDBOSS_CONTACT_COOLDOWN_MS;
    if (boss.isAttacking) {
        const away = -getEndbossTowardPlayer(boss, character);
        boss.x += away * 28;
        clampEndbossLevelBounds(boss, character);
        setEndbossAttackPhase(boss, "chase");
        return;
    }
    separateBossFromPlayer(boss, character);
    boss.nextAttackTime = 0;
}
