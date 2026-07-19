/**
 * Background tile for seamless level scrolling.
 */
class BackgroundObject extends DrawableObject {
    tileX = 0;
    speedFactor = 1;
    isSky = false;
    layerId = 0;
    tileWorldWidth = 0;
    srcY = 0;
    srcCropH = 0;

    /**
     * Creates a background tile.
     * @param {string} imagePath - Image path.
     * @param {number} tileX - World X position of this tile.
     * @param {object} [config={}] - Layer configuration.
     */
    constructor(imagePath, tileX, config = {}) {
        super();
        this.loadImage(imagePath);
        this.tileX = tileX;
        this.speedFactor = config.speed ?? 1;
        this.isSky = config.isSky ?? false;
        this.layerId = config.layerId ?? 0;
        this.tileWorldWidth = config.tileWidth ?? 0;
        this.srcY = config.srcY ?? 0;
        this.srcCropH = config.srcCropH ?? 0;
    }
}
