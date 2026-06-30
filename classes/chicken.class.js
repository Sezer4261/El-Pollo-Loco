/**
 * Chicken enemy with patrol behavior and stomp vulnerability.
 */
class Chicken extends MovableObject {
    health = 1;
    isDead = false;
    patrolLeft = 0;
    patrolRight = 0;
    direction = -1;
    walkFrames = [];
    deadFrames = [];
    frameIndex = 0;
    lastAnimTime = 0;
    speed = 1.5;

    /**
     * Creates a chicken at the given patrol zone.
     * @param {number} x - Start X position.
     * @param {number} patrolLeft - Left patrol boundary.
     * @param {number} patrolRight - Right patrol boundary.
     * @param {boolean} [small=false] - Use small chicken variant.
     */
    constructor(x, patrolLeft, patrolRight, small = false) {
        super();
        this.isSmall = small;
        this.x = x;
        this.y = ENEMY_GROUND_Y;
        this.width = small ? 40 : 58;
        this.height = small ? 39 : 57;
        this.speed = small ? 2 : 1.5;
        this.patrolLeft = patrolLeft;
        this.patrolRight = patrolRight;
        this.offset = { top: 5, left: 5, right: 5, bottom: 5 };
        this.loadFrames();
    }


    /**
     * Loads chicken animation frames.
     */
    loadFrames() {
        const base = this.isSmall
            ? "img/3_enemies_chicken/chicken_small"
            : "img/3_enemies_chicken/chicken_normal";
        const walk = [1, 2, 3].map((n) => base + "/1_walk/" + n + "_w.png");
        this.walkFrames = this.loadImages(walk);
        this.deadFrames = this.loadImages([base + "/2_dead/dead.png"]);
        this.img = this.walkFrames[0];
    }


    /**
     * Updates patrol and animation each frame.
     */
    update() {
        if (!this.isDead) this.patrol();
        this.updateAnimation(performance.now());
    }


    /**
     * Patrols between boundaries.
     */
    patrol() {
        this.x += this.direction * this.speed;
        this.otherDirection = this.direction < 0;
        if (this.x <= this.patrolLeft) this.direction = 1;
        if (this.x >= this.patrolRight) this.direction = -1;
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
     * Kills the chicken instantly.
     */
    die() {
        this.isDead = true;
        this.frameIndex = 0;
        this.img = this.deadFrames[0];
    }

}
