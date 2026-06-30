const LEVEL_WIDTH = 3840;
const LEVEL_END = 3600;

/**
 * Defines level layout and entity factories.
 */
class Level {
    static BACKGROUND_TILES = [
        { path: "img/5_background/first_half_background.png", x: 0 },
        { path: "img/5_background/second_half_background.png", x: 1920 }
    ];

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
    }


    /**
     * Builds scrolling background tiles.
     * @returns {BackgroundObject[]} Background tiles.
     */
    createBackgrounds() {
        return Level.BACKGROUND_TILES.map(
            (tile) => new BackgroundObject(tile.path, tile.x)
        );
    }


    /**
     * Builds chicken enemies from level data.
     * @returns {Chicken[]} Chicken array.
     */
    createChickens() {
        return this.enemyData.map(
            (e) => new Chicken(e.x, e.left, e.right, e.small)
        );
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
        return new Endboss(this.endbossX);
    }

}
