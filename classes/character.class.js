/**
 * Player-controlled Pepe with idle, sleep, jump and throw mechanics.
 */
class Character extends MovableObject {
    health = 100;
    maxHealth = 100;
    coinBar = 0;
    bottleBar = 0;
    isDead = false;
    isDucking = false;
    canThrow = true;
    currentState = "idle";
    frameLists = {};
    frameIndex = 0;
    lastAnimTime = 0;
    idleStartTime = performance.now();
    animationSpeeds = { idle: 120, longIdle: 150, walk: 90, jump: 80, hurt: 120, dead: 200 };

    /**
     * Creates Pepe at the start position.
     */
    constructor() {
        super();
        this.x = 80;
        this.y = GROUND_Y;
        this.width = 100;
        this.height = 197;
        this.offset = { top: 30, left: 20, right: 20, bottom: 10 };
        this.loadAnimations();
        this.img = this.frameLists.idle[0];
    }


    /**
     * Loads all Pepe animation frame lists.
     */
    loadAnimations() {
        this.frameLists.idle = this.buildFrames("img/2_character_pepe/1_idle/idle/I-", 1, 10);
        this.frameLists.longIdle = this.buildFrames("img/2_character_pepe/1_idle/long_idle/I-", 11, 20);
        this.frameLists.walk = this.buildFrames("img/2_character_pepe/2_walk/W-", 21, 26);
        this.frameLists.jump = this.buildFrames("img/2_character_pepe/3_jump/J-", 31, 39);
        this.frameLists.hurt = this.buildFrames("img/2_character_pepe/4_hurt/H-", 41, 43);
        this.frameLists.dead = this.buildFrames("img/2_character_pepe/5_dead/D-", 51, 57);
    }


    /**
     * Builds numbered frame images.
     * @param {string} basePath - Path prefix.
     * @param {number} start - First frame number.
     * @param {number} end - Last frame number.
     * @returns {HTMLImageElement[]} Frame images.
     */
    buildFrames(basePath, start, end) {
        const frames = [];
        for (let i = start; i <= end; i++) {
            const img = new Image();
            img.src = basePath + i + ".png";
            frames.push(img);
        }
        return frames;
    }


    /**
     * Updates physics, movement and animation.
     */
    update() {
        if (this.isDead) {
            this.updateAnimation(performance.now());
            return;
        }
        this.applyGravity();
        if (this.currentState !== "hurt") this.handleMovement();
        this.updateAnimation(performance.now());
    }


    /**
     * Handles keyboard movement and idle timer.
     */
    handleMovement() {
        const kb = keyboard;
        if (this.isAboveGround()) {
            this.isDucking = false;
            this.resetIdleTimer();
            this.applyAirMovement(kb);
            this.setState("jump");
            return;
        }
        if (kb.DOWN) {
            this.isDucking = true;
            this.applyDuckMovement(kb);
            return;
        }
        this.isDucking = false;
        if (kb.LEFT) this.moveLeft();
        else if (kb.RIGHT) this.moveRight();
        else this.handleIdleState();
        if (kb.UP) this.jump();
    }


    /**
     * Moves Pepe while ducking on the ground.
     * @param {Keyboard} kb - Keyboard state.
     */
    applyDuckMovement(kb) {
        this.resetIdleTimer();
        if (kb.LEFT) {
            this.x -= 3;
            this.otherDirection = true;
            this.setState("walk");
        } else if (kb.RIGHT) {
            this.x += 3;
            this.otherDirection = false;
            this.setState("walk");
        } else {
            this.setState("idle");
        }
    }


    /**
     * Allows left/right movement while jumping.
     * @param {Keyboard} kb - Keyboard state.
     */
    applyAirMovement(kb) {
        if (kb.LEFT) {
            this.x -= 5;
            this.otherDirection = true;
        } else if (kb.RIGHT) {
            this.x += 5;
            this.otherDirection = false;
        }
    }


