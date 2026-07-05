/**
 * Filters collected coins and updates the character bar.
 * @param {Character} character - Player character.
 * @param {Coin[]} coins - Coin list.
 * @returns {Coin[]} Remaining coins.
 */
function filterCollectedCoins(character, coins) {
    return coins.filter((coin) => {
        if (coin.collected) return false;
        if (!character.isColliding(coin)) return true;
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
        if (bottle.collected || !character.isColliding(bottle)) return !bottle.collected;
        const pickedUp = character.collectBottle();
        if (!pickedUp) return true;
        bottle.collected = true;
        return false;
    });
}
