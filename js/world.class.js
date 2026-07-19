/**
 * Main game world managing rendering, physics, and game state.
 */
class World {
    canvas;
    ctx;
    character;
    chickens = [];
    endboss;
    coins = [];
    bottles = [];
    throwables = [];
    backgrounds = [];
    cameraX = 0;
    level;
    statusBar;
    collisionManager;
    worldCollisions;
    isRunning = false;
    gameEnded = false;
    lastEnemyHit = 0;
    layerDriftOffsets = {};
    backgroundsReady = false;
    lastLogicUpdate = 0;

    /**
     * Creates the game world on the given canvas.
     * @param {HTMLCanvasElement} canvas - Game canvas element.
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.collisionManager = new CollisionManager();
        this.statusBar = new StatusBar();
        this.loadLevel();
        this.worldCollisions = new WorldCollisions(this);
    }

    /**
     * Loads or reloads the current level.
     * @returns {void}
     */
    loadLevel() {
        this.level = new Level(level1Data);
        this.character = new Character();
        assignWorldLevelEntities(this, this.level);
        resetWorldState(this);
    }

    /**
     * Resets auto-scroll offsets for drifting background layers.
     * @returns {void}
     */
    initLayerDriftOffsets() {
        this.layerDriftOffsets = {};
        BACKGROUND_LAYER_GROUPS.forEach((group, layerId) => {
            if (group.driftSpeed) this.layerDriftOffsets[layerId] = 0;
        });
    }

    /**
     * Advances endless background drifts such as moving clouds.
     * @returns {void}
     */
    updateBackgroundDrift() {
        const h = this.canvas.height;
        BACKGROUND_LAYER_GROUPS.forEach((group, layerId) => {
            if (!group.driftSpeed) return;
            const refImg = this.backgrounds.find((tile) => tile.layerId === layerId)?.img;
            const tileWorldW = group.tileWidth || refImg?.naturalWidth || 1920;
            const scale = refImg?.naturalHeight ? h / refImg.naturalHeight : 1;
            const wrap = tileWorldW * scale;
            let next = (this.layerDriftOffsets[layerId] || 0) + group.driftSpeed;
            if (wrap > 0) next %= wrap;
            this.layerDriftOffsets[layerId] = next;
        });
    }

    /**
     * Starts the game loop and music after backgrounds are ready.
     * @returns {void}
     */
    start() {
        this.isRunning = true;
        this.gameEnded = false;
        this.backgroundsReady = false;
        this.lastLogicUpdate = 0;
        this.clearCanvas();
        requestAnimationFrame((time) => this.draw(time));
        preloadGameAssets(this.backgrounds, this.endboss).then(() => {
            if (!this.isRunning) return;
            this.backgroundsReady = true;
            audioManager.startGameMusic();
        });
    }

    /**
     * Stops the game loop and sounds.
     * @returns {void}
     */
    stop() {
        this.isRunning = false;
        audioManager.stopEffects();
    }

    /**
     * Resets the world without page reload.
     * @returns {void}
     */
    reset() {
        this.stop();
        this.loadLevel();
        this.worldCollisions = new WorldCollisions(this);
    }

    /**
     * Main draw loop.
     * @param {number} [now=0] - Current animation frame timestamp.
     * @returns {void}
     */
    draw(now = 0) {
        if (!this.isRunning) return;
        now = now || performance.now();
        if (shouldQueueWorldBackgroundFrame(this)) return queueWorldBackgroundFrame(this);
        if (shouldAdvanceWorldLogic(this, now)) runWorldLogicFrame(this, now);
        this.clearAndDraw();
        requestAnimationFrame((time) => this.draw(time));
    }

    /**
     * Updates all entities each frame.
     * @returns {void}
     */
    updateEntities() {
        this.updateBackgroundDrift();
        this.character.update();
        this.updateCamera();
        updateWorldChickens(this);
        this.endboss.update(this.character, this.cameraX, this.canvas.width);
        animateWorldCoins(this.coins);
        updateWorldThrowables(this.throwables);
    }

    /**
     * Clears canvas and draws all layers.
     * @returns {void}
     */
    clearAndDraw() {
        this.updateCamera();
        this.clearCanvas();
        this.drawBackgroundScreenSpace();
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        drawWorldLayer(this);
        this.ctx.restore();
    }

    /**
     * Fills the canvas with the ground color.
     * @returns {void}
     */
    clearCanvas() {
        this.ctx.fillStyle = "#8ebad6";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draws background tiles in screen space before camera transform.
     * @returns {void}
     */
    drawBackgroundScreenSpace() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        drawBackgroundLayers(this.ctx, this.backgrounds, this.cameraX, w, h, this.layerDriftOffsets);
    }

    /**
     * Updates camera position based on character.
     * @returns {void}
     */
    updateCamera() {
        this.cameraX = this.character.x - 150;
        if (this.cameraX < 0) this.cameraX = 0;
        const maxCam = this.level.width - this.canvas.width;
        if (this.cameraX > maxCam) this.cameraX = maxCam;
    }

    /**
     * Updates collisions, bars, and win or lose checks.
     * @returns {void}
     */
    updateGameState() {
        this.throwables = this.throwables.filter((t) => t.isActive);
        this.worldCollisions.processAll();
        this.updateStatusBars();
        this.checkEndConditions();
    }

    /**
     * Updates all HUD status bars.
     * @returns {void}
     */
    updateStatusBars() {
        const char = this.character;
        ensureCharacterDeathState(char);
        updateWorldCharacterBars(this.statusBar, char);
        updateWorldEndbossBar(this);
    }

    /**
     * Checks win and lose conditions.
     * @returns {void}
     */
    checkEndConditions() {
        if (this.gameEnded) return;
        if (this.character.isDead) return this.handleGameOver(false);
        if (this.endboss.deathComplete) this.handleGameOver(true);
    }

    /**
     * Ends the game and shows the result screen.
     * @param {boolean} won - Whether the player won.
     * @returns {void}
     */
    handleGameOver(won) {
        this.gameEnded = true;
        this.stop();
        audioManager.playEffect(won ? "win" : "gameOver");
        screenManager.showEndScreen(won);
    }
}
