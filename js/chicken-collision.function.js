/**
 * Returns the bottle collision box for a chicken.
 * @param {Chicken} chicken - Chicken instance.
 * @param {ThrowableObject} bottle - Thrown bottle.
 * @returns {{x: number, y: number, w: number, h: number}} Hitbox.
 */
function getChickenBottleHitBox(chicken, bottle) {
    const padX = bottle.isLowThrow ? 12 : 6;
    const padY = bottle.isLowThrow ? 18 : 10;
    return {
        x: chicken.x + chicken.offset.left - padX,
        y: chicken.y + chicken.offset.top - padY,
        w: chicken.width - chicken.offset.left - chicken.offset.right + padX * 2,
        h: chicken.height - chicken.offset.top - chicken.offset.bottom + padY * 2
    };
}


/**
 * Checks whether a bottle overlaps a chicken hitbox.
 * @param {Chicken} chicken - Chicken instance.
 * @param {ThrowableObject} bottle - Thrown bottle.
 * @returns {boolean} True when the bottle hits.
 */
function isChickenHitByBottle(chicken, bottle) {
    const b = bottle.getHitBox();
    const box = getChickenBottleHitBox(chicken, bottle);
    return b.x < box.x + box.w && b.x + b.w > box.x &&
        b.y < box.y + box.h && b.y + b.h > box.y;
}
