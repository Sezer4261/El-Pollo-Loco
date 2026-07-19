/** @param {Endboss} boss - Endboss instance. @param {number} cameraX - Camera X offset. @param {number} canvasWidth - Canvas width. @returns {boolean} On-screen state. */
function isEndbossOnScreen(boss, cameraX, canvasWidth) {
    const screenX = boss.x - cameraX;
    return screenX + boss.width >= 0 && screenX <= canvasWidth;
}

/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @param {number} cameraX - Camera X offset. @param {number} canvasWidth - Canvas width. @returns {boolean} Engagement state. */
function shouldEndbossEngage(boss, character, cameraX, canvasWidth) {
    if (boss.isDead) return false;
    return isEndbossOnScreen(boss, cameraX, canvasWidth);
}

/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @param {number} cameraX - Camera X offset. @param {number} canvasWidth - Canvas width. */
function ensureEndbossEngagement(boss, character, cameraX, canvasWidth) {
    if (boss.isDead || boss.isHurt) return;
    if (!shouldEndbossEngage(boss, character, cameraX, canvasWidth)) return;
    boss.isAlert = false;
    boss.nextAttackTime = 0;
    if (boss.isAttacking) return;
    boss.isAttacking = true;
    setEndbossAttackPhase(boss, "chase");
}

/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. */
function tryStartEndbossAttack(boss, character) {
    if (boss.isAttacking || boss.isHurt || boss.isDead) return;
    if (!isPlayerInBossArena(character, boss)) return;
    boss.isAlert = false;
    boss.nextAttackTime = 0;
    boss.isAttacking = true;
    setEndbossAttackPhase(boss, "chase");
}

/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @returns {number} Distance in pixels. */
function getEndbossPlayerDistance(boss, character) {
    const playerCenter = character.x + character.width / 2;
    const bossCenter = boss.x + boss.width / 2;
    return Math.abs(playerCenter - bossCenter);
}

/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @returns {number} Edge gap in pixels, 0 when overlapping. */
function getEndbossEdgeDistance(boss, character) {
    const bossBox = boss.getHitBox();
    const playerBox = character.getHitBox();
    if (playerBox.x + playerBox.w <= bossBox.x) return bossBox.x - (playerBox.x + playerBox.w);
    if (playerBox.x >= bossBox.x + bossBox.w) return playerBox.x - (bossBox.x + bossBox.w);
    return 0;
}

/** @param {Endboss} boss - Endboss instance. @param {string} phase - Attack phase name. */
function setEndbossAttackPhase(boss, phase) {
    boss.attackPhase = phase;
    boss.attackPhaseStart = performance.now();
    boss.jumpAttackStarted = false;
    boss.jumpHitDealt = false;
    boss.isJumping = false;
    boss.isLeapAttack = false;
    boss.speedX = 0;
    boss.speedY = 0;
    if (boss.y > boss.groundY) boss.y = boss.groundY;
    boss.setState("walk");
}

/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @returns {number} Direction multiplier. */
function getEndbossTowardPlayer(boss, character) {
    const playerCenter = character.x + character.width / 2;
    const bossCenter = boss.x + boss.width / 2;
    return playerCenter < bossCenter ? -1 : 1;
}

/** @param {Endboss} boss - Endboss instance. @param {number} toward - Direction from boss to player. */
function retreatEndboss(boss, toward) {
    const away = -toward;
    boss.direction = away;
    boss.setState("walk");
    if (isEndbossOnGround(boss) && !boss.isJumping) boss.x += away * ENDBOSS_RETREAT_SPEED;
    updateEndbossFacing(boss);
}

/** @param {Endboss} boss - Endboss instance. @param {number} edgeGap - Horizontal gap to the player. @returns {boolean} True when attack animation should play. */
function isEndbossInStrikeRange(boss, edgeGap) {
    if (boss.currentState === "attack") return edgeGap <= ENDBOSS_STRIKE_RANGE_EXIT;
    return edgeGap <= ENDBOSS_STRIKE_RANGE;
}

/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @returns {boolean} True when attack logic handled movement. */
function updateEndbossAttack(boss, character) {
    if (!boss.isAttacking) return false;
    const toward = getEndbossTowardPlayer(boss, character);
    if (handleEndbossRecovery(boss, toward)) return true;
    advanceEndbossAttack(boss, character, toward);
    return true;
}

/** @param {Endboss} boss - Endboss instance. @param {number} toward - Direction from boss to player. @returns {boolean} True when recovery was active. */
function handleEndbossRecovery(boss, toward) {
    if (!boss.recoverUntil || performance.now() >= boss.recoverUntil) return false;
    retreatEndboss(boss, toward);
    return true;
}

/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @param {number} toward - Direction from boss to player. */
function advanceEndbossAttack(boss, character, toward) {
    const edgeGap = getEndbossEdgeDistance(boss, character);
    const inStrikeRange = isEndbossInStrikeRange(boss, edgeGap);
    boss.direction = toward;
    boss.setState(inStrikeRange ? "attack" : "walk");
    moveEndbossAttack(boss, toward, inStrikeRange);
    updateEndbossFacing(boss);
}

/** @param {Endboss} boss - Endboss instance. @param {number} toward - Direction from boss to player. @param {boolean} inStrikeRange - Whether the player is in strike range. */
function moveEndbossAttack(boss, toward, inStrikeRange) {
    if (!isEndbossOnGround(boss) || boss.isJumping) return;
    const speed = inStrikeRange ? ENDBOSS_STRIKE_SPEED : ENDBOSS_CHASE_SPEED;
    boss.x += toward * speed;
}

/** @param {Character} character - Player character. @param {Endboss} boss - Endboss instance. @returns {boolean} Arena entry state. */
function isPlayerInBossArena(character, boss) {
    if (character.x >= boss.patrolLeft - 320) return true;
    return getEndbossPlayerDistance(boss, character) <= ENDBOSS_ENGAGE_DISTANCE;
}
