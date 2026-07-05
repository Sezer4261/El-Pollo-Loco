/**
 * Player-controlled Pepe with idle, sleep, jump and throw mechanics.
 */
class Character extends MovableObject {
    health = 100;
    maxHealth = 100;
    coinBar = 0;
    bottleBar = 0;
    coinsCollected = 0;
    enemiesDefeated = 0;
    isDead = false;
    isDucking = false;
    canThrow = true;
    currentState = "idle";
    frameLists = {};
    frameIndex = 0;
    lastAnimTime = 0;
    idleStartTime = performance.now();
    animationSpeeds = { idle: 120, longIdle: 150, walk: 90, jump: 80, duck: 200, hurt: 120, dead: 200 };
    standingOffset = { top: 30, left: 20, right: 20, bottom: 10 };
    duckOffset = { top: 8, left: 20, right: 20, bottom: 5 };

    /**
     * Creates Pepe at the start position.
     */
    constructor() {
        super();
        this.x = 80;
        this.y = GROUND_Y;
        this.width = CHARACTER_WIDTH;
        this.height = CHARACTER_HEIGHT;
        this.offset = { ...this.standingOffset };
        this.loadAnimations();
        this.img = this.frameLists.idle[0];
    }


    /**
     * Loads all Pepe animation frame lists.
     */
    loadAnimations() {
        CHARACTER_FRAME_CONFIG.forEach((config) => {
            this.frameLists[config.key] = buildFrames(config.basePath, config.start, config.end);
        });
    }


    /**
     * Returns the Y coordinate where this character stands on the ground.
     * @returns {number} Ground Y for the current height.
     */
    getGroundY() {
        return getGroundYForHeight(this.height);
    }


    /**
     * Returns true when the character is above the ground line.
     * @returns {boolean} Above ground state.
     */
    isAboveGround() {
        return this.y < this.getGroundY() - 1;
    }


    /**
     * Applies gravity using the ground line for the current pose.
     */
    applyGravity() {
        const groundY = this.getGroundY();
        if (!this.isAboveGround()) {
            this.y = groundY;
            this.speedY = 0;
            return;
        }
        this.speedY += GRAVITY;
        this.y += this.speedY;
        if (this.y >= groundY && this.speedY >= 0) {
            this.y = groundY;
            this.speedY = 0;
        }
    }


    /**
     * Updates physics, movement and animation.
     */
    update() {
        if (this.isDead) {
            this.updateAnimation(performance.now());
            return;
        }
        this.applyGravity();
        if (this.currentState !== "hurt") this.handleMovement();
        clampCharacterLevelBounds(this);
        this.updateAnimation(performance.now());
    }


    /**
     * Handles keyboard movement and idle timer.
     */
    handleMovement() {
        const kb = keyboard;
        if (this.isAboveGround()) {
            handleCharacterAirMovement(this, kb);
            return;
        }
        handleCharacterGroundMovement(this, kb);
    }


    /**
     * Moves Pepe while ducking on the ground.
     * @param {Keyboard} kb - Keyboard state.
     */
    applyDuckMovement(kb) {
        this.resetIdleTimer();
        if (kb.LEFT) {
            this.x -= 3;
            this.otherDirection = true;
            this.setState("walk");
            return;
        }
        if (kb.RIGHT) {
            this.x += 3;
            this.otherDirection = false;
            this.setState("walk");
            return;
        }
        this.setState("duck");
    }


    /**
     * Switches between standing and ducking size and hitbox.
     * @param {boolean} ducking - Whether Pepe is ducking.
     */
    applyDuckPose(ducking) {
        if (ducking) {
            this.height = CHARACTER_DUCK_HEIGHT;
            this.y = getGroundYForHeight(CHARACTER_DUCK_HEIGHT);
            this.offset = this.duckOffset;
            return;
        }
        this.height = CHARACTER_HEIGHT;
        this.offset = this.standingOffset;
        if (!this.isAboveGround()) {
            this.y = this.getGroundY();
        }
    }


    /**
     * Allows left/right movement while jumping.
     * @param {Keyboard} kb - Keyboard state.
     */
    applyAirMovement(kb) {
        if (kb.LEFT) {
            this.x -= 5;
            this.otherDirection = true;
            return;
        }
        if (kb.RIGHT) {
            this.x += 5;
            this.otherDirection = false;
        }
    }


    /**
     * Sets idle or long idle after 15 seconds.
     */
    handleIdleState() {
        const idleMs = performance.now() - this.idleStartTime;
        const nextState = idleMs >= 15000 ? "longIdle" : "idle";
        if (nextState === "longIdle" && this.currentState !== "longIdle") {
            audioManager.playEffect("snore");
        }
        this.setState(nextState);
    }


    /**
     * Resets the idle sleep timer.
     */
    resetIdleTimer() {
        this.idleStartTime = performance.now();
    }


    /**
     * Moves Pepe left.
     */
    moveLeft() {
        this.x -= 5;
        this.otherDirection = true;
        this.resetIdleTimer();
        this.setState("walk");
    }


