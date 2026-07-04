/**
 * Clears expired hurt and alert states on the endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 */
function clearEndbossTimedStates(boss, now) {
    if (boss.isHurt && now > boss.hurtEndTime) {
        boss.isHurt = false;
        boss.setState("walk");
        boss.nextAttackTime = now;
    }
    if (boss.isAlert && now > boss.alertEndTime) {
        boss.isAlert = false;
        boss.setState("walk");
        boss.nextAttackTime = now;
    }
}


/**
 * Plays a short alert once when the player enters boss range.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @param {number} now - Current timestamp.
 */
function activateEndbossAlert(boss, character, now) {
    if (boss.isHurt || boss.isAttacking) return;
    const dist = getEndbossPlayerDistance(boss, character);
    if (dist >= 720) {
        boss.hasAlerted = false;
        return;
    }
    if (boss.hasAlerted) return;
    boss.isAlert = true;
    boss.hasAlerted = true;
    boss.alertEndTime = now + 700;
    boss.setState("alert");
}
