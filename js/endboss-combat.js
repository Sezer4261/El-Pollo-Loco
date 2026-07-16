/**
 * Returns true when the endboss is visible on the canvas.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 * @returns {boolean} On-screen state.
 */
function isEndbossOnScreen(boss, cameraX, canvasWidth) {
    const screenX = boss.x - cameraX;
    return screenX + boss.width >= 0 && screenX <= canvasWidth;
}

/**
 * Returns true when the boss should actively fight the player.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 * @returns {boolean} Engagement state.
 */
function shouldEndbossEngage(boss, character, cameraX, canvasWidth) {
    if (boss.isDead) return false;
    return isEndbossOnScreen(boss, cameraX, canvasWidth);
}

/**
 * Forces the boss into the chase when visible on screen.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 */
function ensureEndbossEngagement(boss, character, cameraX, canvasWidth) {
    if (boss.isDead || boss.isHurt) return;
    if (!shouldEndbossEngage(boss, character, cameraX, canvasWidth)) return;
    boss.isAlert = false;
    boss.nextAttackTime = 0;
    if (boss.isAttacking) return;
    boss.isAttacking = true;
    setEndbossAttackPhase(boss, "chase");
}

/**
 * Starts the attack loop when the player enters the boss arena.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function tryStartEndbossAttack(boss, character) {
    if (boss.isAttacking || boss.isHurt || boss.isDead) return;
    if (!isPlayerInBossArena(character, boss)) return;
    boss.isAlert = false;
    boss.nextAttackTime = 0;
    boss.isAttacking = true;
    setEndbossAttackPhase(boss, "chase");
}

/**
 * Returns horizontal distance between boss and player centers.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {number} Distance in pixels.
 */
function getEndbossPlayerDistance(boss, character) {
    const playerCenter = character.x + character.width / 2;
    const bossCenter = boss.x + boss.width / 2;
    return Math.abs(playerCenter - bossCenter);
}

/**
 * Returns the horizontal gap between boss and player hitboxes.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {number} Edge gap in pixels, 0 when overlapping.
 */
function getEndbossEdgeDistance(boss, character) {
    const bossBox = boss.getHitBox();
    const playerBox = character.getHitBox();
    if (playerBox.x + playerBox.w <= bossBox.x) return bossBox.x - (playerBox.x + playerBox.w);
    if (playerBox.x >= bossBox.x + bossBox.w) return playerBox.x - (bossBox.x + bossBox.w);
    return 0;
}

/**
 * Switches the boss into chase mode on the ground.
 * @param {Endboss} boss - Endboss instance.
 * @param {string} phase - Attack phase name.
 */
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

/**
 * Returns movement direction toward the player (-1 or 1).
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {number} Direction multiplier.
 */
function getEndbossTowardPlayer(boss, character) {
    const playerCenter = character.x + character.width / 2;
    const bossCenter = boss.x + boss.width / 2;
    return playerCenter < bossCenter ? -1 : 1;
}

/**
 * Runs the boss backwards away from the player during hit recovery.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} toward - Direction from boss to player (-1 or 1).
 */
function retreatEndboss(boss, toward) {
    const away = -toward;
    boss.direction = away;
    boss.setState("walk");
    if (isEndbossOnGround(boss) && !boss.isJumping) boss.x += away * ENDBOSS_RETREAT_SPEED;
    updateEndbossFacing(boss);
}

/**
 * Returns whether the endboss should use the attack animation.
 * Hysteresis prevents walk/attack flicker near the strike boundary.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} edgeGap - Horizontal gap to the player.
 * @returns {boolean} True when attack animation should play.
 */
function isEndbossInStrikeRange(boss, edgeGap) {
    if (boss.currentState === "attack") return edgeGap <= ENDBOSS_STRIKE_RANGE_EXIT;
    return edgeGap <= ENDBOSS_STRIKE_RANGE;
}

/**
 * Runs toward the player and deals contact damage on touch.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {boolean} True when attack logic handled movement.
 */
function updateEndbossAttack(boss, character) {
    if (!boss.isAttacking) return false;
    const toward = getEndbossTowardPlayer(boss, character);
    if (handleEndbossRecovery(boss, toward)) return true;
    advanceEndbossAttack(boss, character, toward);
    return true;
}

function handleEndbossRecovery(boss, toward) {
    if (!boss.recoverUntil || performance.now() >= boss.recoverUntil) return false;
    retreatEndboss(boss, toward);
    return true;
}

function advanceEndbossAttack(boss, character, toward) {
    const edgeGap = getEndbossEdgeDistance(boss, character);
    const inStrikeRange = isEndbossInStrikeRange(boss, edgeGap);
    boss.direction = toward;
    boss.setState(inStrikeRange ? "attack" : "walk");
    moveEndbossAttack(boss, toward, inStrikeRange);
    updateEndbossFacing(boss);
}

function moveEndbossAttack(boss, toward, inStrikeRange) {
    if (!isEndbossOnGround(boss) || boss.isJumping) return;
    const speed = inStrikeRange ? ENDBOSS_STRIKE_SPEED : ENDBOSS_CHASE_SPEED;
    boss.x += toward * speed;
}

/**
 * Returns true when the endboss is standing on the ground.
 * @param {Endboss} boss - Endboss instance.
 * @returns {boolean} Ground contact state.
 */
function isEndbossOnGround(boss) {
    return boss.y >= boss.groundY && boss.speedY >= 0;
}

