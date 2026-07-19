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

/**
 * Creates one background tile from a layer group entry.
 * @param {object} group - Background layer group config.
 * @param {number} layerId - Layer identifier.
 * @param {string} file - Tile filename.
 * @param {number} tileX - World-space tile X position.
 * @returns {BackgroundObject} Created background tile.
 */
function createBackgroundTile(group, layerId, file, tileX) {
    return new BackgroundObject(group.folder + file, tileX, { ...group, layerId });
}

/**
 * Appends repeating composite tiles for one background group.
 * @param {BackgroundObject[]} tiles - Target background tile list.
 * @param {object} group - Background layer group config.
 * @param {number} layerId - Layer identifier.
 * @param {number} levelWidth - Total level width.
 * @returns {void}
 */
function appendCompositeBackgroundTiles(tiles, group, layerId, levelWidth) {
    for (let x = 0; x <= levelWidth; x += group.tileWidth) {
        const file = group.files[(x / group.tileWidth) % group.files.length];
        tiles.push(createBackgroundTile(group, layerId, file, x));
    }
}

/**
 * Appends fixed-position tiles for one background group.
 * @param {BackgroundObject[]} tiles - Target background tile list.
 * @param {object} group - Background layer group config.
 * @param {number} layerId - Layer identifier.
 * @returns {void}
 */
function appendFixedBackgroundTiles(tiles, group, layerId) {
    group.files.forEach((file, index) => {
        tiles.push(createBackgroundTile(group, layerId, file, index * group.tileWidth));
    });
}

/**
 * Appends all tiles for one background group.
 * @param {BackgroundObject[]} tiles - Target background tile list.
 * @param {object} group - Background layer group config.
 * @param {number} layerId - Layer identifier.
 * @param {number} levelWidth - Total level width.
 * @returns {void}
 */
function appendBackgroundGroup(tiles, group, layerId, levelWidth) {
    if (group.isSky) return tiles.push(new BackgroundObject(group.path, 0, { ...group, layerId }));
    if (group.isComposite) return appendCompositeBackgroundTiles(tiles, group, layerId, levelWidth);
    appendFixedBackgroundTiles(tiles, group, layerId);
}

/**
 * Builds all parallax background tiles for a level.
 * @param {number} levelWidth - Total level width.
 * @returns {BackgroundObject[]} Background tiles.
 */
function createParallaxBackgrounds(levelWidth) {
    const tiles = [];
    BACKGROUND_LAYER_GROUPS.forEach((group, layerId) => {
        appendBackgroundGroup(tiles, group, layerId, levelWidth);
    });
    return tiles;
}

/**
 * Returns the uniform scale for a background image on the canvas.
 * @param {number} h - Canvas height.
 * @param {HTMLImageElement} img - Background image.
 * @returns {number} Scale factor.
 */
function getBackgroundScale(h, img) {
    return h / img.naturalHeight;
}

/**
 * Draws one background image tile with preserved aspect ratio.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {HTMLImageElement} img - Image to draw.
 * @param {number} screenX - Destination X position.
 * @param {number} h - Canvas height.
 * @param {number} [srcWidth] - Source crop width.
 * @param {number} [srcY=0] - Source crop top.
 * @param {number} [srcCropH=0] - Source crop height.
 * @param {number} [seamOverlap=0] - Extra width to hide seams.
 * @returns {void}
 */
function drawAspectBackgroundTile(ctx, img, screenX, h, srcWidth, srcY = 0, srcCropH = 0, seamOverlap = 0) {
    const scale = getBackgroundScale(h, img);
    const cropW = srcWidth ?? img.naturalWidth;
    const cropH = srcCropH > 0 ? srcCropH : img.naturalHeight - srcY;
    const destW = cropW * scale + seamOverlap;
    ctx.drawImage(img, 0, srcY, cropW, cropH, screenX, srcY * scale, destW, cropH * scale);
}

/**
 * Returns whether an image is fully ready for drawing.
 * @param {HTMLImageElement} img - Image to inspect.
 * @returns {boolean} True when ready.
 */
function isReadyImage(img) {
    return !!img?.complete && !!img.naturalWidth;
}

