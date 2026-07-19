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

/**
 * Static configuration for the first level.
 * @type {{
 *   width:number,endX:number,endboss:{x:number,left:number,right:number},
 *   enemies:Array<{x:number,direction:number,small:boolean}>,
 *   coins:Array<{x:number,y:number}>,bottles:Array<{x:number,y:number}>
 * }}
 */
const level1Data = {
    width: LEVEL_WIDTH,
    endX: 5400,
    endboss: { x: 5000, left: 4680, right: 5450 },
    enemies: [
        { x: 700, direction: -1, small: false },
        { x: 950, direction: -1, small: true },
        { x: 1200, direction: 1, small: true },
        { x: 1550, direction: -1, small: false },
        { x: 1750, direction: 1, small: false },
        { x: 1900, direction: -1, small: true },
        { x: 2200, direction: -1, small: false },
        { x: 2450, direction: 1, small: true },
        { x: 2700, direction: -1, small: true },
        { x: 2950, direction: -1, small: false },
        { x: 3150, direction: 1, small: false },
        { x: 3350, direction: -1, small: true },
        { x: 3500, direction: 1, small: true },
        { x: 3680, direction: -1, small: false },
        { x: 3820, direction: 1, small: true },
        { x: 3950, direction: -1, small: true },
        { x: 4080, direction: 1, small: false },
        { x: 4290, direction: 1, small: true },
        { x: 4450, direction: 1, small: false },
        { x: 4560, direction: 1, small: true }
    ],
    coins: [
        { x: 300, y: COIN_GROUND_Y },
        { x: 550, y: COIN_JUMP_Y },
        { x: 850, y: COIN_GROUND_Y },
        { x: 1150, y: COIN_JUMP_Y },
        { x: 1500, y: COIN_GROUND_Y },
        { x: 2000, y: COIN_GROUND_Y },
        { x: 2350, y: COIN_JUMP_Y },
        { x: 2800, y: COIN_GROUND_Y },
        { x: 3400, y: COIN_JUMP_Y },
        { x: 4000, y: COIN_GROUND_Y }
    ],
    bottles: [
        { x: 450, y: BOTTLE_GROUND_Y },
        { x: 1000, y: BOTTLE_GROUND_Y },
        { x: 1650, y: BOTTLE_GROUND_Y },
        { x: 2250, y: BOTTLE_GROUND_Y },
        { x: 2950, y: BOTTLE_GROUND_Y },
        { x: 3550, y: BOTTLE_GROUND_Y },
        { x: 4150, y: BOTTLE_GROUND_Y },
        { x: 4850, y: BOTTLE_GROUND_Y }
    ]
};
