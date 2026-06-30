const LEVEL_WIDTH = 3840;
const LEVEL_END = 3600;

/**
 * Defines level layout and entity factories.
 */
class Level {
    static PARALLAX_LAYERS = [
        { path: "img/5_background/layers/air.png", speed: 0 },
        { path: "img/5_background/layers/4_clouds/full.png", speed: 0.2 },
        { path: "img/5_background/layers/3_third_layer/full.png", speed: 0.4 },
        { path: "img/5_background/layers/2_second_layer/full.png", speed: 0.6 },
        { path: "img/5_background/layers/1_first_layer/full.png", speed: 1 }
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
     * Builds parallax background layers.
     * @returns {BackgroundObject[]} Background layers.
     */
    createBackgrounds() {
        return Level.PARALLAX_LAYERS.map(
            (layer) => new BackgroundObject(layer.path, layer.speed)
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
