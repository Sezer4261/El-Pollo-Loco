/**
 * Collectible salsa bottle on the ground.
 */
class Bottle extends MovableObject {
    collected = false;

    /**
     * Creates a ground bottle at the given position.
     * @param {number} x - X position.
     * @param {number} y - Y position.
     */
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 60;
        this.offset = { top: 5, left: 5, right: 5, bottom: 5 };
        this.loadImage("img/6_salsa_bottle/1_salsa_bottle_on_ground.png");
    }

}
