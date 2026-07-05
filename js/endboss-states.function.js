/**
 * Clears expired hurt and alert states on the endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @param {number} now - Current timestamp.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 */
function clearEndbossTimedStates(boss, character, now, cameraX, canvasWidth) {
    if (boss.isHurt && now > boss.hurtEndTime) {
        boss.isHurt = false;
        boss.setState("walk");
        boss.nextAttackTime = 0;
        if (character && shouldEndbossEngage(boss, character, cameraX, canvasWidth)) {
            boss.isAttacking = true;
            setEndbossAttackPhase(boss, "chase");
        }
    }
    if (boss.isAlert && now > boss.alertEndTime) {
        boss.isAlert = false;
        boss.setState("walk");
        boss.nextAttackTime = now;
    }
}


/**
 * Plays a short alert once when the player approaches from far away.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @param {number} now - Current timestamp.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 */
function activateEndbossAlert(boss, character, now, cameraX, canvasWidth) {
    if (boss.isHurt || boss.isAttacking) return;
    if (shouldEndbossEngage(boss, character, cameraX, canvasWidth)) {
        boss.isAlert = false;
        return;
    }
    const dist = getEndbossPlayerDistance(boss, character);
    if (dist >= 720) {
        boss.hasAlerted = false;
        return;
    }
    if (boss.hasAlerted) return;
    boss.isAlert = true;
    boss.hasAlerted = true;
    boss.alertEndTime = now + 250;
    boss.setState("alert");
}
