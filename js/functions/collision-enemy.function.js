/**
 * Resolves one chicken collision with the character.
 * @param {WorldCollisions} collisions - Collision handler.
 * @param {Character} character - Player character.
 * @param {Chicken} chicken - Target chicken.
 * @param {number} now - Current timestamp.
 * @returns {boolean} True when damage was applied.
 */
function resolveChickenCharacterHit(collisions, character, chicken, now) {
    if (chicken.isDead) return false;
    if (collisions.manager.isStomp(character, chicken)) {
        collisions.defeatChicken(chicken);
        character.speedY = -8;
        audioManager.playEffect("hit");
        return false;
    }
    if (!collisions.manager.isSideHit(character, chicken)) return false;
    character.takeDamage(20);
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
    if (boss.isDead || !collisions.manager.isBossSideHit(character, boss)) return;
    character.takeDamage(30);
    collisions.world.lastEnemyHit = now;
}
