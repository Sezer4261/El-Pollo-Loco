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
    /** @param {number} x - Start X position. @param {number} patrolLeft - Left patrol boundary. @param {number} patrolRight - Right patrol boundary. */
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
    /** Loads all endboss animation frames. */
    loadAnimations() {
        this.frameLists.walk = this.loadImages(ENDBOSS_FRAME_PATHS.walk);
        this.frameLists.alert = this.loadImages(ENDBOSS_FRAME_PATHS.alert);
        this.frameLists.attack = this.loadImages(ENDBOSS_FRAME_PATHS.attack);
        this.frameLists.hurt = this.loadImages(ENDBOSS_FRAME_PATHS.hurt);
        this.frameLists.dead = this.loadImages(ENDBOSS_FRAME_PATHS.dead);
    }
    /** @param {Character} character - Player character reference. @param {number} cameraX - Camera X offset. @param {number} canvasWidth - Canvas width. */
    update(character, cameraX, canvasWidth) {
        if (this.isDead) return this.updateDeath(performance.now());
        this.updateStates(character, cameraX, canvasWidth);
        updateEndbossMovement(this, character, cameraX, canvasWidth);
        applyEndbossGravity(this);
        this.updateAnimation(performance.now());
    }
    /** @param {number} now - Current timestamp. */
    updateDeath(now) {
        if (this.deathPhase === "animating") return this.updateDeathAnimation(now);
        if (this.deathPhase === "falling" || this.deathPhase === "landed") this.updateRoastFall(now);
    }
    /** @param {number} now - Current timestamp. */
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
    /** @param {HTMLImageElement} roastedImg - Final roast frame. */
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
    /** @param {number} now - Current timestamp. */
    updateRoastFall(now) {
        if (this.deathPhase === "landed") return checkRoastLandDelay(this, now);
        applyRoastFallPhysics(this, now);
    }
    /** @param {Character} character - Player character. @param {number} cameraX - Camera X offset. @param {number} canvasWidth - Canvas width. */
    updateStates(character, cameraX, canvasWidth) {
        const now = performance.now();
        clearEndbossTimedStates(this, character, now, cameraX, canvasWidth);
        ensureEndbossEngagement(this, character, cameraX, canvasWidth);
        activateEndbossAlert(this, character, now, cameraX, canvasWidth);
    }
    /** @param {string} state - State name. */
    setState(state) {
        const frames = this.frameLists[state];
        if (this.currentState === state) return;
        this.currentState = state;
        this.frameIndex = 0;
        this.lastAnimTime = performance.now();
        if (frames?.length) this.img = frames[0];
    }
    /** @param {number} now - Current timestamp. */
    updateAnimation(now) {
        const frames = this.frameLists[this.currentState] || this.frameLists.walk;
        if (now - this.lastAnimTime < 150 || !frames?.length) return;
        this.frameIndex = (this.frameIndex + 1) % frames.length;
        this.img = frames[this.frameIndex];
        this.lastAnimTime = now;
    }
    /** @param {number} amount - Damage amount. */
    takeDamage(amount) {
        const now = performance.now();
        if (this.isDead) return;
        applyEndbossDamage(this, amount, now);
        if (this.health <= 0) return this.die();
        if (shouldSkipEndbossHurt(this, now)) return;
        applyEndbossHurtState(this, now);
    }
    /** Starts the roast transformation death sequence. */
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
    /** @returns {{x: number, y: number, w: number, h: number}} Hitbox. */
    getHitBox() {
        if (this.isDead) return { x: this.x, y: this.y, w: 0, h: 0 };
        return super.getHitBox();
    }
    /** @param {ThrowableObject} bottle - Thrown bottle. @returns {boolean} True when the bottle hits. */
    isHitByBottle(bottle) {
        const b = bottle.getHitBox();
        const box = this.getBottleHitBox();
        return b.x < box.x + box.w && b.x + b.w > box.x && b.y < box.y + box.h && b.y + b.h > box.y;
    }
    /** @returns {{x: number, y: number, w: number, h: number}} Hitbox. */
    getBottleHitBox() {
        return { x: this.x + 10, y: this.y + 15, w: this.width - 20, h: this.height - 5 };
    }
}
/** @param {Endboss} boss - Endboss instance. @param {number} now - Current timestamp. */
function checkRoastLandDelay(boss, now) {
    if (now - boss.landedAt >= Endboss.END_DELAY_MS) boss.deathComplete = true;
}
/** @param {Endboss} boss - Endboss instance. @param {number} now - Current timestamp. */
function applyRoastFallPhysics(boss, now) {
    boss.speedY += GRAVITY * 1.15;
    boss.y += boss.speedY;
    boss.rotation += (boss.targetRotation - boss.rotation) * 0.12;
    if (boss.y < boss.groundY) return;
    boss.y = boss.groundY;
    boss.speedY = 0;
    boss.rotation = boss.targetRotation;
    boss.deathPhase = "landed";
    boss.landedAt = now;
}
/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @param {number} now - Current timestamp. @param {number} cameraX - Camera X offset. @param {number} canvasWidth - Canvas width. */
function clearEndbossTimedStates(boss, character, now, cameraX, canvasWidth) {
    handleEndbossHurtTimeout(boss, character, now, cameraX, canvasWidth);
    handleEndbossAlertTimeout(boss, now);
}
/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @param {number} now - Current timestamp. @param {number} cameraX - Camera X offset. @param {number} canvasWidth - Canvas width. */
function handleEndbossHurtTimeout(boss, character, now, cameraX, canvasWidth) {
    if (!boss.isHurt || now <= boss.hurtEndTime) return;
    boss.isHurt = false;
    boss.setState("walk");
    boss.nextAttackTime = 0;
    if (shouldEndbossEngage(boss, character, cameraX, canvasWidth)) reengageEndbossAfterHurt(boss);
}
/** @param {Endboss} boss - Endboss instance. */
function reengageEndbossAfterHurt(boss) {
    boss.isAttacking = true;
    setEndbossAttackPhase(boss, "chase");
}
/** @param {Endboss} boss - Endboss instance. @param {number} now - Current timestamp. */
function handleEndbossAlertTimeout(boss, now) {
    if (!boss.isAlert || now <= boss.alertEndTime) return;
    boss.isAlert = false;
    boss.setState("walk");
    boss.nextAttackTime = now;
}
/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @param {number} now - Current timestamp. @param {number} cameraX - Camera X offset. @param {number} canvasWidth - Canvas width. */
function activateEndbossAlert(boss, character, now, cameraX, canvasWidth) {
    if (shouldSkipEndbossAlert(boss, character, cameraX, canvasWidth)) return;
    if (isEndbossTooFarForAlert(boss, character)) {
        boss.hasAlerted = false;
        return;
    }
    if (boss.hasAlerted) return;
    enterEndbossAlert(boss, now);
}
/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @param {number} cameraX - Camera X offset. @param {number} canvasWidth - Canvas width. @returns {boolean} True when alert should be skipped. */
function shouldSkipEndbossAlert(boss, character, cameraX, canvasWidth) {
    if (boss.isHurt || boss.isAttacking) return true;
    if (!shouldEndbossEngage(boss, character, cameraX, canvasWidth)) return false;
    boss.isAlert = false;
    return true;
}
/** @param {Endboss} boss - Endboss instance. @param {Character} character - Player character. @returns {boolean} True when the player is too far away. */
function isEndbossTooFarForAlert(boss, character) { return getEndbossPlayerDistance(boss, character) >= 720; }
/** @param {Endboss} boss - Endboss instance. @param {number} now - Current timestamp. */
function enterEndbossAlert(boss, now) {
    boss.isAlert = true;
    boss.hasAlerted = true;
    boss.alertEndTime = now + 250;
    boss.setState("alert");
}
/** @param {Endboss} boss - Endboss instance. @param {number} amount - Damage amount. @param {number} now - Current timestamp. */
function applyEndbossDamage(boss, amount, now) {
    boss.health = Math.max(0, boss.health - amount);
    boss.hitFlashUntil = now + ENDBOSS_HIT_FLASH_MS;
    boss.lastHitTime = now;
}
/** @param {Endboss} boss - Endboss instance. @param {number} now - Current timestamp. @returns {boolean} True when hurt should be skipped. */
function shouldSkipEndbossHurt(boss, now) {
    return boss.isAttacking || now < boss.staggerCooldownUntil;
}
/** @param {Endboss} boss - Endboss instance. @param {number} now - Current timestamp. */
function applyEndbossHurtState(boss, now) {
    boss.staggerCooldownUntil = now + ENDBOSS_STAGGER_COOLDOWN_MS;
    boss.isHurt = true;
    resetEndbossCombatState(boss);
    boss.hurtEndTime = now + ENDBOSS_HURT_MS;
    boss.setState("hurt");
}
/** @param {Endboss} boss - Endboss instance. */
function resetEndbossCombatState(boss) {
    boss.isAttacking = false;
    boss.attackPhase = null;
    boss.isJumping = false;
    boss.isLeapAttack = false;
    boss.jumpAttackStarted = false;
    boss.speedX = 0;
}
