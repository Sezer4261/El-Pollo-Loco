/**
 * Resolves one chicken collision with the character.
 * @param {WorldCollisions} collisions - Collision handler.
 * @param {Character} character - Player character.
 * @param {Chicken} chicken - Target chicken.
 * @param {number} now - Current timestamp.
 * @returns {boolean} True when damage was applied.
 */
function resolveChickenCharacterHit(collisions, character, chicken, now) {
    if (chicken.isDead || character.isDead || character.currentState === "hurt") return false;
    if (collisions.manager.isStomp(character, chicken)) {
        collisions.defeatChicken(chicken);
        character.speedY = -8;
        audioManager.playEffect("hit");
        return false;
    }
    if (!collisions.manager.isSideHit(character, chicken)) return false;
    character.takeDamage(CHICKEN_CONTACT_DAMAGE);
    collisions.world.lastEnemyHit = now;
    return true;
}


/**
 * Pushes the endboss away from the player after a hit.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function separateBossFromPlayer(boss, character) {
    const bossCenter = boss.x + boss.width / 2;
    const playerCenter = character.x + character.width / 2;
    const dir = bossCenter < playerCenter ? -1 : 1;
    boss.x += dir * 90;
    boss.speedX = 0;
    boss.isJumping = false;
    boss.isLeapAttack = false;
    clampEndbossLevelBounds(boss, character);
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
    if (boss.contactCooldownUntil && now < boss.contactCooldownUntil) return;
    if (!collisions.manager.isBossSideHit(character, boss)) return;
    character.takeDamage(ENDBOSS_CONTACT_DAMAGE);
    collisions.world.lastEnemyHit = now;
    separateBossFromPlayer(boss, character);
    boss.contactCooldownUntil = now + 1400;
    boss.nextAttackTime = now + 2200;
    boss.nextJumpTime = now + 900;
}
