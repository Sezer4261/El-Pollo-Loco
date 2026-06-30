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
    }


    /**
     * Starts the game loop and music.
     */
    start() {
        this.isRunning = true;
        this.gameEnded = false;
        audioManager.startGameMusic();
        this.draw();
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
        this.updateEntities();
        this.clearAndDraw();
        this.updateGameState();
        requestAnimationFrame(() => this.draw());
    }


    /**
     * Updates all entities each frame.
     */
    updateEntities() {
        this.character.update();
        this.chickens.forEach((c) => c.update());
        this.endboss.update(this.character);
        this.coins.forEach((c) => c.animate(performance.now()));
        this.throwables.forEach((t) => t.update());
    }


    /**
     * Clears canvas and draws all layers.
     */
    clearAndDraw() {
        this.updateCamera();
        this.ctx.fillStyle = "#c9a66b";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackgroundScreenSpace();
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        this.drawObjects(this.coins);
        this.drawObjects(this.bottles);
        this.drawObjects(this.chickens);
        if (this.endboss.isRoasted) this.drawEndbossRoasted(this.endboss);
        else this.drawFlipped(this.endboss);
        this.drawObjects(this.throwables);
        this.drawFlipped(this.character);
        this.ctx.restore();
    }


    /**
     * Draws background tiles in screen space before camera transform.
     */
    drawBackgroundScreenSpace() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cam = this.cameraX;
        this.backgrounds.forEach((tile) => {
            this.drawBackgroundTile(tile, cam, w, h);
        });
    }


    /**
     * Draws one background tile at its world position.
     * @param {BackgroundObject} tile - Background tile.
     * @param {number} cam - Camera X offset.
     * @param {number} w - Canvas width.
     * @param {number} h - Canvas height.
     */
    drawBackgroundTile(tile, cam, w, h) {
        const img = tile.img;
        if (!img?.complete || !img.naturalWidth) return;
        const srcY = Math.max(0, img.naturalHeight - h);
        const screenX = tile.tileX - cam;
        if (screenX + img.naturalWidth < 0 || screenX > w) return;
        const destX = Math.max(0, screenX);
        const srcX = screenX < 0 ? -screenX : 0;
        const drawW = Math.min(img.naturalWidth - srcX, w - destX);
        this.ctx.drawImage(
            img, srcX, srcY, drawW, h,
            destX, 0, drawW, h
        );
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
     * Draws an array of image objects.
     * @param {MovableObject[]} objects - Objects to draw.
     */
    drawObjects(objects) {
        objects.forEach((obj) => this.drawImage(obj));
    }


    /**
     * Draws a single image object.
     * @param {MovableObject} obj - Object to draw.
     */
    drawImage(obj) {
        if (!obj.img?.complete) return;
        this.ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
    }


    /**
     * Draws object with horizontal flip.
     * @param {MovableObject} obj - Object to draw.
     */
    drawFlipped(obj) {
        if (!obj.img?.complete) return;
        if (!obj.otherDirection) {
            this.drawImage(obj);
            return;
        }
        this.ctx.save();
        this.ctx.translate(obj.x + obj.width, obj.y);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(obj.img, 0, 0, obj.width, obj.height);
        this.ctx.restore();
    }


    /**
     * Draws the roasted endboss with rotation while falling.
     * @param {Endboss} boss - Defeated endboss.
     */
    drawEndbossRoasted(boss) {
        if (!boss.img?.complete) return;
        const cx = boss.x + boss.width / 2;
        const cy = boss.y + boss.height / 2;
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(boss.rotation);
        if (boss.otherDirection) this.ctx.scale(-1, 1);
        this.ctx.drawImage(boss.img, -boss.width / 2, -boss.height / 2, boss.width, boss.height);
        this.ctx.restore();
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
        this.statusBar.setHealth(char.health, char.maxHealth);
        this.statusBar.setCoins(char.coinBar);
        this.statusBar.setBottles(char.bottleBar);
        const bossVisible = this.character.x > this.endboss.x - 500;
        this.statusBar.setEndboss(this.endboss.health, this.endboss.maxHealth, bossVisible);
    }


    /**
     * Checks win and lose conditions.
     */
    checkEndConditions() {
        if (this.gameEnded) return;
        if (this.character.isDead) {
            this.gameEnded = true;
            this.handleGameOver(false);
            return;
        }
        if (this.endboss.deathComplete && !this.gameEnded) {
            this.gameEnded = true;
            this.handleGameOver(true);
        }
    }


    /**
     * Ends the game and shows result screen.
     * @param {boolean} won - Whether player won.
     */
    handleGameOver(won) {
        this.stop();
        audioManager.playEffect(won ? "win" : "gameOver");
        screenManager.showEndScreen(won);
    }

}
