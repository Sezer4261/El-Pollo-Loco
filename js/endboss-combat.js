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
/** @param {Endboss} boss - Endboss instance. @returns {boolean} Ground contact state. */
function isEndbossOnGround(boss) { return boss.y >= boss.groundY && boss.speedY >= 0; }
/** Applies gravity and landing physics for the endboss. @param {Endboss} boss - Endboss instance. */
function applyEndbossGravity(boss) {
    if (shouldSnapEndbossToGround(boss)) return settleEndbossGround(boss);
    boss.speedY += GRAVITY;
    boss.y += boss.speedY;
    if (boss.y < boss.groundY) return;
    landEndbossJump(boss);
}
/** @param {Endboss} boss - Endboss instance. @returns {boolean} True when snapping is allowed. */
function shouldSnapEndbossToGround(boss) { return isEndbossOnGround(boss) && !boss.isJumping; }
/** @param {Endboss} boss - Endboss instance. */
function settleEndbossGround(boss) {
    boss.y = boss.groundY;
    boss.speedY = 0;
    if (!boss.isAttacking || boss.attackPhase !== "jump") boss.speedX = 0;
}
/** @param {Endboss} boss - Endboss instance. */
function landEndbossJump(boss) {
    boss.y = boss.groundY;
    boss.speedY = 0;
    boss.isJumping = false;
}
/** @param {Endboss} boss - Endboss instance. @param {Character} [character] - Player character for chase-aware clamping. @returns {{minX: number, maxX: number, chase: boolean}} Movement bounds. */
function getEndbossMovementBounds(boss, character) {
    const chase = isEndbossChasingBounds(boss, character);
    if (boss.isAttacking && character) return getEndbossFullLevelBounds(boss, chase);
    const minX = chase ? getEndbossChaseMinX(boss, character) : boss.patrolLeft;
    return { minX, maxX: boss.patrolRight - boss.width, chase };
}
/** @param {Endboss} boss - Endboss instance. @param {Character} [character] - Player character. @returns {boolean} True when chase bounds apply. */
function isEndbossChasingBounds(boss, character) {
    return Boolean(character && (boss.isAttacking || isPlayerInBossArena(character, boss)));
}
/** @param {Endboss} boss - Endboss instance. @param {boolean} chase - Whether chase bounds are active. @returns {{minX: number, maxX: number, chase: boolean}} Full-level bounds. */
function getEndbossFullLevelBounds(boss, chase) {
    return { minX: LEVEL_MIN_X, maxX: LEVEL_WIDTH - boss.width, chase };
}
/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @returns {number} Left movement bound. */
function getEndbossChaseMinX(boss, character) {
    const reachFloor = boss.patrolLeft - ENDBOSS_CHASE_REACH;
    const playerFloor = character.x - boss.width * 0.35;
    return Math.max(reachFloor, Math.min(boss.patrolLeft, playerFloor));
}
/** @param {Endboss} boss - Endboss instance. @param {Character} [character] - Player character. */
function clampEndbossLevelBounds(boss, character) {
    const { minX, maxX, chase } = getEndbossMovementBounds(boss, character);
    if (boss.x < minX) return clampEndbossLeft(boss, minX, chase);
    if (boss.x > maxX) clampEndbossRight(boss, maxX, chase);
}
/** @param {Endboss} boss - Endboss instance. @param {number} minX - Left bound. @param {boolean} chase - Whether chase bounds are active. */
function clampEndbossLeft(boss, minX, chase) {
    boss.x = minX;
    if (boss.speedX < 0) boss.speedX = 0;
    if (!chase) boss.direction = 1;
}
/** @param {Endboss} boss - Endboss instance. @param {number} maxX - Right bound. @param {boolean} chase - Whether chase bounds are active. */
function clampEndbossRight(boss, maxX, chase) {
    boss.x = maxX;
    if (boss.speedX > 0) boss.speedX = 0;
    if (!chase) boss.direction = -1;
}
/** @param {Character} character - Player character. @param {Endboss} boss - Endboss instance. @returns {boolean} Arena entry state. */
function isPlayerInBossArena(character, boss) {
    if (character.x >= boss.patrolLeft - 320) return true;
    return getEndbossPlayerDistance(boss, character) <= ENDBOSS_ENGAGE_DISTANCE;
}
/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @param {number} cameraX - Camera X offset. @param {number} canvasWidth - Canvas width. */
function updateEndbossMovement(boss, character, cameraX, canvasWidth) {
    if (boss.isHurt && !boss.isAttacking) return;
    ensureEndbossEngagement(boss, character, cameraX, canvasWidth);
    if (updateEndbossAttack(boss, character)) return finishEndbossMovement(boss, character);
    tryStartEndbossAttack(boss, character);
    updateEndbossPatrol(boss, character);
    finishEndbossMovement(boss, character);
}
/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. */
function finishEndbossMovement(boss, character) {
    clampEndbossLevelBounds(boss, character);
    updateEndbossFacing(boss);
}
/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. */
function updateEndbossPatrol(boss, character) {
    if (updateEndbossAirMovement(boss) || boss.isJumping || boss.isAlert) return;
    if (isPlayerInBossArena(character, boss)) return chaseEndbossPatrolTarget(boss, character);
    patrolEndbossArena(boss);
}
/** @param {Endboss} boss - Endboss instance. @returns {boolean} True when air movement was applied. */
function updateEndbossAirMovement(boss) {
    if (isEndbossOnGround(boss)) return false;
    boss.x += boss.speedX;
    return true;
}
/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. */
function chaseEndbossPatrolTarget(boss, character) {
    boss.direction = getEndbossTowardPlayer(boss, character);
    boss.x += boss.direction * ENDBOSS_PATROL_CHASE_SPEED;
    tryStartEndbossAttack(boss, character);
}
/** @param {Endboss} boss - Endboss instance. */
function patrolEndbossArena(boss) {
    boss.x += boss.direction * ENDBOSS_PATROL_SPEED;
    if (boss.x <= boss.patrolLeft) boss.direction = 1;
    if (boss.x + boss.width >= boss.patrolRight) boss.direction = -1;
}
/** @param {Endboss} boss - Endboss instance. */
function updateEndbossFacing(boss) {
    const moveX = boss.isJumping && boss.speedX !== 0 ? boss.speedX : boss.direction;
    if (moveX === 0) return;
    boss.otherDirection = moveX > 0;
}
