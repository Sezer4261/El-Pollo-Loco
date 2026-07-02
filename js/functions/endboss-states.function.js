/**
 * Clears expired hurt and alert states on the endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 */
function clearEndbossTimedStates(boss, now) {
    if (boss.isHurt && now > boss.hurtEndTime) {
        boss.isHurt = false;
        boss.setState("walk");
    }
    if (boss.isAlert && now > boss.alertEndTime) {
        boss.isAlert = false;
        boss.setState("walk");
    }
}


/**
 * Activates alert state when the character is near.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @param {number} now - Current timestamp.
 */
function activateEndbossAlert(boss, character, now) {
    const dist = Math.abs(character.x - boss.x);
    if (dist >= 550 || boss.isHurt) return;
    boss.isAlert = true;
    boss.alertEndTime = now + 1200;
    boss.setState("alert");
}
