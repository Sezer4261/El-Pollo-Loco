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
 * Pushes the endboss away and continues the retreat phase after a hit.
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
    boss.jumpAttackStarted = false;
    clampEndbossLevelBounds(boss, character);
    if (boss.isAttacking) {
        setEndbossAttackPhase(boss, "retreat");
        return;
    }
    boss.isAttacking = false;
    boss.attackPhase = null;
}


/**
 * Applies damage when the boss lands on the player during a jump attack.
 * @param {WorldCollisions} collisions - Collision handler.
 * @param {Character} character - Player character.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 */
function resolveBossJumpHit(collisions, character, boss, now) {
    if (!boss.isAttacking || boss.attackPhase !== "jump") return;
    if (boss.jumpHitDealt) return;
    if (boss.isDead || character.isDead || character.currentState === "hurt") return;
    if (!character.isColliding(boss)) return;
    character.takeDamage(ENDBOSS_JUMP_DAMAGE);
    collisions.world.lastEnemyHit = now;
    boss.jumpHitDealt = true;
    audioManager.playEffect("bossHit");
    separateBossFromPlayer(boss, character);
    boss.nextAttackTime = performance.now() + 350;
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
    if (boss.isAttacking && boss.attackPhase === "jump") return;
    const bossNow = performance.now();
    if (boss.contactCooldownUntil && bossNow < boss.contactCooldownUntil) return;
    if (!collisions.manager.isBossSideHit(character, boss)) return;
    character.takeDamage(ENDBOSS_CONTACT_DAMAGE);
    collisions.world.lastEnemyHit = now;
    separateBossFromPlayer(boss, character);
    boss.contactCooldownUntil = bossNow + 900;
    boss.nextAttackTime = bossNow + 350;
}
