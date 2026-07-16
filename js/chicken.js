/**
 * Returns true when a chicken should actively move toward the player.
 * @param {Chicken} chicken - Chicken instance.
 * @returns {boolean} Seek-player state.
 */
function shouldChickenSeekPlayer(chicken) {
    return chicken.marchMaxX !== undefined && chicken.x >= chicken.marchMaxX - 800;
}


/**
 * Turns chickens in the final stretch toward the player.
 * @param {Chicken} chicken - Chicken instance.
 */
function alignChickenTowardPlayer(chicken) {
    const player = world?.character;
    if (!player || chicken.isDead || !shouldChickenSeekPlayer(chicken)) return;
    const playerCenter = player.x + player.width / 2;
    const chickenCenter = chicken.x + chicken.width / 2;
    if (playerCenter > chickenCenter + 10) chicken.direction = 1;
    if (playerCenter < chickenCenter - 10) chicken.direction = -1;
}


/**
 * Moves a chicken continuously through the level.
 * @param {Chicken} chicken - Chicken instance.
 */
function marchChicken(chicken) {
    alignChickenTowardPlayer(chicken);
    const nextX = chicken.x + chicken.direction * chicken.speed;
    const zoneStart = chicken.marchMaxX;
    if (zoneStart !== undefined && chicken.direction > 0 && nextX + chicken.width >= zoneStart) {
        chicken.reachedEndbossGate = true;
        return;
    }
    chicken.x = nextX;
    chicken.otherDirection = chicken.direction < 0;
}


/**
 * Returns true when regular enemies should be cleared for the boss fight.
 * @param {Character} character - Player character.
 * @param {Endboss} endboss - Endboss instance.
 * @returns {boolean} Clear-chickens state.
 */
function shouldClearChickensForBoss(character, endboss) {
    return endboss && !endboss.isDead && isPlayerInBossArena(character, endboss);
}


/**
 * Returns true when a chicken has reached the endboss zone.
 * @param {Chicken} chicken - Chicken instance.
 * @param {number} zoneStartX - Left edge of the endboss arena.
 * @returns {boolean} True when inside the boss zone.
 */
function hasChickenEnteredEndbossZone(chicken, zoneStartX) {
    if (zoneStartX === undefined) return false;
    return chicken.x + chicken.width >= zoneStartX;
}


/**
 * Returns true when a chicken should be removed before the endboss fight.
 * @param {Chicken} chicken - Chicken instance.
 * @param {number} zoneStartX - Left edge of the endboss arena.
 * @param {boolean} bossAlive - Whether the endboss is still alive.
 * @returns {boolean} True when the chicken should be removed.
 */
function shouldRemoveChickenBeforeBoss(chicken, zoneStartX, bossAlive) {
    if (!bossAlive) return false;
    if (chicken.reachedEndbossGate) return true;
    return hasChickenEnteredEndbossZone(chicken, zoneStartX);
}


/**
 * Returns true when a chicken has left the level bounds.
 * @param {Chicken} chicken - Chicken instance.
 * @returns {boolean} True when off screen.
 */
function hasChickenLeftLevel(chicken) {
    if (chicken.isDead) return chicken.x < -200 || chicken.x > LEVEL_WIDTH + 200;
    if (chicken.direction < 0) return chicken.x < -chicken.width - 50;
    return chicken.x > LEVEL_WIDTH + 50;
}

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
     * @param {number} direction - March direction (-1 left, 1 right).
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
        return [1, 2, 3].map((n) => base + "/1_walk/" + n + "_w.png");
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
     * @returns {{x: number, y: number, w: number, h: number}} Hitbox.
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
