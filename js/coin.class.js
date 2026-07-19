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
