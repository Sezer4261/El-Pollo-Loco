/**
 * Draws one parallax background tile in screen space.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {BackgroundObject} tile - Background tile.
 * @param {number} cam - Camera X offset.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 */
function drawBackgroundTile(ctx, tile, cam, w, h) {
    const img = tile.img;
    if (!img?.complete || !img.naturalWidth) return;
    if (tile.isSky) return drawSkyBackgroundTile(ctx, img, w, h);
    drawParallaxBackgroundTile(ctx, img, tile, cam, w, h);
}

/**
 * Draws the sky tile stretched to the full canvas.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {HTMLImageElement} img - Background image.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 */
function drawSkyBackgroundTile(ctx, img, w, h) {
    ctx.drawImage(img, 0, 0, w, h);
}

/**
 * Draws a clipped parallax background tile.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {HTMLImageElement} img - Background image.
 * @param {BackgroundObject} tile - Background tile.
 * @param {number} cam - Camera X offset.
 * @param {number} w - Canvas width.
 * @param {number} h - Canvas height.
 */
function drawParallaxBackgroundTile(ctx, img, tile, cam, w, h) {
    const scale = h / img.naturalHeight;
    const drawW = img.naturalWidth * scale;
    const screenX = tile.tileX - cam * tile.speedFactor;
    const slice = getVisibleBackgroundSlice(screenX, drawW, scale, w);
    if (!slice) return;
    ctx.drawImage(img, slice.srcX, 0, slice.srcW, img.naturalHeight, slice.destX, 0, slice.destW, h);
}

/**
 * Returns the visible source and destination slice for a background tile.
 * @param {number} screenX - Tile X position on screen.
 * @param {number} drawW - Scaled tile width.
 * @param {number} scale - Image scale factor.
 * @param {number} canvasW - Canvas width.
 * @returns {{srcX:number,srcW:number,destX:number,destW:number}|null} Visible slice.
 */
function getVisibleBackgroundSlice(screenX, drawW, scale, canvasW) {
    if (screenX + drawW < 0 || screenX > canvasW) return null;
    const destX = Math.max(0, screenX);
    const srcX = screenX < 0 ? -screenX / scale : 0;
    const destW = Math.min(drawW - srcX * scale, canvasW - destX);
    return { srcX, srcW: destW / scale, destX, destW };
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
 * Draws an object with horizontal flip.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {MovableObject} obj - Object to draw.
 */
function drawFlippedObject(ctx, obj) {
    if (!obj.img?.complete) return;
    if (!obj.otherDirection) return drawImageObject(ctx, obj);
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
 * Draws Pepe ducked by squashing the sprite from the feet upward.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {Character} character - Player character.
 */
function drawDuckingCharacter(ctx, character) {
    const img = character.img;
    if (!img?.complete || !img.naturalHeight) return;
    const feetY = character.y + character.height;
    const scaleY = character.height / CHARACTER_HEIGHT;
    drawDuckingSprite(ctx, character, img, feetY, scaleY);
}

/**
 * Draws the ducking sprite with the correct facing direction.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {Character} character - Player character.
 * @param {HTMLImageElement} img - Character image.
 * @param {number} feetY - Grounded feet position.
 * @param {number} scaleY - Vertical squash factor.
 */
function drawDuckingSprite(ctx, character, img, feetY, scaleY) {
    const originX = character.otherDirection ? character.x + character.width : character.x;
    const directionX = character.otherDirection ? -1 : 1;
    ctx.save();
    ctx.translate(originX, feetY);
    ctx.scale(directionX, scaleY);
    ctx.drawImage(img, 0, -CHARACTER_HEIGHT, character.width, CHARACTER_HEIGHT);
    ctx.restore();
}

/**
 * Draws Pepe with the hurt animation tinted red instead of gray.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {Character} character - Player character.
 */
function drawCharacterLayer(ctx, character) {
    if (character.currentState === "hurt") {
        ctx.save();
        ctx.filter = "sepia(1) saturate(7) hue-rotate(-32deg) brightness(1.08)";
        drawFlippedObject(ctx, character);
        ctx.restore();
        return;
    }
    if (character.isDucking) return drawDuckingCharacter(ctx, character);
    drawFlippedObject(ctx, character);
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
    drawCharacterLayer(ctx, world.character);
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
    if (boss.isRoasted) return drawRoastedEndboss(ctx, boss);
    const flash = boss.hitFlashUntil && performance.now() < boss.hitFlashUntil;
    if (flash) {
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.filter = "sepia(1) saturate(12) hue-rotate(-45deg) brightness(1.35)";
    }
    drawFlippedObject(ctx, boss);
    if (flash) ctx.restore();
}
