const LEVEL_WIDTH = 5760;
const LEVEL_END = 5400;

/**
 * Defines level layout and entity factories.
 */
class Level {
    /**
     * Creates a level from configuration data.
     * @param {object} data - Level configuration.
     */
    constructor(data) {
        this.width = data.width;
        this.endX = data.endX;
        this.enemyData = data.enemies;
        this.coinData = data.coins;
        this.bottleData = data.bottles;
        this.endbossX = data.endboss.x;
        this.endbossLeft = data.endboss.left;
        this.endbossRight = data.endboss.right;
    }


    /**
     * Builds scrolling background tiles.
     * @returns {BackgroundObject[]} Background tiles.
     */
    createBackgrounds() {
        return createParallaxBackgrounds(this.width);
    }


    /**
     * Builds chicken enemies from level data.
     * @returns {Chicken[]} Chicken array.
     */
    createChickens() {
        return this.enemyData.map((enemy) => {
            const chicken = new Chicken(enemy.x, enemy.direction, enemy.small);
            chicken.marchMaxX = this.endbossLeft;
            return chicken;
        });
    }


    /**
     * Builds collectible coins.
     * @returns {Coin[]} Coin array.
     */
    createCoins() {
        return this.coinData.map((c) => new Coin(c.x, c.y));
    }


    /**
     * Builds collectible ground bottles.
     * @returns {Bottle[]} Bottle array.
     */
    createBottles() {
        return this.bottleData.map((b) => new Bottle(b.x, b.y));
    }


    /**
     * Builds the endboss.
     * @returns {Endboss} Endboss instance.
     */
    createEndboss() {
        return new Endboss(this.endbossX, this.endbossLeft, this.endbossRight);
    }

}
