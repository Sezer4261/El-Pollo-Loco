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
        if (!keyboard.SPACE || char.isDead) return;
        const bottle = char.throwBottle();
        if (!bottle) return;
        this.world.throwables.push(bottle);
        audioManager.playEffect("throw");
    }


    /**
     * Resolves thrown bottle collisions.
     */
    checkThrowableHits() {
        this.world.throwables.forEach((obj) => {
            if (!obj.isActive) return;
            this.world.chickens.forEach((chicken) => {
                resolveBottleChickenHit(this, obj, chicken);
            });
            resolveBottleBossHit(obj, this.world.endboss);
        });
    }


    /**
     * Resolves character and chicken collisions.
     */
    checkCharacterEnemyHits() {
        const now = Date.now();
        if (now - this.world.lastEnemyHit < 800) return;
        const char = this.world.character;
        this.world.chickens.forEach((chicken) => {
            if (chicken.isDead) return;
            resolveChickenCharacterHit(this, char, chicken, now);
        });
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
