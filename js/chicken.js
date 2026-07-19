/**
 * Chicken enemy that marches through the level.
 */
class Chicken extends MovableObject {
    health = 1;
    isDead = false;
    direction = -1;
    walkFrames = [];
    deadFrames = [];
    frameIndex = 0;
    lastAnimTime = 0;
    speed = 1.5;

    /**
     * Creates a chicken at the given position.
     * @param {number} x - Start X position.
     * @param {number} direction - March direction.
     * @param {boolean} [small=false] - Use small chicken variant.
     */
    constructor(x, direction, small = false) {
        super();
        this.isSmall = small;
        this.x = x;
        this.direction = direction;
        this.offset = { top: 5, left: 5, right: 5, bottom: 5 };
        this.setChickenSize();
        this.y = getGroundYForHeight(this.height);
        this.speed = this.isSmall ? CHICKEN_SPEED_SMALL : CHICKEN_SPEED_NORMAL;
        this.loadFrames();
    }

    /**
     * Applies the proper chicken size for the selected variant.
     */
    setChickenSize() {
        this.width = this.isSmall ? 66 : 98;
        this.height = this.isSmall ? 64 : 96;
    }

    /**
     * Loads chicken animation frames.
     */
    loadFrames() {
        const base = this.getChickenBasePath();
        this.walkFrames = this.loadImages(this.getWalkFramePaths(base));
        this.deadFrames = this.loadImages([base + "/2_dead/dead.png"]);
        this.img = this.walkFrames[0];
    }

    /**
     * Returns the sprite folder for the current chicken variant.
     * @returns {string} Base image folder.
     */
    getChickenBasePath() {
        return this.isSmall
            ? "img/3_enemies_chicken/chicken_small"
            : "img/3_enemies_chicken/chicken_normal";
    }

    /**
     * Returns walking frame paths for a chicken variant.
     * @param {string} base - Base image folder.
     * @returns {string[]} Walk frame paths.
     */
    getWalkFramePaths(base) {
        return [1, 2, 3].map((index) => base + "/1_walk/" + index + "_w.png");
    }

    /**
     * Updates march and animation each frame.
     */
    update() {
        if (!this.isDead) marchChicken(this);
        this.updateAnimation(performance.now());
    }

    /**
     * Advances walk or dead animation.
     * @param {number} now - Current timestamp.
     */
    updateAnimation(now) {
        if (now - this.lastAnimTime < 120) return;
        const frames = this.isDead ? this.deadFrames : this.walkFrames;
        this.frameIndex = (this.frameIndex + 1) % frames.length;
        this.img = frames[this.frameIndex];
        this.lastAnimTime = now;
    }

    /**
     * Returns no hitbox for defeated chickens.
     * @returns {{x:number,y:number,w:number,h:number}} Hitbox.
     */
    getHitBox() {
        if (this.isDead) return { x: this.x, y: this.y, w: 0, h: 0 };
        return super.getHitBox();
    }

    /**
     * Kills the chicken instantly.
     */
    die() {
        this.isDead = true;
        this.frameIndex = 0;
        this.img = this.deadFrames[0];
    }

    /**
     * Checks collision with a thrown bottle using a generous hitbox.
     * @param {ThrowableObject} bottle - Thrown bottle.
     * @returns {boolean} True when the bottle hits.
     */
    isHitByBottle(bottle) {
        return isChickenHitByBottle(this, bottle);
    }
}
