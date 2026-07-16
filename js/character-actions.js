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
    applyCharacterStandingMove(character, kb);
}


/**
 * Throws a bottle if available.
 * @returns {ThrowableObject|null} Thrown bottle or null.
 */
Character.prototype.throwBottle = function () {
    if (this.isDead || !this.canThrow || this.bottleBar < 20) return null;
    this.bottleBar = Math.max(0, this.bottleBar - 20);
    this.canThrow = false;
    setTimeout(() => { this.canThrow = true; }, BOTTLE_THROW_COOLDOWN_MS);
    return this.createThrownBottle();
};


/**
 * Creates a thrown bottle at the correct position.
 * @returns {ThrowableObject} Thrown bottle instance.
 */
Character.prototype.createThrownBottle = function () {
    const throwType = this.isDucking ? "low" : "high";
    const y = this.isDucking ? LOW_THROW_Y : this.y + 25;
    const x = this.otherDirection ? this.x + 10 : this.x + this.width - 10;
    return new ThrowableObject(x, y, this.otherDirection, throwType);
};


/**
 * Grants one bonus bottle and shows the reward popup.
 * @returns {boolean} True when a bottle was granted.
 */
Character.prototype.grantBonusBottle = function () {
    if (this.bottleBar >= 100) return false;
    this.bottleBar = Math.min(100, this.bottleBar + 20);
    audioManager.playEffect("bottle");
    rewardPopup.show();
    return true;
};


/**
 * Collects a coin and updates the coin bar.
 * @returns {boolean} True when the coin was collected.
 */
Character.prototype.collectCoin = function () {
    if (this.coinBar >= 100) return false;
    const wasFull = this.coinBar >= 90;
    this.coinsCollected++;
    this.coinBar = Math.min(100, this.coinBar + 10);
    if (this.coinsCollected % 5 === 0) this.grantBonusBottle();
    if (wasFull && this.coinBar === 100) this.applyCoinHealthBonus();
    audioManager.playEffect("coin");
    return true;
};


/**
 * Applies health bonus when the coin bar is full.
 */
Character.prototype.applyCoinHealthBonus = function () {
    if (this.coinBar < 100) return;
    this.health = Math.min(this.maxHealth, this.health + 20);
};


/**
 * Registers a defeated enemy and grants a bottle every 5 kills.
 */
Character.prototype.registerEnemyDefeated = function () {
    this.enemiesDefeated++;
    if (this.enemiesDefeated % 5 === 0) this.grantBonusBottle();
};


/**
 * Collects a ground bottle.
 * @returns {boolean} True when the bottle was collected.
 */
Character.prototype.collectBottle = function () {
    if (this.bottleBar >= 100) return false;
    this.bottleBar = Math.min(100, this.bottleBar + 20);
    audioManager.playEffect("bottle");
    return true;
};


/**
 * Applies damage to Pepe.
 * @param {number} amount - Damage amount.
 */
Character.prototype.takeDamage = function (amount) {
    if (this.isDead) return;
    this.health = Math.max(0, this.health - amount);
    if (world?.isRunning) {
        world.statusBar.setHealth(this.health, this.maxHealth);
    }
    if (this.health <= 0) this.die();
    else this.playHurt();
};


/**
 * Plays hurt animation briefly.
 */
Character.prototype.playHurt = function () {
    audioManager.playEffect("hurt");
    this.isDucking = false;
    this.applyDuckPose(false);
    this.setState("hurt");
    setTimeout(() => this.resetFromHurt(), 800);
};


/**
 * Resets Pepe after the hurt animation.
 */
Character.prototype.resetFromHurt = function () {
    if (this.isDead || this.currentState !== "hurt") return;
    this.setState("idle");
    this.img = this.frameLists.idle[0];
};


/**
 * Marks Pepe as dead.
 */
Character.prototype.die = function () {
    this.isDead = true;
    this.setState("dead");
};
