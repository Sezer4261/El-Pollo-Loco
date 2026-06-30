/**
 * Thrown salsa bottle projectile with gravity and rotation.
 */
class ThrowableObject extends MovableObject {
    isActive = true;
    rotationFrames = [];
    frameIndex = 0;
    lastFrameTime = 0;

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
     * @param {string} throwType - "forward" or "down".
     */
    constructor(x, y, facingLeft, throwType = "forward") {
        super();
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.offset = { top: 10, left: 10, right: 10, bottom: 10 };
        this.applyThrowSpeed(facingLeft, throwType);
        this.rotationFrames = this.loadImages(ThrowableObject.ROTATION_PATHS);
        this.img = this.rotationFrames[0];
    }


    /**
     * Sets horizontal and vertical speed for the throw type.
     * @param {boolean} facingLeft - Direction flag.
     * @param {string} throwType - "forward" or "down".
     */
    applyThrowSpeed(facingLeft, throwType) {
        const dir = facingLeft ? -1 : 1;
        if (throwType === "down") {
            this.speedX = dir * 6;
            this.speedY = 14;
            return;
        }
        this.speedX = dir * 10;
        this.speedY = 4;
    }


    /**
     * Updates bottle position, gravity and rotation.
     */
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.speedY += GRAVITY;
        this.animateRotation(performance.now());
        if (this.y > 500 || this.x < -50 || this.x > 5000) {
            this.isActive = false;
        }
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