/**
 * Draws the static sky layer tiled without distortion.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {BackgroundObject[]} backgrounds - All background tiles.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 * @returns {void}
 */
function drawSkyLayer(ctx, backgrounds, w, h) {
    const img = backgrounds.find((tile) => tile.isSky)?.img;
    if (!isReadyImage(img)) return;
    const tileScreenW = img.naturalWidth * getBackgroundScale(h, img);
    for (let i = -2; i <= Math.ceil(w / tileScreenW) + 2; i++) {
        drawAspectBackgroundTile(ctx, img, i * tileScreenW, h);
    }
}

/**
 * Builds draw state for one parallax layer.
 * @param {BackgroundObject[]} tiles - Layer tiles.
 * @param {number} cam - Camera X offset.
 * @param {number} h - Canvas height.
 * @param {number} driftOffset - Auto-scroll drift offset.
 * @returns {object|null} Layer draw state or null.
 */
function getParallaxState(tiles, cam, h, driftOffset) {
    if (!tiles.length || !isReadyImage(tiles[0].img)) return null;
    const frameA = tiles[0];
    const frameB = tiles[1] || frameA;
    if (frameB.img !== frameA.img && !isReadyImage(frameB.img)) return null;
    const srcTileW = frameA.tileWorldWidth || frameA.img.naturalWidth;
    const tileScreenW = srcTileW * getBackgroundScale(h, frameA.img);
    const scrollX = cam * (frameA.speedFactor ?? 1) + driftOffset;
    return { frameA, frameB, srcTileW, tileScreenW, scrollX };
}

/**
 * Returns the visible tile index range for a parallax layer.
 * @param {object} state - Parallax layer state.
 * @param {number} w - Canvas width.
 * @returns {{first: number, last: number}} Visible index range.
 */
function getParallaxRange(state, w) {
    return {
        first: Math.floor(state.scrollX / state.tileScreenW) - 3,
        last: Math.ceil((state.scrollX + w) / state.tileScreenW) + 3
    };
}

/**
 * Returns the correct frame for one parallax tile index.
 * @param {object} state - Parallax layer state.
 * @param {number} index - Tile index.
 * @returns {BackgroundObject} Selected frame tile.
 */
function getParallaxFrame(state, index) {
    const useAlt = state.frameB.img !== state.frameA.img;
    const tileIndex = ((index % 2) + 2) % 2;
    return useAlt && tileIndex === 1 ? state.frameB : state.frameA;
}

/**
 * Draws one parallax tile for the visible range.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {object} state - Parallax layer state.
 * @param {number} index - Tile index.
 * @param {number} h - Canvas height.
 * @returns {void}
 */
function drawParallaxTile(ctx, state, index, h) {
    const frame = getParallaxFrame(state, index);
    if (!isReadyImage(frame.img)) return;
    const screenX = index * state.tileScreenW - state.scrollX;
    drawAspectBackgroundTile(ctx, frame.img, screenX, h, state.srcTileW, frame.srcY ?? 0, frame.srcCropH ?? 0, BACKGROUND_SEAM_OVERLAP);
}

/**
 * Draws one seamless parallax layer across the full screen.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {BackgroundObject[]} tiles - Layer tiles.
 * @param {number} cam - Camera X offset.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 * @param {number} [driftOffset=0] - Auto-scroll offset.
 * @returns {void}
 */
function drawSeamlessParallaxLayer(ctx, tiles, cam, w, h, driftOffset = 0) {
    const state = getParallaxState(tiles, cam, h, driftOffset);
    if (!state) return;
    const range = getParallaxRange(state, w);
    for (let i = range.first; i <= range.last; i++) drawParallaxTile(ctx, state, i, h);
}

/**
 * Returns the current drift offset for one layer.
 * @param {object} group - Background layer group config.
 * @param {Record<number, number>} layerDrifts - Drift offsets per layer.
 * @param {number} layerId - Layer identifier.
 * @returns {number} Drift offset in pixels.
 */
function getLayerDrift(group, layerDrifts, layerId) {
    return group.driftSpeed ? (layerDrifts[layerId] || 0) : 0;
}

