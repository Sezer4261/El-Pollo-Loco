/**
 * Checks whether the roast delay after landing has finished.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 */
function checkRoastLandDelay(boss, now) {
    if (now - boss.landedAt >= Endboss.END_DELAY_MS) {
        boss.deathComplete = true;
    }
}


/**
 * Applies fall physics to the roasted endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 */
function applyRoastFallPhysics(boss, now) {
    boss.speedY += GRAVITY * 1.15;
    boss.y += boss.speedY;
    boss.rotation += (boss.targetRotation - boss.rotation) * 0.12;
    if (boss.y < boss.groundY) return;
    boss.y = boss.groundY;
    boss.speedY = 0;
    boss.rotation = boss.targetRotation;
    boss.deathPhase = "landed";
    boss.landedAt = now;
}
