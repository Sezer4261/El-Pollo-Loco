/**
 * Clamps Pepe inside the level bounds.
 * @param {Character} character - Player character.
 */
function clampCharacterLevelBounds(character) {
    if (character.x < LEVEL_MIN_X) character.x = LEVEL_MIN_X;
    const maxX = LEVEL_WIDTH - character.width;
    if (character.x > maxX) character.x = maxX;
}

/**
 * Returns the Y position for an entity standing on the ground.
 * @param {number} entityHeight - Entity height.
 * @returns {number} Top Y coordinate.
 */
function getGroundYForHeight(entityHeight) {
    return CANVAS_GROUND_Y - entityHeight;
}

/**
 * Clears duck pose when Pepe leaves the ground.
 * @param {Character} character - Player character.
 */
function clearCharacterDuckInAir(character) {
    if (!character.isDucking) return;
    character.isDucking = false;
    character.height = CHARACTER_HEIGHT;
    character.offset = character.standingOffset;
}

/**
 * Handles Pepe movement while jumping.
 * @param {Character} character - Player character.
 * @param {Keyboard} kb - Keyboard state.
 */
function handleCharacterAirMovement(character, kb) {
    clearCharacterDuckInAir(character);
    character.resetIdleTimer();
    character.applyAirMovement(kb);
    character.setState("jump");
}

/**
 * Applies standing walk or idle on the ground.
 * @param {Character} character - Player character.
 * @param {Keyboard} kb - Keyboard state.
 */
function applyCharacterStandingMove(character, kb) {
    character.isDucking = false;
    character.applyDuckPose(false);
    if (kb.LEFT) character.moveLeft();
    else if (kb.RIGHT) character.moveRight();
    else character.handleIdleState();
}

/**
 * Handles Pepe movement on the ground.
 * @param {Character} character - Player character.
 * @param {Keyboard} kb - Keyboard state.
 */
function handleCharacterGroundMovement(character, kb) {
    if (kb.UP) return character.jump();
    if (kb.DOWN) {
        character.isDucking = true;
        character.applyDuckPose(true);
        return character.applyDuckMovement(kb);
    }
    applyCharacterStandingMove(character, kb);
}

/**
 * Returns the throw type for Pepe's current pose.
 * @param {Character} character - Player character.
 * @returns {string} Throw type ("low" or "high").
 */
function getCharacterThrowType(character) {
    return character.isDucking ? "low" : "high";
}

/**
 * Returns the throw start Y position.
 * @param {Character} character - Player character.
 * @returns {number} Throw start Y.
 */
function getCharacterThrowY(character) {
    if (character.isDucking) return ThrowableObject.getLowThrowY();
    return character.y + Math.round(character.height * 0.42);
}

/**
 * Returns the throw start X position.
 * @param {Character} character - Player character.
 * @returns {number} Throw start X.
 */
function getCharacterThrowX(character) {
    if (character.otherDirection) return character.x + Math.round(character.width * 0.15);
    return character.x + Math.round(character.width * 0.7);
}
