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
 * @param {number} [srcWidth] - Source crop width in image pixels.
 * @param {number} [srcY] - Source crop top in image pixels.
 * @param {number} [srcCropH] - Source crop height in image pixels.
 * @param {number} [seamOverlap] - Extra destination width to hide tile seams.
 */
function drawAspectBackgroundTile(ctx, img, screenX, h, srcWidth, srcY = 0, srcCropH = 0, seamOverlap = 0) {
    const scale = getBackgroundScale(h, img);
    const cropW = srcWidth ?? img.naturalWidth;
    const cropH = srcCropH > 0 ? srcCropH : img.naturalHeight - srcY;
    const destW = cropW * scale + seamOverlap;
    ctx.drawImage(img, 0, srcY, cropW, cropH, screenX, srcY * scale, destW, cropH * scale);
}


/**
 * Draws the static sky layer tiled without distortion.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {BackgroundObject[]} backgrounds - All background tiles.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 */
function drawSkyLayer(ctx, backgrounds, w, h) {
    const sky = backgrounds.find((tile) => tile.isSky);
    const img = sky?.img;
    if (!img?.complete || !img.naturalWidth) return;
    const scale = getBackgroundScale(h, img);
    const tileScreenW = img.naturalWidth * scale;
    const first = -2;
    const last = Math.ceil(w / tileScreenW) + 2;
    for (let i = first; i <= last; i++) {
        drawAspectBackgroundTile(ctx, img, i * tileScreenW, h);
    }
}


/**
 * Draws one seamless parallax layer across the full screen.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {BackgroundObject[]} tiles - Layer tiles.
 * @param {number} cam - Camera X offset.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 * @param {number} [driftOffset] - Auto-scroll offset for drifting layers.
 */
function drawSeamlessParallaxLayer(ctx, tiles, cam, w, h, driftOffset = 0) {
    if (!tiles.length) return;
    const frameA = tiles[0];
    const frameB = tiles[1] || tiles[0];
    const refImg = frameA.img;
    if (!refImg?.complete || !refImg.naturalWidth) return;
    const srcTileW = frameA.tileWorldWidth || refImg.naturalWidth;
    const scale = getBackgroundScale(h, refImg);
    const tileScreenW = srcTileW * scale;
    const speed = frameA.speedFactor ?? 1;
    const parallaxScroll = cam * speed * scale;
    const driftScroll = driftOffset;
    const scrollX = parallaxScroll + driftScroll;
    const usesAlternatingFrames = frameB.img !== frameA.img;
    if (usesAlternatingFrames && (!frameB.img?.complete || !frameB.img.naturalWidth)) return;
    const first = Math.floor(scrollX / tileScreenW) - 3;
    const last = Math.ceil((scrollX + w) / tileScreenW) + 3;
    for (let i = first; i <= last; i++) {
        const tileIndex = ((i % 2) + 2) % 2;
        const frame = usesAlternatingFrames && tileIndex === 1 ? frameB : frameA;
        const img = frame.img;
        if (!img?.complete || !img.naturalWidth) continue;
        const screenX = i * tileScreenW - scrollX;
        drawAspectBackgroundTile(ctx, img, screenX, h, srcTileW, frame.srcY ?? 0, frame.srcCropH ?? 0, BACKGROUND_SEAM_OVERLAP);
    }
}


/**
 * Draws all background layers with seamless tiling.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {BackgroundObject[]} backgrounds - All background tiles.
 * @param {number} cam - Camera X offset.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 * @param {Record<number, number>} [layerDrifts] - Auto-scroll offsets per layer.
 */
function drawBackgroundLayers(ctx, backgrounds, cam, w, h, layerDrifts = {}) {
    drawSkyLayer(ctx, backgrounds, w, h);
    const parallaxDrawOrder = [2, 1];
    parallaxDrawOrder.forEach((layerId) => {
        const group = BACKGROUND_LAYER_GROUPS[layerId];
        if (!group || group.isSky) return;
        const tiles = backgrounds.filter((tile) => tile.layerId === layerId);
        const drift = group.driftSpeed ? (layerDrifts[layerId] || 0) : 0;
        drawSeamlessParallaxLayer(ctx, tiles, cam, w, h, drift);
    });
}
