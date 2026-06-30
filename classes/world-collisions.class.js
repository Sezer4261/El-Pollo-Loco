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
                if (chicken.isDead || !obj.isColliding(chicken)) return;
                obj.isActive = false;
                chicken.die();
                audioManager.playEffect("hit");
            });
            const boss = this.world.endboss;
            if (!boss.isDead && obj.isColliding(boss)) {
                obj.isActive = false;
                boss.takeDamage(10);
                audioManager.playEffect("bossHit");
            }
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
            if (this.manager.isStomp(char, chicken)) {
                chicken.die();
                char.speedY = -8;
                audioManager.playEffect("hit");
                return;
            }
            if (!this.manager.isSideHit(char, chicken)) return;
            char.takeDamage(20);
            this.world.lastEnemyHit = now;
        });
        const boss = this.world.endboss;
        if (!boss.isDead && this.manager.isBossSideHit(char, boss)) {
            char.takeDamage(30);
            this.world.lastEnemyHit = now;
        }
    }


    /**
     * Checks coin and bottle collection.
     */
    checkCollectibles() {
        const char = this.world.character;
        this.world.coins = this.world.coins.filter((coin) => {
            if (coin.collected || !char.isColliding(coin)) return !coin.collected;
            coin.collected = true;
            char.collectCoin();
            return false;
        });
        this.world.bottles = this.world.bottles.filter((bottle) => {
            if (bottle.collected || !char.isColliding(bottle)) return !bottle.collected;
            bottle.collected = true;
            char.collectBottle();
            return false;
        });
    }

}
