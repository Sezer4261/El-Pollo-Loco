/**
 * Endboss chicken with alert, attack and hurt states.
 */
class Endboss extends MovableObject {
    health = 120;
    maxHealth = 120;
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
    direction = -1;
    isAttacking = false;
    attackPhase = null;
    attackPhaseStart = 0;
    attackAnimDone = false;
    jumpHitDealt = false;
    jumpAttackStarted = false;
    retreatJumpStarted = false;
    beakHitDealt = false;
    hasAlerted = false;

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
     */
    update(character) {
        if (this.isDead) {
            this.updateDeath(performance.now());
            return;
        }
        this.updateStates(character);
        updateEndbossMovement(this, character);
        applyEndbossGravity(this);
        this.updateAnimation(performance.now());
    }


    /**
     * Plays roast transformation and fall after defeat.
     * @param {number} now - Current timestamp.
     */
    updateDeath(now) {
        if (this.deathPhase === "animating") {
            this.updateDeathAnimation(now);
            return;
        }
        if (this.deathPhase === "falling" || this.deathPhase === "landed") {
            this.updateRoastFall(now);
        }
    }


    /**
     * Advances the roast transformation frames.
     * @param {number} now - Current timestamp.
     */
    updateDeathAnimation(now) {
        if (now - this.lastAnimTime < 180) return;
        const frames = this.frameLists.dead;
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
     * Applies gravity and rotation while the roast falls to the ground.
     * @param {number} now - Current timestamp.
     */
    updateRoastFall(now) {
        if (this.deathPhase === "landed") {
            checkRoastLandDelay(this, now);
            return;
        }
        applyRoastFallPhysics(this, now);
    }


    /**
     * Switches alert state when character is near.
     * @param {Character} character - Player character.
     */
    updateStates(character) {
        const now = performance.now();
        clearEndbossTimedStates(this, now);
        activateEndbossAlert(this, character, now);
    }


    /**
     * Sets the current animation state.
     * @param {string} state - State name.
     */
    setState(state) {
        if (this.currentState === state) return;
        this.currentState = state;
        this.frameIndex = 0;
    }


    /**
     * Advances animation frames.
     * @param {number} now - Current timestamp.
     */
    updateAnimation(now) {
        if (this.isAttacking && this.attackPhase === "peck") return;
        if (now - this.lastAnimTime < 150) return;
        const frames = this.frameLists[this.currentState] || this.frameLists.walk;
        this.frameIndex = (this.frameIndex + 1) % frames.length;
        this.img = frames[this.frameIndex];
        this.lastAnimTime = now;
    }


    /**
     * Applies bottle damage to the boss.
     * @param {number} amount - Damage amount.
     */
    takeDamage(amount) {
        if (this.isDead) return;
        this.health = Math.max(0, this.health - amount);
        this.isHurt = true;
        this.isAttacking = false;
        this.attackPhase = null;
        this.isJumping = false;
        this.jumpAttackStarted = false;
        this.retreatJumpStarted = false;
        this.speedX = 0;
        this.hurtEndTime = performance.now() + 600;
        this.setState("hurt");
        if (this.health <= 0) this.die();
    }


    /**
     * Starts the roast transformation death sequence.
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
     * Checks collision with a thrown bottle using a generous hitbox.
     * @param {ThrowableObject} bottle - Thrown bottle.
     * @returns {boolean} True when the bottle hits.
     */
    isHitByBottle(bottle) {
        const b = bottle.getHitBox();
        const box = this.getBottleHitBox();
        return b.x < box.x + box.w && b.x + b.w > box.x &&
            b.y < box.y + box.h && b.y + b.h > box.y;
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
