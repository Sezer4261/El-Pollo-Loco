/**
 * Checks close contact between Pepe and a collectible.
 * Uses a tighter player box so pickups need a real touch.
 * @param {Character} character - Player character.
 * @param {MovableObject} item - Collectible item.
 * @returns {boolean} True when they truly overlap.
 */
function isTouchingCollectible(character, item) {
    const c = character.getHitBox();
    const insetX = c.w * 0.24;
    const box = {
        x: c.x + insetX,
        y: c.y + c.h * 0.08,
        w: c.w - insetX * 2,
        h: c.h - c.h * 0.12
    };
    const b = item.getHitBox();
    return box.x < b.x + b.w && box.x + box.w > b.x &&
        box.y < b.y + b.h && box.y + box.h > b.y;
}


/**
 * Filters collected coins and updates the character bar.
 * @param {Character} character - Player character.
 * @param {Coin[]} coins - Coin list.
 * @returns {Coin[]} Remaining coins.
 */
function filterCollectedCoins(character, coins) {
    return coins.filter((coin) => {
        if (coin.collected) return false;
        if (!isTouchingCollectible(character, coin)) return true;
        if (coin.requiresJump && !character.isAboveGround()) return true;
        const pickedUp = character.collectCoin();
        if (!pickedUp) return true;
        coin.collected = true;
        return false;
    });
}


/**
 * Filters collected bottles and updates the character bar.
 * @param {Character} character - Player character.
 * @param {Bottle[]} bottles - Bottle list.
 * @returns {Bottle[]} Remaining bottles.
 */
function filterCollectedBottles(character, bottles) {
    return bottles.filter((bottle) => {
        if (bottle.collected || !isTouchingCollectible(character, bottle)) return !bottle.collected;
        const pickedUp = character.collectBottle();
        if (!pickedUp) return true;
        bottle.collected = true;
        return false;
    });
}
