/**
 * Clamps Pepe inside the level bounds (SNES-style walls left and right).
 * @param {Character} character - Player character.
 */
function clampCharacterLevelBounds(character) {
    if (character.x < LEVEL_MIN_X) character.x = LEVEL_MIN_X;
    const maxX = LEVEL_WIDTH - character.width;
    if (character.x > maxX) character.x = maxX;
}


/**
 * Handles Pepe movement while jumping.
 * @param {Character} character - Player character.
 * @param {Keyboard} kb - Keyboard state.
 */
function handleCharacterAirMovement(character, kb) {
    if (character.isDucking) {
        character.isDucking = false;
        character.height = CHARACTER_HEIGHT;
        character.offset = character.standingOffset;
    }
    character.resetIdleTimer();
    character.applyAirMovement(kb);
    character.setState("jump");
}


/**
 * Handles Pepe movement on the ground.
 * @param {Character} character - Player character.
 * @param {Keyboard} kb - Keyboard state.
 */
function handleCharacterGroundMovement(character, kb) {
    if (kb.UP) {
        character.jump();
        return;
    }
    if (kb.DOWN) {
        character.isDucking = true;
        character.applyDuckPose(true);
        character.applyDuckMovement(kb);
        return;
    }
    character.isDucking = false;
    character.applyDuckPose(false);
    if (kb.LEFT) character.moveLeft();
    else if (kb.RIGHT) character.moveRight();
    else character.handleIdleState();
}
