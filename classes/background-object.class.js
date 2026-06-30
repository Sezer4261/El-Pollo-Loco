/**
 * Parallax scrolling background layer.
 */
class BackgroundObject extends MovableObject {
    /**
     * Creates a background layer.
     * @param {string} imagePath - Image path.
     * @param {number} [speed=1] - Parallax speed factor.
     */
    constructor(imagePath, speed = 1) {
        super();
        this.loadImage(imagePath);
        this.speed = speed;
    }
}