/**
 * Applies gravity and landing physics for the endboss.
 * @param {Endboss} boss - Endboss instance.
 */
function applyEndbossGravity(boss) {
    if (shouldSnapEndbossToGround(boss)) return settleEndbossGround(boss);
    boss.speedY += GRAVITY;
    boss.y += boss.speedY;
    if (boss.y < boss.groundY) return;
    landEndbossJump(boss);
}

function shouldSnapEndbossToGround(boss) {
    return isEndbossOnGround(boss) && !boss.isJumping;
}

function settleEndbossGround(boss) {
    boss.y = boss.groundY;
    boss.speedY = 0;
    if (!boss.isAttacking || boss.attackPhase !== "jump") boss.speedX = 0;
}

function landEndbossJump(boss) {
    boss.y = boss.groundY;
    boss.speedY = 0;
    boss.isJumping = false;
}

/**
 * Returns the horizontal movement limits for the endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} [character] - Player character for chase-aware clamping.
 * @returns {{minX: number, maxX: number, chase: boolean}} Movement bounds.
 */
function getEndbossMovementBounds(boss, character) {
    const chase = isEndbossChasingBounds(boss, character);
    if (boss.isAttacking && character) return getEndbossFullLevelBounds(boss, chase);
    const minX = chase ? getEndbossChaseMinX(boss, character) : boss.patrolLeft;
    return { minX, maxX: boss.patrolRight - boss.width, chase };
}

function isEndbossChasingBounds(boss, character) {
    return Boolean(character && (boss.isAttacking || isPlayerInBossArena(character, boss)));
}

function getEndbossFullLevelBounds(boss, chase) {
    return { minX: LEVEL_MIN_X, maxX: LEVEL_WIDTH - boss.width, chase };
}

function getEndbossChaseMinX(boss, character) {
    const reachFloor = boss.patrolLeft - ENDBOSS_CHASE_REACH;
    const playerFloor = character.x - boss.width * 0.35;
    return Math.max(reachFloor, Math.min(boss.patrolLeft, playerFloor));
}

/**
 * Clamps the endboss inside its arena (ground and air movement).
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} [character] - Player character for chase-aware clamping.
 */
function clampEndbossLevelBounds(boss, character) {
    const { minX, maxX, chase } = getEndbossMovementBounds(boss, character);
    if (boss.x < minX) return clampEndbossLeft(boss, minX, chase);
    if (boss.x > maxX) clampEndbossRight(boss, maxX, chase);
}

function clampEndbossLeft(boss, minX, chase) {
    boss.x = minX;
    if (boss.speedX < 0) boss.speedX = 0;
    if (!chase) boss.direction = 1;
}

function clampEndbossRight(boss, maxX, chase) {
    boss.x = maxX;
    if (boss.speedX > 0) boss.speedX = 0;
    if (!chase) boss.direction = -1;
}

/**
 * Returns true when the player has entered the boss arena.
 * @param {Character} character - Player character.
 * @param {Endboss} boss - Endboss instance.
 * @returns {boolean} Arena entry state.
 */
function isPlayerInBossArena(character, boss) {
    if (character.x >= boss.patrolLeft - 320) return true;
    return getEndbossPlayerDistance(boss, character) <= ENDBOSS_ENGAGE_DISTANCE;
}

/**
 * Updates patrol, chase and attack movement for the endboss.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function updateEndbossMovement(boss, character, cameraX, canvasWidth) {
    if (boss.isHurt && !boss.isAttacking) return;
    ensureEndbossEngagement(boss, character, cameraX, canvasWidth);
    if (updateEndbossAttack(boss, character)) return finishEndbossMovement(boss, character);
    tryStartEndbossAttack(boss, character);
    updateEndbossPatrol(boss, character);
    finishEndbossMovement(boss, character);
}

function finishEndbossMovement(boss, character) {
    clampEndbossLevelBounds(boss, character);
    updateEndbossFacing(boss);
}

/**
 * Moves the boss on the ground and chases the player in the arena.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function updateEndbossPatrol(boss, character) {
    if (updateEndbossAirMovement(boss)) return;
    if (boss.isJumping || boss.isAlert) return;
    if (isPlayerInBossArena(character, boss)) return chaseEndbossPatrolTarget(boss, character);
    patrolEndbossArena(boss);
}

function updateEndbossAirMovement(boss) {
    if (isEndbossOnGround(boss)) return false;
    boss.x += boss.speedX;
    return true;
}

function chaseEndbossPatrolTarget(boss, character) {
    boss.direction = getEndbossTowardPlayer(boss, character);
    boss.x += boss.direction * ENDBOSS_PATROL_CHASE_SPEED;
    tryStartEndbossAttack(boss, character);
}

function patrolEndbossArena(boss) {
    boss.x += boss.direction * ENDBOSS_PATROL_SPEED;
    if (boss.x <= boss.patrolLeft) boss.direction = 1;
    if (boss.x + boss.width >= boss.patrolRight) boss.direction = -1;
}

/**
 * Turns the endboss to face its movement direction.
 * @param {Endboss} boss - Endboss instance.
 */
function updateEndbossFacing(boss) {
    const moveX = boss.isJumping && boss.speedX !== 0 ? boss.speedX : boss.direction;
    if (moveX === 0) return;
    boss.otherDirection = moveX > 0;
}
