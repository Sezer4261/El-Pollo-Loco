/**
 * Player-controlled Pepe with movement, combat, and pickups.
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
    prevSpeedY = 0;
    idleStartTime = performance.now();
    animationSpeeds = { idle: 120, longIdle: 150, walk: 90, jump: 130, duck: 200, hurt: 120, dead: 200 };
    standingOffset = { top: 30, left: 20, right: 20, bottom: 10 };
    duckOffset = { top: 8, left: 20, right: 20, bottom: 5 };
    /** Creates Pepe at the start position. */
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
    /** Loads all Pepe animation frame lists. */
    loadAnimations() {
        CHARACTER_FRAME_CONFIG.forEach((config) => this.frameLists[config.key] = buildFrames(config.basePath, config.start, config.end));
    }
    /** @returns {number} Ground Y for the current height. */
    getGroundY() { return getGroundYForHeight(this.height); }
    /** @returns {boolean} Above ground state. */
    isAboveGround() { return this.y < this.getGroundY() - 1; }
    /** Applies gravity using the ground line for the current pose. */
    applyGravity() {
        const groundY = this.getGroundY();
        if (!this.isAboveGround()) return this.landOnGround(groundY);
        this.speedY += GRAVITY;
        this.y += this.speedY;
        if (this.y >= groundY && this.speedY >= 0) this.landOnGround(groundY);
    }
    /** @param {number} groundY - Ground Y position. */
    landOnGround(groundY) {
        this.y = groundY;
        this.speedY = 0;
    }
    /** Updates physics, movement, and animation. */
    update() {
        if (this.isDead) return this.updateAnimation(performance.now());
        this.prevSpeedY = this.speedY;
        this.applyGravity();
        if (this.currentState !== "hurt") this.handleMovement();
        clampCharacterLevelBounds(this);
        this.updateAnimation(performance.now());
    }
    /** Handles keyboard movement and idle timer. */
    handleMovement() {
        const kb = keyboard;
        if (this.isAboveGround()) return handleCharacterAirMovement(this, kb);
        handleCharacterGroundMovement(this, kb);
    }
    /** @param {Keyboard} kb - Keyboard state. @returns {boolean} True when movement happened. */
    tryDuckWalk(kb) {
        if (kb.LEFT) return this.stepDuckWalk(-1);
        if (kb.RIGHT) return this.stepDuckWalk(1);
        return false;
    }
    /** @param {number} direction - Horizontal direction. @returns {boolean} Always true after moving. */
    stepDuckWalk(direction) {
        this.x += direction * CHARACTER_DUCK_SPEED;
        this.otherDirection = direction < 0;
        this.setState("walk");
        return true;
    }
    /** @param {Keyboard} kb - Keyboard state. */
    applyDuckMovement(kb) {
        this.resetIdleTimer();
        if (!this.tryDuckWalk(kb)) this.setState("duck");
    }
    /** @param {boolean} ducking - Whether Pepe is ducking. */
    applyDuckSize(ducking) {
        if (ducking) {
            this.height = CHARACTER_DUCK_HEIGHT;
            this.y = getGroundYForHeight(CHARACTER_DUCK_HEIGHT);
            return this.offset = this.duckOffset;
        }
        this.height = CHARACTER_HEIGHT;
        this.offset = this.standingOffset;
    }
    /** @param {boolean} ducking - Whether Pepe is ducking. */
    applyDuckPose(ducking) {
        this.applyDuckSize(ducking);
        if (!ducking && !this.isAboveGround()) this.y = this.getGroundY();
    }
    /** @param {Keyboard} kb - Keyboard state. */
    applyAirMovement(kb) {
        if (kb.LEFT) return this.moveAir(-1);
        if (kb.RIGHT) this.moveAir(1);
    }
    /** @param {number} direction - Horizontal direction. */
    moveAir(direction) {
        this.x += direction * CHARACTER_WALK_SPEED;
        this.otherDirection = direction < 0;
    }
    /** Sets idle or long idle after 15 seconds. */
    handleIdleState() {
        const idleMs = performance.now() - this.idleStartTime;
        const nextState = idleMs >= CHARACTER_SLEEP_MS ? "longIdle" : "idle";
        if (nextState === "longIdle" && this.currentState !== "longIdle") audioManager.playEffect("snore");
        this.setState(nextState);
    }
    /** Resets the idle sleep timer. */
    resetIdleTimer() { this.idleStartTime = performance.now(); }
    /** Moves Pepe left. */
    moveLeft() {
        this.x -= CHARACTER_WALK_SPEED;
        this.otherDirection = true;
        this.resetIdleTimer();
        this.setState("walk");
    }
    /** Moves Pepe right. */
    moveRight() {
        this.x += CHARACTER_WALK_SPEED;
        this.otherDirection = false;
        this.resetIdleTimer();
        this.setState("walk");
    }
    /** Makes Pepe jump. */
    jump() {
        if (this.isAboveGround()) return;
        this.isDucking = false;
        this.height = CHARACTER_HEIGHT;
        this.offset = this.standingOffset;
        this.speedY = -CHARACTER_JUMP_SPEED;
        this.y = this.getGroundY() + this.speedY;
        this.currentState = "jump";
        this.beginJumpAnimation();
        this.resetIdleTimer();
    }
    /** Starts the jump sprite sequence from the first frame. */
    beginJumpAnimation() {
        const now = performance.now();
        this.lastAnimTime = now;
        this.frameIndex = 0;
        const jumpFrames = this.frameLists.jump;
        if (jumpFrames?.length) this.img = jumpFrames[0];
    }
    /** @param {string} state - State name. */
    setState(state) {
        if (this.isDead && state !== "dead") return;
        if (this.currentState === state) return;
        this.currentState = state;
        this.frameIndex = 0;
        if (state === "jump") this.beginJumpAnimation();
    }
    /** @param {number} now - Current timestamp. */
    updateAnimation(now) {
        if (this.currentState === "jump") return this.updateJumpFrame(now);
        const speed = this.animationSpeeds[this.currentState] || 120;
        if (now - this.lastAnimTime < speed) return;
        this.advanceAnimationFrame();
        this.lastAnimTime = now;
    }
    /** @param {number} now - Current timestamp. */
    updateJumpFrame(now) {
        const frames = this.frameLists.jump;
        if (!frames?.length || now - this.lastAnimTime < CHARACTER_JUMP_FRAME_MS) return;
        if (this.frameIndex < frames.length - 1) {
            this.frameIndex++;
            this.img = frames[this.frameIndex];
        }
        this.lastAnimTime = now;
    }
    /** Moves to the next animation frame. */
    advanceAnimationFrame() {
        const frames = this.frameLists[this.currentState];
        if (!frames?.length) return;
        if (this.currentState === "dead" && this.frameIndex >= frames.length - 1) return;
        this.frameIndex = this.getNextFrameIndex(frames.length);
        this.img = frames[this.frameIndex];
    }
    /** @param {number} frameCount - Number of frames. @returns {number} Next frame index. */
    getNextFrameIndex(frameCount) {
        if (this.currentState === "dead") return Math.min(this.frameIndex + 1, frameCount - 1);
        return (this.frameIndex + 1) % frameCount;
    }
    /** @returns {ThrowableObject|null} Thrown bottle or null. */
    throwBottle() {
        if (!this.canStartBottleThrow()) return null;
        this.bottleBar = Math.max(0, this.bottleBar - 20);
        this.canThrow = false;
        this.resetIdleTimer();
        setTimeout(() => { this.canThrow = true; }, BOTTLE_THROW_COOLDOWN_MS);
        return this.createThrownBottle();
    }
    /** @returns {boolean} True when a bottle throw is allowed. */
    canStartBottleThrow() {
        if (this.isDead || !this.canThrow || this.bottleBar < 20) return false;
        return this.currentState !== "longIdle";
    }
    /** @returns {ThrowableObject} Thrown bottle instance. */
    createThrownBottle() {
        const throwType = getCharacterThrowType(this);
        const x = getCharacterThrowX(this);
        const y = getCharacterThrowY(this);
        return new ThrowableObject(x, y, this.otherDirection, throwType);
    }
    /** @returns {boolean} True when a bottle was granted. */
    grantBonusBottle() {
        if (this.bottleBar >= 100) return false;
        this.bottleBar = Math.min(100, this.bottleBar + 20);
        audioManager.playEffect("bottle");
        rewardPopup.show();
        return true;
    }
    /** @returns {boolean} True when the coin was collected. */
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
    /** Applies health bonus when the coin bar is full. */
    applyCoinHealthBonus() {
        if (this.coinBar < 100) return;
        this.health = Math.min(this.maxHealth, this.health + 20);
    }
    /** Registers a defeated enemy and grants a bottle every 5 kills. */
    registerEnemyDefeated() {
        this.enemiesDefeated++;
        if (this.enemiesDefeated % 5 === 0) this.grantBonusBottle();
    }
    /** @returns {boolean} True when the bottle was collected. */
    collectBottle() {
        if (this.bottleBar >= 100) return false;
        this.bottleBar = Math.min(100, this.bottleBar + 20);
        audioManager.playEffect("bottle");
        return true;
    }
    /** @param {number} amount - Damage amount. */
    takeDamage(amount) {
        if (this.isDead) return;
        this.health = Math.max(0, this.health - amount);
        if (world?.isRunning) world.statusBar.setHealth(this.health, this.maxHealth);
        if (this.health <= 0) this.die();
        else this.playHurt();
    }
    /** Plays hurt animation briefly. */
    playHurt() {
        audioManager.playEffect("hurt");
        this.isDucking = false;
        this.applyDuckPose(false);
        this.setState("hurt");
        setTimeout(() => this.resetFromHurt(), 800);
    }
    /** Resets Pepe after the hurt animation. */
    resetFromHurt() {
        if (this.isDead || this.currentState !== "hurt") return;
        this.setState("idle");
        this.img = this.frameLists.idle[0];
    }
    /** Marks Pepe as dead. */
    die() {
        this.isDead = true;
        this.setState("dead");
    }
}
