/**
 * Checks whether the roast delay after landing has finished.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 * @returns {void}
 */
function checkRoastLandDelay(boss, now) {
    if (now - boss.landedAt >= Endboss.END_DELAY_MS) boss.deathComplete = true;
}

/**
 * Applies fall physics to the roasted endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 * @returns {void}
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

/**
 * Clears expired hurt and alert states on the endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @param {number} now - Current timestamp.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 * @returns {void}
 */
function clearEndbossTimedStates(boss, character, now, cameraX, canvasWidth) {
    handleEndbossHurtTimeout(boss, character, now, cameraX, canvasWidth);
    handleEndbossAlertTimeout(boss, now);
}

/**
 * Clears the hurt state once its timer expires.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @param {number} now - Current timestamp.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 * @returns {void}
 */
function handleEndbossHurtTimeout(boss, character, now, cameraX, canvasWidth) {
    if (!boss.isHurt || now <= boss.hurtEndTime) return;
    boss.isHurt = false;
    boss.setState("walk");
    boss.nextAttackTime = 0;
    if (shouldEndbossEngage(boss, character, cameraX, canvasWidth)) reengageEndbossAfterHurt(boss);
}

/**
 * Restarts the chase after the hurt stun ends.
 * @param {Endboss} boss - Endboss instance.
 * @returns {void}
 */
function reengageEndbossAfterHurt(boss) {
    boss.isAttacking = true;
    setEndbossAttackPhase(boss, "chase");
}

/**
 * Clears the alert state once its timer expires.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 * @returns {void}
 */
function handleEndbossAlertTimeout(boss, now) {
    if (!boss.isAlert || now <= boss.alertEndTime) return;
    boss.isAlert = false;
    boss.setState("walk");
    boss.nextAttackTime = now;
}

/**
 * Plays a short alert once when the player approaches from far away.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @param {number} now - Current timestamp.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 * @returns {void}
 */
function activateEndbossAlert(boss, character, now, cameraX, canvasWidth) {
    if (shouldSkipEndbossAlert(boss, character, cameraX, canvasWidth)) return;
    if (isEndbossTooFarForAlert(boss, character)) {
        boss.hasAlerted = false;
        return;
    }
    if (boss.hasAlerted) return;
    enterEndbossAlert(boss, now);
}

/**
 * Returns whether alert logic should be skipped.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 * @returns {boolean} True when alert should be skipped.
 */
function shouldSkipEndbossAlert(boss, character, cameraX, canvasWidth) {
    if (boss.isHurt || boss.isAttacking) return true;
    if (!shouldEndbossEngage(boss, character, cameraX, canvasWidth)) return false;
    boss.isAlert = false;
    return true;
}

/**
 * Returns whether the player is far enough to reset the alert.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {boolean} True when the player is too far away.
 */
function isEndbossTooFarForAlert(boss, character) {
    return getEndbossPlayerDistance(boss, character) >= 720;
}

/**
 * Enters the short alert animation window.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 * @returns {void}
 */
function enterEndbossAlert(boss, now) {
    boss.isAlert = true;
    boss.hasAlerted = true;
    boss.alertEndTime = now + 250;
    boss.setState("alert");
}

/**
 * Applies damage bookkeeping for the endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} amount - Damage amount.
 * @param {number} now - Current timestamp.
 * @returns {void}
 */
function applyEndbossDamage(boss, amount, now) {
    boss.health = Math.max(0, boss.health - amount);
    boss.hitFlashUntil = now + ENDBOSS_HIT_FLASH_MS;
    boss.lastHitTime = now;
}

/**
 * Returns whether the hurt reaction should be skipped.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 * @returns {boolean} True when hurt should be skipped.
 */
function shouldSkipEndbossHurt(boss, now) {
    return boss.isAttacking || now < boss.staggerCooldownUntil;
}

/**
 * Applies the hurt state and clears active combat flags.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 * @returns {void}
 */
function applyEndbossHurtState(boss, now) {
    boss.staggerCooldownUntil = now + ENDBOSS_STAGGER_COOLDOWN_MS;
    boss.isHurt = true;
    resetEndbossCombatState(boss);
    boss.hurtEndTime = now + ENDBOSS_HURT_MS;
    boss.setState("hurt");
}

/**
 * Resets transient combat state flags after a stagger.
 * @param {Endboss} boss - Endboss instance.
 * @returns {void}
 */
function resetEndbossCombatState(boss) {
    boss.isAttacking = false;
    boss.attackPhase = null;
    boss.isJumping = false;
    boss.isLeapAttack = false;
    boss.jumpAttackStarted = false;
    boss.speedX = 0;
}