/**
 * Draws all background layers with seamless tiling.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {BackgroundObject[]} backgrounds - All background tiles.
 * @param {number} cam - Camera X offset.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 * @param {Record<number, number>} [layerDrifts={}] - Drift offsets.
 * @returns {void}
 */
function drawBackgroundLayers(ctx, backgrounds, cam, w, h, layerDrifts = {}) {
    drawSkyLayer(ctx, backgrounds, w, h);
    [2, 1].forEach((layerId) => {
        const group = BACKGROUND_LAYER_GROUPS[layerId];
        if (!group || group.isSky) return;
        const tiles = backgrounds.filter((tile) => tile.layerId === layerId);
        drawSeamlessParallaxLayer(ctx, tiles, cam, w, h, getLayerDrift(group, layerDrifts, layerId));
    });
}

/**
 * Decodes one image when the browser supports decoding.
 * @param {HTMLImageElement} img - Image to decode.
 * @returns {Promise<void>} Resolves after decode attempt.
 */
async function decodeImage(img) {
    if (!img.decode) return;
    try {
        await img.decode();
    } catch (error) {
        console.error("Image decode failed:", img?.src || img, error);
    }
}

/**
 * Finishes preloading for one image.
 * @param {HTMLImageElement} img - Ready image.
 * @param {() => void} resolve - Promise resolver.
 * @returns {void}
 */
function finishImagePreload(img, resolve) {
    decodeImage(img).finally(resolve);
}

/**
 * Binds load and error handlers for one image preload.
 * @param {HTMLImageElement} img - Image to watch.
 * @param {() => void} resolve - Promise resolver.
 * @returns {void}
 */
function bindImagePreloadEvents(img, resolve) {
    const finish = () => finishImagePreload(img, resolve);
    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", finish, { once: true });
}

/**
 * Preloads one image and decodes it before the first draw call.
 * @param {HTMLImageElement} img - Image to preload.
 * @returns {Promise<void>} Resolves when the image is ready.
 */
function preloadImageElement(img) {
    return new Promise((resolve) => {
        if (isReadyImage(img)) return finishImagePreload(img, resolve);
        bindImagePreloadEvents(img, resolve);
    });
}

/**
 * Collects unique images from a list of items.
 * @param {Array} items - Source item list.
 * @param {(item: any) => HTMLImageElement|undefined} pickImage - Image selector.
 * @returns {HTMLImageElement[]} Unique image list.
 */
function collectUniqueImages(items, pickImage) {
    const seen = new Set();
    return items.reduce((images, item) => {
        const img = pickImage(item);
        if (!img || seen.has(img)) return images;
        seen.add(img);
        images.push(img);
        return images;
    }, []);
}

/**
 * Preloads every image in a list.
 * @param {HTMLImageElement[]} images - Images to preload.
 * @returns {Promise<void[]>} Resolves when all images are ready.
 */
function preloadImageList(images) {
    return Promise.all(images.map((img) => preloadImageElement(img)));
}

/**
 * Preloads all unique background tile images.
 * @param {BackgroundObject[]} backgrounds - Background tiles.
 * @returns {Promise<void[]>} Resolves when every image is ready.
 */
function preloadBackgroundImages(backgrounds) {
    return preloadImageList(collectUniqueImages(backgrounds, (tile) => tile.img));
}

/**
 * Collects all endboss animation images.
 * @param {Endboss} endboss - Endboss instance.
 * @returns {HTMLImageElement[]} Unique image elements.
 */
function collectEndbossImages(endboss) {
    const frames = [];
    Object.values(endboss?.frameLists || {}).forEach((group) => group.forEach((img) => frames.push(img)));
    return collectUniqueImages(frames, (img) => img);
}

/**
 * Preloads background and endboss images before gameplay rendering.
 * @param {BackgroundObject[]} backgrounds - Background tiles.
 * @param {Endboss} endboss - Endboss instance.
 * @returns {Promise<void[]>} Resolves when assets are ready.
 */
function preloadGameAssets(backgrounds, endboss) {
    const images = [...collectEndbossImages(endboss), ...collectUniqueImages(backgrounds, (tile) => tile.img)];
    return preloadImageList(collectUniqueImages(images, (img) => img));
}