    /**
     * Moves Pepe right.
     */
    moveRight() {
        this.x += 5;
        this.otherDirection = false;
        this.resetIdleTimer();
        this.setState("walk");
    }


    /**
     * Makes Pepe jump.
     */
    jump() {
        if (this.isAboveGround()) return;
        this.isDucking = false;
        this.height = CHARACTER_HEIGHT;
        this.offset = this.standingOffset;
        this.speedY = -22;
        this.y = this.getGroundY() + this.speedY;
        this.setState("jump");
        this.resetIdleTimer();
    }


    /**
     * Switches animation state.
     * @param {string} state - State name.
     */
    setState(state) {
        if (this.isDead && state !== "dead") return;
        if (this.currentState === state) return;
        this.currentState = state;
        this.frameIndex = 0;
    }


    /**
     * Throws a bottle if available.
     * @returns {ThrowableObject|null} Thrown bottle or null.
     */
    throwBottle() {
        if (this.isDead || !this.canThrow || this.bottleBar < 20) return null;
        this.bottleBar = Math.max(0, this.bottleBar - 20);
        this.canThrow = false;
        setTimeout(() => { this.canThrow = true; }, BOTTLE_THROW_COOLDOWN_MS);
        return this.createThrownBottle();
    }


    /**
     * Creates a thrown bottle at the correct position.
     * @returns {ThrowableObject} Thrown bottle instance.
     */
    createThrownBottle() {
        const throwType = this.isDucking ? "low" : "high";
        const y = this.isDucking ? LOW_THROW_Y : this.y + 25;
        const x = this.otherDirection ? this.x + 10 : this.x + this.width - 10;
        return new ThrowableObject(x, y, this.otherDirection, throwType);
    }


    /**
     * Grants one bonus bottle and shows the reward popup.
     */
    grantBonusBottle() {
        if (this.bottleBar >= 100) return false;
        this.bottleBar = Math.min(100, this.bottleBar + 20);
        audioManager.playEffect("bottle");
        rewardPopup.show();
        return true;
    }


    /**
     * Collects a coin and updates the coin bar.
     */
    collectCoin() {
        if (this.coinBar >= 100) return false;
        const wasFull = this.coinBar >= 90;
        this.coinsCollected++;
        this.coinBar = Math.min(100, this.coinBar + 10);
        if (this.coinsCollected % 5 === 0) this.grantBonusBottle();
        if (wasFull && this.coinBar === 100) this.applyCoinHealthBonus();
        audioManager.playEffect("coin");
        return true;
    }


    /**
     * Applies health bonus when the coin bar is full.
     */
    applyCoinHealthBonus() {
        if (this.coinBar < 100) return;
        this.health = Math.min(this.maxHealth, this.health + 20);
    }


    /**
     * Registers a defeated enemy and grants a bottle every 5 kills.
     */
    registerEnemyDefeated() {
        this.enemiesDefeated++;
        if (this.enemiesDefeated % 5 === 0) this.grantBonusBottle();
    }


    /**
     * Collects a ground bottle.
     */
    collectBottle() {
        if (this.bottleBar >= 100) return false;
        this.bottleBar = Math.min(100, this.bottleBar + 20);
        audioManager.playEffect("bottle");
        return true;
    }


    /**
     * Advances animation frames.
     * @param {number} now - Current timestamp.
     */
    updateAnimation(now) {
        const speed = this.animationSpeeds[this.currentState] || 120;
        if (now - this.lastAnimTime < speed) return;
        this.advanceAnimationFrame();
        this.lastAnimTime = now;
    }


    /**
     * Moves to the next animation frame.
     */
    advanceAnimationFrame() {
        const frames = this.frameLists[this.currentState];
        if (!frames?.length) return;
        if (this.currentState === "dead" && this.frameIndex >= frames.length - 1) return;
        this.frameIndex = this.currentState === "dead"
            ? Math.min(this.frameIndex + 1, frames.length - 1)
            : (this.frameIndex + 1) % frames.length;
        this.img = frames[this.frameIndex];
    }


    /**
     * Applies damage to Pepe.
     * @param {number} amount - Damage amount.
     */
    takeDamage(amount) {
        if (this.isDead) return;
        this.health = Math.max(0, this.health - amount);
        if (world?.isRunning) {
            world.statusBar.setHealth(this.health, this.maxHealth);
        }
        if (this.health <= 0) this.die();
        else this.playHurt();
    }


    /**
     * Plays hurt animation briefly.
     */
    playHurt() {
        audioManager.playEffect("hurt");
        this.isDucking = false;
        this.applyDuckPose(false);
        this.setState("hurt");
        setTimeout(() => this.resetFromHurt(), 800);
    }


    /**
     * Resets Pepe after the hurt animation.
     */
    resetFromHurt() {
        if (this.isDead || this.currentState !== "hurt") return;
        this.setState("idle");
        this.img = this.frameLists.idle[0];
    }


    /**
     * Marks Pepe as dead.
     */
    die() {
        this.isDead = true;
        this.setState("dead");
    }

}