    /**
     * Sets idle or long idle after 15 seconds.
     */
    handleIdleState() {
        const idleMs = performance.now() - this.idleStartTime;
        const nextState = idleMs >= 15000 ? "longIdle" : "idle";
        if (nextState === "longIdle" && this.currentState !== "longIdle") {
            audioManager.playEffect("snore");
        }
        this.setState(nextState);
    }


    /**
     * Resets the idle sleep timer.
     */
    resetIdleTimer() {
        this.idleStartTime = performance.now();
    }


    /**
     * Moves Pepe left.
     */
    moveLeft() {
        this.x -= 5;
        this.otherDirection = true;
        this.resetIdleTimer();
        this.setState("walk");
    }


    /**
     * Moves Pepe right.
     */
    moveRight() {
        this.x += 5;
        this.otherDirection = false;
        this.resetIdleTimer();
        this.setState("walk");
    }


    /**
     * Makes Pepe jump.
     */
    jump() {
        if (this.isAboveGround()) return;
        this.speedY = -22;
        this.y -= 2;
        this.resetIdleTimer();
    }


    /**
     * Switches animation state.
     * @param {string} state - State name.
     */
    setState(state) {
        if (this.isDead && state !== "dead") return;
        if (this.currentState === state) return;
        this.currentState = state;
        this.frameIndex = 0;
    }


    /**
     * Throws a bottle if available.
     * @returns {ThrowableObject|null} Thrown bottle or null.
     */
    throwBottle() {
        if (this.isDead || !this.canThrow || this.bottleBar < 20) return null;
        this.bottleBar = Math.max(0, this.bottleBar - 20);
        this.canThrow = false;
        setTimeout(() => { this.canThrow = true; }, 500);
        const throwType = this.isDucking ? "down" : "forward";
        const y = this.isDucking
            ? this.y + this.height * 0.72
            : this.y + this.height * 0.4;
        const x = this.otherDirection ? this.x + 5 : this.x + this.width - 5;
        return new ThrowableObject(x, y, this.otherDirection, throwType);
    }


    /**
     * Collects a coin and updates the coin bar.
     */
    collectCoin() {
        this.coinBar = Math.min(100, this.coinBar + 10);
        if (this.coinBar >= 100) {
            this.health = Math.min(this.maxHealth, this.health + 20);
            this.coinBar = 0;
        }
        audioManager.playEffect("coin");
    }


    /**
     * Collects a ground bottle.
     */
    collectBottle() {
        this.bottleBar = Math.min(100, this.bottleBar + 20);
        audioManager.playEffect("bottle");
    }


    /**
     * Advances animation frames.
     * @param {number} now - Current timestamp.
     */
    updateAnimation(now) {
        const speed = this.animationSpeeds[this.currentState] || 120;
        if (now - this.lastAnimTime < speed) return;
        const frames = this.frameLists[this.currentState];
        if (!frames?.length) return;
        if (this.currentState === "dead" && this.frameIndex >= frames.length - 1) return;
        this.frameIndex = this.currentState === "dead"
            ? Math.min(this.frameIndex + 1, frames.length - 1)
            : (this.frameIndex + 1) % frames.length;
        this.img = frames[this.frameIndex];
        this.lastAnimTime = now;
    }


    /**
     * Applies damage to Pepe.
     * @param {number} amount - Damage amount.
     */
    takeDamage(amount) {
        if (this.isDead) return;
        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) this.die();
        else this.playHurt();
    }


    /**
     * Plays hurt animation briefly.
     */
    playHurt() {
        this.setState("hurt");
        setTimeout(() => {
            if (!this.isDead && this.currentState === "hurt") {
                this.setState("idle");
                this.img = this.frameLists.idle[0];
            }
        }, 600);
        audioManager.playEffect("hurt");
    }


    /**
     * Marks Pepe as dead.
     */
    die() {
        this.isDead = true;
        this.setState("dead");
    }

}
