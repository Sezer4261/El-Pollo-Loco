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
    prevSpeedY = 0;
    idleStartTime = performance.now();
    animationSpeeds = { idle: 120, longIdle: 150, walk: 90, jump: 130, duck: 200, hurt: 120, dead: 200 };
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
        this.prevSpeedY = this.speedY;
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
     * Applies duck walk left or right; returns true when moved.
     * @param {Keyboard} kb - Keyboard state.
     * @returns {boolean} True when a duck walk direction was applied.
     */
    tryDuckWalk(kb) {
        if (kb.LEFT) {
            this.x -= CHARACTER_DUCK_SPEED;
            this.otherDirection = true;
            this.setState("walk");
            return true;
        }
        if (!kb.RIGHT) return false;
        this.x += CHARACTER_DUCK_SPEED;
        this.otherDirection = false;
        this.setState("walk");
        return true;
    }


    /**
     * Moves Pepe while ducking on the ground.
     * @param {Keyboard} kb - Keyboard state.
     */
    applyDuckMovement(kb) {
        this.resetIdleTimer();
        if (!this.tryDuckWalk(kb)) this.setState("duck");
    }


    /**
     * Applies standing or ducking size and hitbox.
     * @param {boolean} ducking - Whether Pepe is ducking.
     */
    applyDuckSize(ducking) {
        if (ducking) {
            this.height = CHARACTER_DUCK_HEIGHT;
            this.y = getGroundYForHeight(CHARACTER_DUCK_HEIGHT);
            this.offset = this.duckOffset;
            return;
        }
        this.height = CHARACTER_HEIGHT;
        this.offset = this.standingOffset;
    }


    /**
     * Switches between standing and ducking size and hitbox.
     * @param {boolean} ducking - Whether Pepe is ducking.
     */
    applyDuckPose(ducking) {
        this.applyDuckSize(ducking);
        if (!ducking && !this.isAboveGround()) this.y = this.getGroundY();
    }


    /**
     * Allows left/right movement while jumping.
     * @param {Keyboard} kb - Keyboard state.
     */
    applyAirMovement(kb) {
        if (kb.LEFT) {
            this.x -= CHARACTER_WALK_SPEED;
            this.otherDirection = true;
            return;
        }
        if (kb.RIGHT) {
            this.x += CHARACTER_WALK_SPEED;
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
        this.x -= CHARACTER_WALK_SPEED;
        this.otherDirection = true;
        this.resetIdleTimer();
        this.setState("walk");
    }


    /**
     * Moves Pepe right.
     */
    moveRight() {
        this.x += CHARACTER_WALK_SPEED;
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
        this.speedY = -CHARACTER_JUMP_SPEED;
        this.y = this.getGroundY() + this.speedY;
        this.currentState = "jump";
        this.beginJumpAnimation();
        this.resetIdleTimer();
    }


    /**
     * Starts the jump sprite sequence from the first frame.
     */
    beginJumpAnimation() {
        const now = performance.now();
        this.lastAnimTime = now;
        this.frameIndex = 0;
        const jumpFrames = this.frameLists.jump;
        if (jumpFrames?.length) this.img = jumpFrames[0];
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
        if (state === "jump") this.beginJumpAnimation();
    }


    /**
     * Advances animation frames.
     * @param {number} now - Current timestamp.
     */
    updateAnimation(now) {
        if (this.currentState === "jump") {
            this.updateJumpFrame(now);
            return;
        }
        const speed = this.animationSpeeds[this.currentState] || 120;
        if (now - this.lastAnimTime < speed) return;
        this.advanceAnimationFrame();
        this.lastAnimTime = now;
    }


    /**
     * Plays all jump frames in order over the current jump duration.
     */
    updateJumpFrame(now) {
        const frames = this.frameLists.jump;
        if (!frames?.length) return;
        if (now - this.lastAnimTime < CHARACTER_JUMP_FRAME_MS) return;
        if (this.frameIndex < frames.length - 1) {
            this.frameIndex++;
            this.img = frames[this.frameIndex];
        }
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

}
