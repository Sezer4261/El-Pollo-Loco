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
        return this.enemyData.map((enemy) => this.createChicken(enemy));
    }

    /**
     * Builds a chicken and applies its march limit.
     * @param {{x:number,direction:number,small:boolean}} enemy - Enemy data.
     * @returns {Chicken} Chicken instance.
     */
    createChicken(enemy) {
        const chicken = new Chicken(enemy.x, enemy.direction, enemy.small);
        chicken.marchMaxX = this.endbossLeft;
        return chicken;
    }

    /**
     * Builds collectible coins.
     * @returns {Coin[]} Coin array.
     */
    createCoins() {
        return this.coinData.map((coin) => new Coin(coin.x, coin.y));
    }

    /**
     * Builds collectible ground bottles.
     * @returns {Bottle[]} Bottle array.
     */
    createBottles() {
        return this.bottleData.map((bottle) => new Bottle(bottle.x, bottle.y));
    }

    /**
     * Builds the endboss.
     * @returns {Endboss} Endboss instance.
     */
    createEndboss() {
        return new Endboss(this.endbossX, this.endbossLeft, this.endbossRight);
    }
}
