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
        this.width = 72;
        this.height = 72;
        this.offset = { top: 10, left: 10, right: 10, bottom: 10 };
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
