const LOW_THROW_Y = GROUND_Y + Math.round(CHARACTER_HEIGHT * 0.85);

/**
 * Builds numbered animation frame images.
 * @param {string} basePath - Path prefix.
 * @param {number} start - First frame number.
 * @param {number} end - Last frame number.
 * @returns {HTMLImageElement[]} Frame images.
 */
function buildFrames(basePath, start, end) {
    const frames = [];
    for (let i = start; i <= end; i++) {
        const img = new Image();
        img.src = basePath + i + ".png";
        frames.push(img);
    }
    return frames;
}

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
        return paths.map((path) => this.getCachedImage(path));
    }


    /**
     * Returns a cached image, loading it on first use.
     * @param {string} path - Image file path.
     * @returns {HTMLImageElement} Cached image.
     */
    getCachedImage(path) {
        if (!this.imageCache[path]) {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        }
        return this.imageCache[path];
    }
}

/**
 * Base class for all movable game objects with physics.
 */
class MovableObject extends DrawableObject {
    speedX = 0;
    speedY = 0;
    otherDirection = false;
    offset = { top: 0, left: 0, right: 0, bottom: 0 };

    /**
     * Returns the collision hitbox with offsets applied.
     * @returns {{x: number, y: number, w: number, h: number}} Hitbox.
     */
    getHitBox() {
        return {
            x: this.x + this.offset.left,
            y: this.y + this.offset.top,
            w: this.width - this.offset.left - this.offset.right,
            h: this.height - this.offset.top - this.offset.bottom
        };
    }


    /**
     * Checks overlap with another object using hitboxes.
     * @param {MovableObject} obj - Object to test.
     * @returns {boolean} True when hitboxes overlap.
     */
    isColliding(obj) {
        const a = this.getHitBox();
        const b = obj.getHitBox();
        return a.x < b.x + b.w && a.x + a.w > b.x
            && a.y < b.y + b.h && a.y + a.h > b.y;
    }


    /**
     * Returns true when the object is above ground level.
     * @returns {boolean} Above ground state.
     */
    isAboveGround() {
        return this.y < GROUND_Y;
    }


    /**
     * Applies gravity to vertical movement.
     */
    applyGravity() {
        if (!this.isAboveGround()) {
            this.y = GROUND_Y;
            this.speedY = 0;
            return;
        }
        this.speedY += GRAVITY;
        this.y += this.speedY;
    }
}
