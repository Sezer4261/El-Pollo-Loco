/**
 * Preloads one image and decodes it before the first draw call.
 * @param {HTMLImageElement} img - Image to preload.
 * @returns {Promise<void>} Resolves when the image is ready.
 */
function preloadImageElement(img) {
    return new Promise((resolve) => {
        const finish = async () => {
            if (img.decode) {
                try {
                    await img.decode();
                } catch (_) {
                    /* ignore decode errors */
                }
            }
            resolve();
        };
        if (img.complete && img.naturalWidth) {
            finish();
            return;
        }
        img.addEventListener("load", finish, { once: true });
        img.addEventListener("error", finish, { once: true });
    });
}


/**
 * Preloads all unique background tile images.
 * @param {BackgroundObject[]} backgrounds - Background tiles.
 * @returns {Promise<void>} Resolves when every image is ready.
 */
function preloadBackgroundImages(backgrounds) {
    const seen = new Set();
    const jobs = [];
    backgrounds.forEach((tile) => {
        const img = tile.img;
        if (!img || seen.has(img)) return;
        seen.add(img);
        jobs.push(preloadImageElement(img));
    });
    return Promise.all(jobs);
}


/**
 * Collects all endboss animation images.
 * @param {Endboss} endboss - Endboss instance.
 * @returns {HTMLImageElement[]} Unique image elements.
 */
function collectEndbossImages(endboss) {
    const seen = new Set();
    const images = [];
    Object.values(endboss?.frameLists || {}).forEach((frames) => {
        frames.forEach((img) => {
            if (!img || seen.has(img)) return;
            seen.add(img);
            images.push(img);
        });
    });
    return images;
}


/**
 * Preloads background and endboss images before gameplay rendering.
 * @param {BackgroundObject[]} backgrounds - Background tiles.
 * @param {Endboss} endboss - Endboss instance.
 * @returns {Promise<void>} Resolves when assets are ready.
 */
function preloadGameAssets(backgrounds, endboss) {
    const seen = new Set();
    const jobs = [];
    [...collectEndbossImages(endboss)].forEach((img) => {
        if (!img || seen.has(img)) return;
        seen.add(img);
        jobs.push(preloadImageElement(img));
    });
    backgrounds.forEach((tile) => {
        const img = tile.img;
        if (!img || seen.has(img)) return;
        seen.add(img);
        jobs.push(preloadImageElement(img));
    });
    return Promise.all(jobs);
}
