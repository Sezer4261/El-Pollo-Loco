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
 */
function drawAspectBackgroundTile(ctx, img, screenX, h, srcWidth) {
    const scale = getBackgroundScale(h, img);
    const cropW = srcWidth ?? img.naturalWidth;
    const drawW = cropW * scale;
    ctx.drawImage(img, 0, 0, cropW, img.naturalHeight, screenX, 0, drawW, h);
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
    const drawW = img.naturalWidth * scale;
    const first = -1;
    const last = Math.ceil(w / drawW) + 1;
    for (let i = first; i <= last; i++) {
        drawAspectBackgroundTile(ctx, img, i * drawW, h);
    }
}


/**
 * Draws one seamless parallax layer across the full screen.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {BackgroundObject[]} tiles - Layer tiles.
 * @param {number} cam - Camera X offset.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 */
function drawSeamlessParallaxLayer(ctx, tiles, cam, w, h) {
    if (!tiles.length) return;
    const frameA = tiles[0];
    const frameB = tiles[1] || tiles[0];
    const refImg = frameA.img;
    if (!refImg?.complete || !refImg.naturalWidth) return;
    const srcTileW = frameA.tileWorldWidth || refImg.naturalWidth;
    const scale = getBackgroundScale(h, refImg);
    const tileScreenW = srcTileW * scale;
    const parallaxCam = cam * frameA.speedFactor;
    const first = Math.floor(parallaxCam / tileScreenW) - 1;
    const last = Math.ceil((parallaxCam + w) / tileScreenW) + 1;
    for (let i = first; i <= last; i++) {
        drawSeamlessParallaxTile(ctx, i, tileScreenW, parallaxCam, frameA, frameB, h, srcTileW);
    }
}


/**
 * Draws a single tiled parallax frame.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} index - Tile index.
 * @param {number} tileScreenW - Tile width on screen.
 * @param {number} parallaxCam - Parallax camera offset.
 * @param {BackgroundObject} frameA - First frame tile.
 * @param {BackgroundObject} frameB - Second frame tile.
 * @param {number} h - Canvas height.
 * @param {number} srcTileW - Source crop width in image pixels.
 */
function drawSeamlessParallaxTile(ctx, index, tileScreenW, parallaxCam, frameA, frameB, h, srcTileW) {
    const frame = index % 2 === 0 ? frameA : frameB;
    const img = frame.img;
    if (!img?.complete) return;
    const screenX = index * tileScreenW - parallaxCam;
    drawAspectBackgroundTile(ctx, img, screenX, h, srcTileW);
}


/**
 * Draws all background layers with seamless tiling.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {BackgroundObject[]} backgrounds - All background tiles.
 * @param {number} cam - Camera X offset.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 */
function drawBackgroundLayers(ctx, backgrounds, cam, w, h) {
    drawSkyLayer(ctx, backgrounds, w, h);
    BACKGROUND_LAYER_GROUPS.forEach((group, layerId) => {
        if (group.isSky) return;
        const tiles = backgrounds.filter((tile) => tile.layerId === layerId);
        drawSeamlessParallaxLayer(ctx, tiles, cam, w, h);
    });
}
