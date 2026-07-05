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
    if (tile.isSky) {
        ctx.drawImage(img, 0, 0, w, h);
        return;
    }
    const scale = h / img.naturalHeight;
    const drawH = h;
    const drawW = img.naturalWidth * scale;
    const screenX = tile.tileX - cam * tile.speedFactor;
    if (screenX + drawW < 0 || screenX > w) return;
    const destX = Math.max(0, screenX);
    const srcX = screenX < 0 ? (-screenX / scale) : 0;
    const visibleW = Math.min(drawW - srcX * scale, w - destX);
    ctx.drawImage(
        img,
        srcX, 0, visibleW / scale, img.naturalHeight,
        destX, 0, visibleW, drawH
    );
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
 * Draws Pepe ducked by squashing the sprite from the feet upward.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {Character} character - Player character.
 */
function drawDuckingCharacter(ctx, character) {
    const img = character.img;
    if (!img?.complete || !img.naturalHeight) return;
    const scaleY = character.height / CHARACTER_HEIGHT;
    const feetY = character.y + character.height;
    ctx.save();
    if (character.otherDirection) {
        ctx.translate(character.x + character.width, feetY);
        ctx.scale(-1, scaleY);
        ctx.drawImage(img, 0, -CHARACTER_HEIGHT, character.width, CHARACTER_HEIGHT);
    } else {
        ctx.translate(character.x, feetY);
        ctx.scale(1, scaleY);
        ctx.drawImage(img, 0, -CHARACTER_HEIGHT, character.width, CHARACTER_HEIGHT);
    }
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
    if (character.isDucking) {
        drawDuckingCharacter(ctx, character);
        return;
    }
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
    if (boss.isRoasted) {
        drawRoastedEndboss(ctx, boss);
        return;
    }
    const flash = boss.hitFlashUntil && performance.now() < boss.hitFlashUntil;
    if (flash) {
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.filter = "sepia(1) saturate(12) hue-rotate(-45deg) brightness(1.35)";
    }
    drawFlippedObject(ctx, boss);
    if (flash) ctx.restore();
}
