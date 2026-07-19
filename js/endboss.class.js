/**
 * Endboss chicken with alert, attack, hurt, and death states.
 */
class Endboss extends MovableObject {
    health = ENDBOSS_HEALTH;
    maxHealth = ENDBOSS_HEALTH;
    isDead = false;
    isHurt = false;
    isAlert = false;
    isRoasted = false;
    isJumping = false;
    isLeapAttack = false;
    deathComplete = false;
    deathPhase = "";
    rotation = 0;
    targetRotation = 0;
    groundY = 0;
    currentState = "walk";
    frameLists = {};
    frameIndex = 0;
    lastAnimTime = 0;
    hurtEndTime = 0;
    alertEndTime = 0;
    landedAt = 0;
    nextJumpTime = 0;
    nextAttackTime = 0;
    contactCooldownUntil = 0;
    staggerCooldownUntil = 0;
    recoverUntil = 0;
    direction = -1;
    isAttacking = false;
    attackPhase = null;
    attackPhaseStart = 0;
    attackAnimDone = false;
    jumpHitDealt = false;
    jumpAttackStarted = false;
    hasAlerted = false;
    hitFlashUntil = 0;
    lastHitTime = 0;

    static ROASTED_WIDTH = 210;
    static ROASTED_HEIGHT = 115;
    static END_DELAY_MS = 1000;

    /**
     * Creates the endboss at the given position.
     * @param {number} x - Start X position.
     * @param {number} patrolLeft - Left patrol boundary.
     * @param {number} patrolRight - Right patrol boundary.
     */
    constructor(x, patrolLeft, patrolRight) {
        super();
        this.x = x;
        this.patrolLeft = patrolLeft;
        this.patrolRight = patrolRight;
        this.width = 230;
        this.height = 368;
        this.groundY = getGroundYForHeight(this.height);
        this.y = this.groundY;
        this.offset = { top: 40, left: 30, right: 30, bottom: 20 };
        this.loadAnimations();
        this.img = this.frameLists.walk[0];
    }

    /**
     * Loads all endboss animation frames.
     * @returns {void}
     */
    loadAnimations() {
        this.frameLists.walk = this.loadImages(ENDBOSS_FRAME_PATHS.walk);
        this.frameLists.alert = this.loadImages(ENDBOSS_FRAME_PATHS.alert);
        this.frameLists.attack = this.loadImages(ENDBOSS_FRAME_PATHS.attack);
        this.frameLists.hurt = this.loadImages(ENDBOSS_FRAME_PATHS.hurt);
        this.frameLists.dead = this.loadImages(ENDBOSS_FRAME_PATHS.dead);
    }

    /**
     * Updates boss movement and animation.
     * @param {Character} character - Player character reference.
     * @param {number} cameraX - Camera X offset.
     * @param {number} canvasWidth - Canvas width.
     * @returns {void}
     */
    update(character, cameraX, canvasWidth) {
        if (this.isDead) return this.updateDeath(performance.now());
        this.updateStates(character, cameraX, canvasWidth);
        updateEndbossMovement(this, character, cameraX, canvasWidth);
        applyEndbossGravity(this);
        this.updateAnimation(performance.now());
    }

    /**
     * Plays roast transformation and fall after defeat.
     * @param {number} now - Current timestamp.
     * @returns {void}
     */
    updateDeath(now) {
        if (this.deathPhase === "animating") return this.updateDeathAnimation(now);
        if (this.deathPhase === "falling" || this.deathPhase === "landed") {
            this.updateRoastFall(now);
        }
    }

    /**
     * Advances the roast transformation frames.
     * @param {number} now - Current timestamp.
     * @returns {void}
     */
    updateDeathAnimation(now) {
        const frames = this.frameLists.dead;
        if (now - this.lastAnimTime < 180) return;
        if (this.frameIndex < frames.length - 1) {
            this.frameIndex++;
            this.img = frames[this.frameIndex];
            this.lastAnimTime = now;
            return;
        }
        this.startRoastFall(frames[frames.length - 1]);
        this.lastAnimTime = now;
    }

