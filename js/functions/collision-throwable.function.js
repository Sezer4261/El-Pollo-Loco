/**
 * Resolves bottle hits against one chicken.
 * @param {WorldCollisions} collisions - Collision handler.
 * @param {ThrowableObject} bottle - Thrown bottle.
 * @param {Chicken} chicken - Target chicken.
 */
function resolveBottleChickenHit(collisions, bottle, chicken) {
    if (chicken.isDead || !chicken.isHitByBottle(bottle)) return;
    bottle.isActive = false;
    collisions.defeatChicken(chicken);
    audioManager.playEffect("hit");
}


/**
 * Resolves bottle hit against the endboss.
 * @param {ThrowableObject} bottle - Thrown bottle.
 * @param {Endboss} boss - Endboss instance.
 */
function resolveBottleBossHit(bottle, boss) {
    if (boss.isDead || !boss.isHitByBottle(bottle)) return;
    bottle.isActive = false;
    boss.takeDamage(BOSS_BOTTLE_DAMAGE);
    audioManager.playEffect("bossHit");
}
