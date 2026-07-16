/**
 * Collectible coin placed in the level.
 */
class Coin extends MovableObject {
    collected = false;

    static FRAMES = [
        "img/8_coin/coin_1.png",
        "img/8_coin/coin_2.png"
    ];

    /**
     * Creates a coin at the given position.
     * @param {number} x - X position.
     * @param {number} y - Y position.
     */
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.width = 90;
        this.height = 90;
        this.offset = { top: 23, left: 23, right: 23, bottom: 23 };
        this.requiresJump = y < COIN_JUMP_COLLECT_MAX_Y;
        this.frames = this.loadImages(Coin.FRAMES);
        this.img = this.frames[0];
        this.frameIndex = 0;
        this.lastFrameTime = 0;
    }


    /**
     * Animates the coin rotation.
     * @param {number} now - Current timestamp.
     */
    animate(now) {
        if (now - this.lastFrameTime < 150) return;
        this.frameIndex = (this.frameIndex + 1) % this.frames.length;
        this.img = this.frames[this.frameIndex];
        this.lastFrameTime = now;
    }
}

/**
 * Collectible salsa bottle on the ground.
 */
class Bottle extends MovableObject {
    collected = false;

    /**
     * Creates a ground bottle at the given position.
     * @param {number} x - X position.
     * @param {number} y - Y position.
     */
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.width = 76;
        this.height = 76;
        this.offset = { top: 13, left: 18, right: 18, bottom: 10 };
        this.loadImage("img/6_salsa_bottle/1_salsa_bottle_on_ground.png");
    }
}

/**
 * Thrown salsa bottle with high arc or low ground trajectory.
 */
class ThrowableObject extends MovableObject {
    isActive = true;
    rotationFrames = [];
    frameIndex = 0;
    lastFrameTime = 0;
    isLowThrow = false;

    static ROTATION_PATHS = [
        "img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
        "img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
        "img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
        "img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png"
    ];

    /**
     * Creates a thrown bottle at the given position.
     * @param {number} x - Start X position.
     * @param {number} y - Start Y position.
     * @param {boolean} facingLeft - Direction flag.
     * @param {string} throwType - "high" or "low".
     */
    constructor(x, y, facingLeft, throwType = "high") {
        super();
        this.x = x;
        this.y = y;
        this.width = 45;
        this.height = 45;
        this.offset = { top: 8, left: 8, right: 8, bottom: 8 };
        this.isLowThrow = throwType === "low";
        this.applyThrowSpeed(facingLeft, throwType);
        this.rotationFrames = this.loadImages(ThrowableObject.ROTATION_PATHS);
        this.img = this.rotationFrames[0];
    }


    /**
     * Sets speed for high arc or low ground throw.
     * @param {boolean} facingLeft - Direction flag.
     * @param {string} throwType - "high" or "low".
     */
    applyThrowSpeed(facingLeft, throwType) {
        const dir = facingLeft ? -1 : 1;
        if (throwType === "low") {
            this.speedX = dir * BOTTLE_THROW_SPEED_X_LOW;
            this.speedY = 0;
            return;
        }
        this.speedX = dir * BOTTLE_THROW_SPEED_X;
        this.speedY = BOTTLE_THROW_SPEED_Y;
    }


    /**
     * Updates bottle position and rotation.
     */
    update() {
        this.x += this.speedX;
        if (this.isLowThrow) this.updateLowThrow();
        else this.updateHighThrow();
        this.animateRotation(performance.now());
    }


    /**
     * Keeps the bottle on the ground line across the level.
     */
    updateLowThrow() {
        this.y = LOW_THROW_Y;
        if (this.x < -100 || this.x > 7000) this.isActive = false;
    }


    /**
     * Moves the bottle in a high arc through the screen.
     */
    updateHighThrow() {
        this.y += this.speedY;
        this.speedY += GRAVITY;
        if (this.y > 520 || this.x < -100 || this.x > 7000) this.isActive = false;
    }


    /**
     * Advances rotation animation frames.
     * @param {number} now - Current timestamp.
     */
    animateRotation(now) {
        if (now - this.lastFrameTime < 80) return;
        this.frameIndex = (this.frameIndex + 1) % this.rotationFrames.length;
        this.img = this.rotationFrames[this.frameIndex];
        this.lastFrameTime = now;
    }
}