    /**
     * Switches to the roasted turkey sprite and starts falling.
     * @param {HTMLImageElement} roastedImg - Final roast frame.
     * @returns {void}
     */
    startRoastFall(roastedImg) {
        this.deathPhase = "falling";
        this.isRoasted = true;
        this.img = roastedImg;
        this.x += (this.width - Endboss.ROASTED_WIDTH) / 2;
        this.width = Endboss.ROASTED_WIDTH;
        this.height = Endboss.ROASTED_HEIGHT;
        this.groundY = getGroundYForHeight(this.height);
        this.speedY = 1;
        this.targetRotation = this.otherDirection ? -1.35 : 1.35;
    }

    /**
     * Applies gravity and rotation while the roast falls.
     * @param {number} now - Current timestamp.
     * @returns {void}
     */
    updateRoastFall(now) {
        if (this.deathPhase === "landed") return checkRoastLandDelay(this, now);
        applyRoastFallPhysics(this, now);
    }

    /**
     * Updates timed hurt and alert states.
     * @param {Character} character - Player character.
     * @param {number} cameraX - Camera X offset.
     * @param {number} canvasWidth - Canvas width.
     * @returns {void}
     */
    updateStates(character, cameraX, canvasWidth) {
        const now = performance.now();
        clearEndbossTimedStates(this, character, now, cameraX, canvasWidth);
        ensureEndbossEngagement(this, character, cameraX, canvasWidth);
        activateEndbossAlert(this, character, now, cameraX, canvasWidth);
    }

    /**
     * Sets the current animation state.
     * @param {string} state - State name.
     * @returns {void}
     */
    setState(state) {
        const frames = this.frameLists[state];
        if (this.currentState === state) return;
        this.currentState = state;
        this.frameIndex = 0;
        this.lastAnimTime = performance.now();
        if (frames?.length) this.img = frames[0];
    }

    /**
     * Advances animation frames.
     * @param {number} now - Current timestamp.
     * @returns {void}
     */
    updateAnimation(now) {
        const frames = this.frameLists[this.currentState] || this.frameLists.walk;
        if (now - this.lastAnimTime < 150 || !frames?.length) return;
        this.frameIndex = (this.frameIndex + 1) % frames.length;
        this.img = frames[this.frameIndex];
        this.lastAnimTime = now;
    }

    /**
     * Applies bottle damage to the boss.
     * @param {number} amount - Damage amount.
     * @returns {void}
     */
    takeDamage(amount) {
        const now = performance.now();
        if (this.isDead) return;
        applyEndbossDamage(this, amount, now);
        if (this.health <= 0) return this.die();
        if (shouldSkipEndbossHurt(this, now)) return;
        applyEndbossHurtState(this, now);
    }

    /**
     * Starts the roast transformation death sequence.
     * @returns {void}
     */
    die() {
        this.isDead = true;
        this.isHurt = false;
        this.isAlert = false;
        this.deathComplete = false;
        this.deathPhase = "animating";
        this.landedAt = 0;
        this.frameIndex = 0;
        this.currentState = "dead";
        this.img = this.frameLists.dead[0];
        this.lastAnimTime = performance.now();
    }

    /**
     * Returns no hitbox when the endboss is defeated.
     * @returns {{x: number, y: number, w: number, h: number}} Hitbox.
     */
    getHitBox() {
        if (this.isDead) return { x: this.x, y: this.y, w: 0, h: 0 };
        return super.getHitBox();
    }

    /**
     * Checks collision with a thrown bottle using a generous hitbox.
     * @param {ThrowableObject} bottle - Thrown bottle.
     * @returns {boolean} True when the bottle hits.
     */
    isHitByBottle(bottle) {
        const b = bottle.getHitBox();
        const box = this.getBottleHitBox();
        return b.x < box.x + box.w && b.x + b.w > box.x
            && b.y < box.y + box.h && b.y + b.h > box.y;
    }

    /**
     * Returns the bottle collision box for the endboss.
     * @returns {{x: number, y: number, w: number, h: number}} Hitbox.
     */
    getBottleHitBox() {
        return {
            x: this.x + 10,
            y: this.y + 15,
            w: this.width - 20,
            h: this.height - 5
        };
    }
}
