/**
 * Assigns all level-created entities to the world.
 * @param {World} world - Game world instance.
 * @param {Level} level - Current level instance.
 * @returns {void}
 */
function assignWorldLevelEntities(world, level) {
    world.chickens = level.createChickens();
    world.endboss = level.createEndboss();
    world.coins = level.createCoins();
    world.bottles = level.createBottles();
    world.backgrounds = level.createBackgrounds();
}

/**
 * Resets transient world state after loading a level.
 * @param {World} world - Game world instance.
 * @returns {void}
 */
function resetWorldState(world) {
    world.throwables = [];
    world.cameraX = 0;
    world.lastEnemyHit = 0;
    world.gameEnded = false;
    world.initLayerDriftOffsets();
    world.backgroundsReady = false;
}

/**
 * Returns whether the draw loop should wait for background assets.
 * @param {World} world - Game world instance.
 * @returns {boolean} True when drawing should wait.
 */
function shouldQueueWorldBackgroundFrame(world) {
    return !world.backgroundsReady;
}

/**
 * Clears the canvas and queues another frame while assets load.
 * @param {World} world - Game world instance.
 * @returns {void}
 */
function queueWorldBackgroundFrame(world) {
    world.clearCanvas();
    requestAnimationFrame((time) => world.draw(time));
}

/**
 * Returns whether the world should advance a logic step.
 * @param {World} world - Game world instance.
 * @param {number} now - Current timestamp.
 * @returns {boolean} True when logic should update.
 */
function shouldAdvanceWorldLogic(world, now) {
    const logicInterval = 1000 / TARGET_FPS;
    return !world.lastLogicUpdate || now - world.lastLogicUpdate >= logicInterval;
}

/**
 * Runs one fixed-interval logic update for the world.
 * @param {World} world - Game world instance.
 * @param {number} now - Current timestamp.
 * @returns {void}
 */
function runWorldLogicFrame(world, now) {
    world.lastLogicUpdate = now;
    world.updateEntities();
    world.updateGameState();
}

/**
 * Updates the chicken list, clearing or filtering as needed.
 * @param {World} world - Game world instance.
 * @returns {void}
 */
function updateWorldChickens(world) {
    if (shouldClearChickensForBoss(world.character, world.endboss)) {
        world.chickens = [];
        return;
    }
    world.chickens.forEach((chicken) => chicken.update());
    world.chickens = filterWorldChickens(world);
}

/**
 * Returns the remaining chickens after level-edge cleanup.
 * @param {World} world - Game world instance.
 * @returns {Chicken[]} Filtered chicken list.
 */
function filterWorldChickens(world) {
    return world.chickens.filter((chicken) => {
        if (hasChickenLeftLevel(chicken)) return false;
        if (shouldRemoveChickenBeforeBoss(chicken, world.level.endbossLeft, !world.endboss.isDead)) return false;
        return true;
    });
}

/**
 * Advances the coin idle animations.
 * @param {Coin[]} coins - Coin list.
 * @returns {void}
 */
function animateWorldCoins(coins) {
    coins.forEach((coin) => coin.animate(performance.now()));
}

/**
 * Updates all active throwable objects.
 * @param {ThrowableObject[]} throwables - Throwable list.
 * @returns {void}
 */
function updateWorldThrowables(throwables) {
    throwables.forEach((throwable) => throwable.update());
}

/**
 * Ensures the character enters the death state at zero health.
 * @param {Character} character - Player character.
 * @returns {void}
 */
function ensureCharacterDeathState(character) {
    if (character.health <= 0 && !character.isDead) character.die();
}

/**
 * Updates the player-facing HUD bars.
 * @param {StatusBar} statusBar - HUD status bar manager.
 * @param {Character} character - Player character.
 * @returns {void}
 */
function updateWorldCharacterBars(statusBar, character) {
    statusBar.setHealth(character.health, character.maxHealth);
    statusBar.setCoins(character.coinBar);
    statusBar.setBottles(character.bottleBar);
}

/**
 * Updates the endboss HUD bar visibility and pulse state.
 * @param {World} world - Game world instance.
 * @returns {void}
 */
function updateWorldEndbossBar(world) {
    const { statusBar, endboss } = world;
    const { visible, hitPulse } = getWorldEndbossHudState(world);
    statusBar.setEndboss(endboss.health, endboss.maxHealth, visible, hitPulse);
}

/**
 * Returns endboss HUD visibility and hit pulse info.
 * @param {World} world - Game world instance.
 * @returns {{visible: boolean, hitPulse: boolean}} HUD state.
 */
function getWorldEndbossHudState(world) {
    const visible = isEndbossOnScreen(world.endboss, world.cameraX, world.canvas.width) && !world.endboss.isDead;
    const hitPulse = world.endboss.lastHitTime && performance.now() - world.endboss.lastHitTime < 600;
    return { visible, hitPulse };
}
