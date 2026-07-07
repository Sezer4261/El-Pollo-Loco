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
    boss.recoverUntil = bossNow + ENDBOSS_RECOVER_MS;
    boss.isAttacking = true;
    setEndbossAttackPhase(boss, "chase");
    boss.nextAttackTime = 0;
}
