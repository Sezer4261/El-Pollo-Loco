/**
 * Draws a solid ground strip at the canvas bottom.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 */
function drawGroundBase(ctx, w, h) {
    ctx.fillStyle = GROUND_FILL_COLOR;
    ctx.fillRect(0, h - GROUND_FILL_HEIGHT, w, GROUND_FILL_HEIGHT);
}


/**
 * Draws the static sky layer.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {BackgroundObject[]} backgrounds - All background tiles.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 */
function drawSkyLayer(ctx, backgrounds, w, h) {
    const sky = backgrounds.find((tile) => tile.isSky);
    if (!sky) return;
    drawBackgroundTile(ctx, sky, 0, w, h);
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
    const tileWorldW = frameA.tileWorldWidth || refImg.naturalWidth;
    const parallaxCam = cam * frameA.speedFactor;
    const first = Math.floor(parallaxCam / tileWorldW) - 1;
    const last = Math.ceil((parallaxCam + w) / tileWorldW) + 1;
    for (let i = first; i <= last; i++) {
        drawSeamlessParallaxTile(ctx, i, tileWorldW, parallaxCam, frameA, frameB, h);
    }
}


/**
 * Draws a single tiled parallax frame.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} index - Tile index.
 * @param {number} tileWorldW - Tile width in world space.
 * @param {number} parallaxCam - Parallax camera offset.
 * @param {BackgroundObject} frameA - First frame tile.
 * @param {BackgroundObject} frameB - Second frame tile.
 * @param {number} h - Canvas height.
 */
function drawSeamlessParallaxTile(ctx, index, tileWorldW, parallaxCam, frameA, frameB, h) {
    const frame = index % 2 === 0 ? frameA : frameB;
    const img = frame.img;
    if (!img?.complete) return;
    const screenX = index * tileWorldW - parallaxCam;
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, screenX, 0, tileWorldW, h);
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
    drawGroundBase(ctx, w, h);
}
