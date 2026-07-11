/**
 * Main game world managing rendering, physics and game state.
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
     */
    loadLevel() {
        this.level = new Level(level1Data);
        this.character = new Character();
        this.chickens = this.level.createChickens();
        this.endboss = this.level.createEndboss();
        this.coins = this.level.createCoins();
        this.bottles = this.level.createBottles();
        this.backgrounds = this.level.createBackgrounds();
        this.throwables = [];
        this.cameraX = 0;
        this.lastEnemyHit = 0;
        this.gameEnded = false;
        this.initLayerDriftOffsets();
        this.backgroundsReady = false;
    }


    /**
     * Resets auto-scroll offsets for drifting background layers.
     */
    initLayerDriftOffsets() {
        this.layerDriftOffsets = {};
        BACKGROUND_LAYER_GROUPS.forEach((group, layerId) => {
            if (group.driftSpeed) this.layerDriftOffsets[layerId] = 0;
        });
    }


    /**
     * Advances endless background drifts such as moving clouds.
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
     */
    start() {
        this.isRunning = true;
        this.gameEnded = false;
        this.backgroundsReady = false;
        this.clearCanvas();
        this.draw();
        preloadGameAssets(this.backgrounds, this.endboss).then(() => {
            if (!this.isRunning) return;
            this.backgroundsReady = true;
            audioManager.startGameMusic();
        });
    }


    /**
     * Stops the game loop and sounds.
     */
    stop() {
        this.isRunning = false;
        audioManager.stopEffects();
    }


    /**
     * Resets the world without page reload.
     */
    reset() {
        this.stop();
        this.loadLevel();
        this.worldCollisions = new WorldCollisions(this);
    }


    /**
     * Main draw loop.
     */
    draw() {
        if (!this.isRunning) return;
        if (!this.backgroundsReady) {
            this.clearCanvas();
            requestAnimationFrame(() => this.draw());
            return;
        }
        this.updateEntities();
        this.updateGameState();
        this.clearAndDraw();
        requestAnimationFrame(() => this.draw());
    }


    /**
     * Updates all entities each frame.
     */
    updateEntities() {
        this.updateBackgroundDrift();
        this.character.update();
        this.updateCamera();
        if (shouldClearChickensForBoss(this.character, this.endboss)) {
            this.chickens = [];
        } else {
            this.chickens.forEach((c) => c.update());
            this.chickens = this.chickens.filter((c) => {
                if (hasChickenLeftLevel(c)) return false;
                if (shouldRemoveChickenBeforeBoss(c, this.level.endbossLeft, !this.endboss.isDead)) return false;
                return true;
            });
        }
        this.endboss.update(this.character, this.cameraX, this.canvas.width);
        this.coins.forEach((c) => c.animate(performance.now()));
        this.throwables.forEach((t) => t.update());
    }


    /**
     * Clears canvas and draws all layers.
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
     */
    clearCanvas() {
        this.ctx.fillStyle = "#8ebad6";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }


    /**
     * Draws background tiles in screen space before camera transform.
     */
    drawBackgroundScreenSpace() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        drawBackgroundLayers(this.ctx, this.backgrounds, this.cameraX, w, h, this.layerDriftOffsets);
    }


    /**
     * Updates camera position based on character.
     */
    updateCamera() {
        this.cameraX = this.character.x - 150;
        if (this.cameraX < 0) this.cameraX = 0;
        const maxCam = this.level.width - this.canvas.width;
        if (this.cameraX > maxCam) this.cameraX = maxCam;
    }


    /**
     * Updates collisions, bars and win/lose checks.
     */
    updateGameState() {
        this.throwables = this.throwables.filter((t) => t.isActive);
        this.worldCollisions.processAll();
        this.updateStatusBars();
        this.checkEndConditions();
    }


    /**
     * Updates all HUD status bars.
     */
    updateStatusBars() {
        const char = this.character;
        if (char.health <= 0 && !char.isDead) char.die();
        this.statusBar.setHealth(char.health, char.maxHealth);
        this.statusBar.setCoins(char.coinBar);
        this.statusBar.setBottles(char.bottleBar);
        const bossVisible = isEndbossOnScreen(this.endboss, this.cameraX, this.canvas.width) && !this.endboss.isDead;
        const hitPulse = this.endboss.lastHitTime &&
            performance.now() - this.endboss.lastHitTime < 600;
        this.statusBar.setEndboss(
            this.endboss.health,
            this.endboss.maxHealth,
            bossVisible,
            hitPulse
        );
    }


    /**
     * Checks win and lose conditions.
     */
    checkEndConditions() {
        if (this.gameEnded) return;
        if (this.character.isDead) {
            this.handleGameOver(false);
            return;
        }
        if (this.endboss.deathComplete) this.handleGameOver(true);
    }


    /**
     * Ends the game and shows result screen.
     * @param {boolean} won - Whether player won.
     */
    handleGameOver(won) {
        this.gameEnded = true;
        this.stop();
        audioManager.playEffect(won ? "win" : "gameOver");
        screenManager.showEndScreen(won);
    }

}
