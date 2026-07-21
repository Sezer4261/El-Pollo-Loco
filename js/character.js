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

    animationSpeeds = {
        idle: 120,
        longIdle: 150,
        walk: 90,
        jump: 130,
        duck: 200,
        hurt: 120,
        dead: 200
    };

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
     * Returns the Y coordinate where Pepe stands on the ground.
     * @returns {number} Ground Y for the current height.
     */
    getGroundY() {
        return getGroundYForHeight(this.height);
    }

    /**
     * Returns true when Pepe is above the ground line.
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
        if (!this.isAboveGround()) return this.landOnGround(groundY);
        this.speedY += GRAVITY;
        this.y += this.speedY;
        if (this.y >= groundY && this.speedY >= 0) this.landOnGround(groundY);
    }

    /**
     * Snaps Pepe onto the ground and clears vertical speed.
     * @param {number} groundY - Ground Y position.
     */
    landOnGround(groundY) {
        this.y = groundY;
        this.speedY = 0;
    }

    /**
     * Updates physics, movement, and animation each frame.
     */
    update() {
        if (this.isDead) return this.updateAnimation(performance.now());
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
        if (this.isAboveGround()) return handleCharacterAirMovement(this, kb);
        handleCharacterGroundMovement(this, kb);
    }

    /**
     * Tries to walk left or right while ducking.
     * @param {Keyboard} kb - Keyboard state.
     * @returns {boolean} True when a duck walk step happened.
     */
    tryDuckWalk(kb) {
        if (kb.LEFT) return this.stepDuckWalk(-1);
        if (kb.RIGHT) return this.stepDuckWalk(1);
        return false;
    }

    /**
     * Moves one duck-walk step in the given direction.
     * @param {number} direction - Horizontal direction (-1 or 1).
     * @returns {boolean} Always true after moving.
     */
    stepDuckWalk(direction) {
        this.x += direction * CHARACTER_DUCK_SPEED;
        this.otherDirection = direction < 0;
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
     * Switches between standing and ducking pose.
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
        if (kb.LEFT) return this.moveAir(-1);
        if (kb.RIGHT) this.moveAir(1);
    }

    /**
     * Moves Pepe horizontally in the air.
     * @param {number} direction - Horizontal direction (-1 or 1).
     */
    moveAir(direction) {
        this.x += direction * CHARACTER_WALK_SPEED;
        this.otherDirection = direction < 0;
    }

    /**
     * Sets idle or long-idle after the sleep delay.
     */
    handleIdleState() {
        const idleMs = performance.now() - this.idleStartTime;
        const nextState = idleMs >= CHARACTER_SLEEP_MS ? "longIdle" : "idle";
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
     * Moves Pepe left on the ground.
     */
    moveLeft() {
        this.x -= CHARACTER_WALK_SPEED;
        this.otherDirection = true;
        this.resetIdleTimer();
        this.setState("walk");
    }

    /**
     * Moves Pepe right on the ground.
     */
    moveRight() {
        this.x += CHARACTER_WALK_SPEED;
        this.otherDirection = false;
        this.resetIdleTimer();
        this.setState("walk");
    }

    /**
     * Makes Pepe jump from the ground.
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
}
