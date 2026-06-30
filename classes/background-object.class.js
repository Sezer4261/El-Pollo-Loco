/**
 * Background tile for seamless level scrolling.
 */
class BackgroundObject extends DrawableObject {
    tileX = 0;
    tileWidth = 1920;

    /**
     * Creates a background tile.
     * @param {string} imagePath - Image path.
     * @param {number} tileX - World X position of this tile.
     */
    constructor(imagePath, tileX) {
        super();
        this.loadImage(imagePath);
        this.tileX = tileX;
    }
}
