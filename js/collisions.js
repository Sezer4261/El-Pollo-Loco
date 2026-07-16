/**
 * Returns the bottle collision box for a chicken.
 * @param {Chicken} chicken - Chicken instance.
 * @param {ThrowableObject} bottle - Thrown bottle.
 * @returns {{x: number, y: number, w: number, h: number}} Hitbox.
 */
function getChickenBottleHitBox(chicken, bottle) {
    const padX = bottle.isLowThrow ? 12 : 6;
    const padY = bottle.isLowThrow ? 18 : 10;
    return {
        x: chicken.x + chicken.offset.left - padX,
        y: chicken.y + chicken.offset.top - padY,
        w: chicken.width - chicken.offset.left - chicken.offset.right + padX * 2,
        h: chicken.height - chicken.offset.top - chicken.offset.bottom + padY * 2
    };
}


function boxesOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
        a.y < b.y + b.h && a.y + a.h > b.y;
}


/**
 * Checks whether a bottle overlaps a chicken hitbox.
 * @param {Chicken} chicken - Chicken instance.
 * @param {ThrowableObject} bottle - Thrown bottle.
 * @returns {boolean} True when the bottle hits.
 */
function isChickenHitByBottle(chicken, bottle) {
    return boxesOverlap(bottle.getHitBox(), getChickenBottleHitBox(chicken, bottle));
}


/**
 * Resolves bottle hits against one chicken.
 * @param {WorldCollisions} collisions - Collision handler.
 * @param {ThrowableObject} bottle - Thrown bottle.
 * @param {Chicken} chicken - Target chicken.
 */
function resolveBottleChickenHit(collisions, bottle, chicken) {
    if (chicken.isDead || !chicken.isHitByBottle(bottle)) return;
    bottle.isActive = false;
    collisions.defeatChicken(chicken);
    audioManager.playEffect("hit");
}


/**
 * Resolves bottle hit against the endboss.
 * @param {ThrowableObject} bottle - Thrown bottle.
 * @param {Endboss} boss - Endboss instance.
 */
function resolveBottleBossHit(bottle, boss) {
    if (boss.isDead || !boss.isHitByBottle(bottle)) return;
    bottle.isActive = false;
    boss.takeDamage(BOSS_BOTTLE_DAMAGE);
    audioManager.playEffect("bossHit");
}


/**
 * Defeats a chicken when Pepe stomps it from above.
 * Works even while hurt or briefly after taking damage.
 * @param {WorldCollisions} collisions - Collision handler.
 * @param {Character} character - Player character.
 * @param {Chicken} chicken - Target chicken.
 * @returns {boolean} True when the chicken was stomped.
 */
function resolveChickenStomp(collisions, character, chicken) {
    if (chicken.isDead || character.isDead) return false;
    if (!collisions.manager.isStomp(character, chicken)) return false;
    collisions.defeatChicken(chicken);
    character.speedY = -STOMP_BOUNCE_SPEED;
    character.currentState = "jump";
    character.beginJumpAnimation();
    collisions.world.lastEnemyHit = Date.now();
    audioManager.playEffect("hit");
    return true;
}


/**
 * Resolves one chicken side collision with the character.
 * @param {WorldCollisions} collisions - Collision handler.
 * @param {Character} character - Player character.
 * @param {Chicken} chicken - Target chicken.
 * @param {number} now - Current timestamp.
 * @returns {boolean} True when damage was applied.
 */
function resolveChickenCharacterHit(collisions, character, chicken, now) {
    if (chicken.isDead || character.isDead || character.currentState === "hurt") return false;
    if (!collisions.manager.isSideHit(character, chicken)) return false;
    character.takeDamage(CHICKEN_CONTACT_DAMAGE);
    collisions.world.lastEnemyHit = now;
    return true;
}


/**
 * Resolves endboss side collision with the character.
 * @param {WorldCollisions} collisions - Collision handler.
 * @param {Character} character - Player character.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 */
function resolveBossCharacterHit(collisions, character, boss, now) {
    if (boss.isDead || character.isDead || character.currentState === "hurt") return;
    const bossNow = performance.now();
    if (boss.contactCooldownUntil && bossNow < boss.contactCooldownUntil) return;
    if (!collisions.manager.isSideHit(character, boss)) return;
    character.takeDamage(ENDBOSS_CONTACT_DAMAGE);
    collisions.world.lastEnemyHit = now;
    audioManager.playEffect("bossHit");
    boss.contactCooldownUntil = bossNow + ENDBOSS_CONTACT_COOLDOWN_MS;
    boss.recoverUntil = bossNow + ENDBOSS_RECOVER_MS;
    boss.isAttacking = true;
    setEndbossAttackPhase(boss, "chase");
    boss.nextAttackTime = 0;
}


/**
 * Checks close contact between Pepe and a collectible.
 * Uses a tighter player box so pickups need a real touch.
 * @param {Character} character - Player character.
 * @param {MovableObject} item - Collectible item.
 * @returns {boolean} True when they truly overlap.
 */
function isTouchingCollectible(character, item) {
    const c = character.getHitBox();
    const insetX = c.w * 0.24;
    const box = { x: c.x + insetX, y: c.y + c.h * 0.08, w: c.w - insetX * 2, h: c.h - c.h * 0.12 };
    return boxesOverlap(box, item.getHitBox());
}


