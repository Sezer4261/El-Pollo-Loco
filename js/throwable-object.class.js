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
     * @param {string} [throwType="high"] - Throw type.
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
     * Returns the Y position for low bottle throws.
     * @returns {number} Low-throw ground line.
     */
    static getLowThrowY() {
        return GROUND_Y + Math.round(CHARACTER_HEIGHT * 0.85);
    }

    /**
     * Sets speed for high arc or low ground throw.
     * @param {boolean} facingLeft - Direction flag.
     * @param {string} throwType - "high" or "low".
     */
    applyThrowSpeed(facingLeft, throwType) {
        const direction = facingLeft ? -1 : 1;
        if (throwType === "low") return this.setLowThrowSpeed(direction);
        this.speedX = direction * BOTTLE_THROW_SPEED_X;
        this.speedY = BOTTLE_THROW_SPEED_Y;
    }

    /**
     * Sets the speed for a low bottle throw.
     * @param {number} direction - Horizontal direction.
     */
    setLowThrowSpeed(direction) {
        this.speedX = direction * BOTTLE_THROW_SPEED_X_LOW;
        this.speedY = 0;
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
        this.y = ThrowableObject.getLowThrowY();
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
