/**
 * Base class for all drawable game objects.
 */
class DrawableObject {
    x = 0;
    y = 0;
    width = 80;
    height = 100;
    img = new Image();
    imageCache = {};

    /**
     * Loads a single image from path.
     * @param {string} path - Image file path.
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }


    /**
     * Loads multiple images into cache.
     * @param {string[]} paths - Array of image paths.
     * @returns {HTMLImageElement[]} Loaded images.
     */
    loadImages(paths) {
        return paths.map((path) => {
            if (!this.imageCache[path]) {
                const img = new Image();
                img.src = path;
                this.imageCache[path] = img;
            }
            return this.imageCache[path];
        });
    }

}
