/**
 * Draws one background tile at its world position.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {BackgroundObject} tile - Background tile.
 * @param {number} cam - Camera X offset.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 */
function drawBackgroundTile(ctx, tile, cam, w, h) {
    const img = tile.img;
    if (!img?.complete || !img.naturalWidth) return;
    const srcY = Math.max(0, img.naturalHeight - h);
    const screenX = tile.tileX - cam;
    if (screenX + img.naturalWidth < 0 || screenX > w) return;
    const destX = Math.max(0, screenX);
    const srcX = screenX < 0 ? -screenX : 0;
    const drawW = Math.min(img.naturalWidth - srcX, w - destX);
    ctx.drawImage(img, srcX, srcY, drawW, h, destX, 0, drawW, h);
}


/**
 * Draws a single image object on the canvas.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {MovableObject} obj - Object to draw.
 */
function drawImageObject(ctx, obj) {
    if (!obj.img?.complete) return;
    ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
}


/**
 * Draws object with horizontal flip.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {MovableObject} obj - Object to draw.
 */
function drawFlippedObject(ctx, obj) {
    if (!obj.img?.complete) return;
    if (!obj.otherDirection) {
        drawImageObject(ctx, obj);
        return;
    }
    ctx.save();
    ctx.translate(obj.x + obj.width, obj.y);
    ctx.scale(-1, 1);
    ctx.drawImage(obj.img, 0, 0, obj.width, obj.height);
    ctx.restore();
}


/**
 * Draws the roasted endboss with rotation.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {Endboss} boss - Defeated endboss.
 */
function drawRoastedEndboss(ctx, boss) {
    if (!boss.img?.complete) return;
    const cx = boss.x + boss.width / 2;
    const cy = boss.y + boss.height / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(boss.rotation);
    if (boss.otherDirection) ctx.scale(-1, 1);
    ctx.drawImage(boss.img, -boss.width / 2, -boss.height / 2, boss.width, boss.height);
    ctx.restore();
}


/**
 * Draws all world objects inside the camera transform.
 * @param {World} world - Game world instance.
 */
function drawWorldLayer(world) {
    const ctx = world.ctx;
    drawObjectsLayer(ctx, world.coins);
    drawObjectsLayer(ctx, world.bottles);
    drawObjectsLayer(ctx, world.chickens);
    drawEndbossLayer(ctx, world.endboss);
    drawObjectsLayer(ctx, world.throwables);
    drawFlippedObject(ctx, world.character);
}


/**
 * Draws a list of drawable objects.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {MovableObject[]} objects - Objects to draw.
 */
function drawObjectsLayer(ctx, objects) {
    objects.forEach((obj) => drawImageObject(ctx, obj));
}


/**
 * Draws the endboss in normal or roasted state.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {Endboss} boss - Endboss instance.
 */
function drawEndbossLayer(ctx, boss) {
    if (boss.isRoasted) drawRoastedEndboss(ctx, boss);
    else drawFlippedObject(ctx, boss);
}