function keepCoinAfterPickup(character, coin) {
    if (coin.collected || !isTouchingCollectible(character, coin)) return !coin.collected;
    if (coin.requiresJump && !character.isAboveGround()) return true;
    if (!character.collectCoin()) return true;
    coin.collected = true;
    return false;
}


/**
 * Filters collected coins and updates the character bar.
 * @param {Character} character - Player character.
 * @param {Coin[]} coins - Coin list.
 * @returns {Coin[]} Remaining coins.
 */
function filterCollectedCoins(character, coins) {
    return coins.filter((coin) => keepCoinAfterPickup(character, coin));
}


function keepBottleAfterPickup(character, bottle) {
    if (bottle.collected || !isTouchingCollectible(character, bottle)) return !bottle.collected;
    if (!character.collectBottle()) return true;
    bottle.collected = true;
    return false;
}


/**
 * Filters collected bottles and updates the character bar.
 * @param {Character} character - Player character.
 * @param {Bottle[]} bottles - Bottle list.
 * @returns {Bottle[]} Remaining bottles.
 */
function filterCollectedBottles(character, bottles) {
    return bottles.filter((bottle) => keepBottleAfterPickup(character, bottle));
}


/**
 * Handles collision detection with offset hitboxes.
 */
class CollisionManager {
    /**
     * Checks if character stomps enemy from above.
     * @param {Character} character - Player character.
     * @param {MovableObject} enemy - Enemy object.
     * @returns {boolean} True when stomp is valid.
     */
    isStomp(character, enemy) {
        if (enemy.isDead || !character.isColliding(enemy)) return false;
        const isFalling = character.speedY > 0;
        const justLanded = character.speedY === 0 && character.prevSpeedY > 0;
        if (!isFalling && !justLanded) return false;
        const charBottom = character.getHitBox().y + character.getHitBox().h;
        const enemyBox = enemy.getHitBox();
        const stompZone = enemyBox.y + Math.min(28, enemyBox.h * 0.45);
        return charBottom <= stompZone;
    }


    /**
     * Checks side collision causing character damage.
     * @param {Character} character - Player character.
     * @param {MovableObject} enemy - Enemy object.
     * @returns {boolean} True when side hit occurs.
     */
    isSideHit(character, enemy) {
        return !enemy.isDead && character.isColliding(enemy) && !this.isStomp(character, enemy);
    }


    /**
     * Checks side collision with endboss.
     * @param {Character} character - Player character.
     * @param {Endboss} boss - Endboss instance.
     * @returns {boolean} True when boss damages character.
     */
    isBossSideHit(character, boss) {
        return this.isSideHit(character, boss);
    }
}


function resetThrowLatch(collisions) {
    collisions.spaceWasDown = false;
}


function registerThrownBottle(collisions, bottle) {
    collisions.world.throwables.push(bottle);
    audioManager.playEffect("throw");
}


/**
 * Handles all collision checks for the game world.
 */
class WorldCollisions {
    /**
     * Creates collision handler for a world instance.
     * @param {World} world - Game world reference.
     */
    constructor(world) {
        this.world = world;
        this.manager = world.collisionManager;
        this.spaceWasDown = false;
    }


    /**
     * Runs all collision checks each frame.
     */
    processAll() {
        this.checkThrowInput();
        this.checkThrowableHits();
        this.checkCharacterEnemyHits();
        this.checkCollectibles();
    }


    /**
     * Handles bottle throw input.
     */
    checkThrowInput() {
        const char = this.world.character;
        if (!keyboard.SPACE) return resetThrowLatch(this);
        if (this.spaceWasDown || char.isDead) return;
        this.spaceWasDown = true;
        const bottle = char.throwBottle();
        if (!bottle) return;
        registerThrownBottle(this, bottle);
    }


    /**
     * Resolves thrown bottle collisions.
     */
    checkThrowableHits() {
        this.world.throwables.forEach((obj) => {
            if (!obj.isActive) return;
            this.world.chickens.forEach((chicken) => resolveBottleChickenHit(this, obj, chicken));
            resolveBottleBossHit(obj, this.world.endboss);
        });
    }


    /**
     * Resolves character and chicken collisions.
     */
    checkCharacterEnemyHits() {
        const now = Date.now();
        const char = this.world.character;
        this.world.chickens.forEach((chicken) => resolveChickenStomp(this, char, chicken));
        if (now - this.world.lastEnemyHit < 800) return;
        this.world.chickens.forEach((chicken) => resolveChickenCharacterHit(this, char, chicken, now));
        resolveBossCharacterHit(this, char, this.world.endboss, now);
    }


    /**
     * Defeats a chicken and tracks kill milestones.
     * @param {Chicken} chicken - Chicken to defeat.
     */
    defeatChicken(chicken) {
        if (chicken.isDead) return;
        chicken.die();
        this.world.character.registerEnemyDefeated();
    }


    /**
     * Checks coin and bottle collection.
     */
    checkCollectibles() {
        const char = this.world.character;
        this.world.coins = filterCollectedCoins(char, this.world.coins);
        this.world.bottles = filterCollectedBottles(char, this.world.bottles);
    }
}
