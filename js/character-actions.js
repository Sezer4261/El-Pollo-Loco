/**
 * Throws a bottle if allowed, or wakes Pepe from sleep first.
 * @returns {ThrowableObject|null} Thrown bottle or null.
 */
Character.prototype.throwBottle = function () {
    if (this.wakeFromSleep()) return null;
    if (!this.canStartBottleThrow()) return null;
    this.bottleBar = Math.max(0, this.bottleBar - 20);
    this.canThrow = false;
    this.resetIdleTimer();
    setTimeout(() => { this.canThrow = true; }, BOTTLE_THROW_COOLDOWN_MS);
    return this.createThrownBottle();
};

/**
 * Wakes Pepe from sleep without throwing a bottle.
 * @returns {boolean} True when sleep was interrupted.
 */
Character.prototype.wakeFromSleep = function () {
    if (this.currentState !== "longIdle") return false;
    this.resetIdleTimer();
    this.setState("idle");
    this.img = this.frameLists.idle[0];
    return true;
};

/**
 * Returns true when a bottle throw is currently allowed.
 * @returns {boolean} Throw permission state.
 */
Character.prototype.canStartBottleThrow = function () {
    return !this.isDead && this.canThrow && this.bottleBar >= 20;
};

/**
 * Creates a thrown bottle at Pepe's hand position.
 * @returns {ThrowableObject} Thrown bottle instance.
 */
Character.prototype.createThrownBottle = function () {
    const throwType = getCharacterThrowType(this);
    const x = getCharacterThrowX(this);
    const y = getCharacterThrowY(this);
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
    if (world?.isRunning) world.statusBar.setHealth(this.health, this.maxHealth);
    if (this.health <= 0) this.die();
    else this.playHurt();
};

/**
 * Plays the hurt animation briefly.
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
